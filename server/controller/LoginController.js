import {registerService, loginService, getSchoolsService} from "../services/LoginService.js";
function respondData(res, result) {
    const { status, ...payload } = result;
    if (payload.error) return res.status(status).json({ error: payload.error });
    return res.status(status).json(payload);
}
export async function registerController(req, res) {
    try {
        const {username: usernameRaw, password, schoolId} = req.body;
        if (!usernameRaw || !password) return res.status(400).json({ error: "Missing username or password." });
        const result = await registerService({usernameRaw, password, schoolId});

        return respondData(res, result);
    } catch (err) {
        // Handle unique index race condition
        if (err?.code === 11000) {
            return res.status(409).json({ error: "Username already taken." });
        }
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
}

export async function loginController(req, res) {
    try {
        const {username: usernameRaw, password} = req.body;
        if (!usernameRaw || !password) return res.status(400).json({ error: "Missing username or password." });
        const result = await loginService({usernameRaw, password});

        return respondData(res, result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
}

export async function getSchoolsController(req, res) {
    try {
        const result = await getSchoolsService();
        return respondData(res, result);
    } catch (e) {
        console.error(e);
        res.status(500).json({error: "Failed to load schools."});
    }
}