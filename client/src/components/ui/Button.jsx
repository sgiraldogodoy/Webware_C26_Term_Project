export default function Button({
                                   variant = "primary",
                                   size = "md",
                                   className = "",
                                   ...props
                               }) {
    const base =
        "inline-flex items-center justify-center rounded-md font-semibold transition " +
        "focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-sky-900 dark:bg-sky-700 text-white hover:bg-sky-700 dark:hover:bg-sky-500 focus:ring-sky-600",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400",
        outline: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus:ring-gray-400",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400",
    };

    const sizes = {
        sm: "text-sm px-3 py-1.5",
        md: "text-sm px-4 py-2",
        lg: "text-base px-5 py-2.5",
    };

    return (
        <button
            className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        />
    );
}