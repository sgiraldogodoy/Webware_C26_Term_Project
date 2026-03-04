import { useEffect, useState } from "react";
import Page from "../components/ui/Page";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { useNavigate } from "react-router-dom";
import EmployeeRadarChart from "../components/charts/CompareRadarChart.jsx";

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

        fetch("/api/compare-dashboard/years", {
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

        fetch(`/api/schools/${user.schoolId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setSchoolProfile(data))
            .catch(() => setError("Failed to load school profile."));
    }, [user]);

    if (!user) return <Page>Loading user...</Page>;
    if (!yearId) return <Page>Loading years...</Page>;
    if (!compareData) return <Page>Loading compare dashboard...</Page>;

    function CompareSection({ title, labels, yourValues, peerValues }) {
        return (
            <section className="mb-14">

                <h2 className="text-xl font-semibold mb-6">
                    {title}
                </h2>

                <Card>
                    <CardContent className="py-6">

                        {/* Number Comparison Table */}
                        <div className="overflow-x-auto mb-8">
                            <table className="min-w-full text-sm border">
                                <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left">Metric</th>
                                    <th className="px-4 py-2 text-right">Your School</th>
                                    <th className="px-4 py-2 text-right">Peer Avg</th>
                                </tr>
                                </thead>
                                <tbody>
                                {labels.map((label, index) => (
                                    <tr key={label} className="border-t">
                                        <td className="px-4 py-2">{label}</td>
                                        <td className="px-4 py-2 text-right font-semibold">
                                            {Number(yourValues[index] || 0).toFixed(1)}
                                        </td>
                                        <td className="px-4 py-2 text-right text-gray-600">
                                            {Number(peerValues[index] || 0).toFixed(1)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Radar Chart */}
                        <div className="h-96">
                            <EmployeeRadarChart
                                labels={labels}
                                yourValues={yourValues}
                                peerValues={peerValues}
                            />
                        </div>

                    </CardContent>
                </Card>

            </section>
        );
    }


    const your = compareData?.your || {};
    const peer = compareData?.peer || {};
    return (
        <Page>

            {/* Back button */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="text-blue-600 hover:underline"
                >
                    ← Back to Dashboard
                </button>
            </div>

            {/* Filters */}
            <Card className="mb-10">
                <CardContent className="py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                        {/* School Info */}
                        <div>
                            <h2 className="text-lg font-semibold">
                                {schoolProfile?.NAME_TX || "Your School"}
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Compare your school against selected peer group
                            </p>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-6">

                            {/* Cluster Filter */}
                            <div className="flex flex-col">
                                <label className="text-sm text-gray-500 mb-1">
                                    Compare By
                                </label>
                                <select
                                    value={cluster}
                                    onChange={(e) => setCluster(e.target.value)}
                                    className="border px-4 py-2 rounded-md shadow-sm"
                                >
                                    <option value="region">Region</option>
                                    <option value="group">Group</option>
                                    <option value="gender">Gender</option>
                                    <option value="all">All Schools</option>
                                </select>
                            </div>

                            {/* Year Filter */}
                            <div className="flex flex-col">
                                <label className="text-sm text-gray-500 mb-1">
                                    Year
                                </label>
                                <select
                                    value={yearId}
                                    onChange={(e) => setYearId(e.target.value)}
                                    className="border px-4 py-2 rounded-md shadow-sm"
                                >
                                    {years.map((y) => (
                                        <option key={y} value={String(y)}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>

                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Radar chart */}
            {/* Admin Support */}
            <CompareSection
                title="Admin Support"

                labels={[
                    "Exempt FTE",
                    "Non-Exempt FTE",
                    "Total Admin FTE",
                ]}

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

            {/* Personnel */}
            <CompareSection
                title="Personnel"

                labels={[
                    "Total Employees",
                    "FT Employees",
                    "FTE Only",
                ]}

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

            {/* Enrollment */}
            <CompareSection
                title="Enrollment"

                labels={[
                    "Students Added",
                    "Graduated",
                    "Not Returning",
                ]}

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
        </Page>
    );
}