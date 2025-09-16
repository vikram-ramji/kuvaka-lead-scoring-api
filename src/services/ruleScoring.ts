import { Lead, Offer } from "../types/index.js";
import { keyof } from "zod";

/**
 * Calculates a deterministic, rule-based score for a single lead against an offer.
 * The score is based on role seniority, industry match, and data completeness.
 *
 * @param {Lead} lead - The lead object to score.
 * @param {Offer} offer - The offer containing the ideal customer profile.
 * @returns {number} A score between 0 and 50.
 */
export const ruleScore = (lead: Lead, offer: Offer): number => {
  let score = 0;

  // Rule 1: Role relevance: decision maker (+20), influencer (+10), else 0
  // We check for keywords in the lead's role to determine their likely influence in a purchasing decision.
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

  // Rule 2: Industry match: exact ICP (+20), adjacent (+10), else 0
  // We compare the lead's industry with the offer's ideal use cases.
  const industry = (lead.industry || "").toLowerCase();
  const icps = (offer.ideal_use_cases || []).map((s) => s.toLowerCase());

  if (icps.some((icp) => industry === icp)) {
    // An exact match
    score += 20;
  } else if (
    // Partial match
    icps.some((icp) => industry.includes(icp) || icp.includes(industry))
  ) {
    score += 10;
  }

  // Rule 3: Data completeness: all fields present (+10)
  // A complete profile indicates higher quality data.
  const fields = keyof(Lead).options; //Convert the Lead schema keys to string array
  const complete = fields.every((f) => Boolean(lead[f]));
  if (complete) score += 10;

  return score; // Maximum score for this layer is 50
};
