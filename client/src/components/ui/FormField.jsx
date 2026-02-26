export default function FormField({ label, help, error, children }) {
    return (
        <div className="space-y-1">
            {label && <label className="text-sm font-medium text-gray-800">{label}</label>}
            {children}
            {help && !error && <p className="text-xs text-gray-500">{help}</p>}
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}