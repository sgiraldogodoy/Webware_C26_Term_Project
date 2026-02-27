import express from "express";
import {loginController, registerController} from "../controller/LoginController.js";

const router = express.Router();

/** USER ENDPOINTS
 * Registration rules:
 * - Username: 3-30 chars, letters/numbers/underscores, unique
 * - Password: min 8 chars, at least 1 letter and 1 number
 * - Role: "ADMIN" or "SCHOOL" (default SCHOOL)
 * - If role is SCHOOL, schoolId is required. If ADMIN, schoolId must be null.
 *
 * Responses:
 * - 201 Created: { message: "User created", id: user._id }
 * - 400 Bad Request: { error: "Validation error message" }
 * - 409 Conflict: { error: "Username already taken." }
 * - 500 Server Error: { error: "Server error" }
 *
 * Login rules:
 * - Validate credentials
 * - On success, return JWT token and role
 * - 401 Unauthorized: { error: "Invalid credentials" }
 */
router.post("/register", registerController);

router.post("/login", loginController);

export default router;