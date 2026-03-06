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

function buildPersonnelRows(options, savedRows) {
    const savedMap = new Map((savedRows ?? []).map((r) => [r.EMP_CAT_CD, r]));

    return options.map((opt) => {
        const saved = savedMap.get(opt.value);
        return {
            EMP_CAT_CD: opt.value,
            label: opt.label,
            TOTAL_EMPLOYEES: saved?.TOTAL_EMPLOYEES ?? 0,
            FT_EMPLOYEES: saved?.FT_EMPLOYEES ?? 0,
            POC_EMPLOYEES: saved?.POC_EMPLOYEES ?? 0,
            SUBCONTRACT_NUM: saved?.SUBCONTRACT_NUM ?? 0,
            SUBCONTRACT_FTE: saved?.SUBCONTRACT_FTE ?? 0,
            FTE_ONLY_NUM: saved?.FTE_ONLY_NUM ?? 0,
        };
    });
}

function buildAdminRows(options, savedRows) {
    const savedMap = new Map((savedRows ?? []).map((r) => [r.ADMIN_STAFF_FUNC_CD, r]));

    return options.map((opt) => {
        const saved = savedMap.get(opt.value);
        return {
            ADMIN_STAFF_FUNC_CD: opt.value,
            label: opt.label,
            NR_EXEMPT: saved?.NR_EXEMPT ?? 0,
            NR_NONEXEMPT: saved?.NR_NONEXEMPT ?? 0,
            FTE_EXEMPT: saved?.FTE_EXEMPT ?? 0,
            FTE_NONEXEMPT: saved?.FTE_NONEXEMPT ?? 0,
        };
    });
}

