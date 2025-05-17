import { Router } from "express";
import {
    deleteSymptomLogByDate,
    fetchSymptomLogByDate,
    getDatesWithEntries,
    saveSymptomLog,
    getAllSymptomLogs
}
    from "../controllers/symptomLog.controller.js";

const symptomLogRouter = Router();

// POST /api/v1/symptom-logs
symptomLogRouter
    .post("/", saveSymptomLog);

symptomLogRouter
    .get("/", getAllSymptomLogs);

// DELETE /api/v1/symptom-logs
symptomLogRouter
    .delete("/", deleteSymptomLogByDate);


symptomLogRouter
    .get("/by-date", fetchSymptomLogByDate)


symptomLogRouter
    .get("/dates", getDatesWithEntries)


export default symptomLogRouter;
