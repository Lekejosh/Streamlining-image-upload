import { Router } from "express";

import upload from "./upload.route";

import job from "./job.route";

import type { Request, Response } from "express";

const router = Router();

router.use("/api/v1/upload", upload);

router.use("/api/v1/job", job);

router.get("/", (req: Request, res: Response) => {
  return res.status(200).json({ message: "Welcome" });
});

export default router;
