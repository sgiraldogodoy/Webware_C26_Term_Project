// export default function FormField({ label, help, error, children }) {
//     return (
//         <div className="space-y-1">
//             {label && <label className="text-sm font-medium text-gray-800 ">{label}</label>}
//             {children}
//             {help && !error && <p className="text-xs text-gray-500">{help}</p>}
//             {error && <p className="text-xs text-red-600">{error}</p>}
//         </div>
//     );
// }

export default function FormField({ label, help, error, children }) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label
                    className="
            text-sm font-medium
            text-slate-700
            dark:text-slate-200
          "
                >
                    {label}
                </label>
            )}

            {children}

            {help && !error && (
                <p
                    className="
            text-xs
            text-slate-500
            dark:text-slate-400
          "
                >
                    {help}
                </p>
            )}

            {error && (
                <p
                    className="
            text-xs
            text-rose-600
            dark:text-rose-400
          "
                >
                    {error}
                </p>
            )}
        </div>
    );
}