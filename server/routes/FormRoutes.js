import express from "express";
import {
    getFormController,
    saveDraftController,
    submitController,
    getYearsController,
    getFormOptionsController,
} from "../controller/FormController.js";

const router = express.Router();

router.get("/", getFormController);
router.get("/years", getYearsController);
router.get("/options", getFormOptionsController);
router.put("/draft", saveDraftController);
router.post("/submit", submitController);

export default router;