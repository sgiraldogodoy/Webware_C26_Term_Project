import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import FormField from "../components/ui/FormField";
import Navbar from "../components/Navigation/Navbar.jsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../components/ui/Card.jsx";
import Page from "../components/ui/Page.jsx";
import Layout from "../components/ui/Layout.jsx";

const TEAL = "rgb(0,139,139)";
const NAVY = "rgb(3,68,122)";
const NAVY2 = "rgb(1,50,90)";

export default function HomePage() {
    const navigate = useNavigate();


    return (
        <div style={{ height: "100vh", overflow: "hidden" }}>
        <Layout role={null} title="School Dashboard">
                <h1 style={{
                    fontSize: "clamp(42px, 8vw, 80px)",
                    fontWeight: 900,
                    color: "#fff",
                    lineHeight: 1.1,
                    margin: 0,
                    maxWidth: 800
                }}>
                    School benchmarking,<br />
                    <span style={{ color: "rgb(19,48,87)" }}>made simple.</span>
                </h1>
            <button
                className={[ // took theme from card component and customized
                    "mt-2",
                    "px-10 py-3",            // padding
                    "text-[15px] font-extrabold",
                    "rounded-full",
                    "bg-white/50 ring-1 ring-slate-200 shadow-lg",
                    "dark:bg-slate-900/50 dark:ring-white/10 dark:shadow-black/40 dark:text-slate-50",
                    "backdrop-blur-md"
                ].join(" ")}
                style={{ color: NAVY }}     // keep your variable here
                onClick={() => navigate("/login")}
            >
                Get Started →
            </button>
        </Layout>
        </div>
    );
}
