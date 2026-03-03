import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Page from "../components/ui/Page";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import FormField from "../components/ui/FormField";
import Alert from "../components/ui/Alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) navigate("/school-dashboard");
    }, [navigate]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Login failed");

            localStorage.setItem("token", data.token);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (

        <Page>
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>School Benchmarking</CardTitle>
                    <CardDescription>Log in to enter data and view dashboards.</CardDescription>
                    {error && <Alert variant="error" className="mt-3">{error}</Alert>}
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormField label="Username">
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                required
                            />
                        </FormField>

                        <FormField label="Password">
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </FormField>

                        <Button className="w-full" type="submit" disabled={submitting}>
                            {submitting ? "Logging in..." : "Login"}
                        </Button>

                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-gray-200" />
                            <span className="text-xs text-gray-500">or</span>
                            <div className="h-px flex-1 bg-gray-200" />
                        </div>

                        <Button className="w-full" type="button" variant="outline" onClick={() => navigate("/register")}>
                            Create account
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Page>
    );
}