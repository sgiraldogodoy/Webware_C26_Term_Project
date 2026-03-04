import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Page from "../components/ui/Page";
import Navbar from "../components/Navigation/Navbar.jsx";
import Dropdown from "../components/ui/Dropdown.jsx";
import Input from "../components/ui/Input.jsx";
import FormField from "../components/ui/FormField.jsx";
import Button from "../components/ui/Button.jsx";
import Alert from "../components/ui/Alert.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card.jsx";

const STEPS = ["Personnel", "Admin Support", "Review"];

export default function FormPage() {
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("token"), []);

    const [user, setUser] = useState(null);
    const [years, setYears] = useState([]);
    const [yearId, setYearId] = useState(null);

    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(true);

    const [personnel, setPersonnel] = useState({ TOTAL_EMPLOYEES: 0, FT_EMPLOYEES: 0, POC_EMPLOYEES: 0 });
    const [adminSupport, setAdminSupport] = useState({ NR_EXEMPT: 0, NR_NONEXEMPT: 0, FTE_EXEMPT: 0, FTE_NONEXEMPT: 0 });

    const [status, setStatus] = useState("draft");
    const [errors, setErrors] = useState({ personnel: {}, adminSupport: {} });
    const [msg, setMsg] = useState("");
    const [errMsg, setErrMsg] = useState("");

    // auth
    useEffect(() => {
        if (!token) { navigate("/"); return; }

        fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
            .then(r => (r.ok ? r.json() : Promise.reject()))
            .then(setUser)
            .catch(() => { localStorage.removeItem("token"); navigate("/"); });
    }, [navigate, token]);

    // years for dropdown (reuse your dashboard years endpoint)
    useEffect(() => {
        if (!user) return;

        fetch("/api/form/years", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(async (r) => {
                const j = await r.json().catch(() => ({}));
                if (!r.ok) throw new Error(j.error || "Failed to load years");
                return j;
            })
            .then((j) => {
                const arr = j.data ?? [];   // <-- IMPORTANT
                setYears(arr);
                if (arr.length > 0) setYearId(arr[0].ID);
            })
            .catch((e) => setErrMsg(e.message));
    }, [user, token]);

    // load form data
    useEffect(() => {
        if (!user || !yearId) return;

        setLoading(true);
        setMsg(""); setErrMsg("");

        fetch(`/api/form?yearId=${yearId}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json().then(j => ({ ok: r.ok, j })))
            .then(({ ok, j }) => {
                if (!ok) throw new Error(j.error || "Failed to load form");
                setPersonnel(j.data.personnel);
                setAdminSupport(j.data.adminSupport);
                setStatus(j.data.status);
                setErrors({ personnel: {}, adminSupport: {} });
            })
            .catch(e => setErrMsg(e.message))
            .finally(() => setLoading(false));
    }, [user, yearId, token]);

    //const yearOptions = years.map(y => ({ value: y.ID, label: `Year ${y.SCHOOL_YEAR}` }));
    const yearOptions = years.map(y => ({
        value: String(y.ID),
        label: `Year ${y.SCHOOL_YEAR}`,
    }));


    async function saveDraft() {
        setMsg(""); setErrMsg("");
        const res = await fetch("/api/form/draft", {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ yearId, personnel, adminSupport })
        });
        const j = await res.json();
        if (!res.ok) { setErrMsg(j.error || "Failed to save"); return; }
        setErrors(j.validation || { personnel: {}, adminSupport: {} });
        setStatus("draft");
        setMsg("Draft saved.");
    }

    async function submit() {
        setMsg(""); setErrMsg("");
        const res = await fetch("/api/form/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ yearId, personnel, adminSupport })
        });
        const j = await res.json();
        if (!res.ok) {
            setErrors(j.validation || { personnel: {}, adminSupport: {} });
            setErrMsg(j.error || "Submit failed");
            return;
        }
        setErrors({ personnel: {}, adminSupport: {} });
        setStatus("submitted");
        setMsg("Submitted successfully.");
    }

    if (!user) return <Page>Loading...</Page>;
    if (user.role !== "SCHOOL") return <Page>Only school users can fill forms.</Page>;
    if (!yearId) return <Page>Loading years...</Page>;
    if (loading) return <Page>Loading form...</Page>;

    return (
        <Page className="items-start justify-center">
            <div className="w-full max-w-5xl px-6 py-10">
                <Navbar />

                <div className="flex items-start justify-between mt-6">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900">Benchmarking Form</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Status: <span className="font-semibold">{status}</span> · School: {user.schoolId} · Year: {yearId}
                        </p>
                    </div>

                    <div className="w-52">
                        <Dropdown label="Year" value={String(yearId)} options={yearOptions} onChange={(v) => setYearId(Number(v))} />
                    </div>
                </div>

                {(errMsg || msg) && (
                    <div className="mt-4 space-y-2">
                        {errMsg && <Alert variant="error">{errMsg}</Alert>}
                        {msg && <Alert variant="success">{msg}</Alert>}
                    </div>
                )}

                {/* Stepper */}
                <div className="mt-6 flex gap-2">
                    {STEPS.map((s, i) => (
                        <button
                            key={s}
                            onClick={() => setStep(i)}
                            className={`rounded-md px-3 py-2 text-sm font-medium ring-1 ${
                                i === step ? "bg-blue-50 text-blue-700 ring-blue-200" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            {i + 1}. {s}
                        </button>
                    ))}
                </div>

                {/* Step content */}
                <div className="mt-6">
                    {step === 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Employee Personnel</CardTitle>
                                <CardDescription>Enter employee counts for this year.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField label="Total employees" help="All employees at the school (headcount)." error={errors.personnel?.TOTAL_EMPLOYEES}>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={personnel.TOTAL_EMPLOYEES}
                                        onChange={(e) => setPersonnel(p => ({ ...p, TOTAL_EMPLOYEES: e.target.value }))}
                                    />
                                </FormField>

                                <FormField label="Full-time employees" help="Headcount of full-time employees." error={errors.personnel?.FT_EMPLOYEES}>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={personnel.FT_EMPLOYEES}
                                        onChange={(e) => setPersonnel(p => ({ ...p, FT_EMPLOYEES: e.target.value }))}
                                    />
                                </FormField>

                                <FormField label="POC employees" help="People of Color employees (headcount)." error={errors.personnel?.POC_EMPLOYEES}>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={personnel.POC_EMPLOYEES}
                                        onChange={(e) => setPersonnel(p => ({ ...p, POC_EMPLOYEES: e.target.value }))}
                                    />
                                </FormField>
                            </CardContent>
                        </Card>
                    )}

                    {step === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Admin Support</CardTitle>
                                <CardDescription>Enter admin staff counts and FTE.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="NR Exempt" help="Headcount of exempt admin staff." error={errors.adminSupport?.NR_EXEMPT}>
                                    <Input type="number" min="0" value={adminSupport.NR_EXEMPT}
                                           onChange={(e) => setAdminSupport(a => ({ ...a, NR_EXEMPT: e.target.value }))} />
                                </FormField>

                                <FormField label="NR Nonexempt" help="Headcount of nonexempt admin staff." error={errors.adminSupport?.NR_NONEXEMPT}>
                                    <Input type="number" min="0" value={adminSupport.NR_NONEXEMPT}
                                           onChange={(e) => setAdminSupport(a => ({ ...a, NR_NONEXEMPT: e.target.value }))} />
                                </FormField>

                                <FormField label="FTE Exempt" help="FTE of exempt staff (can be decimal)." error={errors.adminSupport?.FTE_EXEMPT}>
                                    <Input type="number" min="0" step="0.01" value={adminSupport.FTE_EXEMPT}
                                           onChange={(e) => setAdminSupport(a => ({ ...a, FTE_EXEMPT: e.target.value }))} />
                                </FormField>

                                <FormField label="FTE Nonexempt" help="FTE of nonexempt staff (can be decimal)." error={errors.adminSupport?.FTE_NONEXEMPT}>
                                    <Input type="number" min="0" step="0.01" value={adminSupport.FTE_NONEXEMPT}
                                           onChange={(e) => setAdminSupport(a => ({ ...a, FTE_NONEXEMPT: e.target.value }))} />
                                </FormField>
                            </CardContent>
                        </Card>
                    )}

                    {step === 2 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Review</CardTitle>
                                <CardDescription>Confirm values, then save draft or submit.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="rounded-md bg-slate-50 p-4 ring-1 ring-slate-200">
                                        <div className="font-semibold mb-2">Personnel</div>
                                        <div>Total: {personnel.TOTAL_EMPLOYEES}</div>
                                        <div>Full-time: {personnel.FT_EMPLOYEES}</div>
                                        <div>POC: {personnel.POC_EMPLOYEES}</div>
                                    </div>

                                    <div className="rounded-md bg-slate-50 p-4 ring-1 ring-slate-200">
                                        <div className="font-semibold mb-2">Admin Support</div>
                                        <div>NR Exempt: {adminSupport.NR_EXEMPT}</div>
                                        <div>NR Nonexempt: {adminSupport.NR_NONEXEMPT}</div>
                                        <div>FTE Exempt: {adminSupport.FTE_EXEMPT}</div>
                                        <div>FTE Nonexempt: {adminSupport.FTE_NONEXEMPT}</div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={saveDraft}>Save Draft</Button>
                                    <Button onClick={submit}>Submit</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Nav buttons */}
                <div className="mt-6 flex justify-between">
                    <Button variant="outline" disabled={step === 0} onClick={() => setStep(s => Math.max(0, s - 1))}>
                        Back
                    </Button>

                    <Button disabled={step === STEPS.length - 1} onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}>
                        Next
                    </Button>
                </div>
            </div>
        </Page>
    );
}