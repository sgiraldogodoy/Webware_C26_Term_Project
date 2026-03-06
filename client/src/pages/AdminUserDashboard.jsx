import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Page from "../components/ui/Page";
import Dropdown from "../components/ui/Dropdown";
import { Card } from "../components/ui/Card";
import Navbar from "../components/Navigation/Navbar.jsx";
import EmployeeBarChartData from "../components/charts/EmployeeBarChartData.jsx";
import TrendLineChart from "../components/charts/TrendLineChart.jsx";
import DoughnutChart from "../components/charts/DonutChart.jsx";

const CATEGORY_OPTIONS = [
    { value: "Enrollment", label: "Enrollment" },
    { value: "Personnel", label: "Personnel" },
    { value: "Admin support", label: "Admin support" },
];

const CHART_TITLES = {
    Enrollment: {
        bar2: "Enrollment by Year Comparison",
        bar: "Enrollment Overview",
        donut: "Student Breakdown",
    },
    Personnel: {
        bar2: "Employees by Category",
        bar: "Enrollment Overview",
        donut: "Workforce Composition",
    },
    "Admin support": {
        bar2: "Staff by Function",
        bar: "Exempt vs Non-Exempt",
        donut: "Admin Composition",
    },
};

const TEAL = "rgb(0,139,139)";

function KpiCard({ label, value, trend, trendPct, trendDirection}) {
    const up = trend >= 0;
    const color = (trendDirection === "up" && up) || (trendDirection === "down" && !up) ? TEAL : "#e53e3e";
    return (
        <div style={{
            background: "#fff",
            borderRadius: 14,
            padding: "18px 22px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(3,68,122,0.06)",
            borderLeft: `4px solid ${color}`,
            display: "flex", flexDirection: "column", gap: 4
        }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
            <span style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>{typeof value === "number" ? value.toLocaleString() : value}</span>
            <span style={{ fontSize: 12, color: color, fontWeight: 600 }}>
                {up ? "▲" : "▼"} {trendPct} vs last year
            </span>
        </div>
    );
}

export default function AdminUserDashboard() {
    const [user, setUser] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [category, setCategory] = useState("Personnel");
    const [yearId, setYearId] = useState(null);
    const [years, setYears] = useState([]);
    const [schools, setSchools] = useState([]);
    const [schoolId, setSchoolId] = useState(null);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    // Auth check
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/"); return; }

        fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(data => setUser(data))
            .catch(() => { localStorage.removeItem("token"); navigate("/"); });
    }, [navigate]);

    // Load schools
    useEffect(() => {
        if (!user) return;
        fetch("/api/schools/public")
            .then(res => res.json())
            .then(data => setSchools(data.data))
            .catch(() => setError("Failed to load schools."));
    }, [user]);


    // Load years when school changes
    useEffect(() => {
        if (!user || !schoolId) return;
        //setYearId(null);
        //setDashboardData(null);

        const token = localStorage.getItem("token");
        fetch(`/api/dashboard/years?schoolId=${schoolId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                console.log("years API returned:", data);
                setYears(Array.isArray(data) ? data : []);
                if (Array.isArray(data) && data.length > 0) setYearId(Number(data[0].ID));
            })
            .catch(() => setError("Failed to load years."));
    }, [user, schoolId]);

    // Load dashboard data
    useEffect(() => {
        if (!user || !schoolId || !yearId) return;

        const token = localStorage.getItem("token");
        fetch(`/api/dashboard?schoolId=${schoolId}&yearId=${yearId}&category=${category}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setDashboardData(data))
            .catch(() => setError("Failed to load dashboard data."));
    }, [user, schoolId, category, yearId]);

    if (!user) return <Page>Loading user...</Page>;

    const schoolOptions = schools.map(s => ({ value: s.id, label: s.name }));
    const yearOptions = years.map(y => ({ value: String(y.ID), label: `Year ${y.SCHOOL_YEAR}` }));
    const selectedSchool = schools.find(s => s.id === schoolId);
    const titles = CHART_TITLES[category] || {};

    return (
        <div>
            <Navbar role={user.role} />
            <Page centered={false} className="items-start justify-center">
                <div className="w-full max-w-6xl mx-auto px-6 pt-4 pb-10">

                    {/* Header + Filters */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Admin Dashboard</h1>
                            <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>
                                {selectedSchool ? `${selectedSchool.name} · Viewing ${category}` : "Select a school to view data"}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Dropdown
                                label="School"
                                value={schoolId ?? ""}
                                options={schoolOptions}
                                onChange={(newValue) => { setSchoolId(Number(newValue)); setError(""); }}
                            />
                            <Dropdown
                                label="Category"
                                value={category}
                                options={CATEGORY_OPTIONS}
                                onChange={(newValue) => setCategory(newValue)}
                            />
                            {schoolId && <Dropdown
                                label="Year"
                                value={String(yearId)}
                                options={yearOptions}
                                onChange={(newValue) => setYearId(Number(newValue))}
                            />}
                        </div>
                    </div>

                    {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}

                    {!schoolId && (
                        <div className="mt-20 text-center text-slate-400 text-sm">
                            Select a school from the dropdown above to view dashboard data.
                        </div>
                    )}

                    {dashboardData && (
                        <>
                            {/* KPI Cards */}
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {dashboardData.kpis.map((kpi, i) => (
                                    <KpiCard key={i} label={kpi.label} value={kpi.value} trend={kpi.trend} trendPct={kpi.trendPct} trendDirection={kpi.trendDirection} />
                                ))}
                            </div>

                            {/* Charts */}
                            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">

                                <Card className="p-4">
                                    {dashboardData?.charts?.bar2 ? (
                                        <EmployeeBarChartData
                                            data={dashboardData.charts.bar2}
                                            title={titles.bar2}
                                            horizontal={true}
                                        />
                                    ) : (
                                        <div style={{ opacity: 0.7 }}>No breakdown data.</div>
                                    )}
                                </Card>

                                <Card className="p-4">
                                    <TrendLineChart
                                        data={dashboardData?.charts?.line}
                                        title={`Trend — ${category}`}
                                        height={260}
                                    />
                                </Card>

                                <Card className="p-4">
                                    {dashboardData?.charts?.bar ? (
                                        <EmployeeBarChartData
                                            data={dashboardData.charts.bar}
                                            title={titles.bar}
                                            multiColor={true}
                                        />
                                    ) : (
                                        <div style={{ opacity: 0.7 }}>No overview data.</div>
                                    )}
                                </Card>

                                <Card className="p-4">
                                    {dashboardData?.charts?.donut ? (
                                        <DoughnutChart
                                            data={dashboardData.charts.donut}
                                            title={titles.donut}
                                            height={260}
                                        />
                                    ) : (
                                        <div style={{ opacity: 0.7 }}>No composition data.</div>
                                    )}
                                </Card>

                            </div>
                        </>
                    )}
                </div>
            </Page>
        </div>
    );
}