import express from "express";
import type { Response } from "express";
import appRouter from "./routes/index.js";

const app = express();
const port = process.env.PORT || "3001";

app.use(express.json());

app.get("/", (res: Response) => {
  res.send("Lead Scoring Api is live!");
});

app.use("/api", appRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
