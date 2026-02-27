import {registerService, loginService} from "../services/LoginService.js";

function respondData(res, result) {
    if (result.error) {
        return res.status(result.status).json({ error: result.error });
    }
    return res.status(result.status).json({ message: result.message, id: result.id });
}
export async function registerController(req, res) {
    try {
        const {username: usernameRaw, password, schoolId} = req.body;
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
        const result = await loginService({usernameRaw, password});

        return respondData(res, result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
}