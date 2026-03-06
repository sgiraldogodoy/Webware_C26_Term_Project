import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/User.js";
import School from "../models/School.js";
import { validatePassword, validateUsername } from "../registerValidator.js";

export async function getMeService({ user }) {
    if (!user?.id) return { status: 401, error: "Not authenticated." };

    const dbUser = await User.findById(user.id).select({ password: 0 }).lean();
    if (!dbUser) return { status: 404, error: "User not found." };

    let school = null;
    if (dbUser.schoolId) {
        school = await School.findOne({ ID: dbUser.schoolId })
            .select({ _id: 0, ID: 1, NAME_TX: 1, REGION_CD: 1, GROUP_CD: 1, GENDER_COMPOSITION_CD: 1 })
            .lean();
    }

    return {
        status: 200,
        data: {
            id: dbUser._id,
            username: dbUser.username,
            role: dbUser.role,
            schoolId: dbUser.schoolId ?? null,
            school: school
                ? {
                    id: school.ID,
                    name: school.NAME_TX,
                    region: school.REGION_CD,
                    group: school.GROUP_CD,
                    genderComposition: school.GENDER_COMPOSITION_CD,
                }
                : null,
            createdAt: dbUser.createdAt,
        },
    };
}

export async function changePasswordService({ user, currentPassword, newPassword }) {
    if (!user?.id) return { status: 401, error: "Not authenticated." };

    const dbUser = await User.findById(user.id);
    if (!dbUser) return { status: 404, error: "User not found." };

    const ok = await bcrypt.compare(currentPassword ?? "", dbUser.password);
    if (!ok) return { status: 401, error: "Current password is incorrect." };

    const v = validatePassword(newPassword);
    if (!v.ok) return { status: 400, error: v.message };

    dbUser.password = await bcrypt.hash(newPassword, 10);
    await dbUser.save();

    return { status: 200, message: "Password updated." };
}

/** ADMIN: list users */
export async function adminListUsersService() {
    const users = await User.find()
        .select({ password: 0 })
        .sort({ createdAt: -1 })
        .lean();

    return {
        status: 200,
        data: users.map(u => ({
            id: u._id,
            username: u.username,
            role: u.role,
            schoolId: u.schoolId ?? null,
            createdAt: u.createdAt,
        })),
    };
}

/** ADMIN: create a user */
export async function adminCreateUserService({ usernameRaw, password, role, schoolId }) {
    const u = validateUsername(usernameRaw);
    if (!u.ok) return { status: 400, error: u.message };

    const p = validatePassword(password);
    if (!p.ok) return { status: 400, error: p.message };

    const finalRole = role === "ADMIN" ? "ADMIN" : "SCHOOL";

    let finalSchoolId = null;
    if (finalRole === "SCHOOL") {
        const num = Number(schoolId);
        if (!Number.isInteger(num) || num <= 0) return { status: 400, error: "Invalid school selection." };
        const school = await School.findOne({ ID: num, ACTIVE_INT: "Y" }).lean();
        if (!school) return { status: 400, error: "Selected school not found." };
        finalSchoolId = num;
    } else {
        // ADMIN
        if (schoolId) return { status: 400, error: "ADMIN users must not have a schoolId." };
    }

    const existing = await User.findOne({ username: u.username }).lean();
    if (existing) return { status: 409, error: "Username already taken." };

    const hashed = await bcrypt.hash(password, 10);

    const created = await User.create({
        username: u.username,
        password: hashed,
        role: finalRole,
        schoolId: finalSchoolId,
    });

    return { status: 201, message: "User created", id: created._id };
}