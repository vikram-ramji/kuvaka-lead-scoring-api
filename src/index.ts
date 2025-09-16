import leadsRouter from "./routes/leads.js";
import offerRouter from "./routes/offer.js";
import resultsRouter from "./routes/results.js";
import scoreRouter from "./routes/score.js";
import express, { Request, Response } from "express";
import AppError from "./utils/AppError.js";

const app = express();
const port = process.env.PORT || "3001";

app.use(express.json());

app.use("/offer", offerRouter);
app.use("/leads", leadsRouter);
app.use("/score", scoreRouter);
app.use("/results", resultsRouter);

app.use((err: Error, req: Request, res: Response) => {
  console.log("Error: ", err);
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  res.status(500).json({
    status: "error",
    message: "Something went very wrong!",
  });
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
