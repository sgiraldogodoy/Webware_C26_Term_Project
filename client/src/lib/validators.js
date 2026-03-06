export function validateUsernameClient(raw) {
    const username = (raw ?? "").trim().toLowerCase();
    const ok =
        /^[a-z][a-z0-9._]{2,19}$/.test(username) &&
        !username.includes("..") &&
        !username.includes("__") &&
        !username.includes("._") &&
        !username.includes("_.") &&
        !username.endsWith(".") &&
        !username.endsWith("_");

    return {
        ok,
        username,
        message: ok
            ? ""
            : "Username must be 3–20 characters, start with a letter, and use only letters, numbers, periods, or underscores. It cannot end with or repeat periods/underscores."
    };
}

export function validatePasswordClient(password, confirmPassword = undefined) {
    if (!password) return { ok: false, message: "Password is required." };
    if (password.length < 8 || password.length > 64) {
        return { ok: false, message: "Password must be 8–64 characters long." };
    }
    if (/\s/.test(password)) {
        return { ok: false, message: "Password cannot contain spaces." };
    }

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_\-+\=[\]{}|;:'",.<>/?]/.test(password);
    const allowedCharsOnly = /^[A-Za-z0-9!@#$%^&*()_\-+\=[\]{}|;:'",.<>/?]+$/.test(password);

    if (!allowedCharsOnly) {
        return { ok: false, message: "Password contains unsupported characters." };
    }
    if (!(hasLower && hasUpper && hasDigit && hasSpecial)) {
        return {
            ok: false,
            message: "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character."
        };
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
        return { ok: false, message: "Passwords do not match." };
    }

    return { ok: true, message: "" };
}