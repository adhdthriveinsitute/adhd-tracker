import {
    saveSymptomLogService,
    getSymptomLogByUserAndDate,
    getAllDatesWithEntriesForUserService,
    deleteSymptomLogByUserAndDateService,
    getAllSymptomLogsService,
    getSymptomLogsByUsersAndDatesService,
    getSymptomLogDatesBatchService,
    saveBulkSymptomLogsService
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


export const saveBulkSymptomLogs = async (req, res) => {
    try {
        const { logs } = req.body;

        if (!logs || !Array.isArray(logs) || logs.length === 0) {
            throw new AppError(400, "Logs array is required and cannot be empty.");
        }

        // Validate each log entry
        for (let i = 0; i < logs.length; i++) {
            const log = logs[i];
            if (!log.email) {
                throw new AppError(400, `Email is required for log at index ${i}.`);
            }
            if (!log.date) {
                throw new AppError(400, `Date is required for log at index ${i}.`);
            }
            if (!log.scores || !Array.isArray(log.scores) || log.scores.length === 0) {
                throw new AppError(400, `Scores array is required for log at index ${i}.`);
            }

            // Check for duplicate symptom IDs in each log
            const ids = log.scores.map(s => s.symptomId);
            if (new Set(ids).size !== ids.length) {
                throw new AppError(400, `Duplicate symptom IDs in scores for log at index ${i}.`);
            }
        }

        const result = await saveBulkSymptomLogsService(logs);

        res
            .status(200)
            .json({
                message: "Bulk symptom logs processed successfully.",
                summary: {
                    total: logs.length,
                    successful: result.successful.length,
                    failed: result.failed.length
                },
                successful: result.successful,
                failed: result.failed
            });
    } catch (error) {
        handleError(res, error, error instanceof AppError ? error.statusCode : 500, "Failed to save bulk symptom logs.");
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


// POST /api/v1/symptom-logs/batch
export const getSymptomLogsByUsersAndDates = async (req, res) => {
    try {
        const { userIds, dates } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            throw new AppError(400, "userIds array is required.");
        }

        if (!Array.isArray(dates) || dates.length === 0) {
            throw new AppError(400, "dates array is required.");
        }

        const result = await getSymptomLogsByUsersAndDatesService(userIds, dates);

        res.status(200).json(result);
    } catch (error) {
        handleError(
            res,
            error,
            error instanceof AppError ? error.statusCode : 500,
            "Failed to fetch symptom logs in batch."
        );
    }
};




// POST /api/v1/symptom-logs/dates/batch
export const getSymptomLogDatesBatch = async (req, res) => {
    try {
        const { userIds } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            throw new AppError(400, "userIds array is required.");
        }

        const result = await getSymptomLogDatesBatchService(userIds);

        res.status(200).json(result);
    } catch (error) {
        handleError(
            res,
            error,
            error instanceof AppError ? error.statusCode : 500,
            "Failed to fetch symptom log dates in batch."
        );
    }
};
