import express from "express";

import {
  createProduct,
  updateProduct,
  viewProduct,
  deleteProduct,
  uploadProductFiles,
  downloadProductFile,
} from "../controllers/Product.js";

import { approveJob, disputeJob } from "../controllers/productFunctions.js";

import { updateJobFiles } from "../controllers/jobFiles.js";
import { updateBidFiles } from "../controllers/bidFiles.js";

import { downloadJobFile } from "../controllers/jobFiles.js";

import {
  getAllJobs,
  createJob,
  getSingleJob,
  updateJob,
  deleteJob,
} from "../controllers/Jobs.js";

const router = express.Router();

router.get("/jobs", getAllJobs);
router.get("/jobs/:id", getSingleJob);
router.get("/jobs/:jobId/download/:fileId", downloadJobFile);

router.post("/jobs/post", createJob);
router.patch("/jobs/:jobId/files", updateJobFiles);

router.patch("/job/:jobId/bids/:bidId/files", updateBidFiles);

router.patch("/jobs/update/:id", updateJob);

router.delete("/jobs/delete/:id", deleteJob);

//---------------------

router.post("/jobs/:jobId/submit", createProduct);
router.patch("/jobs/:jobId/files/product", uploadProductFiles);
router.patch("/jobs/:jobId/update", updateProduct);
router.get("/jobs/:jobId/product", viewProduct);
router.delete("/jobs/:jobId/delete", deleteProduct);
router.get("/jobs/:jobId/files/:fileId", downloadProductFile);

//---------------------------------------

router.patch("/jobs/:jobId/approve", approveJob);
router.patch("/jobs/:jobId/dispute", disputeJob);

export default router;
