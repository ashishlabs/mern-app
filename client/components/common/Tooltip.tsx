import React from 'react';

interface TooltipProps {
    children: React.ReactNode;
    text: string;
    position?: 'top' | 'right' | 'bottom' | 'left';
}

const Tooltip = ({ children, text, position = 'top' }: TooltipProps) => {
    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    };

    return (
        <div className="relative group">
            {children}
            <div className={`absolute ${positionClasses[position]} scale-0 transition-all duration-200 group-hover:scale-100`}>
                <div className="bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
                    {text}
                </div>
            </div>
        </div>
    );
};

export default Tooltip; 