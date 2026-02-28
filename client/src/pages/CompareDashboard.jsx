import { useEffect, useState } from "react";
import Page from "../components/ui/Page";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { useNavigate } from "react-router-dom";

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

    return (
        <Page>
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="text-blue-600 hover:underline"
                >
                    ← Back to Dashboard
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <label>
                    Select compare by your current category
                </label>
                <select
                    value={cluster}
                    onChange={(e) => setCluster(e.target.value)}
                    className="border px-3 py-2 rounded"
                >
                    <option value="region">Region</option>
                    <option value="group">Group</option>
                    <option value="gender">Gender</option>
                    <option value="all">All Schools</option>
                </select>

                <select
                    value={yearId}
                    onChange={(e) => setYearId(e.target.value)}
                    className="border px-3 py-2 rounded"
                >
                    {years.map((y) => (
                        <option key={y} value={String(y)}>
                            Year {y}
                        </option>
                    ))}
                </select>

                {schoolProfile && (
                    <p>
                        Comparing with schools in the same{" "}
                        <strong>{cluster.toUpperCase()}</strong>
                        {cluster !== "all" && (
                            <>
                                {" "}
                                (
                                {cluster === "region" && schoolProfile.region}
                                {cluster === "group" && schoolProfile.group}
                                {cluster === "gender" && schoolProfile.gender}
                                )
                            </>
                        )}
                    </p>
                )}
            </div>

            <h2 className="text-lg font-semibold mb-2">Admin Support (Peer Avg)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Avg Exempt FTE</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {compareData.adminSupport?.avgExemptFte?.toFixed?.(2) ?? "-"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Avg Non-Exempt FTE</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {compareData.adminSupport?.avgNonExemptFte?.toFixed?.(2) ?? "-"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Avg Total Admin FTE</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {compareData.adminSupport?.avgAdminSupportFte?.toFixed?.(2) ?? "-"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-lg font-semibold mb-2">Personnel (Peer Avg)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Avg Total Employees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {compareData.personnel?.avgTotalEmployees?.toFixed?.(2) ?? "-"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Avg FT Employees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {compareData.personnel?.avgFTEmployees?.toFixed?.(2) ?? "-"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Avg FTE Only</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {compareData.personnel?.avgFTEOnly?.toFixed?.(2) ?? "-"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-lg font-semibold mb-2">Enrollment (Peer Avg)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Avg Students Added</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {compareData.enrollment?.avgStudentsAdded?.toFixed?.(2) ?? "-"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Avg Graduated</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {compareData.enrollment?.avgStudentsGraduated?.toFixed?.(2) ?? "-"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Avg Not Returning</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {compareData.enrollment?.avgStudentsNotReturn?.toFixed?.(2) ?? "-"}
                        </p>
                    </CardContent>
                </Card>

            </div>
        </Page>
    );
}