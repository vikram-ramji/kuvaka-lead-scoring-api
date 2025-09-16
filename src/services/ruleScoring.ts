import { Lead, Offer } from "../types/index.js";
import { keyof } from "zod";

export const ruleScore = (lead: Lead, offer: Offer): number => {
  let score = 0;

  // Role relevance: decision maker (+20), influencer (+10), else 0
  const role = (lead.role || "").toLowerCase();
  const decisionMakerKeywords = [
    "head",
    "vp",
    "vice",
    "director",
    "chief",
    "cxo",
    "founder",
    "ceo",
    "cto",
  ];
  const influencerKeywords = [
    "manager",
    "lead",
    "principal",
    "senior",
    "staff",
  ];

  if (decisionMakerKeywords.some((k) => role.includes(k))) {
    score += 20;
  } else if (influencerKeywords.some((k) => role.includes(k))) {
    score += 10;
  }

  // Industry match: exact ICP (+20), adjacent (+10), else 0
  const industry = (lead.industry || "").toLowerCase();
  const icps = (offer.ideal_use_cases || []).map((s) => s.toLowerCase());

  if (icps.some((icp) => industry === icp)) {
    score += 20;
  } else if (
    icps.some((icp) => industry.includes(icp) || icp.includes(industry))
  ) {
    score += 10;
  }

  // Data completeness: all fields present (+10)
  const fields = keyof(Lead).options;
  const complete = fields.every((f) => Boolean(lead[f]));
  if (complete) score += 10;

  return score; // max score: 50
};
