import { SymptomLog } from "../models/symptomLog.model.js";
import { AppError } from "../utils/index.js";
import { DATE_FORMAT_REGEX, DATE_FORMAT_STRING } from "../constants.js"
import mongoose from "mongoose";

export const saveSymptomLogService = async (userId, date, scores) => {
  try {
    if (!userId || !date || !Array.isArray(scores) || scores.length === 0) {
      throw new AppError(400, "User ID, date, and scores are required.");
    }


    if (!DATE_FORMAT_REGEX.test(date)) {
      throw new AppError(400, `Date must be in ${DATE_FORMAT_STRING} format.`);
    }

    const update = { scores };
    const options = {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    };

    const symptomLog = await SymptomLog.findOneAndUpdate(
      { user: userId, date },
      update,
      options
    );

    return symptomLog;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, error?.message || "Failed to save symptom log.");
  }
};


export const getSymptomLogByUserAndDate = async (userId, date) => {

  if (!DATE_FORMAT_REGEX.test(date)) {
    throw new AppError(400, `Date must be in ${DATE_FORMAT_STRING} format.`);
  }


  const log = await SymptomLog.findOne({
    user: userId,
    date
  });

  return log;

};



export const getAllDatesWithEntriesForUserService = async (userId) => {
  if (!userId) {
    throw new AppError(400, "User ID is required.");
  }

  try {
    // Step 1: Get all symptom logs for the user
    const logs = await SymptomLog.find({ user: userId }).select("date -_id");

    const dates = logs.map(log => log.date.split("T")[0]);
    const uniqueDates = [...new Set(dates)];
    uniqueDates.sort((a, b) => new Date(b) - new Date(a));

    return uniqueDates;

  } catch (error) {
    throw new AppError(500, "Failed to fetch dates with entries.");
  }
};


export const deleteSymptomLogByUserAndDateService = async (userId, date) => {
  try {
    if (!DATE_FORMAT_REGEX.test(date)) {
      throw new AppError(400, `Date must be in ${DATE_FORMAT_STRING} format.`);
    }

    const result = await SymptomLog.findOneAndDelete({
      user: userId,
      date,
    });

    return result; // will be null if not found
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, error?.message || "Failed to delete symptom log.");
  }
};



export const getAllSymptomLogsService = async () => {
  try {
    const logs = await SymptomLog.find({})
      .populate({
        path: "user",
        select: "name _id"
      })
      .select("user date scores -_id") // exclude _id if not needed

    return logs.map(log => ({
      name: log.user?.name || "Unknown",
      date: log.date,
      scores: log.scores
    }));
  } catch (error) {
    throw new AppError(500, error?.message || "Failed to fetch all symptom logs.");
  }
};



export const getSymptomLogsByUsersAndDatesService = async (userIds, dates) => {
  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new AppError(400, "userIds must be a non-empty array.");
    }

    if (!Array.isArray(dates) || dates.length === 0) {
      throw new AppError(400, "dates must be a non-empty array.");
    }

    const invalidDates = dates.filter(date => !DATE_FORMAT_REGEX.test(date));
    if (invalidDates.length > 0) {
      throw new AppError(400, `Invalid date format(s): ${invalidDates.join(", ")}. Use ${DATE_FORMAT_STRING}.`);
    }

    const logs = await SymptomLog.find({
      user: { $in: userIds },
      date: { $in: dates }
    })
      .select("user date scores -_id")
      .lean();

    // console.log("Raw logs from DB:", logs);
    // console.dir(logs[0].scores[0], { depth: null });


    // Shape the response
    const result = {};
    for (const userId of userIds) {
      result[userId] = {};

      for (const date of dates) {
        result[userId][date] = { symptoms: [] };
      }
    }

    for (const log of logs) {
      const uid = log.user.toString();
      const date = log.date;

      if (result[uid] && result[uid][date]) {
        result[uid][date] = { symptoms: log.scores };
      }
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, error?.message || "Failed to fetch symptom logs.");
  }
};



export const getSymptomLogDatesBatchService = async (userIds) => {
  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new AppError(400, "userIds must be a non-empty array.");
    }

    // Use aggregation to group by user and collect unique dates
    const logs = await SymptomLog.aggregate([
      {
        $match: {
          user: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) }
        }
      },
      {
        $group: {
          _id: {
            user: "$user",
            date: "$date"
          }
        }
      },
      {
        $group: {
          _id: "$_id.user",
          dates: { $addToSet: "$_id.date" }
        }
      }
    ]);

    // Prepare result as { userId: [dates...] }
    const result = {};
    for (const userId of userIds) {
      result[userId] = [];
    }

    for (const entry of logs) {
      const uid = entry._id.toString();
      result[uid] = entry.dates;
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, error?.message || "Failed to fetch symptom log dates.");
  }
};
