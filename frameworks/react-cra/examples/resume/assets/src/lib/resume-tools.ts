import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

import { allJobs, allEducations } from 'content-collections'

// Tool definition for getting jobs by skill
export const getJobsBySkillToolDef = toolDefinition({
  name: 'getJobsBySkill',
  description:
    'Find all jobs where the candidate used a specific technology or skill. Use this to check if the candidate has experience with particular technologies.',
  inputSchema: z.object({
    skill: z
      .string()
      .describe(
        'The skill or technology to search for (e.g., "React", "TypeScript", "Leadership")',
      ),
  }),
  outputSchema: z.array(
    z.object({
      jobTitle: z.string(),
      company: z.string(),
      location: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      summary: z.string(),
      tags: z.array(z.string()),
      content: z.string(),
    }),
  ),
})

// Server implementation
export const getJobsBySkill = getJobsBySkillToolDef.server(({ skill }) => {
  return allJobs.filter((job) =>
    job.tags.some((tag) => tag.toLowerCase().includes(skill.toLowerCase())),
  )
})

// Tool definition for getting all jobs
export const getAllJobsToolDef = toolDefinition({
  name: 'getAllJobs',
  description:
    'Get a complete list of all work experience with full details including job titles, companies, dates, summaries, and skills. Use this to get an overview of the candidate\'s entire work history.',
  inputSchema: z.object({}),
  outputSchema: z.array(
    z.object({
      jobTitle: z.string(),
      company: z.string(),
      location: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      summary: z.string(),
      tags: z.array(z.string()),
      content: z.string(),
    }),
  ),
})

// Server implementation
export const getAllJobs = getAllJobsToolDef.server(() => {
  return allJobs.map((job) => ({
    jobTitle: job.jobTitle,
    company: job.company,
    location: job.location,
    startDate: job.startDate,
    endDate: job.endDate,
    summary: job.summary,
    tags: job.tags,
    content: job.content,
  }))
})

// Tool definition for getting all education
export const getAllEducationToolDef = toolDefinition({
  name: 'getAllEducation',
  description:
    'Get a complete list of all education history including schools, programs, dates, and skills learned. Use this to understand the candidate\'s educational background.',
  inputSchema: z.object({}),
  outputSchema: z.array(
    z.object({
      school: z.string(),
      summary: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      tags: z.array(z.string()),
      content: z.string(),
    }),
  ),
})

// Server implementation
export const getAllEducation = getAllEducationToolDef.server(() => {
  return allEducations.map((education) => ({
    school: education.school,
    summary: education.summary,
    startDate: education.startDate,
    endDate: education.endDate,
    tags: education.tags,
    content: education.content,
  }))
})

// Tool definition for searching experience
export const searchExperienceToolDef = toolDefinition({
  name: 'searchExperience',
  description:
    'Search for jobs by keywords in the job title, company name, summary, or content. Use this to find specific types of experience or roles.',
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        'The search query (e.g., "senior", "lead", "frontend", "startup")',
      ),
  }),
  outputSchema: z.array(
    z.object({
      jobTitle: z.string(),
      company: z.string(),
      location: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      summary: z.string(),
      tags: z.array(z.string()),
      matchedIn: z
        .array(z.string())
        .describe('Which fields matched the search'),
    }),
  ),
})

// Server implementation
export const searchExperience = searchExperienceToolDef.server(({ query }) => {
  const lowerQuery = query.toLowerCase()

  return allJobs
    .map((job) => {
      const matchedIn: string[] = []

      if (job.jobTitle.toLowerCase().includes(lowerQuery)) {
        matchedIn.push('job title')
      }
      if (job.company.toLowerCase().includes(lowerQuery)) {
        matchedIn.push('company')
      }
      if (job.summary.toLowerCase().includes(lowerQuery)) {
        matchedIn.push('summary')
      }
      if (job.content.toLowerCase().includes(lowerQuery)) {
        matchedIn.push('description')
      }

      return { job, matchedIn }
    })
    .filter(({ matchedIn }) => matchedIn.length > 0)
    .map(({ job, matchedIn }) => ({
      jobTitle: job.jobTitle,
      company: job.company,
      location: job.location,
      startDate: job.startDate,
      endDate: job.endDate,
      summary: job.summary,
      tags: job.tags,
      matchedIn,
    }))
})
