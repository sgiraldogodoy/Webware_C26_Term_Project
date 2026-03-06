import {
    getMeService,
    changePasswordService,
    adminListUsersService,
    adminCreateUserService,
} from "../services/UserService.js";

function respond(res, result) {
    const { status, ...payload } = result;
    if (payload.error) return res.status(status).json({ error: payload.error });
    return res.status(status).json(payload);
}

export async function getMeController(req, res) {
    try {
        return respond(res, await getMeService({ user: req.user }));
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Server error" });
    }
}

export async function changePasswordController(req, res) {
    try {
        const { currentPassword, newPassword } = req.body;
        return respond(res, await changePasswordService({ user: req.user, currentPassword, newPassword }));
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Server error" });
    }
}

export async function adminListUsersController(req, res) {
    try {
        return respond(res, await adminListUsersService());
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Server error" });
    }
}

export async function adminCreateUserController(req, res) {
    try {
        const { username, password, role, schoolId } = req.body;
        return respond(res, await adminCreateUserService({ usernameRaw: username, password, role, schoolId }));
    } catch (e) {
        // unique index race condition
        if (e?.code === 11000) return res.status(409).json({ error: "Username already taken." });
        console.error(e);
        return res.status(500).json({ error: "Server error" });
    }
}