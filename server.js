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
import PeerGroup from "./server/models/PeerGroup.js";
import Submission from "./server/models/Submission.js";
import EmployeePersonnel from "./server/models/EmployeePersonnel.js";
import EmployeeAdminSupport from "./server/models/EmployeeAdminSupport.js";

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

// dashboard endpoints
// helper functions
function toNum(x) {
    if (x === null || x === undefined) return null;
    if (typeof x === "string" && x.toLowerCase() === "NULL") return null;
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
}

function computeStats(values) {
    // first get numeric vals
    const xs = values.map(toNum).filter(v => v !== null).sort((a, b) => a - b);
    const count = xs.length;
    if (!count) return { count: 0, avg: null, median: null, min: null, max: null };

    const avg = xs.reduce((s, v) => s + v, 0) / count;
    const mid = Math.floor(count / 2);
    const median = count % 2 === 0 ? (xs[mid - 1] + xs[mid]) / 2 : xs[mid];

    return { count, avg, median, min: xs[0], max: xs[count - 1] };
}

app.get("/api/peer-groups", auth, async (req, res) => {
    // for now just return all peer groups - in future we can filter based on user/school
    const groups = await PeerGroup.find({}).lean();
    res.json(groups.map(g => ({ id: g._id.toString(), name: g.name })));
});

app.get("/api/dashboard", auth, async (req, res) => {
    try {
        const schoolYrId = Number(req.query.year); // <-- this is SCHOOL_YR_ID now
        const category = (req.query.category || "overview").toString();

        if (!Number.isFinite(schoolYrId)) {
            return res.status(400).json({ error: "Invalid year (expected SCHOOL_YR_ID)" });
        }

        if (req.user.role !== "SCHOOL") {
            return res.status(403).json({ error: "Only SCHOOL users can view dashboards." });
        }

        const schoolIdNum = Number(req.user.schoolId);
        if (!Number.isFinite(schoolIdNum)) {
            return res.status(400).json({ error: "Invalid schoolId on user token (expected number)" });
        }

        const personnel = await EmployeePersonnel.findOne({
            SCHOOL_ID: schoolIdNum,
            SCHOOL_YR_ID: schoolYrId
        }).lean();

        const kpis = [
            { label: "Total Employees", yourValue: toNum(personnel?.TOTAL_EMPLOYEES) },
            { label: "Full-Time Employees", yourValue: toNum(personnel?.FT_EMPLOYEES) },
            { label: "POC Employees", yourValue: toNum(personnel?.POC_EMPLOYEES) },
            { label: "FTE Only", yourValue: toNum(personnel?.FTE_ONLY_NUM) },
        ];

        res.json({
            kpis,
            charts: {
                bar: {
                    labels: ["Total Employees", "Full-Time Employees", "POC Employees", "FTE Only"],
                    your: kpis.map(k => k.yourValue),
                    peer: [null, null, null, null] // add peer after you implement peer groups
                },
                line: null
            }
        });
    } catch (err) {
        console.error("Dashboard route error:", err);
        return res.status(500).json({ error: "Server error in /api/dashboard" });
    }
});

/*
app.get("/api/dashboard", auth, async (req, res) => {

    console.log("Dashboard request received:", req.query);

    res.json({
        kpis: [
            { label: "Total Employees", yourValue: 214, peerValue: 198, delta: 16 }
        ],
        charts: {
            bar: {
                labels: ["Employees"],
                your: [214],
                peer: [198]
            },
            line: {
                labels: ["2022", "2023", "2024"],
                your: [200, 210, 214],
                peer: [190, 195, 198]
            }
        }
    });
});
*/

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
