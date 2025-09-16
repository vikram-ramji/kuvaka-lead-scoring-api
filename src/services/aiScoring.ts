import { GoogleGenAI } from "@google/genai";
import z from "zod";
import { AiScoreResponse, Lead, Offer } from "../types/index.js";
import AppError from "../utils/AppError.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("FATAL: GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * Scores a batch of leads using the Gemini AI model based on a provided offer.
 * This function constructs a detailed prompt, sends it to the Gemini API,
 * and robustly validates the response to ensure it matches the required format.
 *
 * @param {Lead[]} leads - An array of lead objects to be scored.
 * @param {Offer} offer - The offer object defining the Ideal Customer Profile (ICP).
 * @returns {Promise<AiScoreResponse>} A promise that resolves to an array of AI-scored lead results.
 * @throws {AppError} Throws an AppError with a 502 status code if the AI service is unavailable, returns malformed JSON, or the response fails schema validation.
 */
export const aiScore = async (
  leads: Lead[],
  offer: Offer,
): Promise<AiScoreResponse> => {
  // The prompt  defines the persona, context, task, and most importantly, the output format.
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
        // Configuring response structure  by providing the schema (Accepts OpenAPI-3.0 Json Schema Only as per docs)
        responseMimeType: "application/json",
        responseSchema: z.toJSONSchema(AiScoreResponse, {
          target: "openapi-3.0",
        }),
      },
    });

    const responseData = response.text;
    // Ensure the data is recieved
    if (typeof responseData !== "string") {
      throw new AppError("The AI service did not return any response.", 502);
    }

    // Parse the text data to json
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseData);
    } catch {
      throw new AppError("The AI service returned a malformed response.", 502);
    }

    // Validate response json to check if it's structure matches expectation
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
    // This is a catch-all for network errors, API authentication failures, etc.
    console.error("Error calling Gemini API:", err);
    throw new AppError("The AI scoring service is currently unavailable.", 502);
  }
};
