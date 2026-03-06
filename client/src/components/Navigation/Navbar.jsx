// import {Link, useLocation, useNavigate} from "react-router-dom";
// import Button from "../ui/Button.jsx";
//
// export default function Navbar(props) {
//     const location = useLocation();
//     const navigate = useNavigate();
//
//     let nav_links = null;
//     if (props.role === "ADMIN") {
//         nav_links = [
//             { label: "Admin Dashboard", to: "/admin-dashboard", enabled: true },
//             { label: "Compare", to: "/compare", enabled: false },
//         ];
//     } else if (props.role === "SCHOOL") {
//         nav_links = [
//             { label: "Dashboard", to: "/dashboard", enabled: true },
//             { label: "Benchmarking Form", to: "/benchmark-form", enabled: false },
//             { label: "Compare", to: "/compare", enabled: false },
//             { label: "School Dashboard", to: "/school-dashboard", enabled: true }
//         ];
//     } else {
//         console.log("error in role, nav_links is null: " + props.role);
//     }
//
//     return (
//         <nav className="justify-between">
//
//             <ul className="flex items-center gap-5">
//                 {nav_links.map(({label, to, enabled}) => {
//                     const isActive = location.pathname === to;
//
//                     if (!enabled) {
//                         return (
//                             <li key={label}>
//                                 {label}
//                             </li>
//                         );
//                     }
//
//                     return (
//                         <li key={label}>
//                             <Link
//                                 to={to}
//                                 className="flex items-center gap-5"
//                                 >
//                                 {label}
//                             </Link>
//                         </li>
//                     );
//                 })}
//                 <Button
//                     className="btn"
//                     onClick={() => {
//                         localStorage.removeItem("token");
//                         navigate("/");
//                     }}
//                 > Log Out
//                 </Button>
//             </ul>
//         </nav>
//     );
// }

import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link, useLocation, useNavigate } from "react-router-dom";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Navbar({ role }) {
    const location = useLocation();
    const navigate = useNavigate();

    let nav_links = [];
    if (role === "ADMIN") {
        nav_links = [
            { label: "Admin Dashboard", to: "/admin-dashboard", enabled: true },
            { label: "Compare", to: "/compare-dashboard", enabled: true },
            { label: "Manage Users", to: "/admin/users", enabled: true },
        ];
    } else if (role === "SCHOOL") {
        nav_links = [
            { label: "Dashboard", to: "/dashboard", enabled: true },
            { label: "Benchmarking Form", to: "/benchmark-form", enabled: false },
            { label: "Form", to: "/form", enabled: true },
            { label: "Compare", to: "/compare", enabled: false },
            { label: "School Dashboard", to: "/school-dashboard", enabled: true },
            { label: "Profile", to: "/profile", enabled: true },
            { label: "Settings", to: "/settings", enabled: true }
        ];
    } else {
        console.log("error in role, nav_links is null: " + role);
    }

    function handleLogout() {
        localStorage.removeItem("token");
        navigate("/");
    }

    return (
        <Disclosure as="nav" className="relative bg-surface-1 border-b border-border">
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">

                    {/* Mobile menu button */}
                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                        <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500">
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Open main menu</span>
                            <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
                            <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
                        </DisclosureButton>
                    </div>

                    {/* Logo + nav links */}
                    <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                        <div className="flex shrink-0 items-center">
                            <div className="flex shrink-0 items-center gap-2">
                                <div className="bg-white rounded-lg">
                                    <img
                                        src="/images/image.png"
                                        alt="School Benchmarking"
                                        className="h-8 w-auto"
                                    />
                            </div>
                                <span className="text-white font-bold text-sm">School Benchmarking</span>
                            </div>
                        </div>

                        <div className="hidden sm:ml-6 sm:block">
                            <div className="flex space-x-4">
                                {nav_links && nav_links.map(({ label, to, enabled }) => {
                                    const isActive = location.pathname === to;

                                    if (!enabled) {
                                        return (
                                            <span
                                                key={label}
                                                className="rounded-md px-3 py-2 text-sm font-medium text-gray-500 cursor-not-allowed"
                                            >
                                                {label}
                                            </span>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={label}
                                            to={to}
                                            aria-current={isActive ? 'page' : undefined}
                                            className={classNames(
                                                // active link
                                                isActive ? 'bg-surface-2 text-white' : 'text-slate-300 hover:bg-surface-2 hover:text-white',
                                                'rounded-md px-3 py-2 text-sm font-medium'
                                            )}
                                        >
                                            {label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right side: bell + profile */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        <button
                            type="button"
                            className="relative rounded-full p-1 text-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
                        >
                            <span className="absolute -inset-1.5" />
                            <span className="sr-only">View notifications</span>
                            <BellIcon aria-hidden="true" className="size-6" />
                        </button>

                        {/* Profile dropdown */}
                        <Menu as="div" className="relative ml-3">
                            <MenuButton className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                                <span className="absolute -inset-1.5" />
                                <span className="sr-only">Open user menu</span>
                                <div className="size-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                                    {role?.[0] ?? "U"}
                                </div>
                            </MenuButton>

                            <MenuItems
                                transition
                                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg outline outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                            >
                                <MenuItem>
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                                    >
                                        Your Profile
                                    </Link>
                                </MenuItem>
                                <MenuItem>
                                    <Link
                                        to="/settings"
                                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                                    >
                                        Settings
                                    </Link>
                                </MenuItem>
                                <div className="border-t border-gray-100 my-1" />
                                <MenuItem>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                                    >
                                        Sign out
                                    </button>
                                </MenuItem>
                            </MenuItems>
                        </Menu>
                    </div>

                </div>
            </div>

            {/* Mobile menu */}
            <DisclosurePanel className="sm:hidden">
                <div className="space-y-1 px-2 pt-2 pb-3">
                    {nav_links.map(({ label, to, enabled }) => {
                        const isActive = location.pathname === to;

                        if (!enabled) {
                            return (
                                <span
                                    key={label}
                                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 cursor-not-allowed"
                                >
                                    {label}
                                </span>
                            );
                        }

                        return (
                            <DisclosureButton
                                key={label}
                                as={Link}
                                to={to}
                                aria-current={isActive ? 'page' : undefined}
                                className={classNames(
                                    isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white',
                                    'block rounded-md px-3 py-2 text-base font-medium'
                                )}
                            >
                                {label}
                            </DisclosureButton>
                        );
                    })}
                </div>
            </DisclosurePanel>
        </Disclosure>
    );
}