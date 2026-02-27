import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

//Import Schemas
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

app.use("/api/dashboard", auth, dashboardRoutes);

app.use("/api", loginRoutes);


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
