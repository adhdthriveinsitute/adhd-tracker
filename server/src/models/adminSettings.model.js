import mongoose from "mongoose";

const adminSettingsSchema = new mongoose.Schema(
  {
    allowUserRegistration: {
      type: Boolean,
      default: true,
    },
    requireEmailVerification: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const AdminSettings = mongoose.model("AdminSettings", adminSettingsSchema);
