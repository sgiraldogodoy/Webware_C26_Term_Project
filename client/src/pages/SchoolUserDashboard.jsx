import { useEffect, useState } from "react";
import Page from "../components/ui/Page";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import Alert from "../components/ui/Alert";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navigation/Navbar.jsx"

export default function SchoolDashboard() {
    const [user, setUser] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [category, setCategory] = useState("Enrollment");
    const [yearId, setYearId] = useState(null);
    const [years, setYears] = useState([]);
    const [error, setError] = useState("");

    const navigate = useNavigate();

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

    return (
        <>
            <Navbar/>
            <Page>
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="text-blue-600 hover:underline"
                    >
                        ← Dashboard
                    </button>
                </div>

                <div className="flex gap-4 mb-6">
                    <Select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                    >
                        <option>Enrollment</option>
                        <option>Personnel</option>
                        <option>Admin support</option>
                    </Select>

                    <Select
                        value={yearId}
                        onChange={e => setYearId(Number(e.target.value))}
                    >
                        {years.map(y => (
                            <option key={y} value={y}>
                                Year {y}
                            </option>
                        ))}
                    </Select>
                </div>

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
            </Page>
        </>
    );
}
