import mongoose from "mongoose";

const { Schema, model } = mongoose;

const detailsSchema = Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    businessName: {
      type: String,
    },
    prGoals: {
      type: String,
    },
    budget: {
      type: String,
    },
    bids: {
      type: Number,
      default: 0,
    },
    assignedTo: {
      type: String,
    },
    status: {
      type: [String],
      enum: ["Pending", "Ongoing", "Complete", "Under Review", "Cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Details = model("Details", detailsSchema);

export default Details;
