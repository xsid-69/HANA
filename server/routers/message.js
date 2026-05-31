import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const messageRouter = router({
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.conversation.findMany({
      where: {
        participants: { some: { userId: ctx.user.id } }
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, image: true } } }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    })
  }),

  getMessages: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      cursor: z.string().optional(),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const participant = await ctx.prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: input.conversationId,
            userId: ctx.user.id,
          }
        }
      })

      if (!participant) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const messages = await ctx.prisma.message.findMany({
        where: { conversationId: input.conversationId },
        include: { sender: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
        take: input.limit + 1,
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
      })

      let nextCursor = undefined
      if (messages.length > input.limit) {
        const next = messages.pop()
        nextCursor = next.id
      }

      return { messages, nextCursor }
    }),

  send: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      content: z.string().min(1).max(2000),
      type: z.enum(['TEXT', 'IMAGE']).default('TEXT'),
    }))
    .mutation(async ({ ctx, input }) => {
      const participant = await ctx.prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: input.conversationId,
            userId: ctx.user.id,
          }
        }
      })

      if (!participant) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const message = await ctx.prisma.message.create({
        data: {
          conversationId: input.conversationId,
          senderId: ctx.user.id,
          content: input.content,
          type: input.type,
        },
        include: { sender: { select: { id: true, name: true, image: true } } }
      })

      await ctx.prisma.conversation.update({
        where: { id: input.conversationId },
        data: { lastMessageAt: new Date() }
      })

      const otherParticipants = await ctx.prisma.conversationParticipant.findMany({
        where: {
          conversationId: input.conversationId,
          userId: { not: ctx.user.id }
        }
      })

      for (const p of otherParticipants) {
        await ctx.prisma.notification.create({
          data: {
            userId: p.userId,
            type: 'NEW_MESSAGE',
            title: 'New Message',
            body: input.content.slice(0, 100),
            data: { conversationId: input.conversationId },
          }
        })
      }

      return message
    }),

  markRead: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.message.updateMany({
        where: {
          conversationId: input.conversationId,
          senderId: { not: ctx.user.id },
          isRead: false,
        },
        data: { isRead: true, readAt: new Date() }
      })

      await ctx.prisma.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId: input.conversationId,
            userId: ctx.user.id,
          }
        },
        data: { lastReadAt: new Date() }
      })

      return { success: true }
    }),
})
