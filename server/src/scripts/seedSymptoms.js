import mongoose from "mongoose";
import { connectToMongoDB } from "../config/db/index.js";
import { Symptom } from "../models/symptom.model.js";
import { SYMPTOMS } from "../constants.js";

const seedSymptoms = async () => {
    try {
        // Connect to MongoDB
        await connectToMongoDB();
        console.log("Connected to MongoDB successfully");

        // Clear existing symptoms first
        await Symptom.deleteMany({});
        console.log("Cleared existing symptoms");

        // Insert symptoms from constants
        const symptomsToInsert = SYMPTOMS.map(symptom => ({
            id: symptom.id,
            name: symptom.name,
            category: symptom.category.toLowerCase(), // Convert to lowercase to match enum
            value: symptom.defaultValue
        }));

        const result = await Symptom.insertMany(symptomsToInsert);
        
        console.log(`\n✓ Successfully seeded ${result.length} symptom(s) to the collection`);
        console.log("✓ Symptoms added from constants.js\n");

        // Close the connection
        await mongoose.connection.close();
        console.log("MongoDB connection closed");
        
        process.exit(0);
    } catch (error) {
        console.error("Error seeding symptoms:", error);
        
        // Ensure connection is closed even on error
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        
        process.exit(1);
    }
};

// Execute the script
seedSymptoms();
