import React from 'react';

export default function Tooltip({ content, children, className = '', placement = 'bottom' }) {
    let positionClasses = "top-full mt-2 left-1/2 -translate-x-1/2 translate-y-1 group-hover/tooltip:translate-y-0";
    
    if (placement === 'bottom-right' || placement === 'right') {
        positionClasses = "top-full mt-2 right-0 translate-x-0 translate-y-1 group-hover/tooltip:translate-y-0";
    } else if (placement === 'bottom-left' || placement === 'left') {
        positionClasses = "top-full mt-2 left-0 translate-x-0 translate-y-1 group-hover/tooltip:translate-y-0";
    } else if (placement === 'top') {
        positionClasses = "bottom-full mb-2 left-1/2 -translate-x-1/2 -translate-y-1 group-hover/tooltip:translate-y-0";
    } else if (placement === 'top-right') {
        positionClasses = "bottom-full mb-2 right-0 translate-x-0 -translate-y-1 group-hover/tooltip:translate-y-0";
    } else if (placement === 'top-left') {
        positionClasses = "bottom-full mb-2 left-0 translate-x-0 -translate-y-1 group-hover/tooltip:translate-y-0";
    }

    return (
        <div className={`relative group/tooltip inline-flex items-center justify-center ${className}`}>
            {children}
            {content && (
                <div className={`absolute px-3 py-1.5 bg-gray-900/90 dark:bg-gray-100/90 text-white dark:text-gray-900 text-xs font-medium rounded shadow-xl backdrop-blur-sm opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 ${positionClasses}`}>
                    {content}
                </div>
            )}
        </div>
    );
}
