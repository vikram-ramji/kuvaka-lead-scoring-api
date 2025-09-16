import { Lead } from "../types/index.js";
import { Router, Request, Response, NextFunction } from "express";
import { parse } from "csv-parse/sync";
import multer from "multer";
import { keyof } from "zod";
import AppError from "../utils/AppError.js";

const router = Router();
/**
 * Returns a Multer instance that provides methods for generating middleware that process files
 * uploaded in multipart/form-data format.
 * The StorageEngine specified in storage will be used to store files.
 */
const upload = multer({ storage: multer.memoryStorage() });
/**
 * In-memory storage for the Lead object.
 * WARNING: This is not production-ready. In a real application, this should be a database or a cache like Redis.
 * Data will be lost on server restart and is not shared across multiple server instances.
 */
let leads: Lead[];
//Convert the Lead schema keys to string array
const fields = keyof(Lead).options;

/**
 * POST /leads/upload
 * Recieves CSV file upload containing leads data and stores it.
 */
router.post(
  "/upload",
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if file is uploaded
      if (!req.file) {
        return next(
          new AppError("No file uploaded. Please upload a CSV file.", 400),
        );
      }

      // Converts the csv file to string
      const text = req.file.buffer.toString("utf8");
      // Parses the csv text to an array of objects
      const records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as Record<string, string>[];

      // Validate if file is not empty
      if (records.length === 0) {
        return next(new AppError("CSV file is empty or invalid.", 400));
      }

      // Check for missing columns
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

      // Structurize the data and handle null values
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

/**
 * Retrieves the stored Offer data.
 * This is a simple getter for the in-memory 'offer' variable.
 * @returns The offer object, or undefined if offer has not been provided.
 */
export const getLeads = (): Lead[] | undefined => leads;
export default router;
