import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const bookingRouter = router({
  create: protectedProcedure
    .input(z.object({
      companionId: z.string(),
      date: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      durationHours: z.number().min(2).max(8),
      activityType: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const companion = await ctx.prisma.companion.findUnique({
        where: { id: input.companionId },
        select: { hourlyRate: true, userId: true }
      })

      if (!companion) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Companion not found' })
      }

      if (companion.userId === ctx.user.id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot book yourself' })
      }

      const date = new Date(input.date)

      const conflict = await ctx.prisma.booking.findFirst({
        where: {
          companionId: input.companionId,
          date,
          status: { in: ['PENDING', 'CONFIRMED'] },
          OR: [
            { startTime: { lte: input.startTime }, endTime: { gt: input.startTime } },
            { startTime: { lt: input.endTime }, endTime: { gte: input.endTime } },
          ]
        }
      })

      if (conflict) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Time slot unavailable' })
      }

      const subtotal = companion.hourlyRate * input.durationHours
      const serviceFee = Math.round(subtotal * 0.08)
      const deposit = 2000
      const totalAmount = subtotal + serviceFee + deposit

      const booking = await ctx.prisma.booking.create({
        data: {
          clientId: ctx.user.id,
          companionId: input.companionId,
          date,
          startTime: input.startTime,
          endTime: input.endTime,
          durationHours: input.durationHours,
          activityType: input.activityType,
          notes: input.notes,
          hourlyRate: companion.hourlyRate,
          subtotal,
          serviceFee,
          deposit,
          totalAmount,
          status: 'PENDING',
        }
      })

      await ctx.prisma.notification.create({
        data: {
          userId: companion.userId,
          type: 'BOOKING_REQUEST',
          title: 'New Booking Request',
          body: `You have a new booking request for ${input.activityType}`,
          data: { bookingId: booking.id },
        }
      })

      return booking
    }),

  getMyBookings: protectedProcedure
    .input(z.object({
      status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'DECLINED']).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.booking.findMany({
        where: {
          OR: [
            { clientId: ctx.user.id },
            { companion: { userId: ctx.user.id } }
          ],
          ...(input?.status && { status: input.status }),
        },
        include: {
          companion: {
            include: { user: { select: { name: true, image: true } } }
          },
          client: { select: { name: true, image: true } },
        },
        orderBy: { date: 'desc' },
      })
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.findUnique({
        where: { id: input.id },
        include: {
          companion: {
            include: { user: { select: { name: true, image: true } } }
          },
          client: { select: { name: true, image: true } },
          review: true,
        }
      })

      if (!booking) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      if (booking.clientId !== ctx.user.id && booking.companion.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      return booking
    }),

  cancel: protectedProcedure
    .input(z.object({ id: z.string(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.findUnique({
        where: { id: input.id },
        include: { companion: { select: { userId: true } } }
      })

      if (!booking) throw new TRPCError({ code: 'NOT_FOUND' })

      if (booking.clientId !== ctx.user.id && booking.companion.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot cancel this booking' })
      }

      return ctx.prisma.booking.update({
        where: { id: input.id },
        data: {
          status: 'CANCELLED',
          cancelledBy: ctx.user.id,
          cancelledAt: new Date(),
          cancelReason: input.reason,
        }
      })
    }),

  confirm: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.findUnique({
        where: { id: input.id },
        include: { companion: { select: { userId: true } } }
      })

      if (!booking) throw new TRPCError({ code: 'NOT_FOUND' })
      if (booking.companion.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }
      if (booking.status !== 'PENDING') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Booking is not pending' })
      }

      const updated = await ctx.prisma.booking.update({
        where: { id: input.id },
        data: { status: 'CONFIRMED' }
      })

      await ctx.prisma.notification.create({
        data: {
          userId: booking.clientId,
          type: 'BOOKING_CONFIRMED',
          title: 'Booking Confirmed',
          body: 'Your booking has been confirmed!',
          data: { bookingId: booking.id },
        }
      })

      return updated
    }),

  complete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.findUnique({
        where: { id: input.id },
        include: { companion: { select: { userId: true } } }
      })

      if (!booking) throw new TRPCError({ code: 'NOT_FOUND' })
      if (booking.companion.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }
      if (booking.status !== 'CONFIRMED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Booking is not confirmed' })
      }

      const updated = await ctx.prisma.booking.update({
        where: { id: input.id },
        data: { status: 'COMPLETED' }
      })

      await ctx.prisma.notification.create({
        data: {
          userId: booking.clientId,
          type: 'BOOKING_COMPLETED',
          title: 'Booking Completed',
          body: 'Your experience is complete! Leave a review.',
          data: { bookingId: booking.id },
        }
      })

      return updated
    }),
})
