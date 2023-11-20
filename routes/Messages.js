import express from "express";
import { getMessages, createMessage } from "../controllers/messagesCrud.js";

const router = express.Router();

router.post("/messages/create", createMessage);

router.get("/messages/:id", getMessages);

export default router;
