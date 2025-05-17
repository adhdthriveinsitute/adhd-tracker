import { Router } from "express";
import { login, logout, resendEmailVerification, signup, verifyEmail } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter
    .route("/signup")
    .post(signup)

authRouter
    .route("/login")
    .post(login)

authRouter
    .route("/verify-email")
    .get(verifyEmail)

authRouter
    .route("/resend-email-verification")
    .post(resendEmailVerification)

authRouter
    .route("/logout")
    .post(logout)

export default authRouter;
