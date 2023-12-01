import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Job from "../models/Job.js";
import generateToken from "../utils/generateToken.js";
import { createNotification } from "./notificationsCrud.js";

export const registerFreelancer = asyncHandler(async (req, res) => {
  const role = "Freelancer";
  const { type, email, name, password } = req.body;

  if (!type || !name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Fill in all the details to create an account" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    const nameExists = await User.findOne({ name });
    if (nameExists) {
      return res.status(400).json({ message: "Username already in use" });
    }

    const passwordPattern =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordPattern.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include at least one letter, one number, and one special character.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      role,
      type,
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      const token = generateToken(user._id);

      res.status(201).json({
        _id: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
        type: user.type,
        token,
      });

      const userId = user._id;
      const notificationMessage = `Hello ${user.name}, Welcome to Assist Africa. Create a profile, to access the project's dashboard. Then verify your phone number and email address.  `;

      await createNotification(userId, notificationMessage);
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Register Client
export const registerClient = asyncHandler(async (req, res) => {
  const role = "Client";
  const { type, email, name, password } = req.body;

  if (!type || !name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Fill in all the details to register" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    const nameExists = await User.findOne({ name });
    if (nameExists) {
      return res.status(400).json({ message: "Username already in use" });
    }

    const passwordPattern =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordPattern.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include at least one letter, one number, and one special character.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      role,
      type,
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      const token = generateToken(user._id);

      res.status(201).json({
        _id: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
        type: user.type,
        token,
      });

      const userId = user._id;
      const notificationMessage = `Hello ${user.name}, Welcome to Assist Africa. Create a profile to post projects. `;

      await createNotification(userId, notificationMessage);
    } else {
      res
        .status(400)
        .json({ message: "Invalid user data, check all the required fields" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(error);
  }
});

//Login User
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Fill in all the details to login" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(401)
      .json({ message: "There is no account associated with this email." });
  }

  if (user && !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Wrong password." });
  }

  const token = generateToken(user._id);

  res.json({
    _id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    token: token,
  });
});

export const getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//=================================================================

export const getCompletedJobs = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "User ID not provided" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found, check ID" });
    }

    const userEmail = user.email;

    const completedJobs = await Job.find({
      $or: [{ user_email: userEmail }, { assignedTo: userEmail }],
      stage: "Complete",
    });

    if (!completedJobs || completedJobs.length === 0) {
      return res
        .status(404)
        .json({ message: "User has no completed projects yet" });
    }

    res.status(200).json(completedJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//===================MISC=== To be deleted=======

export const updateBalance = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    const { amount } = req.body;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount." });
    }

    user.currentBalance += amount;

    await user.save();

    res.status(200).json({ message: "Balance updated successfully." });
  } catch (error) {
    console.error("Error updating balance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//++============================FREELANCER RATING+++++++++++++++======

export const getFreelancerAverageRating = asyncHandler(async (req, res) => {
  try {
    const freelancerId = req.params;

    const freelancer = await User.findById(freelancerId);

    if (!freelancer) {
      return res.status(404).json({ message: "Freelancer not found" });
    }

    const freelancerEmail = freelancer.email;

    const jobs = await Job.find({ assignedTo: freelancerEmail });

    const completedJobs = jobs.filter(
      (job) => job.stage === "Complete" && job.freelancerRating
    );

    if (completedJobs.length === 0) {
      return res.status(200).json({ averageRating: 0 });
    }

    const totalRatings = completedJobs.reduce(
      (total, job) => total + job.freelancerRating,
      0
    );
    const averageRating = totalRatings / completedJobs.length;

    res
      .status(200)
      .json({ averageRating: parseFloat(averageRating.toFixed(1)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
