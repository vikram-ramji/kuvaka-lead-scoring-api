import { Offer } from "../types/index.js";
import { Router, Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError.js";

const router = Router();
let offer: Offer;

router.post("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    console.log(body);

    const parsed = Offer.safeParse(body);

    if (!parsed.success) {
      console.log(parsed.error);
      const errorMessage = parsed.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return next(new AppError(`Invalid input: ${errorMessage}`, 400));
    }

    offer = parsed.data;
    return res
      .status(200)
      .json({ message: `Recieved Offer successfully`, offer: offer });
  } catch (err) {
    next(err);
  }
});

export const getOffer = () => offer;

export default router;
