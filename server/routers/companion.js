import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, publicProcedure, protectedProcedure } from '../trpc'

export const companionRouter = router({
  getAll: publicProcedure
    .input(z.object({
      city: z.string().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      tags: z.array(z.string()).optional(),
      activity: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      const filters = input ?? {}
      const page = filters.page ?? 1
      const limit = filters.limit ?? 20

      const companions = await ctx.prisma.companion.findMany({
        where: {
          isActive: true,
          ...(filters.city && { city: filters.city }),
          ...(filters.minPrice || filters.maxPrice ? {
            hourlyRate: {
              ...(filters.minPrice && { gte: filters.minPrice }),
              ...(filters.maxPrice && { lte: filters.maxPrice }),
            }
          } : {}),
          ...(filters.tags?.length && { tags: { hasSome: filters.tags } }),
        },
        include: {
          user: { select: { name: true, image: true } },
          experiences: true,
          _count: { select: { reviews: true, bookings: true } }
        },
        orderBy: { averageRating: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      })

      return companions
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const companion = await ctx.prisma.companion.findUnique({
        where: { id: input.id },
        include: {
          user: { select: { name: true, image: true } },
          experiences: true,
          availability: true,
          reviews: {
            where: { isVisible: true },
            include: { author: { select: { name: true, image: true } } },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: { select: { reviews: true, bookings: true } }
        }
      })

      if (!companion) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Companion not found' })
      }

      return companion
    }),

  getFeatured: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.companion.findMany({
      where: { isActive: true, isFeatured: true },
      include: {
        user: { select: { name: true, image: true } },
        experiences: true,
      },
      orderBy: { averageRating: 'desc' },
      take: 10,
    })
  }),

  search: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.companion.findMany({
        where: {
          isActive: true,
          OR: [
            { displayName: { contains: input.query, mode: 'insensitive' } },
            { bio: { contains: input.query, mode: 'insensitive' } },
            { tags: { hasSome: [input.query.toLowerCase()] } },
            { city: { contains: input.query, mode: 'insensitive' } },
          ]
        },
        include: {
          user: { select: { name: true, image: true } },
          experiences: true,
        },
        take: 20,
      })
    }),

  getAvailability: publicProcedure
    .input(z.object({ companionId: z.string(), date: z.string() }))
    .query(async ({ ctx, input }) => {
      const date = new Date(input.date)
      const dayOfWeek = date.getDay()

      const availability = await ctx.prisma.availability.findUnique({
        where: { companionId_dayOfWeek: { companionId: input.companionId, dayOfWeek } }
      })

      const blockedDate = await ctx.prisma.blockedDate.findFirst({
        where: { companionId: input.companionId, date }
      })

      const existingBookings = await ctx.prisma.booking.findMany({
        where: {
          companionId: input.companionId,
          date,
          status: { in: ['PENDING', 'CONFIRMED'] }
        },
        select: { startTime: true, endTime: true }
      })

      return {
        isAvailable: availability?.isAvailable && !blockedDate,
        startTime: availability?.startTime,
        endTime: availability?.endTime,
        bookedSlots: existingBookings,
      }
    }),
})
