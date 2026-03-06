import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from "chart.js";

import {Radar} from "react-chartjs-2";

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);
export default function EmployeeRadarChart({
                                               labels = [],
                                               yourValues = [],
                                               peerValues = [],
                                           }) {

    const safeYour =
        yourValues.length === labels.length
            ? yourValues
            : new Array(labels.length).fill(0);

    const safePeer =
        peerValues.length === labels.length
            ? peerValues
            : new Array(labels.length).fill(0);

    const data = {
        labels,
        datasets: [
            {
                label: "Your School",
                data: safeYour,
                backgroundColor: "rgba(3, 68, 122, 0.2)",
                borderColor: "rgb(3, 68, 122)",
                pointBackgroundColor: "rgb(3, 68, 122)",
                borderWidth: 2,
            },
            {
                label: "Peer Average",
                data: safePeer,
                backgroundColor: "rgba(120, 160, 200, 0.2)",
                borderColor: "rgb(120, 160, 200)",
                pointBackgroundColor: "rgb(120, 160, 200)",
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                beginAtZero: true,
                pointLabels: { font: { size: 11 } },
            },
        },
        plugins: {
            legend: { position: "top" },
        },
    };

    return <Radar data={data} options={options} />;
}