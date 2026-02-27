import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/");
            return;
        }

        fetch("/api/auth/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(data => setUser(data))
            .catch(() => {
                localStorage.removeItem("token");
                navigate("/");
            });
    }, [navigate]);

    if (!user) return <p>Loading...</p>;

    return (
        <div style={{ padding: "40px" }}>
            <h1>Dashboard</h1>
            <p>Role: {user.role}</p>
            <p>School ID: {user.schoolId || "Admin user"}</p>


            {user.role === "SCHOOL" && (
                <button onClick={() => navigate("/school-dashboard")}>
                    Student Dashboard
                </button>
            )}

<br/>



            <button
                className="btn"
                onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/");
                }}
            > Log Out</button>
        </div>
    );
}