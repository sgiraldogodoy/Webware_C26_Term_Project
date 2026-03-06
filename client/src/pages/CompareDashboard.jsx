import { useEffect, useMemo, useState } from "react";
import Page from "../components/ui/Page";
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

function toPlainNumber(value) {
    if (value == null) return 0;

    if (typeof value === "number") return value;

    if (typeof value === "string") {
        const n = Number(value);
        return Number.isFinite(n) ? n : 0;
    }

    if (typeof value === "object") {
        if ("$numberDecimal" in value) {
            const n = Number(value.$numberDecimal);
            return Number.isFinite(n) ? n : 0;
        }

        if (typeof value.toString === "function") {
            const n = Number(value.toString());
            return Number.isFinite(n) ? n : 0;
        }
    }

    return 0;
}

function MetricRow({ label, trendDirection, yourValue, peerValue }) {
    const your = toPlainNumber(yourValue);
    const peer = toPlainNumber(peerValue);
    const diff = your - peer;
    const up = diff >= 0;
    const color =
        (trendDirection === "up" && up) || (trendDirection === "down" && !up)
            ? TEAL
            : "#e53e3e";

    return (
        <tr className="border-t">
            <td className="px-4 py-2 text-sm text-slate-700">{label}</td>
            <td className="px-4 py-2 text-right text-sm font-semibold text-slate-900">
                {your.toFixed(1)}
            </td>
            <td className="px-4 py-2 text-right text-sm text-slate-500">
                {peer.toFixed(1)}
            </td>
            <td className="px-4 py-2 text-right text-sm font-semibold" style={{ color }}>
                {up ? "▲" : "▼"} {Math.abs(diff).toFixed(1)}
            </td>
        </tr>
    );
}

