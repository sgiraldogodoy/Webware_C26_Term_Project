import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function validateUsernameClient(raw) {
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
            : "3–20 chars, start with a letter, letters/numbers/._ only, no consecutive or trailing ./_"
    };
}

function validatePasswordClient(pw) {
    if (!pw) return { ok: false, message: "Password is required." };
    if (pw.length < 8 || pw.length > 64) return { ok: false, message: "Password must be 8–64 characters." };
    if (/\s/.test(pw)) return { ok: false, message: "No spaces allowed." };

    const hasLower = /[a-z]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasDigit = /[0-9]/.test(pw);
    const hasSpecial = /[!@#$%^&*()_\-+\=[\]{}|;:'",.<>/?]/.test(pw);
    const allowedCharsOnly = /^[A-Za-z0-9!@#$%^&*()_\-+\=[\]{}|;:'",.<>/?]+$/.test(pw);

    if (!allowedCharsOnly) return { ok: false, message: "Password contains unsupported characters." };
    if (!(hasLower && hasUpper && hasDigit && hasSpecial)) {
        return { ok: false, message: "Must include uppercase, lowercase, number, and special character." };
    }
    return { ok: true, message: "" };
}

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("SCHOOL");
    const [schoolId, setSchoolId] = useState(""); // for now you can paste an ObjectId
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();

    const usernameCheck = useMemo(() => validateUsernameClient(username), [username]);
    const passwordCheck = useMemo(() => validatePasswordClient(password), [password]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!usernameCheck.ok) return setError(usernameCheck.message);
        if (!passwordCheck.ok) return setError(passwordCheck.message);
        if (role === "SCHOOL" && !schoolId.trim()) return setError("schoolId is required for SCHOOL users.");

        setSubmitting(true);
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: usernameCheck.username,
                    password,
                    role,
                    schoolId: role === "SCHOOL" ? schoolId.trim() : null
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Registration failed");
            }

            setSuccess("Account created! You can log in now.");
            setTimeout(() => navigate("/"), 800);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2>Create Account</h2>

                {error && <div style={styles.error}>{error}</div>}
                {success && <div style={styles.success}>{success}</div>}

                <label style={styles.label}>Username</label>
                <input
                    style={styles.input}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. school_user1"
                    autoComplete="username"
                />
                <div style={styles.hint}>
                    {username.length > 0 && (usernameCheck.ok ? "✓ Looks good" : usernameCheck.message)}
                </div>

                <label style={styles.label}>Password</label>
                <input
                    style={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="8–64 chars, mixed types"
                    autoComplete="new-password"
                />
                <div style={styles.hint}>
                    {password.length > 0 && (passwordCheck.ok ? "✓ Strong password" : passwordCheck.message)}
                </div>

                <label style={styles.label}>Role</label>
                <select style={styles.input} value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="SCHOOL">School User</option>
                    <option value="ADMIN">Osprey Admin</option>
                </select>

                {role === "SCHOOL" && (
                    <>
                        <label style={styles.label}>School ID</label>
                        <input
                            style={styles.input}
                            value={schoolId}
                            onChange={(e) => setSchoolId(e.target.value)}
                            placeholder="Paste the school ObjectId for now"
                        />
                        <div style={styles.hint}>
                            Later we’ll replace this with a dropdown of schools.
                        </div>
                    </>
                )}

                <button disabled={submitting} style={styles.button}>
                    {submitting ? "Creating..." : "Register"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/")}
                    style={{ ...styles.button, background: "#777" }}
                >
                    Back to Login
                </button>
            </form>
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f4f6f8",
        padding: 16
    },
    form: {
        width: 360,
        background: "white",
        borderRadius: 10,
        padding: 24,
        boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 10
    },
    label: { fontSize: 14, fontWeight: 600 },
    input: { padding: 10, fontSize: 16 },
    hint: { fontSize: 12, color: "#555", minHeight: 16 },
    button: {
        padding: 10,
        fontSize: 16,
        border: "none",
        borderRadius: 6,
        background: "#0066cc",
        color: "white",
        cursor: "pointer",
        marginTop: 6
    },
    error: { background: "#ffe5e5", padding: 10, borderRadius: 6, color: "#a40000" },
    success: { background: "#e6ffea", padding: 10, borderRadius: 6, color: "#0a6b1c" }
};