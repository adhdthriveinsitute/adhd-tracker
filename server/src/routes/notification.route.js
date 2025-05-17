import { Router } from "express";
import { savePushSubscription, updateReminder } from "../controllers/notification.controller.js";

const notificationRouter = Router();

notificationRouter
    .post("/update-reminder", updateReminder);

notificationRouter
    .post("/subscribe", savePushSubscription);

export default notificationRouter;
