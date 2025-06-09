import React from 'react';
import { PanelResizeHandle } from 'react-resizable-panels';

interface ResizeHandleProps {
    direction?: 'horizontal' | 'vertical';
    className?: string;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
    direction = 'horizontal',
    className = ''
}) => {
    return (
        <PanelResizeHandle
            className={`
                group relative flex items-center justify-center
                ${direction === 'horizontal'
                    ? 'w-2 cursor-col-resize'
                    : 'h-2 cursor-row-resize'
                }
                bg-transparent hover:bg-primary/20 hover:rounded-md 
                transition-all duration-200 ease-out
                ${className}
            `}
        >
            {/* Visual indicator - only visible on hover */}
            <div className={`
                opacity-0 group-hover:opacity-100 
                group-hover/stacked:opacity-30 group-hover/overlay:opacity-30 
                group-hover/normal:opacity-30 group-hover/execution:opacity-30
                bg-primary/60 rounded-full transition-all duration-200 ease-out
                ${direction === 'horizontal'
                    ? 'w-0.5 h-8'
                    : 'h-0.5 w-8'
                }
            `} />

            {/* Invisible hover area for easier grabbing */}
            <div className={`
                absolute 
                ${direction === 'horizontal'
                    ? 'w-6 h-full -left-2'
                    : 'h-6 w-full -top-2'
                }
            `} />
        </PanelResizeHandle>
    );
};

export default ResizeHandle; 