import express from "express";

import { getStatus, getInfo } from "../controllers/Status.js";

const router = express.Router();

router.get("/", getInfo);
router.get("/status", getStatus);

export default router;
