import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import SchoolDashboard from "./pages/SchoolUserDashboard.jsx";
import AdminDashboard from "./pages/AdminUserDashboard.jsx";
import CompareDashboard from "./pages/CompareDashboard.jsx";
import BenchmarkForm from "./pages/BenchmarkForm.jsx";
import FormPage from "./pages/FormPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import AdminUsersPage from "./pages/AdminUsersPage.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/form" element={<FormPage />} />
                <Route path="/school-dashboard" element={<SchoolDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/compare-dashboard" element={<CompareDashboard />} />
                <Route path="/benchmark-form" element={<BenchmarkForm />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
            </Routes>
        </BrowserRouter>
    );
}
