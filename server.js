import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";
import {validateUsername, validatePassword} from "./server/registerValidator.js"

//Import Schemas
import User from "./server/models/User.js";
import School from "./server/models/School.js";
import dashboardRoutes from "./server/routes/DashboardRoutes.js";
import cors from "cors";
import loginRoutes from "./server/routes/LoginRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;


// app.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true
// }));

app.use(express.json());
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Error:", err));

app.use(express.json()); // parse JSON bodies
app.use(express.static("./client/public")); // serve files from /public


/**
 * Authentication middleware - verifies JWT token and attaches user info to req.user
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function auth(req, res, next) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET missing");
    }
    const header = req.headers.authorization;

    if (!header) return res.sendStatus(401);

    const token = header.split(" ")[1];

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.sendStatus(403);
    }
}

/*----------------------ENDPOINTS-----------------------*/

/**
 * Auth test endpoint - returns user info from JWT
 */
app.get("/api/auth/me", auth, async (req, res) => {
    res.json(req.user);
});

/**
 * Public endpoint to get list of schools. No auth required.
 */
app.get("/api/schools/public", async (req, res) => {
    try {
        const query = { ACTIVE_INT: "Y" }; // remove if you don't want active filtering

        const schools = await School.find(query)
            .select({ ID: 1, NAME_TX: 1, REGION_CD: 1, GROUP_CD: 1, GENDER_COMPOSITION_CD: 1 })
            .sort({ NAME_TX: 1 })
            .lean();

        res.json(
            schools.map((s) => ({
                id: s.ID,
                name: s.NAME_TX,
                region: s.REGION_CD,
                group: s.GROUP_CD,
                gender: s.GENDER_COMPOSITION_CD,
            }))
        );
    } catch (e) {
        console.error(e);
        res.status(500).json({error: "Failed to load schools."});
    }
});

app.use("/api/dashboard", auth, dashboardRoutes);

app.use("/api", auth, loginRoutes);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "client", "dist")));

app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
