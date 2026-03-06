export function Card({ className = "", ...props }) {
    return (
        <div
            className={[
                "rounded-2xl",
                // light
                "bg-white/50 ring-1 ring-slate-200 shadow-lg",
                // dark
                "dark:bg-slate-900/50 dark:ring-white/10 dark:shadow-black/40 dark:text-slate-50",
                // blur
                "backdrop-blur-md",
                className,
            ].join(" ")}
            {...props}
        />
    );
}

export function CardHeader({ className = "", ...props }) {
    return <div className={["p-4 pb-2", className].join(" ")} {...props} />;
}

export function CardTitle({ className = "", ...props }) {
    return (
        <h2
            className={[
                "text-xl font-semibold tracking-tight",
                "text-slate-900 dark:text-slate-50",
                className,
            ].join(" ")}
            {...props}
        />
    );
}

export function CardDescription({ className = "", ...props }) {
    return (
        <p
            className={[
                "mt-1 text-sm",
                "text-slate-600 dark:text-slate-300",
                className,
            ].join(" ")}
            {...props}
        />
    );
}

export function CardContent({ className = "", ...props }) {
    return <div className={["p-4 pt-2", className].join(" ")} {...props} />;
}