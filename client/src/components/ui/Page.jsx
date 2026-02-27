// export default function Page({ children }) {
//     return (
//         // <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//         //     {children}
//         // </div>
//     );
// }

export default function Page({ children, className = "" }) {
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