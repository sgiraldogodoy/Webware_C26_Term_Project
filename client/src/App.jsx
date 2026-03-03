import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import SchoolDashboard from "./pages/SchoolUserDashboard.jsx";
import CompareDashboard from "./pages/CompareDashboard.jsx";
import BenchmarkForm from "./pages/BenchmarkForm.jsx";
export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/school-dashboard" element={<SchoolDashboard />} />
                <Route path="/compare-dashboard" element={<CompareDashboard />} />
                <Route path="/benchmark-form" element={<BenchmarkForm />} />
            </Routes>
        </BrowserRouter>
    );
}
