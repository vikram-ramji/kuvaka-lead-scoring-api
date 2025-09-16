import { GoogleGenAI } from "@google/genai";
import z from "zod";
import { AiScoreResponse, Lead, Offer } from "../types/index.js";
import AppError from "../utils/AppError.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("FATAL: GEMINI_API_KEY environment variable is not set.");
}

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

    Return only a valid JSON array where each item has {name, intent, reasoning}. The "name" must exactly match one of the prospect names provided. The "intent" must be one of "High", "Medium", or "Low".
  `;

  try {
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

    const responseData = response.data ?? response.text;
    console.log(responseData);
    if (typeof responseData !== "string") {
      throw new AppError("The AI service returned a malformed response.", 502);
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseData);
    } catch {
      throw new AppError("The AI service returned a malformed response.", 502);
    }

    const validationResult = AiScoreResponse.safeParse(parsedResponse);

    if (!validationResult.success) {
      console.error(
        "AI service response failed validation:",
        validationResult.error.issues,
      );
      throw new AppError(
        "The AI service response did not match the required format.",
        502,
      );
    }

    return validationResult.data;
  } catch (err) {
    console.error("Error calling Gemini API:", err);
    throw new AppError("The AI scoring service is currently unavailable.", 502);
  }
};
