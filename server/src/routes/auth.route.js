import { Router } from "express";
import {
    forgotPassword,
    login,
    logout,
    resendEmailVerification,
    resetPassword,
    signup,
    verifyEmail
} from "../controllers/auth.controller.js";

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


authRouter
    .route("/forgot-password")
    .post(forgotPassword);


authRouter
    .route("/reset-password")
    .post(resetPassword);


export default authRouter;
