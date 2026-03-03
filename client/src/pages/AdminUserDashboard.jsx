import { useEffect, useState } from "react";
import Page from "../components/ui/Page";
import Select from "../components/ui/Select";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navigation/Navbar.jsx"

export default function AdminUserDashboard() {
    const [user, setUser] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [category, setCategory] = useState("Enrollment");
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

    // Load school list once user is confirmed
    useEffect(() => {
        if (!user) return;

        fetch("/api/schools/public")
            .then(res => res.json())
            .then(data => setSchools(data))
            .catch(() => setError("Failed to load schools."));
    }, [user]);

    // Load years whenever schoolId changes; also resets year and dashboard
    useEffect(() => {
        if (!user || !schoolId) return;

        setYearId(null);
        setDashboardData(null);

        const token = localStorage.getItem("token");

        fetch(`/api/dashboard/years?schoolId=${schoolId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setYears(data);
                if (data.length > 0) setYearId(data[0]);
            })
            .catch(() => setError("Failed to load years."));
    }, [user, schoolId]);

    // Load dashboard data whenever school, year, or category changes
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

    return (
        <>
            <Page>
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="text-blue-600 hover:underline"
                    >
                        ← Dashboard
                    </button>
                </div>

                {error && <p className="text-red-600 mb-4">{error}</p>}

                <div className="flex gap-4 mb-6">
                    <Select
                        value={schoolId ?? ""}
                        onChange={e => {
                            setSchoolId(Number(e.target.value));
                            setError("");
                        }}
                    >
                        <option value="" disabled>Select a school</option>
                        {schools.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </Select>

                    <Select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                    >
                        <option>Enrollment</option>
                        <option>Personnel</option>
                        <option>Admin support</option>
                    </Select>

                    <Select
                        value={yearId ?? ""}
                        onChange={e => setYearId(Number(e.target.value))}
                        disabled={!schoolId}
                    >
                        {years.map(y => (
                            <option key={y} value={y}>Year {y}</option>
                        ))}
                    </Select>
                </div>

                {dashboardData && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {dashboardData.kpis.map((kpi, i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <CardTitle>{kpi.label}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{kpi.value}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </Page>
        </>
    );
}