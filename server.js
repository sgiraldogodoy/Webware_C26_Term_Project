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

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
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

// GET template
app.get("/api", auth, async (req, res) => {//TODO fix URL

});

// POST template
app.post("/api/",auth, async (req, res) => {//TODO fix URL

});

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
app.post("/api/register", async (req, res) => {
    try {
        const {username: usernameRaw, password, schoolId} = req.body;

        // Validate username
        const u = validateUsername(usernameRaw);
        if (!u.ok) return res.status(400).json({ error: u.message });

        // Validate password
        const p = validatePassword(password);
        if (!p.ok) return res.status(400).json({ error: p.message });

        const finalRole = "SCHOOL";

        // Expect schoolId to be a number (or numeric string)
        const schoolIdNum = Number(schoolId);

        if (!Number.isInteger(schoolIdNum) || schoolIdNum <= 0) {
            return res.status(400).json({error: "Invalid school selection."});
        }

        // confirm school exists and active
        const school = await School.findOne({ID: schoolIdNum, ACTIVE_INT: "Y"}).lean();
        if (!school) {
            return res.status(400).json({error: "Selected school not found."});
        }

        // Uniqueness check (fast fail)
        const existing = await User.findOne({ username: u.username }).lean();
        if (existing) {
            return res.status(409).json({ error: "Username already taken." });
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            username: u.username,
            password: hashed,
            role: finalRole,
            schoolId: schoolIdNum
        });

        return res.status(201).json({ message: "User created", id: user._id });
    } catch (err) {
        // Handle unique index race condition
        if (err?.code === 11000) {
            return res.status(409).json({ error: "Username already taken." });
        }
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
});

// POST User
app.post("/api/login", async (req, res) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET missing");
    }

    const { username, password } = req.body;

    const normalizedUsername = (username ?? "").trim().toLowerCase();
    const user = await User.findOne({ username: normalizedUsername });

    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
        {
            id: user._id,
            role: user.role,
            schoolId: user.schoolId
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    res.json({
        token,
        role: user.role
    });
});


// DELETE template
app.delete("/api/", auth, async (req, res) => {//TODO fix URL

});

// PUT template
app.put("/api/",auth, async (req, res) => {//TODO fix URL

});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "client", "dist")));

app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

app.use("/api/dashboard", auth, dashboardRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
