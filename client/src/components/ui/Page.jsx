export default function Page({ children, className = "" }, centered = true) {
    return (
        <div
            className={[
                "min-h-screen flex items-center justify-center p-4",
                "bg-glow text-slate-900",
                "dark:bg-glow-dark dark:text-slate-700",
                className,
            ].join(" ")}
        >
            {children}
        </div>
    );
}