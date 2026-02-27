import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
    Title,
} from "chart.js";

import { Bar } from "react-chartjs-2";

// Register required parts
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
    Title
);

function isFiniteNumber(x) {
    return typeof x === "number" && Number.isFinite(x);
}

export default function EmployeeBarChart({ kpis, title = "Employee Personnel Overview" }) {
    if (!kpis || kpis.length === 0) {
        return <div style={{ opacity: 0.7 }}>No data available.</div>;
    }

    // Labels = KPI names
    const labels = kpis.map(k => k.label);

    // Values = KPI numbers
    const values = kpis.map(k =>
        typeof k.value === "number" && Number.isFinite(k.value)
            ? k.value
            : 0
    );

    const data = {
        labels,
        datasets: [
            {
                label: "Your School",
                data: values,

                // optional styling (Chart.js auto-colors if omitted)
                borderWidth: 2,
                borderRadius: 8,
                // borderColor: 'rgb(0,230,255)',
                backgroundColor: 'rgb(3,68,122)',
            },
        ],
    };

    const options = {
        responsive: true,

        plugins: {
            legend: { position: "top" },

            title: {
                display: true,
                text: title,
            },

            tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.label}: ${ctx.parsed.y}`,
                },
            },
        },

        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                },
            },
        },
    };

    return <Bar data={data} options={options} />;
}