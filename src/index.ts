import leadsRouter from "./routes/leads.js";
import offerRouter from "./routes/offer.js";
import resultsRouter from "./routes/results.js";
import scoreRouter from "./routes/score.js";
import express from "express";

const app = express();
const port = process.env.PORT || "3001";

app.use(express.json());

app.use("/offer", offerRouter);
app.use("/leads", leadsRouter);
app.use("/score", scoreRouter);
app.use("/results", resultsRouter);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
