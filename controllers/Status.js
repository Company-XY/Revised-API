import asyncHandler from "express-async-handler";

export const getStatus = asyncHandler(async (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "Server is up and running.......@Company_XY" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const getInfo = asyncHandler(async (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "Right Track.....proceed to /status/ ...@Company_XY" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