export default function FormPage() {
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("token"), []);

    const [user, setUser] = useState(null);
    const [years, setYears] = useState([]);
    const [yearId, setYearId] = useState(null);

    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(true);

    const [formOptions, setFormOptions] = useState({
        personnelCategories: [],
        adminFunctions: [],
    });

    const [personnelRows, setPersonnelRows] = useState([]);
    const [adminSupportRows, setAdminSupportRows] = useState([]);

    const [status, setStatus] = useState("draft");
    const [errors, setErrors] = useState({ personnel: [], adminSupport: [] });
    const [msg, setMsg] = useState("");
    const [errMsg, setErrMsg] = useState("");

    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }

        fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then(setUser)
            .catch(() => {
                localStorage.removeItem("token");
                navigate("/");
            });
    }, [navigate, token]);

    useEffect(() => {
        if (!user) return;

        Promise.all([
            fetch("/api/form/years", { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
                r.json().then((j) => ({ ok: r.ok, j }))
            ),
            fetch("/api/form/options", { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
                r.json().then((j) => ({ ok: r.ok, j }))
            ),
        ])
            .then(([yearsRes, optionsRes]) => {
                if (!yearsRes.ok) throw new Error(yearsRes.j.error || "Failed to load years");
                if (!optionsRes.ok) throw new Error(optionsRes.j.error || "Failed to load form options");

                const yearData = yearsRes.j.data ?? [];
                const optionData = optionsRes.j.data ?? {
                    personnelCategories: [],
                    adminFunctions: [],
                };

                setYears(yearData);
                setFormOptions(optionData);

                if (yearData.length > 0) {
                    setYearId(yearData[0].ID);
                }
            })
            .catch((e) => setErrMsg(e.message));
    }, [user, token]);

    useEffect(() => {
        if (!user || !yearId) return;

        setLoading(true);
        setMsg("");
        setErrMsg("");

        fetch(`/api/form?yearId=${yearId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
            .then(({ ok, j }) => {
                if (!ok) throw new Error(j.error || "Failed to load form");

                const savedPersonnel = j.data.personnelRows ?? [];
                const savedAdmin = j.data.adminSupportRows ?? [];

                setPersonnelRows(buildPersonnelRows(formOptions.personnelCategories, savedPersonnel));
                setAdminSupportRows(buildAdminRows(formOptions.adminFunctions, savedAdmin));
                setStatus(j.data.status ?? "draft");
                setErrors({ personnel: [], adminSupport: [] });
            })
            .catch((e) => setErrMsg(e.message))
            .finally(() => setLoading(false));
    }, [user, yearId, token, formOptions]);

    const yearOptions = years.map((y) => ({
        value: String(y.ID),
        label: `Year ${y.SCHOOL_YEAR}`,
    }));

    const yearNumber = useMemo(() => {
        return yearOptions.find((y) => String(y.value) === String(yearId))?.label ?? "";
    }, [yearId, yearOptions]);

    async function saveDraft() {
        setMsg("");
        setErrMsg("");

        const validation = validateForm(personnelRows, adminSupportRows);
        setErrors({
            personnel: validation.personnel,
            adminSupport: validation.adminSupport,
        });

        const res = await fetch("/api/form/draft", {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ yearId, personnelRows, adminSupportRows }),
        });

        const j = await res.json();
        if (!res.ok) {
            setErrMsg(j.error || "Failed to save");
            return;
        }

        setErrors(j.validation || { personnel: [], adminSupport: [] });
        setStatus("draft");
        setMsg("Draft saved.");
    }

    async function submit() {
        setMsg("");
        setErrMsg("");

        const validation = validateForm(personnelRows, adminSupportRows);
        setErrors({
            personnel: validation.personnel,
            adminSupport: validation.adminSupport,
        });

        if (validation.hasErrors) {
            setErrMsg("Cannot submit form with validation errors. Please fix them first.");
            return;
        }

        const res = await fetch("/api/form/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ yearId, personnelRows, adminSupportRows }),
        });

        const j = await res.json();
        if (!res.ok) {
            setErrors(j.validation || { personnel: [], adminSupport: [] });
            setErrMsg(j.error || "Submit failed");
            return;
        }

        setErrors({ personnel: [], adminSupport: [] });
        setStatus("submitted");
        setMsg("Submitted successfully.");
    }

    if (!user) return <Page>Loading...</Page>;
    if (user.role !== "SCHOOL") return <Page>Only school users can fill forms.</Page>;
    if (!yearId) return <Page>Loading years...</Page>;
    if (loading) return <Page>Loading form...</Page>;

    return (
        <div className="h-screen flex flex-col">
            <Navbar role={user.role} />
            <div className="flex-1 overflow-y-auto">
                <Page className="items-start justify-center">
                <div className="w-full max-w-6xl px-6 py-10">
                    <div className="flex items-start justify-between mt-6">
                        <div>
                            <h1 className="text-3xl font-semibold text-slate-900">Benchmarking Form</h1>
                            <p className="mt-1 text-sm text-slate-600">
                                Status: <span className="font-semibold">{status}</span> · School: {user.schoolId} · {yearNumber}
                            </p>
                        </div>

                        <div className="w-52">
                            <Dropdown
                                label="Year"
                                value={String(yearId)}
                                options={yearOptions}
                                onChange={(v) => setYearId(Number(v))}
                            />
                        </div>
                    </div>

                    {(errMsg || msg) && (
                        <div className="mt-4 space-y-2">
                            {errMsg && <Alert variant="error">{errMsg}</Alert>}
                            {msg && <Alert variant="success">{msg}</Alert>}
                        </div>
                    )}

                    <div className="mt-6 flex gap-2">
                        {STEPS.map((s, i) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setStep(i)}
                                className={`rounded-md px-3 py-2 text-sm font-medium ring-1 ${
                                    i === step
                                        ? "bg-blue-50 text-blue-700 ring-blue-200"
                                        : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                {i + 1}. {s}
                            </button>
                        ))}
                    </div>

                    <div className="mt-6">
                        {step === 0 && (
                            <div className="space-y-4">
                                {personnelRows.map((row, idx) => (
                                    <Card key={row.EMP_CAT_CD}>
                                        <CardHeader>
                                            <CardTitle>{row.label}</CardTitle>
                                            <CardDescription>{row.EMP_CAT_CD}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <FormField label="Total employees" error={errors.personnel?.[idx]?.TOTAL_EMPLOYEES}>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={row.TOTAL_EMPLOYEES}
                                                    onChange={(e) =>
                                                        setPersonnelRows((prev) =>
                                                            prev.map((r, i) =>
                                                                i === idx ? { ...r, TOTAL_EMPLOYEES: e.target.value } : r
                                                            )
                                                        )
                                                    }
                                                />
                                            </FormField>

                                            <FormField label="Full-time employees" error={errors.personnel?.[idx]?.FT_EMPLOYEES}>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={row.FT_EMPLOYEES}
                                                    onChange={(e) =>
                                                        setPersonnelRows((prev) =>
                                                            prev.map((r, i) =>
                                                                i === idx ? { ...r, FT_EMPLOYEES: e.target.value } : r
                                                            )
                                                        )
                                                    }
                                                />
                                            </FormField>

                                            <FormField label="Employees identifying as People of Color" error={errors.personnel?.[idx]?.POC_EMPLOYEES}>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={row.POC_EMPLOYEES}
                                                    onChange={(e) =>
                                                        setPersonnelRows((prev) =>
                                                            prev.map((r, i) =>
                                                                i === idx ? { ...r, POC_EMPLOYEES: e.target.value } : r
                                                            )
                                                        )
                                                    }
                                                />
                                            </FormField>

                                            <FormField label="Subcontractors" error={errors.personnel?.[idx]?.SUBCONTRACT_NUM}>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={row.SUBCONTRACT_NUM}
                                                    onChange={(e) =>
                                                        setPersonnelRows((prev) =>
                                                            prev.map((r, i) =>
                                                                i === idx ? { ...r, SUBCONTRACT_NUM: e.target.value } : r
                                                            )
                                                        )
                                                    }
                                                />
                                            </FormField>

                                            <FormField label="Subcontractor full-time equivalent" error={errors.personnel?.[idx]?.SUBCONTRACT_FTE}>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={row.SUBCONTRACT_FTE}
                                                    onChange={(e) =>
                                                        setPersonnelRows((prev) =>
                                                            prev.map((r, i) =>
                                                                i === idx ? { ...r, SUBCONTRACT_FTE: e.target.value } : r
                                                            )
                                                        )
                                                    }
                                                />
                                            </FormField>

                                            <FormField label="Employee full-time equivalent" error={errors.personnel?.[idx]?.FTE_ONLY_NUM}>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={row.FTE_ONLY_NUM}
                                                    onChange={(e) =>
                                                        setPersonnelRows((prev) =>
                                                            prev.map((r, i) =>
                                                                i === idx ? { ...r, FTE_ONLY_NUM: e.target.value } : r
                                                            )
                                                        )
                                                    }
                                                />
                                            </FormField>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-4">
                                {adminSupportRows.map((row, idx) => (
                                    <Card key={row.ADMIN_STAFF_FUNC_CD}>
                                        <CardHeader>
                                            <CardTitle>{row.label}</CardTitle>
                                            <CardDescription>{row.ADMIN_STAFF_FUNC_CD}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField label="Exempt employees" error={errors.adminSupport?.[idx]?.NR_EXEMPT}>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={row.NR_EXEMPT}
                                                    onChange={(e) =>
                                                        setAdminSupportRows((prev) =>
                                                            prev.map((r, i) =>
                                                                i === idx ? { ...r, NR_EXEMPT: e.target.value } : r
                                                            )
                                                        )
                                                    }
                                                />
                                            </FormField>

                                            <FormField label="Non-exempt employees" error={errors.adminSupport?.[idx]?.NR_NONEXEMPT}>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={row.NR_NONEXEMPT}
                                                    onChange={(e) =>
                                                        setAdminSupportRows((prev) =>
                                                            prev.map((r, i) =>
                                                                i === idx ? { ...r, NR_NONEXEMPT: e.target.value } : r
                                                            )
                                                        )
                                                    }
                                                />
                                            </FormField>

                                            <FormField label="Exempt full-time equivalent" error={errors.adminSupport?.[idx]?.FTE_EXEMPT}>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={row.FTE_EXEMPT}
                                                    onChange={(e) =>
                                                        setAdminSupportRows((prev) =>
                                                            prev.map((r, i) =>
                                                                i === idx ? { ...r, FTE_EXEMPT: e.target.value } : r
                                                            )
                                                        )
                                                    }
                                                />
                                            </FormField>

                                            <FormField label="Non-exempt full-time equivalent" error={errors.adminSupport?.[idx]?.FTE_NONEXEMPT}>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={row.FTE_NONEXEMPT}
                                                    onChange={(e) =>
                                                        setAdminSupportRows((prev) =>
                                                            prev.map((r, i) =>
                                                                i === idx ? { ...r, FTE_NONEXEMPT: e.target.value } : r
                                                            )
                                                        )
                                                    }
                                                />
                                            </FormField>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {step === 2 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Review</CardTitle>
                                    <CardDescription>Confirm values, then save draft or submit.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 text-sm">
                                    <div>
                                        <div className="font-semibold mb-2">Personnel</div>
                                        <div className="space-y-2">
                                            {personnelRows.map((row) => (
                                                <div key={row.EMP_CAT_CD} className="rounded-md bg-slate-50 p-4 ring-1 ring-slate-200">
                                                    <div className="font-medium">{row.label}</div>
                                                    <div>Total: {row.TOTAL_EMPLOYEES}</div>
                                                    <div>Full-time: {row.FT_EMPLOYEES}</div>
                                                    <div>People of Color: {row.POC_EMPLOYEES}</div>
                                                    <div>Subcontractors: {row.SUBCONTRACT_NUM}</div>
                                                    <div>Subcontractor FTE: {row.SUBCONTRACT_FTE}</div>
                                                    <div>Employee FTE: {row.FTE_ONLY_NUM}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="font-semibold mb-2">Admin Support</div>
                                        <div className="space-y-2">
                                            {adminSupportRows.map((row) => (
                                                <div key={row.ADMIN_STAFF_FUNC_CD} className="rounded-md bg-slate-50 p-4 ring-1 ring-slate-200">
                                                    <div className="font-medium">{row.label}</div>
                                                    <div>Exempt employees: {row.NR_EXEMPT}</div>
                                                    <div>Non-exempt employees: {row.NR_NONEXEMPT}</div>
                                                    <div>Exempt FTE: {row.FTE_EXEMPT}</div>
                                                    <div>Non-exempt FTE: {row.FTE_NONEXEMPT}</div>
                                                </div>
                                            ))}
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

                    <div className="mt-6 flex justify-between">
                        <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
                            Back
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setPersonnelRows((prev) =>
                                    prev.map((row) => ({
                                        ...row,
                                        TOTAL_EMPLOYEES: row.TOTAL_EMPLOYEES === "" ? 0 : row.TOTAL_EMPLOYEES,
                                        FT_EMPLOYEES: row.FT_EMPLOYEES === "" ? 0 : row.FT_EMPLOYEES,
                                        POC_EMPLOYEES: row.POC_EMPLOYEES === "" ? 0 : row.POC_EMPLOYEES,
                                        SUBCONTRACT_NUM: row.SUBCONTRACT_NUM === "" ? 0 : row.SUBCONTRACT_NUM,
                                        SUBCONTRACT_FTE: row.SUBCONTRACT_FTE === "" ? 0 : row.SUBCONTRACT_FTE,
                                        FTE_ONLY_NUM: row.FTE_ONLY_NUM === "" ? 0 : row.FTE_ONLY_NUM,
                                    }))
                                );

                                setAdminSupportRows((prev) =>
                                    prev.map((row) => ({
                                        ...row,
                                        NR_EXEMPT: row.NR_EXEMPT === "" ? 0 : row.NR_EXEMPT,
                                        NR_NONEXEMPT: row.NR_NONEXEMPT === "" ? 0 : row.NR_NONEXEMPT,
                                        FTE_EXEMPT: row.FTE_EXEMPT === "" ? 0 : row.FTE_EXEMPT,
                                        FTE_NONEXEMPT: row.FTE_NONEXEMPT === "" ? 0 : row.FTE_NONEXEMPT,
                                    }))
                                );
                            }}
                        >
                            Fill blanks with 0
                        </Button>
                        <Button disabled={step === STEPS.length - 1} onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
                            Next
                        </Button>
                    </div>
                </div>
            </Page>
            </div>
        </div>
    );
}