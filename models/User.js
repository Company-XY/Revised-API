import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["Client", "Freelancer", "Admin"],
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "Business Client",
        "Individual Client",
        "Experienced Freelancer",
        "Beginner Freelancer",
        "Intermediate Freelancer",
        "Agency Freelancer",
      ],
    },
    bio: {
      type: String,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    consultation: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerificationCode: {
      type: String,
    },
    phoneVerificationCodeExpiresAt: {
      type: Date,
    },
    currentBalance: {
      type: Number,
      default: 0,
    },
    escrowBalance: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
    },
    contactInfo: {
      type: String,
    },
    experience: {
      type: String,
    },
    skills: [
      {
        value: { type: String },
        label: { type: String },
      },
    ],
    certifications: [
      {
        title: String,
        link: String,
      },
    ],
    tasks: [
      {
        value: { type: String },
        label: { type: String },
      },
    ],
    availability: {
      type: String,
    },
    avatar: {
      title: String,
      imageUrl: String,
    },
    sampleWork: [
      {
        title: String,
        fileUrl: String,
      },
    ],
    paymentMethod: {
      type: String,
    },
    paymentRate: {
      type: Number,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiration: {
      type: Date,
    },
    //To create a separate notifications controller incase the document grows and affects performace
    //Alternatively to have a cron job that deleted notifications that are older than a month for all users
    notifications: [
      {
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        read: { type: Boolean, default: false },
      },
    ],
    conversations: [
      {
        participant: { type: String, required: true },
        messages: [
          {
            from: { type: String, required: true },
            to: { type: String, required: true },
            message: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
            read: { type: Boolean, default: false },
          },
        ],
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Method to compare a password with the stored password hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = model("User", userSchema);

export default User;
