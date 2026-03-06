import { useEffect, useState } from "react";
import Page from "../components/ui/Page";
import { Card, CardContent } from "../components/ui/Card";
import { useNavigate } from "react-router-dom";
import EmployeeRadarChart from "../components/charts/CompareRadarChart.jsx";
import Navbar from "../components/Navigation/Navbar.jsx";
import Dropdown from "../components/ui/Dropdown.jsx";

const TEAL = "rgb(0,139,139)";
const NAVY = "rgb(3,68,122)";

const CLUSTER_OPTIONS = [
    { value: "region", label: "Region" },
    { value: "group", label: "Group" },
    { value: "gender", label: "Gender" },
    { value: "all", label: "All Schools" },
];

function MetricRow({ label, yourValue, peerValue }) {
    const your = Number(yourValue || 0);
    const peer = Number(peerValue || 0);
    const diff = your - peer;
    const up = diff >= 0;

    return (
        <tr className="border-t">
            <td className="px-4 py-2 text-sm text-slate-700">{label}</td>
            <td className="px-4 py-2 text-right text-sm font-semibold text-slate-900">
                {your.toFixed(1)}
            </td>
            <td className="px-4 py-2 text-right text-sm text-slate-500">
                {peer.toFixed(1)}
            </td>
            <td className="px-4 py-2 text-right text-sm font-semibold" style={{ color: up ? TEAL : "#e53e3e" }}>
                {up ? "▲" : "▼"} {Math.abs(diff).toFixed(1)}
            </td>
        </tr>
    );
}

function CompareSection({ title, labels, yourValues, peerValues }) {
    return (
        <div style={{
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(3,68,122,0.06)",
            overflow: "hidden",
            marginBottom: 20
        }}>
            {/* Section header */}
            <div style={{
                padding: "14px 22px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex", alignItems: "center", gap: 10
            }}>
                <div style={{ width: 4, height: 18, borderRadius: 2, background: TEAL }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{title}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                {/* Table */}
                <div style={{ padding: "16px 22px", borderRight: "1px solid #f1f5f9" }}>
                    <table className="w-full">
                        <thead>
                        <tr>
                            <th className="pb-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Metric</th>
                            <th className="pb-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">You</th>
                            <th className="pb-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">Peer Avg</th>
                            <th className="pb-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">Diff</th>
                        </tr>
                        </thead>
                        <tbody>
                        {labels.map((label, i) => (
                            <MetricRow
                                key={label}
                                label={label}
                                yourValue={yourValues[i]}
                                peerValue={peerValues[i]}
                            />
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Radar chart */}
                <div style={{ padding: "16px 22px", height: 280 }}>
                    <EmployeeRadarChart
                        labels={labels}
                        yourValues={yourValues}
                        peerValues={peerValues}
                    />
                </div>
            </div>
        </div>
    );
}

export default function CompareDashboard() {
    const [user, setUser] = useState(null);
    const [compareData, setCompareData] = useState(null);
    const [cluster, setCluster] = useState("region");
    const [yearId, setYearId] = useState(null);
    const [years, setYears] = useState([]);
    const [schoolProfile, setSchoolProfile] = useState(null);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/"); return; }

        fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(data => setUser(data))
            .catch(() => { localStorage.removeItem("token"); navigate("/"); });
    }, [navigate]);

    useEffect(() => {
        if (!user) return;
        const token = localStorage.getItem("token");

        fetch("/api/compare-dashboard/years", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => { setYears(data); if (data.length > 0) setYearId(data[0]); })
            .catch(() => setError("Failed to load years."));
    }, [user]);

    useEffect(() => {
        if (!user || !yearId) return;
        const token = localStorage.getItem("token");

        fetch(`/api/compare-dashboard?yearId=${yearId}&cluster=${cluster}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setCompareData(data))
            .catch(() => setError("Failed to load compare data."));
    }, [user, yearId, cluster]);

    useEffect(() => {
        if (!user) return;
        const token = localStorage.getItem("token");

        fetch(`/api/schools/${user.schoolId}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => setSchoolProfile(data))
            .catch(() => setError("Failed to load school profile."));
    }, [user]);

    if (!user) return <Page>Loading user...</Page>;
    if (!yearId) return <Page>Loading years...</Page>;
    if (!compareData) return <Page>Loading compare dashboard...</Page>;

    const yearOptions = years.map(y => ({ value: y, label: `Year ${y}` }));
    const your = compareData?.your || {};
    const peer = compareData?.peer || {};

    return (
        <div>
            <Navbar role={user.role} />
            <Page centered={false}>
                <div className="w-full max-w-6xl mx-auto px-6 pt-4 pb-10">

                    {/* Header + Filters */}
                    <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                        <div>
                            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                                Benchmarking Compare
                            </h1>
                            <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>
                                {schoolProfile?.NAME_TX || "Your School"} · Comparing by {cluster}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4 items-center">
                            <button
                                onClick={() => navigate("/dashboard")}
                                style={{ fontSize: 13, color: NAVY, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
                            >
                                ← Back to Dashboard
                            </button>
                            <Dropdown
                                label="Compare By"
                                value={cluster}
                                options={CLUSTER_OPTIONS}
                                onChange={(val) => setCluster(val)}
                            />
                            <Dropdown
                                label="Year"
                                value={yearId}
                                options={yearOptions}
                                onChange={(val) => setYearId(val)}
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                    {/* Compare Sections */}
                    <CompareSection
                        title="Admin Support"
                        labels={["Exempt FTE", "Non-Exempt FTE", "Total Admin FTE"]}
                        yourValues={[your.adminSupport?.exemptFte, your.adminSupport?.nonExemptFte, your.adminSupport?.totalAdminSupportFte]}
                        peerValues={[peer.adminSupport?.avgExemptFte, peer.adminSupport?.avgNonExemptFte, peer.adminSupport?.avgAdminSupportFte]}
                    />

                    <CompareSection
                        title="Personnel"
                        labels={["Total Employees", "FT Employees", "FTE Only"]}
                        yourValues={[your.personnel?.totalEmployees, your.personnel?.ftEmployees, your.personnel?.fteOnly]}
                        peerValues={[peer.personnel?.avgTotalEmployees, peer.personnel?.avgFTEmployees, peer.personnel?.avgFTEOnly]}
                    />

                    <CompareSection
                        title="Enrollment"
                        labels={["Students Added", "Graduated", "Not Returning"]}
                        yourValues={[your.enrollment?.studentsAdded, your.enrollment?.studentsGraduated, your.enrollment?.studentsNotReturn]}
                        peerValues={[peer.enrollment?.avgStudentsAdded, peer.enrollment?.avgStudentsGraduated, peer.enrollment?.avgStudentsNotReturn]}
                    />

                </div>
            </Page>
        </div>
    );
}