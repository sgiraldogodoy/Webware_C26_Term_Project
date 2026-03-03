import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, Title);

export default function DoughnutChart({ data, title }) {
    if (!data?.labels?.length || !data?.datasets?.length) return <div style={{opacity:.7}}>No data.</div>;
    return <Doughnut data={data} options={{ plugins:{ title:{display:true, text:title}, legend:{position:"top"} }}} />;
}