import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

//Import Schemas
import User from "./server/models/User.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
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

    if (user.password !== password) { // later replace with bcrypt
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
