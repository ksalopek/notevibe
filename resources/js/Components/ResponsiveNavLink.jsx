import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-primary-400 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 focus:border-primary-700 dark:focus:border-primary-500 focus:bg-primary-100 dark:focus:bg-primary-900 focus:text-primary-800 dark:focus:text-primary-200'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 focus:border-gray-300 dark:focus:border-gray-700 focus:bg-gray-50 dark:focus:bg-gray-800 focus:text-gray-800 dark:focus:text-gray-200'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
