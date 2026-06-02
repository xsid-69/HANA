import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, publicProcedure, protectedProcedure } from '../trpc'

export const companionRouter = router({
  getAll: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      city: z.string().optional(),
      district: z.string().optional(),
      tags: z.array(z.string()).optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      sortBy: z.enum(['rating', 'price_asc', 'price_desc', 'name']).optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ ctx, input }) => {
      const f = input ?? {}
      const page = f.page ?? 1
      const limit = f.limit ?? 50

      const where = {
        isActive: true,
        ...(f.city && { city: { equals: f.city, mode: 'insensitive' } }),
        ...(f.district && { district: { contains: f.district, mode: 'insensitive' } }),
        ...(f.tags?.length && { tags: { hasSome: f.tags } }),
        ...((f.minPrice || f.maxPrice) ? {
          hourlyRate: {
            ...(f.minPrice && { gte: f.minPrice }),
            ...(f.maxPrice && { lte: f.maxPrice }),
          }
        } : {}),
        ...(f.search ? {
          OR: [
            { displayName: { contains: f.search, mode: 'insensitive' } },
            { bio: { contains: f.search, mode: 'insensitive' } },
            { city: { contains: f.search, mode: 'insensitive' } },
            { district: { contains: f.search, mode: 'insensitive' } },
            { tags: { hasSome: [f.search.toLowerCase()] } },
          ]
        } : {}),
      }

      const orderBy =
        f.sortBy === 'price_asc' ? { hourlyRate: 'asc' } :
        f.sortBy === 'price_desc' ? { hourlyRate: 'desc' } :
        f.sortBy === 'name' ? { displayName: 'asc' } :
        { averageRating: 'desc' }

      return ctx.prisma.companion.findMany({
        where,
        include: {
          user: { select: { name: true, image: true } },
          experiences: true,
          _count: { select: { reviews: true, bookings: true } },
        },
        orderBy,
        take: limit,
        skip: (page - 1) * limit,
      })
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