function CompareSection({ title, labels, trendDirection, yourValues, peerValues }) {
    const normalizedYourValues = yourValues.map(toPlainNumber);
    const normalizedPeerValues = peerValues.map(toPlainNumber);

    return (
        <div
            style={{
                background: "#fff",
                borderRadius: 14,
                boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(3,68,122,0.06)",
                overflow: "hidden",
                marginBottom: 20,
            }}
        >
            <div
                style={{
                    padding: "14px 22px",
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <div style={{ width: 4, height: 18, borderRadius: 2, background: TEAL }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{title}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                <div style={{ padding: "16px 22px", borderRight: "1px solid #f1f5f9" }}>
                    <table className="w-full">
                        <thead>
                        <tr>
                            <th className="pb-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                Metric
                            </th>
                            <th className="pb-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                You
                            </th>
                            <th className="pb-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                Peer Avg
                            </th>
                            <th className="pb-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                Diff
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {labels.map((label, i) => (
                            <MetricRow
                                key={label}
                                label={label}
                                trendDirection={trendDirection[i]}
                                yourValue={normalizedYourValues[i]}
                                peerValue={normalizedPeerValues[i]}
                            />
                        ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ padding: "16px 22px", height: 280 }}>
                    <EmployeeRadarChart
                        labels={labels}
                        yourValues={normalizedYourValues}
                        peerValues={normalizedPeerValues}
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
    const [schools, setSchools] = useState([]);
    const [schoolId, setSchoolId] = useState(null);
    const [schoolProfile, setSchoolProfile] = useState(null);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }

        fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then((data) => setUser(data))
            .catch(() => {
                localStorage.removeItem("token");
                navigate("/");
            });
    }, [navigate]);

    useEffect(() => {
        if (!user) return;
        const token = localStorage.getItem("token");

        fetch("/api/form/years", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (res) => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || "Failed to load years.");
                return data;
            })
            .then((result) => {
                const arr = result.data ?? [];
                setYears(arr);
                if (arr.length > 0) {
                    setYearId(Number(arr[0].ID));
                }
            })
            .catch((e) => setError(e.message));
    }, [user]);

    useEffect(() => {
        if (!user) return;

        if (user.role === "SCHOOL") {
            setSchoolId(user.schoolId);
            return;
        }

        fetch("/api/schools/public")
            .then(async (res) => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || "Failed to load schools.");
                return data;
            })
            .then((data) => {
                console.log("schools API returned:", data);

                const rawSchools = Array.isArray(data)
                    ? data
                    : Array.isArray(data.data)
                        ? data.data
                        : [];

                const normalizedSchools = rawSchools.map((s) => ({
                    id: s.id ?? s.ID ?? s._id,
                    name: s.name ?? s.NAME_TX ?? "Unnamed School",
                }));

                setSchools(normalizedSchools);

                if (normalizedSchools.length > 0 && !schoolId) {
                    setSchoolId(Number(normalizedSchools[0].id));
                }
            })
            .catch((e) => setError(e.message));
    }, [user]);

    useEffect(() => {
        if (!user || !yearId || !schoolId) return;

        const token = localStorage.getItem("token");
        const params = new URLSearchParams({
            yearId: String(yearId),
            cluster,
            schoolId: String(schoolId),
        });

        fetch(`/api/compare-dashboard?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (res) => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || "Failed to load compare data.");
                return data;
            })
            .then((data) => setCompareData(data))
            .catch((e) => setError(e.message));
    }, [user, yearId, cluster, schoolId]);

    useEffect(() => {
        if (!schoolId) return;

        const token = localStorage.getItem("token");

        fetch(`/api/schools/${schoolId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (res) => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || "Failed to load school profile.");
                return data;
            })
            .then((data) => setSchoolProfile(data))
            .catch((e) => setError(e.message));
    }, [schoolId]);

    if (!user) return <Page>Loading user...</Page>;
    if (yearId === null) return <Page>Loading years...</Page>;
    if (user.role === "ADMIN" && schools.length === 0) {
        return <Page>Loading schools...</Page>;
    }
    //if (!compareData) return <Page>Loading compare dashboard...</Page>;

    const schoolOptions = schools.map((s) => ({
        value: String(s.id),
        label: s.name,
    }));

    const yearOptions = years.map((y) => ({
        value: String(y.ID),
        label: `Year ${y.SCHOOL_YEAR}`,
    }));

    const your = compareData?.your || {};
    const peer = compareData?.peer || {};

    return (
        <div>
            <Navbar role={user.role} />
            <Page centered={false}>
                <div className="w-full max-w-6xl mx-auto px-6 pt-4 pb-10">
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
                                style={{
                                    fontSize: 13,
                                    color: NAVY,
                                    fontWeight: 600,
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                ← Back to Dashboard
                            </button>

                            {user.role === "ADMIN" && (
                                <Dropdown
                                    label="School"
                                    value={String(schoolId ?? "")}
                                    options={schoolOptions}
                                    onChange={(newValue) => {
                                        setSchoolId(Number(newValue));
                                        setError("");
                                    }}
                                />
                            )}

                            <Dropdown
                                label="Compare By"
                                value={cluster}
                                options={CLUSTER_OPTIONS}
                                onChange={(val) => setCluster(val)}
                            />

                            <Dropdown
                                label="Year"
                                value={String(yearId)}
                                options={yearOptions}
                                onChange={(newValue) => setYearId(Number(newValue))}
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                    <CompareSection
                        title="Admin Support"
                        labels={["Exempt FTE", "Non-Exempt FTE", "Total Admin FTE"]}
                        trendDirection={["up", "up", "up"]}
                        yourValues={[
                            your.adminSupport?.exemptFte,
                            your.adminSupport?.nonExemptFte,
                            your.adminSupport?.totalAdminSupportFte,
                        ]}
                        peerValues={[
                            peer.adminSupport?.avgExemptFte,
                            peer.adminSupport?.avgNonExemptFte,
                            peer.adminSupport?.avgAdminSupportFte,
                        ]}
                    />

                    <CompareSection
                        title="Personnel"
                        labels={["Total Employees", "FT Employees", "FTE Only"]}
                        trendDirection={["up", "up", "up"]}
                        yourValues={[
                            your.personnel?.totalEmployees,
                            your.personnel?.ftEmployees,
                            your.personnel?.fteOnly,
                        ]}
                        peerValues={[
                            peer.personnel?.avgTotalEmployees,
                            peer.personnel?.avgFTEmployees,
                            peer.personnel?.avgFTEOnly,
                        ]}
                    />

                    <CompareSection
                        title="Enrollment"
                        labels={["Students Added", "Graduated", "Not Returning"]}
                        trendDirection={["up", "up", "down"]}
                        yourValues={[
                            your.enrollment?.studentsAdded,
                            your.enrollment?.studentsGraduated,
                            your.enrollment?.studentsNotReturn,
                        ]}
                        peerValues={[
                            peer.enrollment?.avgStudentsAdded,
                            peer.enrollment?.avgStudentsGraduated,
                            peer.enrollment?.avgStudentsNotReturn,
                        ]}
                    />
                </div>
            </Page>
        </div>
    );
}