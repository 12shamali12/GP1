import { Module } from "@nestjs/common";
import { SupervisorController } from "./supervisor.controller";
import { SupervisorService } from "./supervisor.service";
import { PrismaModule } from "../prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [SupervisorController],
  providers: [SupervisorService],
})
export class SupervisorModule {}
