import { Router, Response, NextFunction } from "express";
import { getOffer } from "./offer.js";
import { getLeads } from "./leads.js";
import { ruleScore } from "../services/ruleScoring.js";
import chunk from "../utils/chunk.js";
import { AiScoreResponse, Results } from "../types/index.js";
import { aiScore } from "../services/aiScoring.js";
import AppError from "../utils/AppError.js";

const router = Router();
let results: Results;

router.post("/", async (req, res: Response, next: NextFunction) => {
  try {
    const offer = getOffer();
    const leads = getLeads();

    if (!offer || !leads) {
      return next(
        new AppError(
          "Prerequisites not met. Please upload offer and leads first.",
          400,
        ),
      );
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
        throw new AppError(
          `Internal data mismatch: Missing AI result for lead '${lead.name}'. Please try again.`,
          500,
        );
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
    next(err);
  }
});

export const getResults = () => results;
export default router;
