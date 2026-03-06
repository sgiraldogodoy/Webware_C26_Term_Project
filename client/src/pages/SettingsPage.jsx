import { useMemo, useState, useEffect } from "react";
import Page from "../components/ui/Page";
import Navbar from "../components/Navigation/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import FormField from "../components/ui/FormField";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { apiFetch } from "../lib/api";
import { validatePasswordClient } from "../lib/validators";


export default function SettingsPage() {
    const [me, setMe] = useState([])
    const [currentPassword, setCurrent] = useState("");
    const [newPassword, setNew] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");

    useEffect(() => {
        apiFetch("/api/users/me").then(j => setMe(j.data)).catch(e => setErr(e.message));
    }, []);

    const passwordCheck = useMemo(
        () => validatePasswordClient(newPassword, confirmPassword),
        [newPassword, confirmPassword]
    );

    async function onSubmit(e) {
        e.preventDefault();
        setErr("");
        setMsg("");

        if (!passwordCheck.ok) {
            setErr(passwordCheck.message);
            return;
        }

        try {
            const j = await apiFetch("/api/users/me/password", {
                method: "PUT",
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            setMsg(j.message || "Password updated.");
            setCurrent("");
            setNew("");
            setConfirmPassword("");
        } catch (e) {
            setErr(e.message);
        }
    }

    return (
        <Page className="items-start justify-center">
            <div className="w-full max-w-4xl px-6 py-10">
                {me && <Navbar role={me.role}></Navbar>}
                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {err && <Alert variant="error" className="mb-3">{err}</Alert>}
                            {msg && <Alert variant="success" className="mb-3">{msg}</Alert>}

                            <form onSubmit={onSubmit} className="space-y-4">
                                <FormField label="Current password">
                                    <Input type="password" value={currentPassword} onChange={(e) => {
                                        setCurrent(e.target.value);
                                        setErr("");
                                        setMsg("");
                                    }} />
                                </FormField>

                                <FormField label="New password">
                                    <Input type="password" value={newPassword} onChange={(e) => {
                                        setNew(e.target.value);
                                        setErr("");
                                        setMsg("");
                                    }} />
                                </FormField>

                                <FormField label="Confirm new password">
                                    <Input type="password" value={confirmPassword} onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setErr("");
                                        setMsg("");
                                    }} />
                                </FormField>

                                <Button type="submit">Update password</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Page>
    );
}