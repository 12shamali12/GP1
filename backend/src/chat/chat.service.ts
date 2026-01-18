import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { SendMessageDto, StartMessageDto } from "./dto";

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  private async findUser(identifier: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { email: identifier },
          { phone: identifier },
          { username: identifier },
        ],
      },
    });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  private async getConversationForUsers(userIds: string[]) {
    const convo = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: userIds[0] } } },
          { participants: { some: { userId: userIds[1] } } },
          { participants: { every: { userId: { in: userIds } } } },
        ],
      },
      include: {
        participants: true,
      },
    });
    return convo;
  }


  private async ensureParticipants(conversationId: string, userIds: string[]) {
    if (userIds.length === 0) return;
    await this.prisma.conversationParticipant.createMany({
      data: userIds.map((userId) => ({ conversationId, userId })),
      skipDuplicates: true,
    });
  }

  private async ensureParticipant(conversationId: string, userId: string) {
    const existing = await this.prisma.conversationParticipant.findFirst({
      where: { conversationId, userId },
    });
    if (existing) return existing;
    const count = await this.prisma.conversationParticipant.count({
      where: { conversationId },
    });
    if (count === 0) {
      return this.prisma.conversationParticipant.create({
        data: { conversationId, userId },
      });
    }
    return null;
  }


  private async cleanupOrphanConversations() {
    const orphans = await this.prisma.conversation.findMany({
      where: { participants: { none: {} } },
      select: { id: true },
    });
    const ids = orphans.map((o) => o.id);
    if (ids.length === 0) return 0;
    await this.prisma.message.deleteMany({
      where: { conversationId: { in: ids } },
    });
    await this.prisma.conversation.deleteMany({
      where: { id: { in: ids } },
    });
    return ids.length;
  }

  async listConversations(identifier: string) {
    await this.cleanupOrphanConversations();
    const user = await this.findUser(identifier);
    const convos = await this.prisma.conversation.findMany({
      where: { participants: { some: { userId: user.id } } },
      orderBy: { updatedAt: "desc" },
      include: {
        participants: { include: { user: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: true } },
      },
    });
    const enriched = await Promise.all(
      convos.map(async (c) => {
        const last = c.messages[0];
        const other = c.participants.find((p) => p.userId !== user.id);
        const unread = await this.prisma.message.count({
          where: {
            conversationId: c.id,
            senderId: { not: user.id },
            createdAt: {
              gt:
                c.participants.find((p) => p.userId === user.id)?.lastReadAt ||
                new Date(0),
            },
          },
        });
        return {
          id: c.id,
          lastMessage: last,
          otherUser: other?.user,
          unread,
        };
      })
    );
    return enriched;
  }

  async unreadConversationsCount(identifier: string) {
    const user = await this.findUser(identifier);
    const convos = await this.prisma.conversation.findMany({
      where: { participants: { some: { userId: user.id } } },
      include: { participants: true },
    });
    let unread = 0;
    for (const c of convos) {
      const hasUnread = await this.prisma.message.count({
        where: {
          conversationId: c.id,
          senderId: { not: user.id },
          createdAt: {
            gt:
              c.participants.find((p) => p.userId === user.id)?.lastReadAt ||
              new Date(0),
          },
        },
      });
      if (hasUnread > 0) unread += 1;
    }
    return unread;
  }

  async searchUsers(query: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { phone: { contains: query } },
          { username: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, phone: true, email: true, username: true, avatar: true, role: true },
      take: 20,
    });
  }

  async startOrSend(dto: StartMessageDto) {
    const sender = await this.findUser(dto.senderIdentifier);
    const recipient = await this.findUser(dto.recipientIdentifier);
    let convo = await this.getConversationForUsers([sender.id, recipient.id]);
    if (!convo) {
      const created = await this.prisma.conversation.create({
        data: {
          participants: {
            create: [
              { userId: sender.id },
              { userId: recipient.id },
            ],
          },
        },
      });
      convo = await this.prisma.conversation.findUnique({
        where: { id: created.id },
        include: { participants: true },
      });
    }
    if (!convo) throw new NotFoundException("Conversation not created");
    await this.ensureParticipants(convo.id, [sender.id, recipient.id]);
    if (dto.text) {
      await this.prisma.message.create({
        data: {
          conversationId: convo.id,
          senderId: sender.id,
          text: dto.text,
        },
      });
      await this.prisma.conversation.update({
        where: { id: convo.id },
        data: { updatedAt: new Date() },
      });
    }
    return { conversationId: convo.id };
  }

  async sendMessage(conversationId: string, dto: SendMessageDto, imageUrl?: string) {
    const sender = await this.findUser(dto.senderIdentifier);
    const participation = await this.ensureParticipant(conversationId, sender.id);
    if (!participation) throw new UnauthorizedException("Not part of this conversation");

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: sender.id,
        text: dto.text || null,
        imageUrl: imageUrl || null,
      },
      include: { sender: true },
    });
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
    return message;
  }

  async listMessages(conversationId: string, identifier: string) {
    const user = await this.findUser(identifier);
    const participation = await this.ensureParticipant(conversationId, user.id);
    if (!participation) throw new UnauthorizedException("Not part of this conversation");
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: { sender: true },
      take: 100,
    });
    // mark read
    await this.prisma.conversationParticipant.update({
      where: { id: participation.id },
      data: { lastReadAt: new Date() },
    });
    return messages;
  }

  async markRead(conversationId: string, identifier: string) {
    const user = await this.findUser(identifier);
    const participation = await this.ensureParticipant(conversationId, user.id);
    if (!participation) throw new UnauthorizedException("Not part of this conversation");
    await this.prisma.conversationParticipant.update({
      where: { id: participation.id },
      data: { lastReadAt: new Date() },
    });
    return { ok: true };
  }
}


