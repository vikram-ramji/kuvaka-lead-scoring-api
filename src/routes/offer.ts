import { Offer } from "#types/index.js";
import { Router, Request, Response } from "express";

const router = Router();
let offer: Offer;

router.post("/", (req: Request, res: Response) => {
  const body = req.body;
  console.log(body);

  const parsed = Offer.safeParse(body);

  if (!parsed.success) {
    console.log(parsed.error["message"]);
    return res.status(400).json({
      message: `Invalid Input`,
    });
  }

  offer = parsed.data;
  return res
    .status(200)
    .json({ message: `Recieved Offer successfully`, offer: offer });
});

export const getOffer = () => offer;

export default router;
