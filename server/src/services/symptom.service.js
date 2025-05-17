import { Symptom } from "../models/symptom.model.js";
import { AppError } from "../utils/index.js";

export const getAllSymptomsService = async () => {
    const symptoms = await Symptom.find().sort({ createdAt: 1 });
    return symptoms;
};

export const createSymptomService = async (symptomData) => {
    const exists = await Symptom.findOne({ id: symptomData.id });
    if (exists) {
        throw new AppError(400, "Symptom with this ID already exists.");
    }

    const newSymptom = new Symptom(symptomData);
    return await newSymptom.save();
};

export const updateSymptomService = async (symptomId, updateData) => {
    const updated = await Symptom.findOneAndUpdate({ id: symptomId }, updateData, {
        new: true,
    });

    if (!updated) {
        throw new AppError(404, "Symptom not found.");
    }

    return updated;
};

export const deleteSymptomService = async (symptomId) => {
    const deleted = await Symptom.findOneAndDelete({ id: symptomId });
    // console.log(deleted)

    if (!deleted) {
        throw new AppError(404, "Symptom not found.");
    }

    return deleted;
};
