import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Page from "../components/ui/Page";
import Dropdown from "../components/ui/Dropdown";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";


// import components
import EmployeeBarChart from "../components/charts/EmployeeBarChart.jsx";
import EmployeeBarChartData from "../components/charts/EmployeeBarChartData.jsx";
import Navbar from "../components/Navigation/Navbar.jsx";
import TrendLineChart from "../components/charts/TrendLineChart.jsx";
import DoughnutChart from "../components/charts/DonutChart.jsx";
import Mockup from "../components/ui/dashboardmockup.jsx";

const CATEGORY_OPTIONS = [
    { value: "Enrollment", label: "Enrollment" },
    { value: "Personnel", label: "Personnel" },
    { value: "Admin support", label: "Admin support" },
];

const TEAL = "rgb(0,139,139)";

function KpiCard({ label, value, trend, trendPct}) {
    const up = trend >= 0;
    return (
        <div style={{
            background: "#fff",
            borderRadius: 14,
            padding: "18px 22px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(3,68,122,0.06)",
            borderLeft: `4px solid ${TEAL}`,
            display: "flex", flexDirection: "column", gap: 4
        }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
            <span style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>{typeof value === "number" ? value.toLocaleString() : value}</span>
            <span style={{ fontSize: 12, color: up ? TEAL : "#e53e3e", fontWeight: 600 }}>
                {up ? "▲" : "▼"} {trendPct} vs last year
            </span>
        </div>
    );
}

export default function SchoolDashboard() {
    const [user, setUser] = useState(null);

    // filters (year, category, peer group, compare mode)
    const [dashboardData, setDashboardData] = useState(null);
    const [category, setCategory] = useState("Personnel");
    const [yearId, setYearId] = useState(null);
    const [years, setYears] = useState([]);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("token"), []);

    // make sure user logged in
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/");
            return;
        }

        // TODO userfole

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
    }, [navigate]);

    useEffect(() => {
        if (!user) return;

        const token = localStorage.getItem("token");

        fetch("/api/dashboard/years", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setYears(data);
                if (data.length > 0) {
                    setYearId(data[0]);
                }
            })
            .catch(() => setError("Failed to load years."));
    }, [user]);

    useEffect(() => {
        if (!user || !yearId) return;

        const token = localStorage.getItem("token");

        fetch(`/api/dashboard?yearId=${yearId}&category=${category}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setDashboardData(data))
            .catch(() => setError("Failed to load dashboard data."));
    }, [user, category, yearId]);

    if (!user) return <Page>Loading user...</Page>;
    if (!yearId) return <Page>Loading years...</Page>;
    if (!dashboardData) return <Page>Loading dashboard...</Page>;

    const yearOptions = years.map(y => ({ value: y, label: `Year ${y}` }));
/*

    if (user.role === "SCHOOL") {
        navigate("/dashboard");
        return;
    }

    if (user.role === "ADMIN") {
        //navigate to admin dashboard
    }
*/

    console.log("dashboardData:", dashboardData);
    console.log("BAR CANDIDATES:", {
        chartData: dashboardData?.charts,
        chartDataBar: dashboardData?.charts?.bar,
        chartsBar: dashboardData?.charts?.bar,
    });

    return (
        <div>
            <Navbar role={user.role}></Navbar>
        <Page className="items-start justify-center">
            <div className="w-full max-w-6xl px-6 py-10 pt-4">


                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>School Dashboard</h1>
                        <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>School ID {user.schoolId} · Viewing {category}</p>
                    </div>
                    {/* Filters */}
                    <div className="mt-6 flex flex-wrap gap-4">
                        <Dropdown
                            label="Category"
                            value={category}
                            options={CATEGORY_OPTIONS}
                            onChange={(newValue) => setCategory(newValue)}
                        />

                        <Dropdown
                            label="Year"
                            value={yearId}
                            options={yearOptions}
                            onChange={(newValue) => setYearId(Number(newValue))}
                        />
                    </div>
                </div>


                {/* KPI Cards */}
                {/*<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">*/}
                {/*    {dashboardData.kpis.map((kpi, i) => (*/}
                {/*        <Card key={i}>*/}
                {/*            <CardHeader>*/}
                {/*                <CardTitle>{kpi.label}</CardTitle>*/}
                {/*            </CardHeader>*/}
                {/*            <CardContent>*/}
                {/*                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">*/}
                {/*                    {kpi.value}*/}
                {/*                </p>*/}
                {/*            </CardContent>*/}
                {/*        </Card>*/}
                {/*    ))}*/}
                {/*</div>*/}
                {/* KPI Cards */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dashboardData.kpis.map((kpi, i) => (
                        <KpiCard key={i} label={kpi.label} value={kpi.value} trend={kpi.trend} trendPct={kpi.trendPct} />
                    ))}
                </div>

                {/* Charts */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">

                    <Card className="p-4">
                        <EmployeeBarChartData
                            data={dashboardData?.charts?.bar2}
                            title="Employees by Category"
                            horizontal={true}
                            multiColor={false}
                        />
                    </Card>

                    <Card className="p-4">
                        <TrendLineChart data={dashboardData?.charts?.line} title={`Trend — ${category}`} height={260} />
                    </Card>

                    <Card className="p-4">
                        <EmployeeBarChartData
                            data={dashboardData?.charts?.bar}
                            title="Enrollment Overview"
                            multiColor={true}/>
                    </Card>

                    <Card className="p-4">
                        {dashboardData?.charts?.donut ? (
                            <DoughnutChart
                                data={dashboardData.charts.donut}
                                title="Personnel Composition"
                                height={260}
                            />
                        ) : (
                            <div style={{ opacity: 0.7 }}>No composition chart for this category yet.</div>
                        )}
                    </Card>

                </div>
            </div>
        </Page>
        </div>
    );
}