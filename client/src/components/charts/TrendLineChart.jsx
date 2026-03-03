import { useMemo } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Title,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Title);

export default function TrendLineChart({ data, title = "Trend", height = 260 }) {
    const ok =
        Array.isArray(data?.labels) &&
        data.labels.length > 0 &&
        Array.isArray(data?.datasets) &&
        data.datasets.length > 0;

    const styledData = useMemo(() => {
        if (!ok) return null;

        return {
            ...data,
            datasets: data.datasets.map((ds) => ({
                ...ds,
                borderColor: ds.borderColor || "rgb(3, 68, 122)",
                borderWidth: ds.borderWidth ?? 2,
                tension: ds.tension ?? 0.3,
                pointRadius: ds.pointRadius ?? 3,
                fill: ds.fill ?? false,
            })),
        };
    }, [data, ok]);

    const options = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: title },
            },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        }),
        [title]
    );

    if (!ok) return <div style={{ opacity: 0.7 }}>No trend data available.</div>;

    return (
        <div style={{ height }}>
            <Line data={styledData} options={options} />
        </div>
    );
}