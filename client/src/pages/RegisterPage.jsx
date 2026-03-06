import {useEffect, useMemo, useState} from "react";
import { useNavigate } from "react-router-dom";
import Page from "../components/ui/Page";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import FormField from "../components/ui/FormField";
import Alert from "../components/ui/Alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import {validatePasswordClient, validateUsernameClient} from "../lib/validators.js";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [schools, setSchools] = useState([]);
    const [schoolId, setSchoolId] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);


    const navigate = useNavigate();

    const usernameCheck = useMemo(() => validateUsernameClient(username), [username]);
    const passwordCheck = useMemo(
        () => validatePasswordClient(password, confirmPassword),
        [password, confirmPassword]
    );

    useEffect(() => {
        fetch("/api/schools/public")
            .then((r) => r.json())
            .then((json) => setSchools(Array.isArray(json) ? json : (json.data ?? [])))
            .catch(() => setError("Could not load schools list."));
    }, []);
    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!schoolId) return setError("Please select a school.");
        if (!usernameCheck.ok) return setError(usernameCheck.message);
        if (!passwordCheck.ok) return setError(passwordCheck.message);

        setSubmitting(true);
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: usernameCheck.username,
                    password,
                    schoolId: Number(schoolId),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Registration failed");

            setSuccess("Account created! You can log in now.");
            setTimeout(() => navigate("/"), 700);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    // const schoolOptions = schools.map(y => ({ value: y, label: `School ${y}` }));

    return (
        <Page>
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create account</CardTitle>
                    <CardDescription>Choose your school, then create a username and password.</CardDescription>
                    {error && <Alert variant="error" className="mt-3">{error}</Alert>}
                    {success && <Alert variant="success" className="mt-3">{success}</Alert>}
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormField label="School" help="Pick your school from the list.">
                            <Select value={schoolId} onChange={(e) => setSchoolId(e.target.value)} required>
                                <option value="">Select a school...</option>
                                {schools.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} ({s.region})
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField
                            label="Username"
                            help="3–20 chars. Letters/numbers/._ only."
                            error={username.length > 0 && !usernameCheck.ok ? usernameCheck.message : ""}
                        >
                            <Input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
                        </FormField>

                        <FormField
                            label="Password"
                            help="8–64 chars. Upper + lower + number + special. Any order. No spaces."
                            error={password.length > 0 && !passwordCheck.ok ? passwordCheck.message : ""}
                        >
                            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                        </FormField>

                        <FormField label="Confirm password">
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                        </FormField>

                        <Button className="w-full" type="submit" disabled={submitting}>
                            {submitting ? "Creating..." : "Register"}
                        </Button>

                        <Button className="w-full" type="button" variant="outline" onClick={() => navigate("/")}>
                            Back to login
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Page>
    );
}