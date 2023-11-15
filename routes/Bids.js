import express from "express";
import {
  createBid,
  updateBid,
  getAllBids,
  getSingleBid,
  deleteBid,
} from "../controllers/bidsCrud.js";

import { awardBid, cancelBid } from "../controllers/bidFunctions.js";

const router = express.Router();

router.get("/jobs/:jobId", getAllBids);
router.get("/jobs/bids/:jobId/:bidId", getSingleBid);

router.post("/jobs/:jobId/create", createBid);

router.patch("/jobs/bids/update/:jobId/:bidId", updateBid);

router.delete("/jobs/bids/delete/:jobId/:bidId", deleteBid);

//Bid functions
router.patch("/jobs/:jobId/bids/:bidId/award", awardBid);

router.patch("/jobs/:jobId/bids/:bidId/cancel", cancelBid);


export default router;
