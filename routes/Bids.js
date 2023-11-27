import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createBid,
  updateBid,
  getAllBids,
  getSingleBid,
  deleteBid,
} from "../controllers/bidsCrud.js";

import { downloadBidFile } from "../controllers/bidFiles.js";

import { awardBid, cancelBid } from "../controllers/bidFunctions.js";

const router = express.Router();

router.get("/jobs/:jobId", protect, getAllBids);
router.get("/jobs/bids/:jobId/:bidId", protect, getSingleBid);

router.get("/jobs/bids/:jobId/:bidId/:fileId", protect, downloadBidFile);

router.post("/jobs/:jobId/create", protect, createBid);

router.patch("/jobs/bids/update/:jobId/:bidId", protect, updateBid);

router.delete("/jobs/bids/delete/:jobId/:bidId", protect, deleteBid);

//Bid functions
router.patch("/jobs/:jobId/bids/:bidId/award", awardBid);
//router.patch("/jobs/:jobId/bids/:bidId/award", protect, awardBid);

router.patch("/jobs/:jobId/bids/:bidId/cancel", protect, cancelBid);

export default router;
