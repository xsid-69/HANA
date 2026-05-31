import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const reviewRouter = router({
  create: protectedProcedure
    .input(z.object({
      bookingId: z.string(),
      rating: z.number().min(1).max(5),
      content: z.string().min(10).max(1000),
    }))
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.findUnique({
        where: { id: input.bookingId },
        include: { review: true }
      })

      if (!booking) throw new TRPCError({ code: 'NOT_FOUND' })
      if (booking.clientId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }
      if (booking.status !== 'COMPLETED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Booking must be completed to review' })
      }
      if (booking.review) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Review already exists' })
      }

      const review = await ctx.prisma.review.create({
        data: {
          bookingId: input.bookingId,
          authorId: ctx.user.id,
          companionId: booking.companionId,
          rating: input.rating,
          content: input.content,
        }
      })

      const reviews = await ctx.prisma.review.findMany({
        where: { companionId: booking.companionId, isVisible: true },
        select: { rating: true }
      })

      const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

      await ctx.prisma.companion.update({
        where: { id: booking.companionId },
        data: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: reviews.length,
        }
      })

      return review
    }),

  getByCompanion: publicProcedure
    .input(z.object({
      companionId: z.string(),
      page: z.number().default(1),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.review.findMany({
        where: { companionId: input.companionId, isVisible: true },
        include: { author: { select: { name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: (input.page - 1) * 10,
      })
    }),
})
