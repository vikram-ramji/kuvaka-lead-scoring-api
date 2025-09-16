import { Offer } from "../types/index.js";
import { Router, Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError.js";

const router = Router();

/**
 * In-memory storage for the Offer object.
 * WARNING: This is not production-ready. In a real application, this should be a database or a cache like Redis.
 * Data will be lost on server restart and is not shared across multiple server instances.
 */
let offer: Offer;

/**
 * POST /offer
 * Recieves and stores the Offer data
 */
router.post("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    // Validate input data
    const parsed = Offer.safeParse(body);

    if (!parsed.success) {
      const errorMessage = parsed.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return next(new AppError(`Invalid input: ${errorMessage}`, 400));
    }

    // store input data in memory
    offer = parsed.data;
    return res
      .status(200)
      .json({ message: `Recieved Offer successfully`, offer: offer });
  } catch (err) {
    next(err);
  }
});

/**
 * Retrieves the stored Offer data.
 * This is a simple getter for the in-memory 'offer' variable.
 * @returns The offer object, or undefined if offer has not been provided.
 */
export const getOffer = (): Offer | undefined => offer;

export default router;
