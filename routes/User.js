import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  registerClient,
  registerFreelancer,
  loginUser,
  getUsers,
  updateBalance,
} from "../controllers/User.js";
import { sendResetLink, resetPassword } from "../controllers/Password.js";
import {
  sendEmailVerificationCode,
  sendPhoneVerificationCode,
  verifyEmailWithCode,
  verifyPhoneWithCode,
} from "../controllers/Verifications.js";
import {
  getUserProfile,
  updateIsApproved,
  uploadAvatar,
  updateProfile,
  viewUserProfile,
  uploadSamples,
  downloadSampleWorkFile,
} from "../controllers/Profile.js";
import {
  createToken,
  stkPush,
  b2cWithdraw,
} from "../controllers/mpesaController.js";
import { getJobsDone, getPortfolio } from "../controllers/Portfolio.js";
import {
  addCertification,
  updateCertification,
  getCertifications,
} from "../controllers/Certifications.js";

const router = express.Router();

//GET ALL USERS
router.get("/users/list", getUsers);

//AUTHENTICATION
router.post("/login", loginUser);
router.post("/register/client", registerClient);
router.post("/register/freelancer", registerFreelancer);

//PASSWORD RECOVERY
router.post("/password", sendResetLink);
router.post("/password/reset", resetPassword);

//EMAIL AND PHONE VERIFICATION
router.post("/verify/email", protect, sendEmailVerificationCode);
router.post("/verify/phone", protect, sendPhoneVerificationCode);
router.post("/verify/email/code", protect, verifyEmailWithCode);
router.post("/verify/phone/code", protect, verifyPhoneWithCode);

//FUNDS DEPOSIT
//Mpesa Deposit
router.post("/deposit/:userId", protect, createToken, stkPush);
router.post("/withdraw/:userId", protect, b2cWithdraw);

//http://localhost:8080/api/v1/users/profile/approval/${_id}

//PROFILE FUNCTIONS
//Each should end with the :id param
router.get("/user/:id", getUserProfile);
router.get("/user/profile/other/:id", protect, viewUserProfile);
router.patch("/users/update/profile/:id", protect, updateProfile);
router.patch("/users/profile/avatar/:id", protect, uploadAvatar);
router.patch("/users/profile/samples/:id", protect, uploadSamples);
router.patch("/users/profile/approval/:id", updateIsApproved);

//CERTIFICATIONS
router.post("/certifications/add/:id", protect, addCertification);
router.patch("/certifications/:id/:certId", protect, updateCertification);

//TO BE DELETED
router.patch("/money/:id", updateBalance);

//SAMPLE FILES GET
router.get("/user/:id/samples/:fileId", protect, downloadSampleWorkFile);

export default router;
