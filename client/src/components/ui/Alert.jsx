export default function Alert({ variant = "info", className = "", children }) {
    const variants = {
        info: "bg-blue-50 text-blue-800 ring-blue-200",
        success: "bg-green-50 text-green-800 ring-green-200",
        error: "bg-red-50 text-red-800 ring-red-200",
        warning: "bg-yellow-50 text-yellow-900 ring-yellow-200",
    };

    return (
        <div className={`rounded-md p-3 text-sm ring-1 ${variants[variant]} ${className}`}>
            {children}
        </div>
    );
}