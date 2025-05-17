import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { CLIENT_URL } from "./config/index.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import symptomLogRouter from "./routes/symptomLog.route.js";
import { Admin } from "./models/admin.model.js";
import adminRouter from "./routes/admin.route.js";
import symptomRouter from "./routes/symptom.route.js";


const app = express();

// CORS configuration
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://192.168.1.107:5173",
        CLIENT_URL
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

// Other middlewares
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/symptom-logs", symptomLogRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/symptoms", symptomRouter);

// Test route
app.get("/", (req, res) => {
    res
        .status(200)
        .json({
            success: true,
            message: "Hello World From ADHD App!",
            requestedUrl: req.url
        });
});

app.get("/admins", async (req, res) => {

    const admins = await Admin.find({})

    res
        .status(200)
        .json({
            admins,
            success: true,
            message: "Hello World From ADHD App!",
            requestedUrl: req.url
        });
});





export default app;
