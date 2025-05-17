import { Router } from "express";
import {
    createSymptom,
    deleteSymptom,
    getAllSymptoms,
    updateSymptom,
} from "../controllers/symptom.controller.js";

const symptomRouter = Router();

symptomRouter
    .route("/")
    .get(getAllSymptoms)
    .post(createSymptom);

symptomRouter
    .route("/")
    .put(updateSymptom)
    .delete(deleteSymptom);

export default symptomRouter;
