import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import axios from "axios";
import qs from "querystring";

import generateRandomVerificationCode from "../utils/emailVerificationCode.js";

//POST verify email
export const sendEmailVerificationCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "There is no account associated with that email." });
    }

    const verificationCode = generateRandomVerificationCode();
    user.verificationCode = verificationCode;
    await user.save();

    const name = user.name;

    const emailData = {
      from: "oloogeorge633@gmail.com",
      to: email,
      subject: "Email Verification Code",
      body: `
          <html>
          <head>
            <style>
              /* Add your CSS styles here */
              body {
                font-family: Arial, sans-serif;
                background: linear-gradient(to bottom, #00f, #007ACC, #007ACC);
                background-repeat: repeat;
                color: white;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
              }
              h1 {
                color: blue;
                font-size: 40px;
              }
              h2 {
                font-size: 28px;
              }
              p {
                font-size: 18px;
              }
              span{
                color: blue;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Assist Africa</h1>
              <h2>Hello, ${name}!</h2>
              <p>Your email verification code is: <span>${verificationCode}</span></p>
            </div>
          </body>
          </html>
        `,
      apiKey: process.env.ELASTIC_EMAIL_API_KEY,
    };

    // Send the email using Elastic Email API
    const response = await axios.post(
      "https://api.elasticemail.com/v2/email/send",
      new URLSearchParams(emailData).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (response.data.success) {
      res.status(200).json({ message: "Verification code sent successfully." });
    } else {
      res.status(500).json({ message: response.data.error });
    }
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      message: "An error occurred while sending the verification code.",
    });
  }
});

//POST Verify email with code
export const verifyEmailWithCode = asyncHandler(async (req, res) => {
  const { code, email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    user.emailVerified = true;
    user.verificationCode = null;
    await user.save();

    res.status(200).json({ message: "Email verification successful." });
  } catch (error) {
    res.status(500).json(error);
  }
});

//PHONE VERIFICATIONS................
// Send verification code

export const sendPhoneVerificationCode = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.body;

  const verificationCode = Math.floor(100000 + Math.random() * 900000);

  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 10);

  const smsData = {
    username: process.env.USERNAME,
    to: phoneNumber,
    message: `Your Assist Africa Phone Number Verification Code is: ${verificationCode}. The Code will Expire in Ten Minutes`,
  };

  try {
    const response = await axios.post(
      process.env.API_URL,
      qs.stringify(smsData),
      {
        headers: {
          apiKey: process.env.API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (response.status === 201) {
      await User.updateOne(
        { phone: phoneNumber },
        {
          phoneVerificationCode: verificationCode,
          phoneVerificationCodeExpiresAt: expirationTime,
        }
      );

      res.json({ message: "Verification code sent successfully" });
    } else {
      res.status(500).json({ message: "Failed to send SMS" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error sending SMS" });
    console.log(error);
  }
});

//VERIFY WITH CODE
// Verify phone with code
export const verifyPhoneWithCode = asyncHandler(async (req, res) => {
  const { code, phoneNumber } = req.body;

  try {
    const user = await User.findOne({ phone: phoneNumber });

    if (!user) {
      return res
        .status(404)
        .json({
          message: "There is no account associated with that phone number",
        });
    }

    if (
      user.phoneVerificationCode !== code ||
      user.phoneVerificationCodeExpiresAt < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code." });
    }

    user.phoneVerified = true;
    user.phoneVerificationCode = null;
    user.phoneVerificationCodeExpiresAt = null;

    await user.save();

    res.json({ message: "Phone verification successful." });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while verifying the phone with the code.",
    });
  }
});
