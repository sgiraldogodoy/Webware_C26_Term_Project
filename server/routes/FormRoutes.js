import express from "express";
import {
    getFormController,
    saveDraftController,
    submitController,
    getYearsController
} from "../controller/FormController.js";

const router = express.Router();

// yearId is required (query)
router.get("/", getFormController);

// get all years
router.get("/years", getYearsController);

// save draft (upsert)
router.put("/draft", saveDraftController);

// submit (validates + sets submitted)
router.post("/submit", submitController);

export default router;