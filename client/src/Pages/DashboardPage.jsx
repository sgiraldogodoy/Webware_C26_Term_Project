import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
    { id: "overview", label: "Overview" },
    { id: "personnel", label: "Personnel" },
    { id: "adminSupport", label: "Admin Support" },
    { id: "attrition", label: "Enrollment / Attrition" },
];

export default function DashboardPage() {
    const [user, setUser] = useState(null);

    // filters (year, category, peer group, compare mode)
    const [year, setYear] = useState("2024");
    const [category, setCategory] = useState("overview");
    const [peerGroupId, setPeerGroupId] = useState("default");
    const [compareMode, setCompareMode] = useState("avg"); // avg | median | range

    // data for UI
    const [peerGroups, setPeerGroups] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [loadingDash, setLoadingDash] = useState(false);
    const [dashError, setDashError] = useState("");

    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("token"), []);

    // make sure user logged in
    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }

        // fetch user info
        fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
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
    }, [navigate, token]);

    // fetch peer groups (once)
    useEffect(() => {
        if (!token) return;

        fetch("/api/peer-groups", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => (res.ok ? res.json() : []))
            .then(data => {
                // data should be like [{id, name}]
                setPeerGroups(data || []);
                // default peer group?
                if ((data || []).length > 0 && peerGroupId === "default") {
                    setPeerGroupId(data[0].id);
                }
            })
            .catch(() => {
                setPeerGroups([]);
            });
    }, [token]);

    // fetch dashboard data whenever filters change
    useEffect(() => {
        if (!token || !user) return;

        setLoadingDash(true);
        setDashError("");
        setDashboardData(null);

        const params = new URLSearchParams({
            year,
            category,
            peerGroupId: peerGroupId === "default" ? "" : peerGroupId,
            compare: compareMode
        });

        fetch(`/api/dashboard?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to load dashboard data");
                return res.json();
            })
            .then(data => setDashboardData(data))
            .catch(err => setDashError(err.message || "Dashboard error"))
            .finally(() => setLoadingDash(false));
    }, [token, user, year, category, peerGroupId, compareMode]);

    if (!user) return <p>Loading...</p>;

    return (
        <div style={{ padding: "32px", maxWidth: "1100px", margin: "0 auto" }}>
            {/* Header row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                    <h1 style={{ margin: 0 }}>Dashboard</h1>
                    <div style={{ opacity: 0.8 }}>
                        Role: {user.role} · School: {user.schoolId || "Admin"}
                    </div>
                </div>

                <button
                    className="btn"
                    onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/");
                    }}
                >
                    Log Out
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
                <label>
                    Year{" "}
                    <select value={year} onChange={e => setYear(e.target.value)}>
                        {/* replace with years from your SCHOOL_YEAR table if you want */}
                        <option value="2022">2022</option>
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                    </select>
                </label>

                <label>
                    Peer Group{" "}
                    <select value={peerGroupId} onChange={e => setPeerGroupId(e.target.value)}>
                        {peerGroups.length === 0 ? (
                            <option value="default">Default Peer Group</option>
                        ) : (
                            peerGroups.map(pg => (
                                <option key={pg.id} value={pg.id}>{pg.name}</option>
                            ))
                        )}
                    </select>
                </label>

                <label>
                    Compare{" "}
                    <select value={compareMode} onChange={e => setCompareMode(e.target.value)}>
                        <option value="avg">Average</option>
                        <option value="median">Median</option>
                        <option value="range">Range</option>
                    </select>
                </label>
            </div>

            {/* Category tabs */}
            <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
                {CATEGORIES.map(c => (
                    <button
                        key={c.id}
                        onClick={() => setCategory(c.id)}
                        className="btn"
                        style={{
                            opacity: category === c.id ? 1 : 0.7,
                            border: category === c.id ? "2px solid #333" : "1px solid #aaa",
                        }}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            {/* Data */}
            <div style={{ marginTop: "24px" }}>
                {loadingDash && <p>Loading dashboard...</p>}
                {dashError && <p style={{ color: "crimson" }}>{dashError}</p>}

                {/* KPI Tiles */}
                {dashboardData?.kpis && (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "12px",
                            marginBottom: "20px"
                        }}
                    >
                        {dashboardData.kpis.map((kpi, idx) => (
                            <div key={idx} style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "12px" }}>
                                <div style={{ fontWeight: 600 }}>{kpi.label}</div>
                                <div style={{ fontSize: "28px", marginTop: "6px" }}>{kpi.yourValue ?? "—"}</div>
                                <div style={{ opacity: 0.8 }}>
                                    Peer: {kpi.peerValue ?? "—"}{" "}
                                    {typeof kpi.delta === "number" ? (
                                        <span>· Δ {kpi.delta >= 0 ? "+" : ""}{kpi.delta}</span>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Charts (placeholders for now) */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "12px", minHeight: "260px" }}>
                        <div style={{ fontWeight: 600, marginBottom: "8px" }}>Bar Chart</div>
                        <div style={{ opacity: 0.75 }}>
                            Replace this with Chart.js bar chart using dashboardData.charts.bar
                        </div>
                    </div>

                    <div style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "12px", minHeight: "260px" }}>
                        <div style={{ fontWeight: 600, marginBottom: "8px" }}>Line Chart</div>
                        <div style={{ opacity: 0.75 }}>
                            Replace this with Chart.js line chart using dashboardData.charts.line
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}