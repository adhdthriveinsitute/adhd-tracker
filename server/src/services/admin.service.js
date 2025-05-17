import { SymptomLog } from "../models/symptomLog.model.js";
import { User } from "../models/user.model.js";
import { AppError } from "../utils/index.js";
import { AdminSettings } from "../models/adminSettings.model.js";


export const getAllUsersDataService = async () => {
    try {
        const users = await User.find()
            .select("-password -accessToken -__v")
            .sort({ createdAt: -1 })

        if (!users || users.length === 0) {
            throw new AppError(404, "No users found.");
        }

        return users;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(500, error.message || "Failed to fetch users.");
    }
};



export const getCSVExportableUserDataService = async () => {
    try {
        const users = await User.find()
            .select("-password -accessToken -__v")
            .sort({ createdAt: -1 });

        if (!users || users.length === 0) {
            throw new AppError(404, "No users found.");
        }

        const userIds = users.map(user => user._id);

        const symptomLogs = await SymptomLog.find({ user: { $in: userIds } });

        // Group logs by userId
        const logsByUser = symptomLogs.reduce((acc, log) => {
            const userId = log.user.toString();
            if (!acc[userId]) acc[userId] = [];
            acc[userId].push(log);
            return acc;
        }, {});

        // Merge symptom logs into users
        const usersWithLogs = users.map(user => {
            const userObj = user.toObject();
            userObj.symptomLogs = logsByUser[user._id.toString()] || [];
            return userObj;
        });

        return usersWithLogs;

    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(500, error.message || "Failed to fetch CSV exportable user data.");
    }
};



export const deleteUserByIdService = async (userId) => {
    try {
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            throw new AppError(404, "User not found.");
        }

        return user;
    } catch (error) {
        throw new AppError(500, error.message || "Failed to delete user.");
    }
};



// Get current admin settings (singleton pattern — 1 doc)
export const getAdminSettingsService = async () => {
    try {
        const settings = await AdminSettings
            .findOne()
            .select("-createdAt -updatedAt")
        if (!settings) {
            throw new AppError(404, "Admin settings not found.");
        }
        return settings;
    } catch (error) {
        throw new AppError(500, error.message || "Failed to fetch admin settings.");
    }
};

// Update admin settings
export const updateAdminSettingsService = async (data) => {
    try {
        const allowedFields = ["allowUserRegistration", "requireEmailVerification"];
        const updateData = {};

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            throw new AppError(400, "No valid fields provided for update.");
        }

        const updated = await AdminSettings.findOneAndUpdate(
            {},
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updated) {
            throw new AppError(404, "Admin settings not found.");
        }

        return updated;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(500, error.message || "Failed to update admin settings.");
    }
};
