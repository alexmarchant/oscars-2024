import prisma from '$lib/prisma'
import type { Vote as PrismaVote } from '@prisma/client'
import { Categories } from '$lib/nominees'


export type Vote = PrismaVote

export interface VoteData {
  category: string
  nominee: string
}

export async function upsertMany({ userId, votes }: { userId: number, votes: VoteData[] }): Promise<Vote[]> {
  for (const vote of votes) {
    if (!validateVoteData(vote)) {
      throw new Error('Invalid vote data')
    }
  }

  const promises = votes.map(vote => {
    return prisma.vote.upsert({
      where: {
        user_category_unique: {
          userId,
          category: vote.category,
        },
      },
      update: {
        nominee: vote.nominee,
      },
      create: {
        userId,
        category: vote.category,
        nominee: vote.nominee,
      },
    })
  })

  return Promise.all(promises)
}

export async function findByUserId(userId: number): Promise<Vote[]> {
  return prisma.vote.findMany({
    where: {
      userId,
    }
  })
}

export async function findAll(): Promise<Vote[]> {
  return prisma.vote.findMany()
}

export function mapUserVotes(votes: Vote[]): Record<string, string> {
  return votes.reduce((acc, vote) => {
    acc[vote.category] = vote.nominee
    return acc
  }, {} as Record<string, string>)
}

export function validateVoteData(data: VoteData): boolean {
  const category = Categories.find(c => c.name === data.category)
  if (!category) return false
  if (!category.nominees.includes(data.nominee)) return false
  return true
}