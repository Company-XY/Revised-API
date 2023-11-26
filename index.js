import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import User from "./routes/User.js";
import Jobs from "./routes/Job.js";
import Bids from "./routes/Bids.js";
import Bots from "./routes/Bot.js";
import Consultations from "./routes/Consultation.js";
import Status from "./routes/Status.js";
import Notifications from "./routes/Notifications.js";
import Messages from "./routes/Messages.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();

const URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 7000;

mongoose
  .connect(URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Database Connection Successful & Server Running on Port ${PORT}..@Assist_Africa...Beta`
      );
    });
  })
  .catch((error) => {
    console.log({ error: error.message });
  });

app.use("/api/v1", User);
app.use("/api/v1", Jobs);
app.use("/api/v1", Bids);
app.use("/api/v1", Consultations);
app.use("/api/v1", Bots);
app.use("/api/v1", Status);
app.use("/api/v1", Notifications);
app.use("/api/v1", Messages);
