//imageWorker.ts

import cloudinary from "cloudinary";
import User from "../models/user.model";
import { Queue, Worker } from "bullmq";
import { timeStamp } from "console";

const queue = new Queue("image-upload", {
  redis: { host: "127.0.0.1", port: 6379 },
} as any);

const uploadToCloudinary = async (imagePath: any, userId: any) => {
  const user = await User.findById(userId);

  if (!user) {
    console.warn("Job removed: User not found.");
    return;
  }
  const timeStamp = Date.now();
  try {
    const result = await cloudinary.v2.uploader.upload(imagePath, {
      folder: "test",
      width: 1200,
      height: 630,
      crop: "fill",
      gravity: "center",
      timestamp: timeStamp,
    });

    if (user?.image?.public_id !== undefined) {
      await cloudinary.v2.uploader.destroy(user.image.public_id as string);
    }

    user.image = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    await user.save();
  } catch (error) {
    console.error("Image upload failed:", error);
  }
};

const worker = new Worker("image-upload", async (job) => {
  const { imagePath, userId } = job.data;
  await uploadToCloudinary(imagePath, userId);
});

(async () => {
  if (await queue.count()) {
    await worker.run();
  }
})();

worker.on("failed", (job: any, err) => {
  console.error(`Image upload job failed for job ${job.id}:`, err);
});
