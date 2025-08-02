import { prisma } from "../prisma";

export async function createNotification(organisationId: number, type: string, message: string) {
    console.log('Creating notification for organisation:', organisationId);
    
    await prisma.mandateNotification.create({
      data: {
        organisationId,
        type,
        message,
        isRead: false,
        createdAt: new Date(),
      }
    });
  }