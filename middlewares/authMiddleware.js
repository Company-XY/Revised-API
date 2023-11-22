import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.userId).select("-password");

      if (!req.user) {
        res.status(404);
        res.json({ message: "User not found" });
      }

      next();
    } catch (error) {
      res.status(401);
      res.json({ message: "Not Authorized, token expired or invalid.." });
    }
  } else {
    res.status(401);
    res.json({ message: "Not authorized, no token" });
  }
});

export { protect };
