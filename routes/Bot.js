import express from "express";
import { handleUserMessage } from "../controllers/basicBot.js";

const router = express.Router();

router.post("/bot/message", handleUserMessage);

export default router;
