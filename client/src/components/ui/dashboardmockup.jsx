import { useState } from "react";
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend, Title,
    CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

const NAVY = "rgb(3,68,122)";
const TEAL = "rgb(0,139,139)";
const TEAL2 = "rgb(0,100,100)";
const NAVY2 = "rgb(1,50,90)";
const LIGHT_TEAL = "rgb(0,200,200)";

const COLORS = [NAVY, TEAL, TEAL2, NAVY2, LIGHT_TEAL];

const CATEGORY_OPTIONS = ["Enrollment", "Personnel", "Admin Support"];
const YEAR_OPTIONS = [{ value: 8, label: "Year 8" }, { value: 7, label: "Year 7" }, { value: 6, label: "Year 6" }];

const mockKpis = [
    { label: "Total Employees", value: 248, trend: +12, trendPct: "+5.1%" },
    { label: "Full-Time Employees", value: 183, trend: +8, trendPct: "+4.6%" },
    { label: "Subcontractors", value: 22, trend: -3, trendPct: "-12%" },
];

const mockBar = {
    labels: ["Instruction", "Admin", "Support", "IT", "Facilities"],
    datasets: [
        { label: "Total Employees", data: [95, 42, 38, 28, 18], backgroundColor: NAVY },
        { label: "FT Employees", data: [80, 35, 28, 22, 14], backgroundColor: TEAL },
    ]
};

const mockLine = {
    labels: ["Yr 4", "Yr 5", "Yr 6", "Yr 7", "Yr 8"],
    datasets: [{
        label: "Total Employees",
        data: [210, 218, 225, 236, 248],
        borderColor: NAVY,
        backgroundColor: "rgba(3,68,122,0.08)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: NAVY,
        pointRadius: 5,
    }]
};

const mockDonut = {
    labels: ["Full-Time", "Part-Time"],
    datasets: [{ data: [183, 65], backgroundColor: [NAVY, TEAL] }]
};

const mockBar2 = {
    labels: ["EMPCAT_IS", "EMPCAT_AD", "EMPCAT_SP", "EMPCAT_FD", "EMPCAT_IT"],
    datasets: [
        { label: "Total", data: [95, 42, 38, 18, 28], backgroundColor: COLORS },
    ]
};

const chartOpts = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        title: { display: !!title, text: title, font: { size: 13, weight: "600", family: "'DM Sans', sans-serif" }, color: "#1e293b", padding: { bottom: 12 } },
        legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } },
    },
    scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { grid: { color: "#f1f5f9" }, ticks: { font: { size: 11 } } },
    }
});

const donutOpts = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        title: { display: !!title, text: title, font: { size: 13, weight: "600" }, color: "#1e293b", padding: { bottom: 12 } },
        legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } },
    }
});

function KpiCard({ label, value, trend, trendPct }) {
    const up = trend >= 0;
    return (
        <div style={{
            background: "#fff",
            borderRadius: 14,
            padding: "18px 22px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(3,68,122,0.06)",
            borderLeft: `4px solid ${up ? TEAL : "#e53e3e"}`,
            display: "flex", flexDirection: "column", gap: 4
        }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
            <span style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>{value.toLocaleString()}</span>
            <span style={{ fontSize: 12, color: up ? TEAL : "#e53e3e", fontWeight: 600 }}>
                {up ? "▲" : "▼"} {trendPct} vs last year
            </span>
        </div>
    );
}

function ChartCard({ title, subtitle, children, span = 1 }) {
    return (
        <div style={{
            background: "#fff",
            borderRadius: 14,
            padding: "20px 22px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(3,68,122,0.06)",
            gridColumn: span === 2 ? "span 2" : "span 1",
            display: "flex", flexDirection: "column", gap: 4
        }}>
            {title && <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{title}</div>}
            {subtitle && <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{subtitle}</div>}
            <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
        </div>
    );
}

export default function DashboardMockup() {
    const [category, setCategory] = useState("Personnel");
    const [yearId, setYearId] = useState(8);

    return (
        <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f8fafc", minHeight: "100vh" }}>

            {/* Top navbar */}
            <div style={{
                background: `linear-gradient(135deg, ${NAVY2} 0%, ${NAVY} 60%, ${TEAL} 100%)`,
                padding: "0 32px",
                height: 58,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                boxShadow: "0 2px 12px rgba(3,68,122,0.18)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#fff", fontSize: 16 }}>🏫</span>
                    </div>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em" }}>School Benchmarking</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>JS</div>
                    <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>John Smith</span>
                </div>
            </div>

            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 40px" }}>

                {/* Page header + filters inline */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>School Dashboard</h1>
                        <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>School ID 36 · Viewing {category}</p>
                    </div>

                    {/* Filters inline with header */}
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", borderRadius: 9, padding: "7px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Category</span>
                            <select value={category} onChange={e => setCategory(e.target.value)}
                                    style={{ border: "none", outline: "none", fontSize: 13, fontWeight: 600, color: "#1e293b", background: "transparent", cursor: "pointer" }}>
                                {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", borderRadius: 9, padding: "7px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Year</span>
                            <select value={yearId} onChange={e => setYearId(Number(e.target.value))}
                                    style={{ border: "none", outline: "none", fontSize: 13, fontWeight: 600, color: "#1e293b", background: "transparent", cursor: "pointer" }}>
                                {YEAR_OPTIONS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* KPI strip */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
                    {mockKpis.map((k, i) => <KpiCard key={i} {...k} />)}
                </div>

                {/* Charts 2x2 grid — fixed height so no scroll needed */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, gridAutoRows: "280px" }}>

                    <ChartCard title="Employees by Category" subtitle="Top categories for selected year">
                        <div style={{ height: 220 }}>
                            <Bar data={mockBar} options={{ ...chartOpts(null), indexAxis: "y" }} />
                        </div>
                    </ChartCard>

                    <ChartCard title="Headcount Trend" subtitle="Total employees across all years">
                        <div style={{ height: 220 }}>
                            <Line data={mockLine} options={chartOpts(null)} />
                        </div>
                    </ChartCard>

                    <ChartCard title="Employment Breakdown by Code" subtitle="Raw category codes">
                        <div style={{ height: 220 }}>
                            <Bar data={mockBar2} options={chartOpts(null)} />
                        </div>
                    </ChartCard>

                    <ChartCard title="Workforce Composition" subtitle="Full-time vs Part-time split">
                        <div style={{ height: 220 }}>
                            <Doughnut data={mockDonut} options={donutOpts(null)} />
                        </div>
                    </ChartCard>

                </div>

                {/* Footer note */}
                <p style={{ textAlign: "center", fontSize: 11, color: "#cbd5e1", marginTop: 28 }}>
                    Data shown for School 36 · Year {yearId} · {category}
                </p>
            </div>
        </div>
    );
}