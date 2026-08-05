'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { getRecommendations } from '@/app/actions/recommendations'
import CompanionCard from '@/components/companion/CompanionCard'

export default function PersonalizedCompanionsSection({ userId }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['recommendations', userId],
    queryFn: () => getRecommendations(userId),
    enabled: Boolean(userId),
    staleTime: 60 * 60 * 1000,
  })
  if (!userId || isError || (!isLoading && !data?.companions?.length)) return null

  const cold = data?.isColdStart
  const items = isLoading ? Array.from({ length: 5 }) : data.companions
  return (
    <section className="mt-7" aria-labelledby="personalized-companions-heading">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 id="personalized-companions-heading" className="font-heading text-xl font-bold text-[#38232a] sm:text-2xl">{cold ? 'Companions to get you started' : 'Picked for you'}</h2>
          <p className="mt-1 text-xs text-[#806970] sm:text-sm">{cold ? 'Popular profiles while Hana learns what you enjoy' : 'Based on the companions and experiences you engage with'}</p>
        </div>
        <Link href="/discover" className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#ad4563] hover:text-[#8f334e] sm:text-sm">See all <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
      </div>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:px-0 lg:grid-cols-5 [&::-webkit-scrollbar]:hidden">
        {items.map((companion, index) => isLoading ? (
          <div key={index} className="h-56 w-44 shrink-0 animate-pulse rounded-[1.25rem] bg-white/70 ring-1 ring-[#ead8d5] md:w-auto" aria-hidden="true" />
        ) : (
          <Link key={companion.id} href={`/companion/${companion.id}`} className="w-44 shrink-0 snap-start md:w-auto">
            <CompanionCard companion={companion} compact personalized={!cold} />
          </Link>
        ))}
      </div>
    </section>
  )
}
