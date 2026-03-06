import {
    getFormService,
    saveDraftService,
    submitService,
    getYearsService,
    getFormOptionsService,
} from "../services/FormService.js";

function respond(res, result) {
    const { status, ...payload } = result;
    if (payload.error) return res.status(status).json({ error: payload.error, validation: payload.validation });
    return res.status(status).json(payload);
}

export async function getFormOptionsController(req, res) {
    try {
        const result = await getFormOptionsService({ user: req.user });
        return respond(res, result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Server error" });
    }
}

export async function getFormController(req, res) {
    try {
        const yearId = Number(req.query.yearId);
        const result = await getFormService({ user: req.user, yearId });
        return respond(res, result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Server error" });
    }
}

export async function getYearsController(req, res) {
    try {
        const result = await getYearsService({ user: req.user });
        return respond(res, result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Server error" });
    }
}

export async function saveDraftController(req, res) {
    try {
        const result = await saveDraftService({ user: req.user, body: req.body });
        return respond(res, result);
    } catch (e) {
        console.error("saveDraftController error:", e);
        console.error("validation details:", JSON.stringify(e?.errInfo?.details, null, 2));
        return res.status(500).json({ error: e.message || "Server error" });
    }
}

export async function submitController(req, res) {
    try {
        const result = await submitService({ user: req.user, body: req.body });
        return respond(res, result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Server error" });
    }
}