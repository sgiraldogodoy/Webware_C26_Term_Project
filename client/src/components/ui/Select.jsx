export default function Select({ className = "", children, ...props }) {
    return (
        <select
            className={
                "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm " +
                "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 " +
                className
            }
            {...props}
        >
            {children}
        </select>
    );
}