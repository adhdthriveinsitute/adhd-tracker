import { Router } from "express";
import { getUserProfile, updateUserProfile } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter
    .route("/profile").get(getUserProfile)

userRouter
    .route("/profile").put(updateUserProfile)

export default userRouter;                    
