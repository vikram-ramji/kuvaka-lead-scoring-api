import { Lead } from "#types/index.js";
import { Router, Request, Response } from "express";
import { parse } from "csv-parse/sync";
import multer from "multer";
import { keyof } from "zod";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
let leads: Lead[];
const fields = keyof(Lead).options;

router.post("/upload", upload.single("file"), (req: Request, res: Response) => {
  if (!req.file) return res.json({ message: "No file uploaded" });
  const text = req.file.buffer.toString("utf8");
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  const parsedHeaders = Object.keys(records[0] || {}).map((h) =>
    h.trim().toLowerCase(),
  );
  const missingHeaders = fields.filter((h) => !parsedHeaders.includes(h));
  if (missingHeaders.length > 0) {
    return res.status(400).json({
      error: `Missing required fields: ${missingHeaders.join(", ")}`,
    });
  }

  leads = records.map((r) => ({
    name: r.name ?? "",
    role: r.role ?? "",
    company: r.company ?? "",
    industry: r.industry ?? "",
    location: r.location ?? "",
    linkedin_bio: r.linkedin_bio ?? "",
  }));
  return res.json({
    message: "file uploaded successfuly",
    count: leads.length,
  });
});

export const getLeads = () => leads;
export default router;
