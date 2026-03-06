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
import { validateForm } from "../lib/formValidator.js";


const STEPS = ["Personnel", "Admin Support", "Review"];

export default function FormPage() {
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("token"), []);

    const [user, setUser] = useState(null);
    const [years, setYears] = useState([]);
    const [yearId, setYearId] = useState(null);

    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(true);

    const [personnel, setPersonnel] = useState({
        TOTAL_EMPLOYEES: 0,
        FT_EMPLOYEES: 0,
        POC_EMPLOYEES: 0,
        SUBCONTRACT_NUM: 0,
        SUBCONTRACT_FTE: 0,
        FTE_ONLY_NUM: 0
    });
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

        // Validate client-side before saving
        const validation = validateForm(personnel, adminSupport);
        setErrors(validation);

        // Even with errors, allow draft save but show errors to user
        const res = await fetch("/api/form/draft", {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ yearId, personnel, adminSupport })
        });
        const j = await res.json();
        if (!res.ok) { setErrMsg(j.error || "Failed to save"); return; }
        setStatus("draft");
        setMsg("Draft saved.");
    }

    async function submit() {
        setMsg(""); setErrMsg("");

        // Validate before submitting
        const validation = validateForm(personnel, adminSupport);
        setErrors(validation);

        // Block submission if there are validation errors
        if (validation.hasErrors) {
            setErrMsg("Cannot submit form with validation errors. Please fix them first.");
            return;
        }

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



//   Complete Annual Benchmarking Form(s)
//   The system shall display an annual benchmarking form divided into logical sections and steps
// o User fills in multiple sections (admissions, demographics, facilities, academics, athletics,
// etc.)
// o System validates entries (numeric ranges, required fields, logical consistency)
    // ▪ Type checks (for example, numeric only where appropriate)
    // ▪ Range checks where sensible (for example, percentages between 0 and 100)
//   o The system shall not allow final submission until all blocking validation errors are
//   resolved

// o System highlights errors and offers help
// o User saves and submits the form

//   Dashboards and Charts
//   o The system shall present dashboards organized by category (facilities, academics,
//       athletics, etc.)
//   o Each dashboard shall:
//       ▪ Display a selection of KPIs as tiles/cards with summary values
// ▪ Provide at least two different chart types (for example, bar chart and line chart)
//   using Chart.js
//   o The system shall allow users to:
//       ▪ Filter by year
// ▪ Select different peer groups (as defined in the dummy data)
// ▪ View their school’s values against peer group averages, medians, or ranges



//only employee fields. All employee fields. possibly need enroll-attrition, but not sure

    // be able to choose year.
    // shoudl be able to choose year



    return (
        <Page className="items-start justify-center">
            <div className="w-full max-w-5xl px-6 py-10">
                <Navbar role= {user.role}></Navbar>

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
                                <FormField label="Total employees" help="Headcount of All employees at the school." error={errors.personnel?.TOTAL_EMPLOYEES}>
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

                                <FormField label="POC employees" help="Headcount of People of Color employees." error={errors.personnel?.POC_EMPLOYEES}>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={personnel.POC_EMPLOYEES}
                                        onChange={(e) => setPersonnel(p => ({ ...p, POC_EMPLOYEES: e.target.value }))}
                                    />
                                </FormField>

                                <FormField label="Subcontractors" help="HeadCount of Subcontractors." error={errors.personnel?.SUBCONTRACT_NUM}>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={personnel.SUBCONTRACT_NUM}
                                        onChange={(e) => setPersonnel(p => ({ ...p, SUBCONTRACT_NUM: e.target.value }))}
                                    />
                                </FormField>
                                <FormField label="FTE Subcontractors" help="Headcount of FTE Subcontractors." error={errors.personnel?.SUBCONTRACT_FTE}>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={personnel.SUBCONTRACT_FTE}
                                        onChange={(e) => setPersonnel(p => ({ ...p, SUBCONTRACT_FTE: e.target.value }))}
                                    />
                                </FormField>

                                <FormField label="FTE Employees" help="Headcount of FTE Employees." error={errors.personnel?.FTE_ONLY_NUM}>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={personnel.FTE_ONLY_NUM}
                                        onChange={(e) => setPersonnel(p => ({ ...p, FTE_ONLY_NUM: e.target.value }))}
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
                                        <div>Subcontractors: {personnel.SUBCONTRACT_NUM}</div>
                                        <div>FTE Subcontractors: {personnel.SUBCONTRACT_FTE}</div>
                                        <div>FTE Employees: {personnel.FTE_ONLY_NUM}</div>
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