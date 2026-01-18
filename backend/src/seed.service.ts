import { PrismaService } from "./prisma.service";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { Role, SupervisorStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const passwordHash = await bcrypt.hash("Shamali5658040@", 10);
    await this.prisma.user.upsert({
      where: { username: "prof.shamali" },
      update: {
        email: "omar.sh.880.oa@gmail.com",
        phone: "0795658040",
        password: passwordHash,
        role: Role.ADMIN,
        supervisorStatus: SupervisorStatus.APPROVED,
        name: "prof.shamali",
        age: 23,
        gender: "male",
      },
      create: {
        username: "prof.shamali",
        email: "omar.sh.880.oa@gmail.com",
        phone: "0795658040",
        password: passwordHash,
        role: Role.ADMIN,
        supervisorStatus: SupervisorStatus.APPROVED,
        name: "prof.shamali",
        age: 23,
        gender: "male",
      },
    });
  }
}
