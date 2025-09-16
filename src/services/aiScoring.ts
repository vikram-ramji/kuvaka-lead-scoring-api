import { GoogleGenAI } from "@google/genai";
import z from "zod";
import { AiScoreResponse, Lead, Offer } from "../types/index.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const aiScore = async (
  leads: Lead[],
  offer: Offer,
): Promise<AiScoreResponse> => {
  const prompt = `
    You are a lead qualification assistant. 
    Given the product and a prospect, classify buying intent as High, Medium, or Low, 
    and explain in 1-2 short sentences.

    Product:
    - Name: ${offer.name}
    - Value props: ${offer.value_props.join(",")}
    - Ideal use cases: ${offer.ideal_use_cases.join(",")}

    Prospects:
    ${leads.map((lead, index) => `${index + 1}. ${JSON.stringify(lead)}`).join("\n")}

    Return only a JSON array where each item has {name, intent, reasoning} where name refers to the lead item's name.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: z.toJSONSchema(AiScoreResponse, {
        target: "openapi-3.0",
      }),
    },
  });

  const raw = response.data ?? response.text;
  console.log(raw);
  if (typeof raw !== "string") {
    throw new Error("Expected JSON string in response");
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error("Failed to parse JSON: " + err);
  }

  const validated = AiScoreResponse.parse(parsed);

  return validated;
};
