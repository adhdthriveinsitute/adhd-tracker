import { User } from "../models/user.model.js";
import { AppError } from "../utils/index.js";


export const getAllUsersService = async () => {

    // wrap in try catch
    return await User.find();
};


export const getUserProfileService = async (userId) => {
    try {
        const user = await User.findById(userId)
            .select("name email organization")

        if (!user) {
            throw new AppError(404, "User not found.");
        }

        return user;
    } catch (error) {
        throw new AppError(500, error.message || "Failed to fetch user profile.");
    }
};


// Allow updating specific fields only
export const updateUserProfileService = async (userId, updates) => {
  try {
    const allowedFields = ["name", "dateOfBirth", "weight", "gender", "email", "type"];
    const updateData = {};

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        updateData[key] = updates[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new AppError(400, "No valid fields provided for update.");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true, context: "query" }
    ).select("-password");

    if (!user) {
      throw new AppError(404, "User not found.");
    }

    return user;

  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, error.message || "Failed to update user profile.");
  }
};
