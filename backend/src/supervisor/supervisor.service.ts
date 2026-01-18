import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Role, SupervisorStatus, DoctorStatus, SlotStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

@Injectable()
export class SupervisorService {
  constructor(private readonly prisma: PrismaService) {}

  private async requireAdmin(actorUsername: string | undefined, actorPassword: string | undefined) {
    if (!actorUsername || !actorPassword) {
      throw new ForbiddenException("Admin credentials required in headers x-actor-username and x-actor-password.");
    }
    const admin = await this.prisma.user.findUnique({ where: { username: actorUsername } });
    if (!admin || admin.role !== Role.ADMIN) {
      throw new ForbiddenException("Only the admin can perform this action.");
    }
    const ok = await bcrypt.compare(actorPassword, admin.password);
    if (!ok) throw new ForbiddenException("Invalid admin credentials.");
    return admin;
  }

  async listPending(actorUsername?: string, actorPassword?: string) {
    await this.requireAdmin(actorUsername, actorPassword);
    return this.prisma.supervisorRequest.findMany({
      where: { status: SupervisorStatus.PENDING },
      orderBy: { createdAt: "asc" },
      include: { applicant: true },
    });
  }

  async listUsers(actorUsername?: string, actorPassword?: string) {
    await this.requireAdmin(actorUsername, actorPassword);
    return this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        supervisorStatus: true,
        doctorStatus: true,
        blocked: true,
        createdAt: true,
      },
    });
  }

  async setBlocked(id: string, blocked: boolean, actorUsername?: string, actorPassword?: string) {
    await this.requireAdmin(actorUsername, actorPassword);
    await this.prisma.user.update({ where: { id }, data: { blocked } });
    return { message: blocked ? "User blocked" : "User unblocked" };
  }

  async deleteUser(id: string, actorUsername?: string, actorPassword?: string) {
    await this.requireAdmin(actorUsername, actorPassword);
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found.");

    await this.prisma.$transaction(async (tx) => {
      await tx.notification.deleteMany({ where: { recipientId: id } });
      await tx.supervisorRequest.deleteMany({
        where: { OR: [{ applicantId: id }, { reviewerId: id }] },
      });
      await tx.doctorRequest.deleteMany({
        where: { OR: [{ applicantId: id }, { reviewerId: id }] },
      });
      await tx.message.deleteMany({ where: { senderId: id } });
      await tx.conversationParticipant.deleteMany({ where: { userId: id } });

      const appointments = await tx.appointment.findMany({
        where: { OR: [{ doctorId: id }, { patientId: id }] },
        select: { id: true, slotId: true },
      });
      const appointmentIds = appointments.map((appt) => appt.id);
      const slotIds = appointments.map((appt) => appt.slotId);
      if (appointmentIds.length > 0) {
        await tx.appointment.deleteMany({ where: { id: { in: appointmentIds } } });
        if (user.role === Role.PATIENT && slotIds.length > 0) {
          await tx.availabilitySlot.updateMany({
            where: { id: { in: slotIds } },
            data: { status: SlotStatus.OPEN },
          });
        }
      }

      if (user.role === Role.DOCTOR) {
        await tx.availabilitySlot.deleteMany({ where: { doctorId: id } });
      }

      await tx.user.delete({ where: { id } });
    });
    return { message: "User deleted" };
  }

  async reapproveSupervisor(id: string, actorUsername?: string, actorPassword?: string) {
    await this.requireAdmin(actorUsername, actorPassword);
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found.");
    if (user.role !== Role.SUPERVISOR) {
      throw new ForbiddenException("Only supervisors can be re-approved.");
    }
    if (user.supervisorStatus !== SupervisorStatus.REJECTED && user.supervisorStatus !== SupervisorStatus.PENDING) {
      throw new ForbiddenException("Only pending or rejected supervisors can be re-approved.");
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        data: { supervisorStatus: SupervisorStatus.APPROVED },
      }),
      this.prisma.notification.create({
        data: {
          title: "Supervisor access approved",
          body: "Your supervisor access was approved by the admin.",
          recipientId: id,
        },
      }),
    ]);

    return { message: "Supervisor re-approved." };
  }

  async reapproveDoctor(id: string, actorUsername?: string, actorPassword?: string) {
    await this.requireAdmin(actorUsername, actorPassword);
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found.");
    if (user.role !== Role.DOCTOR) {
      throw new ForbiddenException("Only doctors can be re-approved.");
    }
    if (user.doctorStatus !== DoctorStatus.REJECTED && user.doctorStatus !== DoctorStatus.PENDING) {
      throw new ForbiddenException("Only pending or rejected doctors can be re-approved.");
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        data: { doctorStatus: DoctorStatus.APPROVED },
      }),
      this.prisma.notification.create({
        data: {
          title: "Doctor access approved",
          body: "Your doctor access was approved by the admin.",
          recipientId: id,
        },
      }),
    ]);

    return { message: "Doctor re-approved." };
  }

  async listDoctorPending(actorUsername?: string, actorPassword?: string) {
    await this.requireAdmin(actorUsername, actorPassword);
    return this.prisma.doctorRequest.findMany({
      where: { status: DoctorStatus.PENDING },
      orderBy: { createdAt: "asc" },
      include: { applicant: true },
    });
  }

  async decideDoctor(
    id: string,
    approve: boolean,
    note: string | undefined,
    actorUsername?: string,
    actorPassword?: string,
  ) {
    const admin = await this.requireAdmin(actorUsername, actorPassword);
    const request = await this.prisma.doctorRequest.findUnique({
      where: { id },
      include: { applicant: true },
    });
    if (!request) throw new NotFoundException("Request not found.");
    if (request.status !== DoctorStatus.PENDING) {
      throw new ForbiddenException("Request already processed.");
    }
    const newStatus = approve ? DoctorStatus.APPROVED : DoctorStatus.REJECTED;
    await this.prisma.$transaction([
      this.prisma.doctorRequest.update({
        where: { id },
        data: {
          status: newStatus,
          note: note ?? null,
          reviewerId: admin.id,
          decidedAt: new Date(),
        },
      }),
      this.prisma.user.update({
        where: { id: request.applicantId },
        data: { doctorStatus: newStatus },
      }),
      this.prisma.notification.create({
        data: {
          title: approve ? "Doctor request approved" : "Doctor request rejected",
          body: approve
            ? "You can now sign in as a doctor."
            : note ?? "Your doctor request was rejected.",
          recipientId: request.applicantId,
        },
      }),
    ]);
    return { message: approve ? "Approved" : "Rejected" };
  }

  async decide(
    id: string,
    approve: boolean,
    note: string | undefined,
    actorUsername?: string,
    actorPassword?: string,
  ) {
    const admin = await this.requireAdmin(actorUsername, actorPassword);
    const request = await this.prisma.supervisorRequest.findUnique({
      where: { id },
      include: { applicant: true },
    });
    if (!request) throw new NotFoundException("Request not found.");
    if (request.status !== SupervisorStatus.PENDING) {
      throw new ForbiddenException("Request already processed.");
    }

    const newStatus = approve ? SupervisorStatus.APPROVED : SupervisorStatus.REJECTED;
    await this.prisma.$transaction([
      this.prisma.supervisorRequest.update({
        where: { id },
        data: {
          status: newStatus,
          note: note ?? null,
          reviewerId: admin.id,
          decidedAt: new Date(),
        },
      }),
      this.prisma.user.update({
        where: { id: request.applicantId },
        data: { supervisorStatus: newStatus },
      }),
      this.prisma.notification.create({
        data: {
          title: approve ? "Supervisor request approved" : "Supervisor request rejected",
          body: approve
            ? "You can now sign in as a supervisor."
            : note ?? "Your supervisor request was rejected.",
          recipientId: request.applicantId,
        },
      }),
    ]);

    return { message: approve ? "Approved" : "Rejected" };
  }
}

