import { useEffect, useState } from "react";
import Page from "../components/ui/Page";
import Navbar from "../components/Navigation/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import Alert from "../components/ui/Alert";
import { apiFetch } from "../lib/api";

export default function ProfilePage() {
    const [data, setData] = useState(null);
    const [err, setErr] = useState("");

    useEffect(() => {
        apiFetch("/api/users/me")
            .then((j) => setData(j.data))
            .catch((e) => setErr(e.message));
    }, []);

    return (
        <Page className="items-start justify-center">
            <div className="w-full max-w-4xl px-6 py-10">
                {data && <Navbar role={data.role}></Navbar>}
                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            {err && <Alert variant="error">{err}</Alert>}
                            {!data ? (
                                <div>Loading...</div>
                            ) : (
                                <>
                                    <div><b>Username:</b> {data.username}</div>
                                    <div><b>Role:</b> {data.role}</div>
                                    <div><b>School ID:</b> {data.schoolId ?? "N/A"}</div>
                                    <div><b>School Name:</b> {data.school?.name ?? "N/A"}</div>
                                    <div><b>Region:</b> {data.school?.region ?? "N/A"}</div>
                                    <div><b>Group:</b> {data.school?.group ?? "N/A"}</div>
                                    <div><b>Gender composition:</b> {data.school?.genderComposition ?? "N/A"}</div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Page>
    );
}