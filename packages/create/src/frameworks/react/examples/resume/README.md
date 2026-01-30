# Resume Example

A professional resume template built with TanStack Start and content-collections for Netlify deployment.

## Features

- **Content Collections**: Work experience and education managed as markdown files
- **Skills Filter**: Interactive sidebar to filter jobs by skills/technologies
- **Beautiful UI**: Modern design with shadcn/ui components
- **SSR Ready**: Full server-side rendering with TanStack Start

## Project Structure

```
├── content/
│   ├── jobs/              # Work experience entries
│   └── education/         # Education entries
├── src/
│   ├── components/
│   │   └── ui/            # Shadcn UI components
│   │       ├── badge.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── hover-card.tsx
│   │       └── separator.tsx
│   ├── lib/
│   │   └── utils.ts       # Utility functions
│   └── routes/
│       ├── __root.tsx     # Root layout
│       └── index.tsx      # Resume page
└── public/
    └── headshot-on-white.jpg
```

## Adding Work Experience

Create a new markdown file in `content/jobs/` with the following frontmatter:

```markdown
---
jobTitle: Your Job Title
company: Company Name
location: City, State
startDate: 2024-01-01
endDate: 2024-12-31  # Optional - omit for current position
summary: Brief summary of your role
tags:
  - React
  - TypeScript
  - Web Development
---

Detailed description of your responsibilities and achievements...
```

## Adding Education

Create a new markdown file in `content/education/`:

```markdown
---
school: School Name
summary: Degree or Program Name
startDate: 2020-01-01
endDate: 2024-01-01
tags:
  - Relevant
  - Skills
---

Details about your education...
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build
```
