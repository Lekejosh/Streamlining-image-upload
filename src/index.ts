import express from "express";
import http from "http";
import path from "path";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

// Import the imageWorker before creating the express app
import "./worker/imageWorker";
import routes from "./routes";

const app = express();
const httpServer = http.createServer(app);

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use your defined routes
app.use(routes);

dotenv.config({
  path: path.resolve(__dirname,  "..", ".env"),
});

// Import the database connection and configuring Cloudinary

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    httpServer.listen(4001, () => {
      console.log(`HTTP Server is working on http://localhost:${4001}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });

// Add an error handler for the express app
app.on("error", (error) => {
  console.error(`An error occurred on the server:\n${error}`);
});
