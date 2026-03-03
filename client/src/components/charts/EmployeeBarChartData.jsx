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

// dark or light mode
const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

const textColor = isDark ? "#f1f5f9" : "#334155";
const gridColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

function isFiniteNumber(x) {
    return typeof x === "number" && Number.isFinite(x);
}

export default function EmployeeBarChart({ data, title = "Employee Personnel Overview" }) {
    if (!data?.labels?.length || !data?.datasets?.length) {
        return <div style={{ opacity: 0.7 }}>No data available.</div>;
    }

    // Clone datasets and inject styling
    const styledData = {
        ...data,
        datasets: data.datasets.map((ds, i) => ({
            ...ds,
            backgroundColor: ds.backgroundColor || "rgb(3,68,122)",
            borderWidth: ds.borderWidth ?? 2,
            borderRadius: ds.borderRadius ?? 8,
        })),
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: { display: true, text: title },
        },
        scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } },
        },
    };

    return <Bar data={styledData} options={options} />;
}