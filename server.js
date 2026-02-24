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

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Error:", err));

app.use(express.json()); // parse JSON bodies
app.use(express.static("./client/public")); // serve files from /public

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


// GET template
app.get("/api", auth, async (req, res) => {//TODO fix URL

});

// POST template
app.post("/api/",auth, async (req, res) => {//TODO fix URL

});

// GET Auth
app.get("/api/auth/me", auth, async (req, res) => {
    res.json(req.user);
});

// POST new User
app.post("/api/register", async (req, res) => {
    try {
        const { username: usernameRaw, password, role, schoolId } = req.body;

        // Validate username
        const u = validateUsername(usernameRaw);
        if (!u.ok) return res.status(400).json({ error: u.message });

        // Validate password
        const p = validatePassword(password);
        if (!p.ok) return res.status(400).json({ error: p.message });

        // Validate role + schoolId rules
        const finalRole = role === "ADMIN" ? "ADMIN" : "SCHOOL"; // default SCHOOL
        if (finalRole === "SCHOOL" && !schoolId) {
            return res.status(400).json({ error: "schoolId is required for SCHOOL users." });
        }
        if (finalRole === "ADMIN" && schoolId) {
            return res.status(400).json({ error: "ADMIN users must not have a schoolId." });
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
            schoolId: finalRole === "SCHOOL" ? schoolId : null
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

    const user = await User.findOne({ username });

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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
