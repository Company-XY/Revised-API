import express from "express";
import { fetchMessages, createMessage } from "../controllers/messagesCrud.js";

const router = express.Router();

router.post("/messages/:userId/create", createMessage);

router.get("/messages/:userId", fetchMessages);

export default router;
