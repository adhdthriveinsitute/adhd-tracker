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

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, "User not found.");
    }

    if ('password' in updates) {
      if (!updates.password) {
        throw new AppError(400, "Password cannot be empty.");
      }
      allowedFields.push("password");
    }


    // Only assign allowed fields that are present in the update
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        user[key] = updates[key];
      }
    }

    await user.save(); // ✅ triggers pre("save") hook

    const userObj = user.toObject();
    delete userObj.password; // 🧼 don't return password in response

    return userObj;

  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, error.message || "Failed to update user profile.");
  }
};

