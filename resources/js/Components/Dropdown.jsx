import { Popover } from '@headlessui/react';
import { Link } from '@inertiajs/react';

const Dropdown = ({ children }) => {
    return <Popover className="relative inline-block">{children}</Popover>;
};

const Trigger = ({ children }) => {
    return (
        <Popover.Button as="div" className="inline-block cursor-pointer">
            {children}
        </Popover.Button>
    );
};

const Content = ({
    align = 'right',
    width = '48',
    contentClasses = 'py-1 bg-white dark:bg-gray-700',
    autoClose = true,
    children,
}) => {
    let anchor = 'bottom end';
    if (align === 'left') anchor = 'bottom start';
    else if (align === 'top-right') anchor = 'top end';
    else if (align === 'top-left') anchor = 'top start';

    let widthClasses = '';
    if (width === '48') {
        widthClasses = 'w-48';
    }

    return (
        <Popover.Panel
            transition
            anchor={anchor}
            className={`z-[100] ${widthClasses} focus:outline-none transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0`}
        >
            {({ close }) => (
                <div
                    className="rounded-md shadow-lg"
                    onClick={(e) => {
                        if (autoClose) {
                            close();
                        } else {
                            e.stopPropagation();
                        }
                    }}
                >
                    <div className={`rounded-md ring-1 ring-black ring-opacity-5 ${contentClasses}`}>
                        {children}
                    </div>
                </div>
            )}
        </Popover.Panel>
    );
};

const DropdownLink = ({ className = '', children, ...props }) => {
    return (
        <Link
            {...props}
            className={
                'block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 dark:text-gray-300 transition duration-150 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-none ' +
                className
            }
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
