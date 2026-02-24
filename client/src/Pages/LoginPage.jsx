import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // If already logged in, go to dashboard
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) navigate("/dashboard");
    }, [navigate]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            localStorage.setItem("token", data.token);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2>School Benchmarking Login</h2>

                {error && <p style={styles.error}>{error}</p>}

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={styles.input}
                    autoComplete="username"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                    autoComplete="current-password"
                />

                <button type="submit" style={styles.button}>
                    Login
                </button>

                <div style={styles.dividerRow}>
                    <div style={styles.dividerLine} />
                    <span style={styles.dividerText}>or</span>
                    <div style={styles.dividerLine} />
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/register")}
                    style={styles.secondaryButton}
                >
                    Create account
                </button>
            </form>
        </div>
    );
}

const styles = {
    container: {
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f6f8",
    },
    form: {
        background: "white",
        padding: "40px",
        borderRadius: "8px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
        width: "320px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
    },
    input: {
        padding: "10px",
        fontSize: "16px",
    },
    button: {
        padding: "10px",
        background: "#0066cc",
        color: "white",
        border: "none",
        cursor: "pointer",
        borderRadius: "6px",
    },
    secondaryButton: {
        padding: "10px",
        background: "#ffffff",
        color: "#0066cc",
        border: "1px solid #0066cc",
        cursor: "pointer",
        borderRadius: "6px",
    },
    dividerRow: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginTop: "4px",
    },
    dividerLine: {
        height: "1px",
        flex: 1,
        background: "#ddd",
    },
    dividerText: {
        fontSize: "12px",
        color: "#777",
    },
    error: {
        color: "red",
        margin: 0,
    },
};