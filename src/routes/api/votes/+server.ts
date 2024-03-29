import { error, json } from '@sveltejs/kit'
import * as votes from '$lib/models/votes'

export async function GET ({ locals }) {
  if (!locals.user) return error(401)

  const userVotes = await votes.findByUserId(locals.user.id)
  const voteMap = votes.mapUserVotes(userVotes)

  return json({ voteMap })
}

export async function PUT ({ locals, request }) {
  if (!locals.user) return error(401)
  if (locals.settings.live === 'true') return error(403)

  const body = await request.json()
  if (!validatePutBody(body)) {
    return error(400, 'Invalid body')
  }

  await votes.upsertMany({
    userId: locals.user.id,
    votes: [body]
  })

  return new Response(null, { status: 200 })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validatePutBody(body: any): body is { category: string, nominee: string } {
  if (!body) return false
  if (!body.category || !body.nominee) return false
  return true
}