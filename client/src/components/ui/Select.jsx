export default function Select({ className = "", ...props }) {
    return (
        <select
            {...props}
            className={[
                "w-full rounded-lg border px-3 py-2 text-sm",
                "bg-white text-slate-900 border-slate-300",
                "dark:bg-slate-900 dark:text-slate-100 dark:border-white/10",
                "focus:outline-none focus:ring-2 focus:ring-slate-400/40",
                className,
            ].join(" ")}
        />
    );
}