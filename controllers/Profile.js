import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import upload from "../middlewares/multer.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";
import util from "util";
import path from "path";
import { createNotification } from "./notificationsCrud.js";

dotenv.config();

//Get user profile
export const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json("User Not Found");
    } else {
      res.json(user);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Upload Avatar
export const uploadAvatar = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle avatar upload
    upload.single("avatar")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: "Error uploading file" });
      }
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);

        user.avatar = {
          title: req.file.originalname,
          imageUrl: result.secure_url,
        };

        const updatedUser = await user.save();
        res.status(200).json(updatedUser);
      } else {
        return res.status(400).json({ message: "No file uploaded" });
      }
    });
  } catch (error) {
    res.status(400).json(error);
    console.error(error);
  }
});

// Update isApproved status
export const updateIsApproved = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User Not Found!" });
    }

    res.status(201).json(user);
    const userId = id;
    const notificationMessage = `Hello ${user.name}, Your profile has been successfully updated and the account approved. `;

    await createNotification(userId, notificationMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Get another user's profile
export const viewUserProfile = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json("User Not Found");
    } else {
      res.json({
        _id: user._id,
        role: user.role,
        type: user.type,
        bio: user.bio,
        name: user.name,
        emailVerified: user.emailVerified,
        isApproved: user.isApproved,
        consultation: user.consultation,
        phoneVerified: user.phoneVerified,
        location: user.location,
        contactInfo: user.contactInfo,
        avatar: user.avatar,
        experience: user.experience,
        skills: user.skills,
        certifications: user.certifications,
        availability: user.availability,
        tasks: user.tasks,
        sampleWork: user.sampleWork,
        paymentMethod: user.paymentMethod,
        paymentRate: user.paymentRate,
        rating: user.rating,
        isPremium: user.isPremium,
        isVerified: user.isVerified,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//update user profile
export const updateProfile = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { phone: phoneNumber, ...updateFields } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      !phoneNumber ||
      typeof phoneNumber !== "string" ||
      phoneNumber.length !== 10
    ) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    const formattedPhoneNumber = `+254${phoneNumber.slice(1)}`;

    const existingUserWithPhone = await User.findOne({
      phone: formattedPhoneNumber,
      _id: { $ne: id },
    });

    if (existingUserWithPhone) {
      return res.status(400).json({ message: "Phone number already in use" });
    }

    user.phone = formattedPhoneNumber;

    Object.keys(updateFields).forEach((key) => {
      user[key] = updateFields[key];
    });

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
});

//SAMPLE WORKS==========================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/samples");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload2 = multer({ storage });

export const uploadSamples = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const multerUpload = util.promisify(upload2.array("sampleWork", 10));

    try {
      await multerUpload(req, res);

      const sampleWork = [];

      for (const file of req.files) {
        const filePath = path.join("public/samples", file.originalname);

        const fileContent = fs.readFileSync(file.path);
        fs.writeFileSync(filePath, fileContent);

        sampleWork.push({
          title: file.originalname,
          fileUrl: filePath,
        });

        fs.unlinkSync(file.path);
      }

      user.sampleWork = sampleWork;
      await user.save();

      res.status(200).json({ message: "Sample work uploaded successfully" });
    } catch (error) {
      res.status(500).json({ message: "File upload or save operation failed" });
      console.error(error);
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.error(error);
  }
};

export const downloadSampleWorkFile = async (req, res) => {
  try {
    const { id, fileId } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const file = user.sampleWork.find((f) => f._id.toString() === fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const filePath = file.fileUrl;

    res.download(filePath, file.title);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
};
