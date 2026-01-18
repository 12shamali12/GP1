import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Prisma, Role } from "@prisma/client";

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  private async findUserByIdentifier(identifier: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { email: identifier },
          { phone: identifier },
          { username: identifier },
          { name: identifier },
          { doctorIdNumber: identifier },
        ],
      },
    });
    if (!user) throw new BadRequestException("User not found for identifier.");
    return user;
  }

  async list(identifier: string) {
    const user = await this.findUserByIdentifier(identifier);
    return this.prisma.notification.findMany({
      where: { recipientId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  async markRead(id: string, identifier: string, read: boolean) {
    const user = await this.findUserByIdentifier(identifier);
    const notif = await this.prisma.notification.findFirst({
      where: { id, recipientId: user.id },
    });
    if (!notif) throw new NotFoundException("Notification not found.");
    return this.prisma.notification.update({
      where: { id },
      data: { read },
    });
  }

  async remove(id: string, identifier: string) {
    const user = await this.findUserByIdentifier(identifier);
    const notif = await this.prisma.notification.findFirst({
      where: { id, recipientId: user.id },
    });
    if (!notif) throw new NotFoundException("Notification not found.");
    await this.prisma.notification.delete({ where: { id } });
    return { message: "Notification deleted." };
  }

  async removeAll(identifier: string) {
    const user = await this.findUserByIdentifier(identifier);
    await this.prisma.notification.deleteMany({ where: { recipientId: user.id } });
    return { message: "All notifications deleted." };
  }
}
