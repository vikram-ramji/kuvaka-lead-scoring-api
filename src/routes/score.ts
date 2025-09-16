import { Router, Response, NextFunction } from "express";
import { getOffer } from "./offer.js";
import { getLeads } from "./leads.js";
import { ruleScore } from "../services/ruleScoring.js";
import chunk from "../utils/chunk.js";
import { AiScoreResponse, Results } from "../types/index.js";
import { aiScore } from "../services/aiScoring.js";
import AppError from "../utils/AppError.js";

const router = Router();

/**
 * In-memory storage for the final scoring results.
 * WARNING: This is not production-ready. In a real application, this should be a database or a cache like Redis.
 * Data will be lost on server restart and is not shared across multiple server instances.
 */
let results: Results;

/**
 * POST /score
 * Triggers the main lead scoring pipeline and
 * stores the results in memory for retrieval via
 * the GET /results endpoint.
 */
router.post("/", async (req, res: Response, next: NextFunction) => {
  try {
    // Fetches the currently loaded offer and leads from memory.
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

    // Applies the deterministic rule-based scoring to each lead.
    const ruleResults = leads.map((lead) => ({
      ...lead,
      rule_points: ruleScore(lead, offer),
    }));

    // Batches the leads and sends them to the AI scoring service.
    const BATCH_SIZE = 5;
    const batched = chunk(leads, BATCH_SIZE);

    let aiResults: AiScoreResponse = [];
    for (const batch of batched) {
      const batchRes = await aiScore(batch, offer);
      aiResults = aiResults.concat(batchRes);
    }

    // Combines the rule and AI scores into a final result set.
    results = ruleResults.map((lead) => {
      const aiItem = aiResults.find((r) => r.name === lead.name);

      if (!aiItem) {
        throw new AppError(
          `Internal data mismatch: Missing AI result for lead '${lead.name}'. Please try again.`,
          500,
        );
      }

      // Map the AI's categorical intent ("High", "Medium", "Low") to a numerical score.
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

/**
 * Retrieves the stored scoring results.
 * This is a simple getter for the in-memory 'results' variable.
 * @returns The array of results, or undefined if scoring has not been run.
 */
export const getResults = (): Results | undefined => results;
export default router;
