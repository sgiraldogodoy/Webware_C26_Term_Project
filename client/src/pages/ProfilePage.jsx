import { useEffect, useState } from "react";
import Page from "../components/ui/Page";
import Navbar from "../components/Navigation/Navbar";
import Alert from "../components/ui/Alert";
import { apiFetch } from "../lib/api";

const TEAL = "rgb(0,139,139)";
const NAVY = "rgb(3,68,122)";

function InfoRow({ label, value }) {
    return (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 0",
            borderBottom: "1px solid #f1f5f9"
        }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {label}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                {value ?? "N/A"}
            </span>
        </div>
    );
}

export default function ProfilePage() {
    const [data, setData] = useState(null);
    const [err, setErr] = useState("");

    useEffect(() => {
        apiFetch("/api/users/me")
            .then((j) => setData(j.data))
            .catch((e) => setErr(e.message));
    }, []);

    const initials = data?.username
        ? data.username.slice(0, 2).toUpperCase()
        : "?";

    return (
        <div style={{ height: "100vh", overflow: "hidden" }}>
            {data && <Navbar role={data.role} />}
            <Page centered={false}>
                <div className="w-full max-w-2xl mx-auto px-6 pt-2 pb-10">

                    {/* Header */}
                    <div style={{ marginBottom: 24 }}>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Profile</h1>
                        <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>Your account information</p>
                    </div>

                    {err && <Alert variant="error" className="mb-4">{err}</Alert>}

                    {!data ? (
                        <div style={{ color: "#94a3b8", fontSize: 14 }}>Loading...</div>
                    ) : (
                        <>
                            {/* Avatar + name card */}
                            <div style={{
                                background: "#fff",
                                borderRadius: 14,
                                padding: "28px 28px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(3,68,122,0.06)",
                                display: "flex",
                                alignItems: "center",
                                gap: 20,
                                marginBottom: 16
                            }}>
                                <div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{data.username}</div>
                                    <div style={{
                                        display: "inline-block",
                                        padding: "2px 10px",
                                        borderRadius: 20,
                                        background: "rgba(0,139,139,0.1)",
                                        color: TEAL,
                                        fontSize: 11,
                                        fontWeight: 700,
                                    }}>
                                        {data.role}
                                    </div>
                                </div>
                            </div>

                            {/* Account details */}
                            <div style={{
                                background: "#fff",
                                borderRadius: 14,
                                padding: "4px 24px",
                                marginBottom: 16
                            }}>
                                <div style={{ padding: "16px 0 8px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 3, height: 14, borderRadius: 2, background: TEAL }} />
                                    Account
                                </div>
                                <InfoRow label="Username" value={data.username} />
                                <InfoRow label="Role" value={data.role} />
                                <InfoRow label="School ID" value={data.schoolId} />
                            </div>

                            {/* School details */}
                            <div style={{
                                background: "#fff",
                                borderRadius: 14,
                                padding: "4px 24px",
                            }}>
                                <div style={{ padding: "16px 0 8px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 3, height: 14, borderRadius: 2, background: TEAL }} />
                                    School
                                </div>
                                <InfoRow label="School Name" value={data.school?.name} />
                                <InfoRow label="Region" value={data.school?.region} />
                                <InfoRow label="Group" value={data.school?.group} />
                                <InfoRow label="Gender Composition" value={data.school?.genderComposition} />
                            </div>
                        </>
                    )}
                </div>
            </Page>
        </div>
    );
}