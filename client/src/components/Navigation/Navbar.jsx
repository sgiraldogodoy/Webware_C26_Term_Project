import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
    { label: "Dashboard", to: "/school-dashboard", enabled: true },
    { label: "Benchmarking Form", to: "/form", enabled: false },
    { label: "Compare", to: "/compare", enabled: false }
];

export default function Navbar() {
    const location = useLocation();

    return (
        <nav className="justify-between">

            <ul className="flex items-center gap-5">
                {NAV_LINKS.map(({label, to, enabled}) => {
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
            </ul>
        </nav>
    );
}