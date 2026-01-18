import { Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import { SupervisorService } from "./supervisor.service";
import { DecisionDto } from "./dto";
import { BlockDto } from "./block.dto";

@Controller("supervisor")
export class SupervisorController {
  constructor(private readonly supervisorService: SupervisorService) {}

  @Get("requests")
  listPending(@Headers("x-actor-username") actorUsername?: string, @Headers("x-actor-password") actorPassword?: string) {
    return this.supervisorService.listPending(actorUsername, actorPassword);
  }

  @Get("users")
  listUsers(@Headers("x-actor-username") actorUsername?: string, @Headers("x-actor-password") actorPassword?: string) {
    return this.supervisorService.listUsers(actorUsername, actorPassword);
  }

  @Post("users/:id/block")
  blockUser(
    @Param("id") id: string,
    @Body() dto: BlockDto,
    @Headers("x-actor-username") actorUsername?: string,
    @Headers("x-actor-password") actorPassword?: string,
  ) {
    return this.supervisorService.setBlocked(id, dto.blocked, actorUsername, actorPassword);
  }

  @Post("users/:id/delete")
  deleteUser(
    @Param("id") id: string,
    @Headers("x-actor-username") actorUsername?: string,
    @Headers("x-actor-password") actorPassword?: string,
  ) {
    return this.supervisorService.deleteUser(id, actorUsername, actorPassword);
  }

  @Get("doctor-requests")
  listDoctorPending(
    @Headers("x-actor-username") actorUsername?: string,
    @Headers("x-actor-password") actorPassword?: string,
  ) {
    return this.supervisorService.listDoctorPending(actorUsername, actorPassword);
  }

  @Post("doctor-requests/:id/decision")
  decideDoctor(
    @Param("id") id: string,
    @Body() dto: DecisionDto,
    @Headers("x-actor-username") actorUsername?: string,
    @Headers("x-actor-password") actorPassword?: string,
  ) {
    return this.supervisorService.decideDoctor(id, dto.approve, dto.note, actorUsername, actorPassword);
  }

  @Post("users/:id/reapprove")
  reapproveUser(
    @Param("id") id: string,
    @Headers("x-actor-username") actorUsername?: string,
    @Headers("x-actor-password") actorPassword?: string,
  ) {
    return this.supervisorService.reapproveSupervisor(id, actorUsername, actorPassword);
  }

  @Post("users/:id/reapprove-doctor")
  reapproveDoctor(
    @Param("id") id: string,
    @Headers("x-actor-username") actorUsername?: string,
    @Headers("x-actor-password") actorPassword?: string,
  ) {
    return this.supervisorService.reapproveDoctor(id, actorUsername, actorPassword);
  }

  @Post("requests/:id/decision")
  decide(
    @Param("id") id: string,
    @Body() dto: DecisionDto,
    @Headers("x-actor-username") actorUsername?: string,
    @Headers("x-actor-password") actorPassword?: string,
  ) {
    return this.supervisorService.decide(id, dto.approve, dto.note, actorUsername, actorPassword);
  }
}
