import {
    createSymptomService,
    deleteSymptomService,
    getAllSymptomsService,
    updateSymptomService,
} from "../services/symptom.service.js";
import { handleError } from "../utils/index.js";

export const getAllSymptoms = async (req, res) => {
    try {
        const symptoms = await getAllSymptomsService();

        res.status(200).json({
            success: true,
            message: "Symptoms fetched successfully.",
            symptoms,
        });
    } catch (error) {
        handleError(res, error, error.statusCode || 500, error.message);
    }
};

export const createSymptom = async (req, res) => {
    try {
        const newSymptom = await createSymptomService(req.body);

        res.status(201).json({
            success: true,
            message: "Symptom created successfully.",
            symptom: newSymptom,
        });
    } catch (error) {
        handleError(res, error, error.statusCode || 500, error.message);
    }
};

export const updateSymptom = async (req, res) => {
    try {
        const { symptomId } = req.query;

        const updated = await updateSymptomService(symptomId, req.body);

        res.status(200).json({
            success: true,
            message: "Symptom updated successfully.",
            symptom: updated,
        });
    } catch (error) {
        handleError(res, error, error.statusCode || 500, error.message);
    }
};

export const deleteSymptom = async (req, res) => {
    try {
        const { symptomId } = req.query;

        const deleted = await deleteSymptomService(symptomId);

        res.status(200).json({
            success: true,
            message: "Symptom deleted successfully.",
            symptom: deleted,
        });
    } catch (error) {
        handleError(res, error, error.statusCode || 500, error.message);
    }
};
