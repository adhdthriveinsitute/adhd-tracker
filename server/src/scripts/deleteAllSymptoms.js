import mongoose from "mongoose";
import { connectToMongoDB } from "../config/db/index.js";
import { Symptom } from "../models/symptom.model.js";

const deleteAllSymptoms = async () => {
    try {
        // Connect to MongoDB
        await connectToMongoDB();
        console.log("Connected to MongoDB successfully");

        // Delete all symptoms
        const result = await Symptom.deleteMany({});
        
        console.log(`\n✓ Successfully deleted ${result.deletedCount} symptom(s) from the collection`);
        console.log("✓ Collection structure preserved\n");

        // Close the connection
        await mongoose.connection.close();
        console.log("MongoDB connection closed");
        
        process.exit(0);
    } catch (error) {
        console.error("Error deleting symptoms:", error);
        
        // Ensure connection is closed even on error
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        
        process.exit(1);
    }
};

// Execute the script
deleteAllSymptoms();

