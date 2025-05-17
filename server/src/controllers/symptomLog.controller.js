import {
    saveSymptomLogService,
    getSymptomLogByUserAndDate,
    getAllDatesWithEntriesForUserService,
    deleteSymptomLogByUserAndDateService,
    getAllSymptomLogsService
} from "../services/symptomLog.service.js";
import { AppError, handleError } from "../utils/index.js";



export const saveSymptomLog = async (req, res) => {
    try {
        const { scores, date, userId } = req.body;

        if (!userId) {
            throw new AppError(401, "Unauthorized user.");
        }

        if (!scores || !Array.isArray(scores) || scores.length === 0) {
            throw new AppError(400, "Scores array is required.");
        }

        if (!date) {
            throw new AppError(400, "Date is required.");
        }

        const ids = scores.map(s => s.symptomId);
        if (new Set(ids).size !== ids.length) {
            throw new AppError(400, "Duplicate symptom IDs in scores.");
        }

        const symptomLog = await saveSymptomLogService(userId, date, scores);

        res.status(200).json({
            message: "Symptom log saved successfully.",
            symptomLog,
        });
    } catch (error) {
        handleError(res, error, error instanceof AppError ? error.statusCode : 500, "Failed to save symptom log.");
    }
};


export const fetchSymptomLogByDate = async (req, res) => {

    const { userId, date } = req.query;

    try {
        if (!userId || !date) {
            throw new AppError(400, "userId and date are required")
        }
        const log = await getSymptomLogByUserAndDate(userId, date);

        if (!log) {
            res.
                status(404)
                .json({ message: "No entry found for selected date" });
            return
        }

        res.status(200).json(log);

    } catch (error) {
        handleError(res, error, error instanceof AppError ? error.statusCode : 500, "Failed to fetch symptom log.");
    }
}


export const getDatesWithEntries = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            throw new AppError(400, "userId is required.");
        }

        const dates = await getAllDatesWithEntriesForUserService(userId);

        res.status(200).json({
            datesWithEntries: dates,
        });
    } catch (error) {
        handleError(res, error, error instanceof AppError ? error.statusCode : 500, "Failed to fetch dates.");
    }
};



export const deleteSymptomLogByDate = async (req, res) => {
    const { userId, date } = req.query;

    try {
        if (!userId || !date) {
            throw new AppError(400, "userId and date are required.");
        }

        const deleted = await deleteSymptomLogByUserAndDateService(userId, date);

        if (!deleted) {
            res
                .status(404)
                .json({
                    message: "No symptom log found to delete."
                });
            return;
        }

        res.status(200).json({
            message: "Symptom log deleted successfully.",
        });
    } catch (error) {
        handleError(
            res,
            error,
            error instanceof AppError ? error.statusCode : 500,
            "Failed to delete symptom log."
        );
    }
};


export const getAllSymptomLogs = async (req, res) => {
    try {
        const logs = await getAllSymptomLogsService();

        res.status(200).json({
            message: "Fetched all symptom logs successfully.",
            symptomLogs: logs
        });
    } catch (error) {
        handleError(
            res,
            error,
            error instanceof AppError ? error.statusCode : 500,
            "Failed to fetch all symptom logs."
        );
    }
};
