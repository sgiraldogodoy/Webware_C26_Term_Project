export function validateUsername(usernameRaw) {
    const username = (usernameRaw ?? "").trim().toLowerCase();

    // 3-20 chars, starts with letter, only letters/numbers/._, no consecutive ._
    const ok =
        /^[a-z][a-z0-9._]{2,19}$/.test(username) &&
        !username.includes("..") &&
        !username.includes("__") &&
        !username.includes("._") &&
        !username.includes("_.") &&
        !username.endsWith(".") &&
        !username.endsWith("_");

    return { ok, username, message: ok ? "" : "Username must be 3–20 chars, start with a letter, and use only letters, numbers, . or _ (no consecutive or trailing ./_)." };
}

export function validatePassword(password) {
    if (typeof password !== "string") {
        return { ok: false, message: "Password is required." };
    }
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

    // only allow reasonable characters (optional but matches your “good characters” ask)
    const allowedCharsOnly = /^[A-Za-z0-9!@#$%^&*()_\-+\=[\]{}|;:'",.<>/?]+$/.test(password);

    if (!allowedCharsOnly) {
        return { ok: false, message: "Password contains unsupported characters." };
    }
    if (!(hasLower && hasUpper && hasDigit && hasSpecial)) {
        return { ok: false, message: "Password must include uppercase, lowercase, a number, and a special character." };
    }

    return { ok: true, message: "" };
}