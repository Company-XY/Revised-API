import express from "express";
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
router.post("/verify/email", sendEmailVerificationCode);
router.post("/verify/phone", sendPhoneVerificationCode);
router.post("/verify/email/code", verifyEmailWithCode);
router.post("/verify/phone/code", verifyPhoneWithCode);

//FUNDS DEPOSIT
//Mpesa Deposit
router.post("/deposit", createToken, stkPush);
router.post("/withdraw", b2cWithdraw);

//http://localhost:8080/api/v1/users/profile/approval/${_id}

//PROFILE FUNCTIONS
//Each should end with the :id param
router.get("/user/:id", getUserProfile);
router.get("/user/profile/other/:id", viewUserProfile);
router.patch("/users/update/profile/:id", updateProfile);
router.patch("/users/profile/avatar/:id", uploadAvatar);
router.patch("/users/profile/samples/:id", uploadSamples);
router.patch("/users/profile/approval/:id", updateIsApproved);

//CERTIFICATIONS
router.post("/certifications/add/:id", addCertification);
router.patch("/certifications/:id/:certId", updateCertification);

//TO BE DELETED
router.patch("/money/:id", updateBalance);

//SAMPLE FILES GET
router.get("/user/:id/samples/:fileId", downloadSampleWorkFile);

export default router;
