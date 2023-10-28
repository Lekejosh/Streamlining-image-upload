//upload.route.ts

import { Router, Request, Response } from "express";
import upload from "../utils/multer";
import User from "./../models/user.model";
import cloudinary from "cloudinary";
import CustomError from "../utils/custom-error";
import { Queue } from "bullmq";
const queue = new Queue("image-upload", {
  redis: { host: "localhost", port: 6379 },
} as any);

const router = Router();

router.post(
  "/",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const userId = "vvcwcw1rvrvrvrvr";
      const data = { userId, name: req.body.name, image: req?.file?.path };

      const user = await User.create({ userId: userId });
      console.log(user);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (data.image) {
        const imagePath = data.image;
        await queue.add("image-upload", { imagePath, userId: user._id });
      }

      if (data.name) {
        user.name = data.name;
      }

      await user.save();

      res
        .status(200)
        .json({ message: "Image upload running in background", user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
