import { NextFunction, Router, Response } from "express";
import { getResults } from "./score.js";

const router = Router();

/**
 * Post /results
 * Returns the Final Results Array
 */
router.get("/", (req, res: Response, next: NextFunction) => {
  try {
    // Fetches the currently loaded Results from memory
    const results = getResults();
    if (!results)
      return res.json({
        message: "Please provide the offer, leads and run the score api first.",
      });
    res.json(results);
  } catch (err) {
    next(err);
  }
});

export default router;
