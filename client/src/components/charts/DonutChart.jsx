import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const COLORS = [
    "rgb(3,68,122)",
    "rgb(0,139,139)",
    "rgb(0,100,100)",
    "rgb(1,50,90)",
    "rgb(0,180,180)",
];

export default function DoughnutChart({ data, title }) {
    if (!data?.labels?.length || !data?.datasets?.length) return <div style={{opacity:.7}}>No data.</div>;

    const coloredData = {
        ...data,
        datasets: data.datasets.map(dataset => ({
            ...dataset,
            backgroundColor: COLORS.slice(0, data.labels.length),
        }))
    };

    return <Doughnut data={coloredData} options={{ plugins:{ title:{display:true, text:title}, legend:{position:"top"} }}} />;
}