import mongoose from "mongoose";
import { connectToMongoDB } from "../config/db/index.js";
import { SymptomLog } from "../models/symptomLog.model.js";

const deleteAllSymptomLogs = async () => {
    try {
        // Connect to MongoDB
        await connectToMongoDB();
        console.log("Connected to MongoDB successfully");

        // Delete all symptom logs
        const result = await SymptomLog.deleteMany({});
        
        console.log(`\n✓ Successfully deleted ${result.deletedCount} symptom log(s) from the collection`);
        console.log("✓ Collection structure preserved\n");

        // Close the connection
        await mongoose.connection.close();
        console.log("MongoDB connection closed");
        
        process.exit(0);
    } catch (error) {
        console.error("Error deleting symptom logs:", error);
        
        // Ensure connection is closed even on error
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        
        process.exit(1);
    }
};

// Execute the script
deleteAllSymptomLogs();
