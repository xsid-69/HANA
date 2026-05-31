import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'

export const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        companion: true,
        _count: {
          select: {
            bookingsAsClient: true,
            savedCompanions: true,
            reviewsWritten: true,
          }
        }
      }
    })
  }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100).optional(),
      bio: z.string().max(500).optional(),
      city: z.string().max(100).optional(),
      image: z.string().url().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: input,
      })
    }),

  completeOnboarding: protectedProcedure
    .input(z.object({
      role: z.enum(['CLIENT', 'COMPANION']),
      name: z.string().min(1).max(100),
      city: z.string().min(1).max(100),
      image: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          role: input.role,
          name: input.name,
          city: input.city,
          image: input.image,
        }
      })

      return user
    }),

  getSaved: protectedProcedure.query(async ({ ctx }) => {
    const saved = await ctx.prisma.savedCompanion.findMany({
      where: { userId: ctx.user.id },
      include: {
        companion: {
          include: {
            user: { select: { name: true, image: true } },
            experiences: true,
          }
        }
      },
      orderBy: { savedAt: 'desc' }
    })
    return saved.map(s => s.companion)
  }),

  toggleSave: protectedProcedure
    .input(z.object({ companionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.savedCompanion.findUnique({
        where: {
          userId_companionId: {
            userId: ctx.user.id,
            companionId: input.companionId,
          }
        }
      })

      if (existing) {
        await ctx.prisma.savedCompanion.delete({ where: { id: existing.id } })
        return { saved: false }
      }

      await ctx.prisma.savedCompanion.create({
        data: { userId: ctx.user.id, companionId: input.companionId }
      })
      return { saved: true }
    }),
})
