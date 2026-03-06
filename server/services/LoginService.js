import {validatePassword, validateUsername} from "../middleware/registerValidator.js";
import School from "../models/School.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export async function registerService({usernameRaw, password, schoolId}) {
    // Validate username
    const u = validateUsername(usernameRaw);
    if (!u.ok) return { status: 400, error: u.message };

    // Validate password
    const p = validatePassword(password);
    if (!p.ok) return {status: 400, error: p.message };

    const finalRole = "SCHOOL";

    // Expect schoolId to be a number (or numeric string)
    const schoolIdNum = Number(schoolId);

    if (!Number.isInteger(schoolIdNum) || schoolIdNum <= 0) {
        return {status: 400, error: "Invalid school selection."};
    }

    // confirm school exists and active
    const school = await School.findOne({ID: schoolIdNum, ACTIVE_INT: "Y"}).lean();
    if (!school) {
        return {status:400, error: "Selected school not found."};
    }

    // Uniqueness check (fast fail)
    const existing = await User.findOne({ username: u.username }).lean();
    if (existing) {
        return {status: 409, error: "Username already taken." };
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
        username: u.username,
        password: hashed,
        role: finalRole,
        schoolId: schoolIdNum
    });

    return {status: 201, message: "User created", id: user._id };
}

export async function loginService({usernameRaw, password}) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET missing");
    }

    const normalizedUsername = (usernameRaw ?? "").trim().toLowerCase();
    const user = await User.findOne({ username: normalizedUsername });

    if (!user) {
        return {status: 401, error: "Invalid credentials" };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        return {status: 401, error: "Invalid credentials" };
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

    return {status: 200, message: "Login successful", token, role: user.role};
}

export async function getSchoolsService() {
    const query = { ACTIVE_INT: "Y" };

    const schools = await School.find(query)
        .select({ ID: 1, NAME_TX: 1, REGION_CD: 1, GROUP_CD: 1, GENDER_COMPOSITION_CD: 1 })
        .sort({ NAME_TX: 1 })
        .lean();

   const data = schools.map((s) => ({
            id: s.ID,
            name: s.NAME_TX,
            region: s.REGION_CD,
            group: s.GROUP_CD,
            gender: s.GENDER_COMPOSITION_CD,
        }));
   return {status: 200, data};
}