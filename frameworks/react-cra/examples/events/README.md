# Events Example - Haute Pâtisserie 2026

A beautiful pastry conference website built with TanStack Start and Netlify, featuring:

- **Speakers & Sessions**: Managed with content-collections for easy markdown-based content
- **Conference Schedule**: Day-by-day timeline of all sessions
- **AI Assistant (Remy)**: An AI-powered chat assistant to help attendees navigate the conference
- **Elegant Dark Theme**: Custom typography with Playfair Display and copper/gold accents

## Features

### Content Management
- Speaker profiles with bios, awards, and specialty information
- Session details with topics, duration, and speaker attribution
- All content in markdown files using content-collections

### AI-Powered Assistance
- Chat with "Remy" the culinary assistant
- Search for speakers and sessions by topic
- Get recommendations based on interests
- Supports multiple AI providers (Anthropic, OpenAI, Gemini, Ollama)

### Routes
- `/` - Home page with featured speakers and sessions
- `/schedule` - Conference schedule with day-by-day timeline
- `/speakers` - All speakers grid
- `/speakers/:slug` - Individual speaker detail page
- `/talks` - All sessions grid
- `/talks/:slug` - Individual session detail page

## Getting Started

```bash
# Create a new project with this example
npx netlify-cta my-conference --example events

# Navigate to the project
cd my-conference

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

## AI Configuration

To use the AI assistant, set one of the following environment variables:

```bash
# Anthropic (Claude)
ANTHROPIC_API_KEY=your-key-here

# OpenAI
OPENAI_API_KEY=your-key-here

# Google Gemini
GEMINI_API_KEY=your-key-here

# Ollama (local, no API key needed)
# Just ensure Ollama is running locally
```

The assistant will automatically use the first available provider.

## Customization

### Adding Speakers
Create a new markdown file in `content/speakers/`:

```markdown
---
name: "Chef Name"
title: "Executive Pastry Chef"
specialty: "French Pastry"
restaurant: "Restaurant Name"
location: "City, Country"
headshot: "speakers/chef-name.jpg"
awards:
  - "Award 1"
  - "Award 2"
---

Bio content here...
```

### Adding Sessions
Create a new markdown file in `content/talks/`:

```markdown
---
title: "Session Title"
speaker: "Chef Name"
duration: "90 minutes"
image: "talks/session-image.jpg"
topics:
  - "Topic 1"
  - "Topic 2"
---

Session description here...
```

## Theme

The example uses a custom dark theme with:
- **Font**: Playfair Display (display) and Cormorant Garamond (body)
- **Colors**: Copper and gold accents on a dark charcoal background
- **Effects**: Elegant card hover animations, grain texture overlay
