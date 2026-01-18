import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get()
  list(@Query("identifier") identifier: string) {
    return this.svc.list(identifier);
  }

  @Patch(":id/read")
  markRead(
    @Param("id") id: string,
    @Query("identifier") identifier: string,
    @Body("read") read: boolean = true
  ) {
    return this.svc.markRead(id, identifier, read);
  }

  @Patch(":id/delete")
  remove(
    @Param("id") id: string,
    @Query("identifier") identifier: string
  ) {
    return this.svc.remove(id, identifier);
  }

  @Patch("delete/all")
  removeAll(@Query("identifier") identifier: string) {
    return this.svc.removeAll(identifier);
  }
}
