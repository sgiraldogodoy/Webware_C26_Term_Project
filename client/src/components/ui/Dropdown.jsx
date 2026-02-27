import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

// modified from React website
export default function Dropdown({ value, options, onChange, label }) {
    const selected = options.find(o => o.value === value);

    return (
        <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="inline-flex w-40 justify-between items-center rounded-lg bg-white/90 dark:bg-slate-900/60 backdrop-blur-md px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 hover:bg-white dark:hover:bg-slate-800 transition">
                {selected?.label || label}
                <ChevronDownIcon className="w-4 h-4 text-slate-400" />
            </MenuButton>

            <MenuItems
                transition
                className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-lg focus:outline-none"
            >
                <div className="py-1">
                    {options.map(option => (
                        <MenuItem key={option.value}>
                            {({ active }) => (
                                <button
                                    onClick={() => onChange(option.value)}
                                    className={`block w-full text-left px-4 py-2 text-sm ${
                                        active
                                            ? "bg-slate-100 dark:bg-slate-800"
                                            : ""
                                    }`}
                                >
                                    {option.label}
                                </button>
                            )}
                        </MenuItem>
                    ))}
                </div>
            </MenuItems>
        </Menu>
    );
}