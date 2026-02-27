export default function Input({ className = "", ...props }) {
    return (
        <input
            className={[
                "w-full rounded-lg px-3 py-2 text-sm transition",

                // Light mode
                "bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400",
                "focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal",

                // Dark mode
                "dark:bg-slate-900/60 dark:border-white/10 dark:text-slate-100 dark:placeholder:text-slate-400",
                "dark:focus:ring-brand-teal/50 dark:focus:border-brand-teal",

                className,
            ].join(" ")}
            {...props}
        />
    );
}