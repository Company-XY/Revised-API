import mongoose from "mongoose";

const { Schema, model } = mongoose;

const callSchema = Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
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
    time: {
      type: String,
    },
    date: {
      type: String,
    },
    time2: {
      type: String,
    },
    date2: {
      type: String,
    },
    assignedTo: {
      type: String,
    },
    bids: {
      type: Number,
      default: 0,
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

const Call = model("Call", callSchema);

export default Call;
