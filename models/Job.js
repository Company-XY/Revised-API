import mongoose from "mongoose";

const { Schema, model } = mongoose;

const jobSchema = Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    services: {
      type: String,
      required: true,
    },
    user_email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    files: [
      {
        filename: String,
        fileUrl: String,
      },
    ],
    skills: [
      {
        value: { type: String },
        label: { type: String },
      },
    ],
    duration: {
      type: Number,
      required: true,
    },
    experience: {
      type: String,
    },
    budget: {
      type: Number,
      required: true,
    },
    bids: [
      {
        email: String,
        name: String,
        proposal: String,
        files: [
          {
            filename: String,
            fileUrl: String,
          },
        ],
        price: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          enum: ["Pending", "Ongoing", "Complete", "Cancelled"],
          default: "Pending",
        },
      },
    ],
    assignedTo: {
      type: String,
    },
    product: {
      files: [
        {
          filename: String,
          fileUrl: String,
        },
      ],
      review: String,
      name: String,
      email: String,
    },
    finalPrice: {
      type: Number,
    },
    stage: {
      type: String,
      enum: [
        "Pending",
        "Ongoing",
        "Under Review",
        "Disputed",
        "Complete",
        "Approved",
      ],
      default: "Pending",
    },
    paymentVerified: {
      type: Boolean,
      default: false,
    },
    review: {
      type: String,
    },
    awardedAt: {
      type: Date,
    },
    freelancerRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    //Client Rating to be changed to client score
    clientRating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

const Job = model("Job", jobSchema);

export default Job;
