import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

//Import Schemas
import PeerGroup from "./server/models/PeerGroup.js";
import dashboardRoutes from "./server/routes/DashboardRoutes.js";
import cors from "cors";
import loginRoutes from "./server/routes/LoginRoutes.js";
import School from "./server/models/School.js";
import compareDashboardRoutes from "./server/routes/compareDashboardRoutes.js";
import userRoutes from "./server/routes/UserRoutes.js";

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

app.use("/api/dashboard", auth, dashboardRoutes);

app.use("/api", loginRoutes);

app.use("/api/compare-dashboard", auth, compareDashboardRoutes);

app.use("/api/users", auth, userRoutes);

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
/*
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

        console.log("dashboard user:", req.user);
        console.log("dashboard params:", { year: req.query.year, category: req.query.category });
        console.log("dashboard query:", { SCHOOL_ID: schoolIdNum, SCHOOL_YR_ID: schoolYrId });

        const personnel = await EmployeePersonnel.findOne({
            SCHOOL_ID: schoolIdNum,
            SCHOOL_YR_ID: schoolYrId
        }).lean();

        console.log("personnel found?", !!personnel);

        const kpis = [
            { label: "Total Employees", yourValue: toNum(personnel?.TOTAL_EMPLOYEES) },
            { label: "Full-Time Employees", yourValue: toNum(personnel?.FT_EMPLOYEES) },
            { label: "POC Employees", yourValue: toNum(personnel?.POC_EMPLOYEES) },
            { label: "FTE Only", yourValue: toNum(personnel?.FTE_ONLY_NUM) },
        ];

        res.json({
            kpis,
            // charts: {
            //     bar: {
            //         labels: ["Total Employees", "Full-Time Employees", "POC Employees", "FTE Only"],
            //         your: kpis.map(k => k.yourValue),
            //         peer: [null, null, null, null] // add peer after you implement peer groups
            //     },
            //     line: null
            // }
        });
    } catch (err) {
        console.error("Dashboard route error:", err);
        return res.status(500).json({ error: "Server error in /api/dashboard" });
    }
});
*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "client", "dist")));

app.get("/api/schools/:id", auth, async (req, res) => {
    const school = await School.findOne({ID: Number(req.params.id)}).lean();
    if (!school) return res.status(404).json({error: "Not found"});
});

app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
