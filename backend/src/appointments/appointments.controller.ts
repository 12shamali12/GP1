import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { AppointmentsService } from "./appointments.service";
import {
  BookSlotDto,
  CancelDto,
  CancelPatientDto,
  CreateSlotDto,
  DecisionDto,
  DeleteSlotDto,
  ReportSubmittedDto,
} from "./dto";

@Controller("appointments")
export class AppointmentsController {
  constructor(private readonly svc: AppointmentsService) {}

  @Post("slots")
  createSlot(@Body() dto: CreateSlotDto) {
    return this.svc.createSlot(dto);
  }

  @Get("slots")
  listSlots(@Query("doctorId") doctorId?: string) {
    return this.svc.listSlots(doctorId);
  }

  @Post("book")
  book(@Body() dto: BookSlotDto) {
    return this.svc.bookSlot(dto);
  }

  @Post(":id/decision")
  decision(@Param("id") id: string, @Body() dto: DecisionDto) {
    return this.svc.decision(id, dto);
  }

  @Post(":id/cancel")
  cancel(@Param("id") id: string, @Body() dto: CancelDto) {
    return this.svc.cancel(id, dto);
  }

  @Post(":id/cancel-patient")
  cancelByPatient(@Param("id") id: string, @Body() dto: CancelPatientDto) {
    return this.svc.cancelByPatient(id, dto);
  }

  @Post(":id/report-submitted")
  reportSubmitted(@Param("id") id: string, @Body() dto: ReportSubmittedDto) {
    return this.svc.reportSubmitted(id, dto);
  }

  @Get("performance")
  performance(
    @Query("doctorIdentifier") doctorIdentifier: string,
    @Query("weekStart") weekStart: string,
    @Query("weekEnd") weekEnd: string
  ) {
    return this.svc.performance(doctorIdentifier, weekStart, weekEnd);
  }

  @Delete("slots/:id")
  removeSlot(@Param("id") id: string, @Body() dto: DeleteSlotDto) {
    return this.svc.deleteSlot(id, dto.doctorIdentifier);
  }

  @Post("slots/batch-delete")
  removeSlotsBatch(
    @Body("slotIds") slotIds: string[],
    @Body("doctorIdentifier") doctorIdentifier: string,
    @Body("dateLabel") dateLabel?: string
  ) {
    return this.svc.deleteSlotsBatch(slotIds || [], doctorIdentifier, dateLabel);
  }

  @Get("mine")
  mine(@Query("role") role: "doctor" | "patient", @Query("identifier") identifier: string) {
    return this.svc.mine(role, identifier);
  }
}
