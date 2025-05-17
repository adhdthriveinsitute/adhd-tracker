import {
    updateUserProfileService,
    getUserProfileService
} from "../services/user.service.js";
import { handleError, AppError } from "../utils/index.js";



export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.query;

        const user = await getUserProfileService(userId);

        res.status(200).json({
            success: true,
            message: "User profile fetched successfully.",
            user,
        });

    } catch (error) {
        handleError(res, error, error.statusCode || 500, error.message);
    }
};


export const updateUserProfile = async (req, res) => {
    try {
        const { userId } = req.query;
        console.log(userId)
        if (!userId) {
            throw new AppError(400, "User ID is required.");
        }

        const updatedUser = await updateUserProfileService(userId, req.body);

        res.status(200).json({
            success: true,
            message: "User profile updated successfully.",
            user: updatedUser,
        });
    } catch (error) {
        handleError(res, error, error.statusCode || 500, error.message);
    }
};
