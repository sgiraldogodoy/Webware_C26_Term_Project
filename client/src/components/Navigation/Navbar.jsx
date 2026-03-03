import {Link, useLocation, useNavigate} from "react-router-dom";
import Button from "../ui/Button.jsx";

export default function Navbar(props) {
    const location = useLocation();
    const navigate = useNavigate();

    let nav_links = null;
    if (props.role === "ADMIN") {
        nav_links = [
            { label: "Admin Dashboard", to: "/admin-dashboard", enabled: true },
            { label: "Compare", to: "/compare", enabled: false },
        ];
    } else if (props.role === "SCHOOL") {
        nav_links = [
            { label: "Dashboard", to: "/dashboard", enabled: true },
            { label: "Benchmarking Form", to: "/form", enabled: false },
            { label: "Compare", to: "/compare", enabled: false },
            { label: "School Dashboard", to: "/school-dashboard", enabled: true }
        ];
    }

    return (
        <nav className="justify-between">

            <ul className="flex items-center gap-5">
                {nav_links.map(({label, to, enabled}) => {
                    const isActive = location.pathname === to;

                    if (!enabled) {
                        return (
                            <li key={label}>
                                {label}
                            </li>
                        );
                    }

                    return (
                        <li key={label}>
                            <Link
                                to={to}
                                className="flex items-center gap-5"
                                >
                                {label}
                            </Link>
                        </li>
                    );
                })}
                <Button
                    className="btn"
                    onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/");
                    }}
                > Log Out
                </Button>
            </ul>
        </nav>
    );
}