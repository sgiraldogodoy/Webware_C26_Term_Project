import express from "express";
import { requireRole } from "../middleware/requireRole.js";
import {
    getMeController,
    changePasswordController,
    adminListUsersController,
    adminCreateUserController,
} from "../controller/UserController.js";

const router = express.Router();

// logged-in user
router.get("/me", getMeController);
router.put("/me/password", changePasswordController);

// admin
router.get("/admin/users", requireRole("ADMIN"), adminListUsersController);
router.post("/admin/users", requireRole("ADMIN"), adminCreateUserController);

export default router;