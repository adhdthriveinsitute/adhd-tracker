import {
    deleteUserByIdService,
    getAllUsersDataService,
    getCSVExportableUserDataService,
    getAdminSettingsService,
    updateAdminSettingsService,
} from "../services/admin.service.js";

import { handleError } from "../utils/index.js";


export const getAllUsersData = async (req, res) => {
    try {
        const users = await getAllUsersDataService();

        res.status(200).json({
            success: true,
            message: "All users fetched successfully.",
            users,
        });

    } catch (error) {
        handleError(res, error, error.statusCode || 500, error.message);
    }
};


export const getCSVExportableUserData = async (req, res) => {
    try {
        const usersWithLogs = await getCSVExportableUserDataService();

        res
            .status(200)
            .json({
                success: true,
                message: "CSV exportable user data fetched successfully.",
                users: usersWithLogs,
            });
    } catch (error) {
        handleError(res, error, error.statusCode || 500, error.message);
    }
};


export const deleteUserById = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            throw new AppError(400, "User ID is required.");
        }

        const deletedUser = await deleteUserByIdService(userId);

        res
            .status(200)
            .json({
                success: true,
                message: "User deleted successfully.",
                user: deletedUser,
            });
    } catch (error) {
        handleError(res, error, error.statusCode || 500, error.message);
    }
};



export const getAdminSettings = async (req, res) => {
    try {
        const settings = await getAdminSettingsService();
        res.status(200).json({
            success: true,
            message: "Admin settings fetched successfully.",
            settings,
        });
    } catch (error) {
        handleError(res, error, error.statusCode || 500, error.message);
    }
};


export const updateAdminSettings = async (req, res) => {
    try {
        const updated = await updateAdminSettingsService(req.body);
        res.status(200).json({
            success: true,
            message: "Admin settings updated successfully.",
            settings: updated,
        });
    } catch (error) {
        handleError(res, error, error.statusCode || 500, error.message);
    }
};

