import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Page from "../components/ui/Page";
import Dropdown from "../components/ui/Dropdown";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";


// import components
import EmployeeBarChart from "../components/charts/EmployeeBarChart.jsx";
import Select from "../components/ui/Select.jsx";
import Navbar from "../components/Navigation/Navbar.jsx";

const CATEGORY_OPTIONS = [
    { value: "Enrollment", label: "Enrollment" },
    { value: "Personnel", label: "Personnel" },
    { value: "Admin support", label: "Admin support" },
];

export default function DashboardPage() {
    const [user, setUser] = useState(null);

    // filters (year, category, peer group, compare mode)
    const [dashboardData, setDashboardData] = useState(null);
    const [category, setCategory] = useState("Enrollment");
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
                console.log("years API returned:", data);
                setYears(Array.isArray(data) ? data : []);
                if (Array.isArray(data) && data.length > 0) setYearId(Number(data[0].ID));
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

    const yearOptions = years.map(y => ({ value: String(y.ID), label: `Year ${y.SCHOOL_YEAR}` }));
/*

    if (user.role === "SCHOOL") {
        navigate("/dashboard");
        return;
    }

    if (user.role === "ADMIN") {
        //navigate to admin dashboard
    }
*/

    return (
        <Page className="items-start justify-center">
            <div className="w-full max-w-6xl px-6 py-10">
                <Navbar role={user.role}></Navbar>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">
                            Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            Role: {user.role} · School: {user.schoolId || "Admin"}
                        </p>
                    </div>

                    {/*<Button
                        variant="outline"
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/");
                        }}
                    >
                        Log Out
                    </Button>*/}
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
                        value={String(yearId)}
                        options={yearOptions}
                        onChange={(newValue) => setYearId(Number(newValue))}
                    />
                </div>

                {/* KPI Cards */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dashboardData.kpis.map((kpi, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <CardTitle>{kpi.label}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                                    {kpi.value}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts */}
                <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <Card className="p-4">
                        <EmployeeBarChart kpis={dashboardData?.kpis} />
                    </Card>

                    <Card className="p-4">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">
                            Line Chart
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-300">
                            Replace this with Chart.js line chart using dashboardData.charts.line
                        </p>
                    </Card>

                </div>
            </div>
        </Page>
    );
}