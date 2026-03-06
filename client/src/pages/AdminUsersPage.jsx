import { useEffect, useMemo, useState } from "react";
import Page from "../components/ui/Page";
import Navbar from "../components/Navigation/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import FormField from "../components/ui/FormField";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import Dropdown from "../components/ui/Dropdown";
import { apiFetch } from "../lib/api";
import { validateUsernameClient, validatePasswordClient } from "../lib/validators";

export default function AdminUsersPage() {
    const [me, setMe] = useState([])
    const [users, setUsers] = useState([]);
    const [schools, setSchools] = useState([]);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("SCHOOL");
    const [schoolId, setSchoolId] = useState("");

    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");

    const usernameCheck = useMemo(() => validateUsernameClient(username), [username]);
    const passwordCheck = useMemo(
        () => validatePasswordClient(password, confirmPassword),
        [password, confirmPassword]
    );

    async function loadUsers() {
        const j = await apiFetch("/api/users/admin/users");
        setUsers(j.data);
    }

    useEffect(() => {
        loadUsers().catch((e) => setErr(e.message));
        fetch("/api/schools/public")
            .then((r) => r.json())
            .then((j) => setSchools(j.data ?? j ?? []))
            .catch(() => {});
    }, []);
    useEffect(() => {
        apiFetch("/api/users/me").then(j => setMe(j.data)).catch(e => setErr(e.message));
    }, []);

    async function createUser(e) {
        e.preventDefault();
        setErr("");
        setMsg("");

        if (!usernameCheck.ok) {
            setErr(usernameCheck.message);
            return;
        }

        if (!passwordCheck.ok) {
            setErr(passwordCheck.message);
            return;
        }

        if (role === "SCHOOL" && !schoolId) {
            setErr("Please select a school.");
            return;
        }

        try {
            const payload = {
                username: usernameCheck.username,
                password,
                role,
                schoolId: role === "SCHOOL" ? Number(schoolId) : null,
            };

            const j = await apiFetch("/api/users/admin/users", {
                method: "POST",
                body: JSON.stringify(payload),
            });

            setMsg(j.message || "User created.");
            setUsername("");
            setPassword("");
            setConfirmPassword("");
            setSchoolId("");
            await loadUsers();
        } catch (e) {
            setErr(e.message);
        }
    }

    const roleOptions = [
        { value: "SCHOOL", label: "School user" },
        { value: "ADMIN", label: "Admin" },
    ];

    const schoolOptions = (Array.isArray(schools) ? schools : []).map((s) => ({
        value: String(s.id ?? s.ID),
        label: s.name ?? s.NAME_TX,
    }));

    return (
        <div style={{ height: "100vh", overflow: "hidden" }}>
            {me && <Navbar role={me.role}></Navbar>}
            <Page className="items-start justify-center">
            <div className="w-full max-w-5xl px-6 py-10">

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create user</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {err && <Alert variant="error" className="mb-3">{err}</Alert>}
                            {msg && <Alert variant="success" className="mb-3">{msg}</Alert>}

                            <form onSubmit={createUser} className="space-y-4">
                                <FormField
                                    label="Username"
                                    help="3–20 characters. Letters, numbers, periods, and underscores only."
                                    error={username.length > 0 && !usernameCheck.ok ? usernameCheck.message : ""}
                                >
                                    <Input value={username} onChange={(e) => {
                                        setUsername(e.target.value);
                                        setErr("");
                                        setMsg("");
                                    }} />
                                </FormField>

                                <FormField
                                    label="Password"
                                    help="8–64 characters. Must include uppercase, lowercase, number, and special character."
                                    error={password.length > 0 && !passwordCheck.ok ? passwordCheck.message : ""}
                                >
                                    <Input type="password" value={password} onChange={(e) => {
                                        setPassword(e.target.value);
                                        setErr("");
                                        setMsg("");
                                    }} />
                                </FormField>

                                <FormField label="Confirm password">
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            setErr("");
                                            setMsg("");
                                        }}
                                    />
                                </FormField>

                                <FormField label="Role">
                                    <Dropdown label="Role" value={role} options={roleOptions} onChange={setRole} />
                                </FormField>

                                {role === "SCHOOL" && (
                                    <FormField label="School">
                                        <Dropdown
                                            label="School"
                                            value={String(schoolId)}
                                            options={schoolOptions}
                                            onChange={setSchoolId}
                                        />
                                    </FormField>
                                )}

                                <Button type="submit">Create</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Users</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                                {users.map((u) => (
                                    <div key={u.id} className="flex justify-between border-b py-2">
                                        <div>
                                            <div className="font-semibold">{u.username}</div>
                                            <div className="text-slate-500">
                                                {u.role} · schoolId: {u.schoolId ?? "N/A"}
                                            </div>
                                        </div>
                                        <div className="text-slate-400">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Page>
        </div>
    );
}