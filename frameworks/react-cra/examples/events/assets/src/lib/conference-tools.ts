import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

import { allSpeakers, allTalks } from 'content-collections'

// Tool definition for getting a speaker by slug
export const getSpeakerBySlugToolDef = toolDefinition({
  name: 'getSpeakerBySlug',
  description:
    'Get the full profile and bio of a specific speaker. Use this when asked about a particular speaker.',
  inputSchema: z.object({
    slug: z.string().describe('The slug of the speaker'),
  }),
  outputSchema: z.object({
    name: z.string(),
    title: z.string(),
    specialty: z.string(),
    restaurant: z.string(),
    location: z.string(),
    bio: z.string(),
    awards: z.array(z.string()),
  }),
})

// Server implementation
export const getSpeakerBySlug = getSpeakerBySlugToolDef.server(({ slug }) => {
  const speaker = allSpeakers.find((s) => s.slug === slug)
  if (!speaker) {
    return {
      name: 'Speaker not found',
      title: '',
      specialty: '',
      restaurant: '',
      location: '',
      bio: 'The requested speaker was not found.',
      awards: [],
    }
  }
  return {
    name: speaker.name,
    title: speaker.title,
    specialty: speaker.specialty,
    restaurant: speaker.restaurant,
    location: speaker.location,
    bio: speaker.content,
    awards: speaker.awards || [],
  }
})

// Tool definition for getting a talk by slug
export const getTalkBySlugToolDef = toolDefinition({
  name: 'getTalkBySlug',
  description:
    'Get the full details of a specific session/talk. Use this when asked about a particular session.',
  inputSchema: z.object({
    slug: z.string().describe('The slug of the talk'),
  }),
  outputSchema: z.object({
    title: z.string(),
    speaker: z.string(),
    duration: z.string(),
    topics: z.array(z.string()),
    description: z.string(),
  }),
})

// Server implementation
export const getTalkBySlug = getTalkBySlugToolDef.server(({ slug }) => {
  const talk = allTalks.find((t) => t.slug === slug)
  if (!talk) {
    return {
      title: 'Session not found',
      speaker: '',
      duration: '',
      topics: [],
      description: 'The requested session was not found.',
    }
  }
  return {
    title: talk.title,
    speaker: talk.speaker,
    duration: talk.duration,
    topics: talk.topics,
    description: talk.content,
  }
})

// Tool definition for listing all speakers
export const getAllSpeakersToolDef = toolDefinition({
  name: 'getAllSpeakers',
  description:
    'Get a list of all speakers at the conference with their names, specialties, and restaurants.',
  inputSchema: z.object({}),
  outputSchema: z.array(
    z.object({
      slug: z.string(),
      name: z.string(),
      specialty: z.string(),
      restaurant: z.string(),
      location: z.string(),
    }),
  ),
})

// Server implementation
export const getAllSpeakers = getAllSpeakersToolDef.server(() => {
  return allSpeakers.map((speaker) => ({
    slug: speaker.slug,
    name: speaker.name,
    specialty: speaker.specialty,
    restaurant: speaker.restaurant,
    location: speaker.location,
  }))
})

// Tool definition for listing all talks
export const getAllTalksToolDef = toolDefinition({
  name: 'getAllTalks',
  description:
    'Get a list of all sessions/talks at the conference with their titles, speakers, and topics.',
  inputSchema: z.object({}),
  outputSchema: z.array(
    z.object({
      slug: z.string(),
      title: z.string(),
      speaker: z.string(),
      duration: z.string(),
      topics: z.array(z.string()),
    }),
  ),
})

// Server implementation
export const getAllTalks = getAllTalksToolDef.server(() => {
  return allTalks.map((talk) => ({
    slug: talk.slug,
    title: talk.title,
    speaker: talk.speaker,
    duration: talk.duration,
    topics: talk.topics,
  }))
})

// Tool definition for searching conference content
export const searchConferenceToolDef = toolDefinition({
  name: 'searchConference',
  description:
    'Search for speakers or sessions by keyword. Use this to find content matching user queries about topics, techniques, or names.',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
  }),
  outputSchema: z.object({
    speakers: z.array(
      z.object({
        slug: z.string(),
        name: z.string(),
        specialty: z.string(),
        restaurant: z.string(),
      }),
    ),
    talks: z.array(
      z.object({
        slug: z.string(),
        title: z.string(),
        speaker: z.string(),
        topics: z.array(z.string()),
      }),
    ),
  }),
})

// Server implementation
export const searchConference = searchConferenceToolDef.server(({ query }) => {
  const queryLower = query.toLowerCase()
  
  const matchingSpeakers = allSpeakers
    .filter(
      (speaker) =>
        speaker.name.toLowerCase().includes(queryLower) ||
        speaker.specialty.toLowerCase().includes(queryLower) ||
        speaker.restaurant.toLowerCase().includes(queryLower) ||
        speaker.content.toLowerCase().includes(queryLower),
    )
    .map((speaker) => ({
      slug: speaker.slug,
      name: speaker.name,
      specialty: speaker.specialty,
      restaurant: speaker.restaurant,
    }))

  const matchingTalks = allTalks
    .filter(
      (talk) =>
        talk.title.toLowerCase().includes(queryLower) ||
        talk.speaker.toLowerCase().includes(queryLower) ||
        talk.topics.some((topic) => topic.toLowerCase().includes(queryLower)) ||
        talk.content.toLowerCase().includes(queryLower),
    )
    .map((talk) => ({
      slug: talk.slug,
      title: talk.title,
      speaker: talk.speaker,
      topics: talk.topics,
    }))

  return {
    speakers: matchingSpeakers,
    talks: matchingTalks,
  }
})
