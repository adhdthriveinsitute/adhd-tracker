import { Router } from "express";
import {
    deleteUserById,
    getAdminSettings,
    getAllUsersData,
    getCSVExportableUserData,
    updateAdminSettings
} from "../controllers/admin.controller.js";

const adminRouter = Router();

adminRouter
    .route("/users/all")
    .get(getAllUsersData)

adminRouter
    .route("/users/all/with-symptoms")
    .get(getCSVExportableUserData)

adminRouter
    .route("/users")
    .delete(deleteUserById)

adminRouter
    .route("/settings")
    .get(getAdminSettings)
    .put(updateAdminSettings)




export default adminRouter;
