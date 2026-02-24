export function Card({ className = "", ...props }) {
    return (
        <div
            className={`rounded-xl bg-white shadow-sm ring-1 ring-gray-200 ${className}`}
            {...props}
        />
    );
}

export function CardHeader({ className = "", ...props }) {
    return <div className={`p-6 pb-3 ${className}`} {...props} />;
}

export function CardTitle({ className = "", ...props }) {
    return <h2 className={`text-xl font-semibold text-gray-900 ${className}`} {...props} />;
}

export function CardDescription({ className = "", ...props }) {
    return <p className={`mt-1 text-sm text-gray-600 ${className}`} {...props} />;
}

export function CardContent({ className = "", ...props }) {
    return <div className={`p-6 pt-3 ${className}`} {...props} />;
}