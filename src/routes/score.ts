import { Router, Response } from "express";
import { getOffer } from "./offer.js";
import { getLeads } from "./leads.js";
import { ruleScore } from "#services/ruleScoring.js";
import chunk from "#utils/chunk.js";
import { AiScoreResponse, Results } from "#types/index.js";
import { aiScore } from "#services/aiScoring.js";

const router = Router();
let results: Results;

router.post("/", async (req, res: Response) => {
  try {
    const offer = getOffer();
    const leads = getLeads();

    if (!offer || !leads) {
      return res
        .status(400)
        .json({ message: "Offer and leads must be uploaded first." });
    }

    const ruleResults = leads.map((lead) => ({
      ...lead,
      rule_points: ruleScore(lead, offer),
    }));

    const BATCH_SIZE = 5;
    const batched = chunk(leads, BATCH_SIZE);

    let aiResults: AiScoreResponse = [];
    for (const batch of batched) {
      const batchRes = await aiScore(batch, offer);
      aiResults = aiResults.concat(batchRes);
    }

    results = ruleResults.map((lead) => {
      const aiItem = aiResults.find((r) => r.name === lead.name);

      if (!aiItem) {
        throw new Error(`Missing AI result for lead: ${lead.name}`);
      }

      const ai_points =
        aiItem.intent === "High" ? 50 : aiItem.intent === "Medium" ? 30 : 10;

      return {
        name: lead.name,
        role: lead.role,
        company: lead.company,
        intent: aiItem.intent,
        score: lead.rule_points + ai_points,
        reasoning: aiItem.reasoning,
      };
    });

    res.json({
      message: "Scoring completed. Use GET /results to fetch results.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error scoring leads" });
  }
});

export const getResults = () => results;
export default router;
