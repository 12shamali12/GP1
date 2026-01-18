import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { AppointmentStatus, PerformanceEventType, Role, SlotStatus } from "@prisma/client";
import { BookSlotDto, CancelDto, CancelPatientDto, CreateSlotDto, DecisionDto, ReportSubmittedDto } from "./dto";

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private async findUserByIdentifier(identifier: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { email: identifier },
          { phone: identifier },
          { username: identifier },
          { doctorIdNumber: identifier },
        ],
      },
    });
    if (!user) throw new NotFoundException("User not found.");
    return user;
  }

  async createSlot(dto: CreateSlotDto) {
    const doctor = await this.findUserByIdentifier(dto.doctorIdentifier);
    if (doctor.role !== Role.DOCTOR) throw new UnauthorizedException("Only doctors can create slots.");
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    if (!(start.getTime() < end.getTime())) throw new BadRequestException("startTime must be before endTime");

    const duplicate = await this.prisma.availabilitySlot.findFirst({
      where: {
        doctorId: doctor.id,
        startTime: start,
        status: { not: SlotStatus.CANCELLED },
      },
    });
    if (duplicate) throw new BadRequestException("You already have a slot at this time.");

    const slot = await this.prisma.availabilitySlot.create({
      data: {
        doctorId: doctor.id,
        startTime: start,
        endTime: end,
        purpose: dto.purpose ?? "General",
      },
    });
    await this.prisma.notification.create({
      data: {
        title: "Slot added",
        body: `You added a slot for ${start.toISOString()}.`,
        recipientId: doctor.id,
      },
    });
    return { message: "Slot created.", slot };
  }

  async listSlots(doctorId?: string) {
    // purge expired unbooked slots
    await this.prisma.availabilitySlot.deleteMany({
      where: {
        status: SlotStatus.OPEN,
        startTime: { lt: new Date() },
      },
    });

    return this.prisma.availabilitySlot.findMany({
      where: {
        ...(doctorId ? { doctorId } : { status: SlotStatus.OPEN }),
      },
      orderBy: { startTime: "asc" },
      include: doctorId
        ? {
            appointment: true,
            doctor: { select: { id: true, name: true, avatar: true, doctorIdNumber: true, phone: true } },
          }
        : {
            doctor: { select: { id: true, name: true, avatar: true, doctorIdNumber: true, phone: true } },
          },
    });
  }

  async bookSlot(dto: BookSlotDto) {
    const patient = await this.findUserByIdentifier(dto.patientIdentifier);
    if (patient.role !== Role.PATIENT) throw new UnauthorizedException("Only patients can book slots.");

    return this.prisma.$transaction(async (tx) => {
      const slotToBook = await tx.availabilitySlot.findUnique({
        where: { id: dto.slotId },
        include: { doctor: { select: { phone: true, name: true, avatar: true, id: true } } },
      });
      if (!slotToBook) throw new NotFoundException("Slot not found.");
      if (slotToBook.status !== SlotStatus.OPEN) throw new BadRequestException("Slot is not available.");

      const overlap = await tx.appointment.findFirst({
        where: {
          patientId: patient.id,
          status: { in: [AppointmentStatus.PENDING, AppointmentStatus.APPROVED] },
          slot: {
            startTime: slotToBook.startTime,
          },
        },
        include: { slot: true },
      });
      if (overlap) throw new BadRequestException("You already have an appointment at this time.");

      await tx.availabilitySlot.update({
        where: { id: slotToBook.id },
        data: { status: SlotStatus.BOOKED },
      });

      const appointment = await tx.appointment.create({
        data: {
          slotId: slotToBook.id,
          doctorId: slotToBook.doctorId,
          doctorPhone: slotToBook.doctor?.phone ?? null,
          patientId: patient.id,
          status: AppointmentStatus.PENDING,
          note: dto.note ?? null,
        },
      });

      // Notify doctor
      await tx.notification.create({
        data: {
          title: "New reservation request",
          body: `A patient requested ${slotToBook.startTime.toISOString()}.`,
          recipientId: slotToBook.doctorId,
        },
      });

      return { message: "Appointment requested.", appointment };
    });
  }

  private async createEvent(opts: {
    doctorId: string;
    patientId?: string;
    appointmentId?: string;
    type: PerformanceEventType;
  }) {
    await this.prisma.appointmentEvent.create({
      data: {
        doctorId: opts.doctorId,
        patientId: opts.patientId,
        appointmentId: opts.appointmentId,
        type: opts.type,
      },
    });
  }

  async decision(id: string, dto: DecisionDto) {
    const doctor = await this.findUserByIdentifier(dto.doctorIdentifier);
    if (doctor.role !== Role.DOCTOR) throw new UnauthorizedException("Only doctors can decide.");

    return this.prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.findUnique({
        where: { id },
        include: { slot: true },
      });
      if (!appt) throw new NotFoundException("Appointment not found.");
      if (appt.doctorId !== doctor.id) throw new UnauthorizedException("Not your appointment.");
      if (appt.status !== AppointmentStatus.PENDING) throw new BadRequestException("Already decided.");

      const status = dto.approve ? AppointmentStatus.APPROVED : AppointmentStatus.REJECTED;
      const slotTime = appt.slot?.startTime?.toISOString?.();
      if (!dto.approve) {
        await this.createEvent({
          doctorId: doctor.id,
          patientId: appt.patientId,
          appointmentId: appt.id,
          type: PerformanceEventType.REJECTED,
        });
        // delete appointment so slot can be reused, but send note in notification
        await tx.appointment.delete({ where: { id } });
        await tx.availabilitySlot.update({
          where: { id: appt.slotId },
          data: { status: SlotStatus.OPEN },
        });
      } else {
        await tx.appointment.update({
          where: { id },
          data: { status },
        });
      }
      await tx.notification.create({
        data: {
          title: dto.approve ? "Appointment approved" : "Appointment rejected",
          body: dto.approve
            ? "Your appointment was approved."
            : `Your appointment was rejected${dto.note ? `: ${dto.note}` : "."} Please book another slot.`,
          recipientId: appt.patientId,
        },
      });
      // Notify doctor for record
      await tx.notification.create({
        data: {
          title: dto.approve ? "You approved an appointment" : "You rejected an appointment",
          body: `Decision made for ${slotTime ?? "an appointment"}${dto.note ? ` | Note: ${dto.note}` : ""}.`,
          recipientId: doctor.id,
        },
      });
      return { message: `Appointment ${dto.approve ? "approved" : "rejected"}.` };
    });
  }

  async cancel(id: string, dto: CancelDto) {
    const doctor = await this.findUserByIdentifier(dto.doctorIdentifier);
    if (doctor.role !== Role.DOCTOR) throw new UnauthorizedException("Only doctors can cancel.");

    return this.prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.findUnique({
        where: { id },
      });
      if (!appt) throw new NotFoundException("Appointment not found.");
      if (appt.doctorId !== doctor.id) throw new UnauthorizedException("Not your appointment.");

      // mark and reopen slot
      await tx.appointment.delete({ where: { id } });
      await tx.availabilitySlot.update({
        where: { id: appt.slotId },
        data: { status: SlotStatus.OPEN },
      });
      const isNoShow = dto.reason?.toLowerCase().includes("no-show");
      await this.createEvent({
        doctorId: doctor.id,
        patientId: appt.patientId,
        appointmentId: appt.id,
        type: isNoShow ? PerformanceEventType.NO_SHOW : PerformanceEventType.CANCEL_DOCTOR,
      });
      await tx.notification.create({
        data: {
          title: "Appointment cancelled",
          body: dto.reason ? `Doctor cancelled: ${dto.reason}` : "Doctor cancelled your appointment.",
          recipientId: appt.patientId,
        },
      });
      await tx.notification.create({
        data: {
          title: "You cancelled an appointment",
          body: `Cancelled appointment for ${appt.slotId}.`,
          recipientId: doctor.id,
        },
      });
      return { message: "Appointment cancelled." };
    });
  }

  async cancelByPatient(id: string, dto: CancelPatientDto) {
    const patient = await this.findUserByIdentifier(dto.patientIdentifier);
    if (patient.role !== Role.PATIENT) throw new UnauthorizedException("Only patients can cancel.");

    return this.prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.findUnique({
        where: { id },
        include: { slot: true },
      });
      if (!appt) throw new NotFoundException("Appointment not found.");
      if (appt.patientId !== patient.id) throw new UnauthorizedException("Not your appointment.");

      await tx.appointment.delete({ where: { id } });
      await tx.availabilitySlot.update({
        where: { id: appt.slotId },
        data: { status: SlotStatus.OPEN },
      });
      await this.createEvent({
        doctorId: appt.doctorId,
        patientId: appt.patientId,
        appointmentId: appt.id,
        type: PerformanceEventType.CANCEL_PATIENT,
      });
      await tx.notification.create({
        data: {
          title: "Appointment cancelled by patient",
          body: "Patient cancelled their reservation; slot reopened.",
          recipientId: appt.doctorId,
        },
      });
      await tx.notification.create({
        data: {
          title: "You cancelled your appointment",
          body: "Your reservation was cancelled and the slot reopened.",
          recipientId: patient.id,
        },
      });
      return { message: "Appointment cancelled." };
    });
  }

  async mine(role: "doctor" | "patient", identifier: string) {
    const user = await this.findUserByIdentifier(identifier);
    const where =
      role === "doctor"
        ? { doctorId: user.id }
        : role === "patient"
          ? { patientId: user.id }
          : null;
    if (!where) throw new BadRequestException("Invalid role.");
    return this.prisma.appointment.findMany({
      where,
      include: {
        slot: {
          include: {
            doctor: true,
          },
        },
        patient: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async reportSubmitted(id: string, dto: ReportSubmittedDto) {
    const doctor = await this.findUserByIdentifier(dto.doctorIdentifier);
    if (doctor.role !== Role.DOCTOR) throw new UnauthorizedException("Only doctors can submit reports.");
    const appt = await this.prisma.appointment.findUnique({ where: { id }, include: { slot: true } });
    if (!appt) throw new NotFoundException("Appointment not found.");
    if (appt.doctorId !== doctor.id) throw new UnauthorizedException("Not your appointment.");

    await this.prisma.appointment.update({
      where: { id },
      data: { reportSubmitted: true, reportSubmittedAt: new Date() },
    });
    await this.createEvent({
      doctorId: doctor.id,
      patientId: appt.patientId,
      appointmentId: appt.id,
      type: PerformanceEventType.REPORT_SUBMITTED,
    });
    await this.prisma.notification.create({
      data: {
        title: "Report submitted",
        body: "You submitted a case report.",
        recipientId: doctor.id,
      },
    });
    return { message: "Report submitted." };
  }

  async performance(doctorIdentifier: string, weekStart: string, weekEnd: string) {
    const doctor = await this.findUserByIdentifier(doctorIdentifier);
    if (doctor.role !== Role.DOCTOR) throw new UnauthorizedException("Only doctors can view performance.");
    const start = new Date(weekStart);
    const end = new Date(weekEnd);
    const events = await this.prisma.appointmentEvent.findMany({
      where: { doctorId: doctor.id, createdAt: { gte: start, lt: end } },
    });
    const counts = {
      done: 0,
      rejected: 0,
      cancelledByDoctor: 0,
      cancelledByPatient: 0,
      noShow: 0,
    };
    events.forEach((e) => {
      switch (e.type) {
        case PerformanceEventType.REPORT_SUBMITTED:
          counts.done += 1;
          break;
        case PerformanceEventType.REJECTED:
          counts.rejected += 1;
          break;
        case PerformanceEventType.CANCEL_DOCTOR:
          counts.cancelledByDoctor += 1;
          break;
        case PerformanceEventType.CANCEL_PATIENT:
          counts.cancelledByPatient += 1;
          break;
        case PerformanceEventType.NO_SHOW:
          counts.noShow += 1;
          break;
      }
    });
    return counts;
  }

  async deleteSlot(slotId: string, doctorIdentifier: string) {
    const doctor = await this.findUserByIdentifier(doctorIdentifier);
    if (doctor.role !== Role.DOCTOR) throw new UnauthorizedException("Only doctors can delete slots.");

    return this.prisma.$transaction(async (tx) => {
      const slot = await tx.availabilitySlot.findUnique({
        where: { id: slotId },
        include: { appointment: true },
      });
      if (!slot) throw new NotFoundException("Slot not found.");
      if (slot.doctorId !== doctor.id) throw new UnauthorizedException("Not your slot.");

      if (slot.appointment) {
        await tx.notification.create({
          data: {
            title: "Appointment cancelled",
            body: "Doctor cancelled your reservation because the slot was removed.",
            recipientId: slot.appointment.patientId,
          },
        });
        await tx.appointment.delete({ where: { id: slot.appointment.id } });
      }

      await tx.availabilitySlot.delete({ where: { id: slot.id } });
      await tx.notification.create({
        data: {
          title: "Slot removed",
          body: `You removed your slot for ${slot.startTime.toISOString()}.`,
          recipientId: doctor.id,
        },
      });

      return { message: "Slot removed." };
    });
  }

  async deleteSlotsBatch(slotIds: string[], doctorIdentifier: string, dateLabel?: string) {
    const doctor = await this.findUserByIdentifier(doctorIdentifier);
    if (doctor.role !== Role.DOCTOR) throw new UnauthorizedException("Only doctors can delete slots.");
    if (!slotIds.length) throw new BadRequestException("No slots provided.");

    return this.prisma.$transaction(async (tx) => {
      const slots = await tx.availabilitySlot.findMany({
        where: { id: { in: slotIds }, doctorId: doctor.id },
        include: { appointment: true },
      });
      for (const slot of slots) {
        if (slot.appointment) {
          await tx.notification.create({
            data: {
              title: "Appointment cancelled",
              body: "Doctor cancelled your reservation because the slot was removed.",
              recipientId: slot.appointment.patientId,
            },
          });
          await tx.appointment.delete({ where: { id: slot.appointment.id } });
        }
        await tx.availabilitySlot.delete({ where: { id: slot.id } });
      }

      await tx.notification.create({
        data: {
          title: "Day removed",
          body: dateLabel
            ? `All appointments on ${dateLabel} were removed.`
            : "All selected appointments were removed.",
          recipientId: doctor.id,
        },
      });

      return { message: "Slots removed." };
    });
  }
}
