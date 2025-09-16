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

The lead scoring pipeline is designed as a dual-layer system to balance speed, cost, and accuracy. It combines a fast, deterministic **Rule Layer** with a nuanced, context-aware **AI Layer**. The final score is a sum of the points from both layers, providing a comprehensive view of lead quality.

### Layer 1: Rule-Based Scoring (0-50 Points)

This layer acts as a rapid, low-cost filter to evaluate leads against explicit, well-defined criteria. It's implemented as a pure function for predictable and easily testable logic.

| Category           | Criteria                                                            | Points | Rationale                                                                    |
| ------------------ | ------------------------------------------------------------------- | :----: | ---------------------------------------------------------------------------- |
| **Role Relevance** | Role contains keywords like `Head`, `VP`, `Director`, `CEO`         |  +20   | Identifies a clear decision-maker with budget authority.                     |
|                    | Role contains keywords like `Manager`, `Lead`, `Senior`             |  +10   | Identifies a potential influencer who can champion the product internally.   |
| **Industry Match** | Lead's industry is an exact match for the offer's `ideal_use_cases` |  +20   | Strongest signal of product-market fit.                                      |
|                    | Lead's industry is a partial match (e.g., "SaaS" vs "B2B SaaS")     |  +10   | Indicates potential relevance and adjacent market opportunities.             |
| **Data Quality**   | All fields in the lead's CSV row are present and non-empty          |  +10   | A complete profile suggests higher-quality data and a more engaged prospect. |

---

### Layer 2: AI-Powered Intent Analysis (0-50 Points)

This layer provides a deeper, qualitative analysis that rules alone cannot capture. It uses the `gemini-1.5-flash` model to understand the nuance of a lead's role and bio in the context of the specific product offer.

1. **Persona Assignment:** The prompt begins by instructing the model to act as a `lead qualification assistant`, setting the context for the task.
2. **Contextual Grounding:** It is fed the complete `offer` details (name, value props, use cases) and the `lead`'s professional data. This grounds the model's analysis in the specific scenario.
3. **Constrained Task:** The model is explicitly told to classify intent into one of three categories: `High`, `Medium`, or `Low`. This prevents ambiguous or unstructured text responses.
4. **Forced Justification:** It is required to provide a brief `reasoning` for its classification, forcing it to "show its work" and providing valuable qualitative insight.
5. **Strict Output Formatting:** The prompt commands the model to return **only a valid JSON array** that conforms to a predefined schema. This is the most critical instruction, ensuring the response is machine-readable and can be safely parsed and validated by the service.

The model's categorical output is then mapped to a numerical score:

- `High` Intent → **50 points**
- `Medium` Intent → **30 points**
- `Low` Intent → **10 points**

This AI-driven score captures subtle signals—like specific achievements in a LinkedIn bio or the alignment of a role's responsibilities with the product's value proposition—that the rigid rule layer would miss.

## Tech Stack

- Node.js + Express
- TypeScript
- Zod (for validation)
- @google/genai (Gemini API)
- csv-parse + multer (for file uploads)

## Example Lead CSV

Provided in the folder for testing
