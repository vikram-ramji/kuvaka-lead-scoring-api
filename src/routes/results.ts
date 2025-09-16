import { Router } from "express";
import { getResults } from "./score.js";

const router = Router();

router.get("/", (req, res) => {
  const results = getResults();
  if (!results)
    return res.json({
      message: "Please provide the offer, leads and run the score api first.",
    });
  res.json(results);
});

export default router;
