import { Lead } from "../types/index.js";
import { Router, Request, Response, NextFunction } from "express";
import { parse } from "csv-parse/sync";
import multer from "multer";
import { keyof } from "zod";
import AppError from "../utils/AppError.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
let leads: Lead[];
const fields = keyof(Lead).options;

router.post(
  "/upload",
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return next(
          new AppError("No file uploaded. Please upload a CSV file.", 400),
        );
      }

      const text = req.file.buffer.toString("utf8");
      const records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as Record<string, string>[];

      if (records.length === 0) {
        return next(new AppError("CSV file is empty or invalid.", 400));
      }

      const parsedHeaders = Object.keys(records[0] || {}).map((h) =>
        h.trim().toLowerCase(),
      );
      const missingHeaders = fields.filter((h) => !parsedHeaders.includes(h));

      if (missingHeaders.length > 0) {
        return next(
          new AppError(
            `Missing required CSV columns: ${missingHeaders.join(", ")}`,
            400,
          ),
        );
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
    } catch (err) {
      if (err instanceof Error) {
        return next(
          new AppError(`Failed to process CSV file: ${err.message}`, 400),
        );
      }
      next(err);
    }
  },
);

export const getLeads = () => leads;
export default router;
