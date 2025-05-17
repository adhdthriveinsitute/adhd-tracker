import mongoose from "mongoose";

const symptomScoreSchema = new mongoose.Schema({
  symptomId: { type: String, required: true }, // "hyperactivity"
  score: { type: Number, min: 1, max: 10, required: true }
}, { _id: false });

const symptomLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: {
    type: String,
    required: true
  },
  scores: [symptomScoreSchema] // length = 22 (or less if you allow skipping)
}, { timestamps: true });

symptomLogSchema.index({ user: 1, date: 1 }, { unique: true }); // ensures 1 log per day per user

export const SymptomLog = mongoose.model('SymptomLog', symptomLogSchema);
