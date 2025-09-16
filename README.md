# Kuvaka Lead Scoring API — Vikram Iyer

Backend assignment implementation for **lead qualification and scoring** using rule-based logic + AI (Gemini).

**Live API**: <https://kuvaka-lead-scoring-api.onrender.com>

## Features

- **Offer Management** — upload product/offer details (`/offer`)
- **Lead Upload** — upload CSV of leads (`/leads/upload`)
- **Scoring Pipeline** — combines rule-based scoring (max 50 pts) and AI scoring (max 50 pts) via Gemini (`/score`)
- **Results Retrieval** — fetch final scored leads (`/results`)
- **Validation** — Zod schemas for structured AI responses
- **TypeScript + Express** — clean, modular backend with pnpm

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/<your-username>/kuvaka-lead-scoring-api-vikramiyer.git
cd kuvaka-lead-scoring-api-vikramiyer
pnpm install
```

### 2. Environment

Create a `.env` file in the root of the project with the following content:

```bash
PORT=3000
GOOGLE_API_KEY=your_gemini_api_key_here
```

### 3. Run

To run the application, use the following commands.

Development mode (with hot-reloading):

```bash
pnpm dev
```

Build for production and start:

```bash
pnpm build
pnpm start
```

## API Usage

### 1. POST /offer

Sets the ideal customer profile (ICP) for the scoring logic.

Example Body:

```bash
{
  "name": "AI Outreach Automation",
  "value_props": ["24/7 outreach", "6x more meetings"],
  "ideal_use_cases": ["B2B SaaS mid-market"]
}
```

### 2. POST /leads/upload

Upload a CSV file containing lead data, use "file" as key.

The file must have the following columns:

```bash
name, role, company, industry, location, linkedin_bio.
```

### 3. POST /score

This endpoint triggers the lead scoring pipeline, applying both rule-based and AI-based scoring. It returns a confirmation message upon successful initiation.

### 4. GET /results

Retrieves the scored leads.

Example Response:

```bash
[
  {
    "name": "Ava Patel",
    "role": "Head of Growth",
    "company": "FlowMetrics",
    "intent": "High",
    "score": 90,
    "reasoning": "As a Head of Growth in B2B SaaS, Ava is directly responsible for scaling GTM and acquiring meetings, aligning perfectly with the product's value proposition."
  },
]
```

## Scoring Logic

The final score is a combination of a rule-based layer and an AI-powered layer.

### Rule Layer (0–50 pts)

- Role relevance: decision maker (+20), influencer (+10), else 0
- Industry match: exact ICP (+20), adjacent (+10), else 0
- Data completeness: all fields present (+10)

### AI Layer (0–50 pts)

- Gemini prompt: Classifies lead intent (High/Medium/Low) and provides reasoning (1–2 sentences).
- Points Awarded: High → 50 pts, Medium → 30 pts, Low → 10 pts

Final Score
The final score is calculated as follows:
final_score = rule_score + ai_points

## Tech Stack

- Node.js + Express
- TypeScript
- Zod (for validation)
- @google/genai (Gemini API)
- csv-parse + multer (for file uploads)

## Example Lead CSV

```bash
name,role,company,industry,location,linkedin_bio
Ava Patel,Head of Growth,FlowMetrics,B2B SaaS,San Francisco,"10+ years scaling SaaS GTM teams"
Lily Chen,Marketing Manager,DataCloud,B2B SaaS,New York,"Focused on demand generation and ABM campaigns"
David Kim,CTO,HealthNext,Healthcare,Boston,"Background in healthtech platforms"
```
