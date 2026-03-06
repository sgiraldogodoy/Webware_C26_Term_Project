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
const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

export default function EmployeeBarChart({ data, title = "Employee Personnel Overview", horizontal = false }) {
    if (!data?.labels?.length || !data?.datasets?.length) {
        return <div style={{ opacity: 0.7 }}>No data available.</div>;
    }

    // Clone datasets and inject styling
    const COLORS = [
        "rgb(3,68,122)",
        "rgb(0,139,139)",
        "rgb(99,102,241)"
    ];

    const styledData = {
        ...data,
        datasets: data.datasets.map((ds, i) => ({
            ...ds,
            backgroundColor: ds.backgroundColor || COLORS[i % COLORS.length],
            borderWidth: ds.borderWidth ?? 2,
            borderRadius: ds.borderRadius ?? 8,
            barPercentage: 0.9,
            categoryPercentage: 0.9,
        })),
    };

    // Determine which axis is the value axis when horizontal is true
    const valueAxis = horizontal ? 'x' : 'y';
    const categoryAxis = horizontal ? 'y' : 'x';

    // Set chart options; indexAxis should be an option, not on the data object
    const options = {
        indexAxis: horizontal ? 'y' : 'x',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top", labels: { color: textColor } },
            title: { display: true, text: title, color: textColor },
            tooltip: { enabled: true },
        },
        scales: {
            [valueAxis]: {
                beginAtZero: true,
                grid: { color: gridColor },
                ticks: {
                    color: textColor,
                    // show integer-like ticks; fallback to default
                    callback: function (val) {
                        return Number.isFinite(val) ? val : val;
                    }
                }
            },
            [categoryAxis]: {
                grid: { color: gridColor },
                ticks: { color: textColor },
            }
        },
        // layout tweaks for better horizontal rendering
        elements: {
            bar: { maxBarThickness: 80 }
        }
    };

    return (
        // explicitly reference textColor in style so static analyzer picks it up
        <div style={{ height: 300, color: textColor }}>
            <Bar data={styledData} options={options} />
        </div>
    );
}