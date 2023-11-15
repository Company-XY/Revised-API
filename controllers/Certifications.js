import asyncHandler from "express-async-handler";
import User from "../models/User.js";

export const getCertifications = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const certiications = user.certifications;

    res.status(200).json(certiications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const addCertification = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { title, link } = req.body;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    user.certifications.push({ title, link });
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const updateCertification = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { certificationId, newTitle, newLink } = req.body;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const certification = user.certifications.id(certificationId);

    if (!certification) {
      return res.status(404).json({ message: "Certification does not exist" });
    }

    if (newTitle) {
      certification.title = newTitle;
    }

    if (newLink) {
      certification.link = newLink;
    }

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
