import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createCall,
  updateCall,
  getAllCalls,
  getOneCall,
  deleteCall,
  getUserCalls,
} from "../controllers/callConsultationCrud.js";
import {
  createDetails,
  updateDetails,
  getAllDetails,
  getOneDetail,
  deleteDetail,
  getUserDetails,
} from "../controllers/detailConsultationCrud.js";

const router = express.Router();

//call consultations
router.get("/consultations/calls", protect, getAllCalls);
router.get("/consultations/calls/:id", protect, getOneCall);
router.get("/consultations/calls/user", protect, getUserCalls);

router.post("/consultations/calls/create", protect, createCall);

router.patch("/consultations/calls/update/:id", protect, updateCall);

router.delete("/consultations/calls/delete/:id", protect, deleteCall);

//details consultations
router.get("/consultations/details", protect, getAllDetails);
router.get("/consultations/details/:id", protect, getOneDetail);
router.get("/consultations/details/user", protect, getUserDetails);

router.post("/consultations/details/create", protect, createDetails);

router.patch("/consultations/details/update/:id", protect, updateDetails);

router.delete("/consultations/details/delete/:id", protect, deleteDetail);

export default router;
