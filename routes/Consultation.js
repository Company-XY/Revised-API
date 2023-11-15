import express from "express";
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
router.get("/consultations/calls", getAllCalls);
router.get("/consultations/calls/:id", getOneCall);
router.get("/consultations/calls/user", getUserCalls);

router.post("/consultations/calls/create", createCall);

router.patch("/consultations/calls/update/:id", updateCall);

router.delete("/consultations/calls/delete/:id", deleteCall);

//details consultations
router.get("/consultations/details", getAllDetails);
router.get("/consultations/details/:id", getOneDetail);
router.get("/consultations/details/user", getUserDetails);

router.post("/consultations/details/create", createDetails);

router.patch("/consultations/details/update/:id", updateDetails);

router.delete("/consultations/details/delete/:id", deleteDetail);

export default router;
