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
                    ? 'w-2 hover:w-3 cursor-col-resize'
                    : 'h-2 hover:h-3 cursor-row-resize'
                }
                bg-transparent hover:bg-primary/20 transition-all duration-300 ease-out
                ${className}
            `}
        >
            {/* Visual indicator - only visible on hover */}
            <div className={`
                opacity-0 group-hover:opacity-100 
                group-hover/stacked:opacity-30 group-hover/overlay:opacity-30 
                group-hover/normal:opacity-30 group-hover/execution:opacity-30
                bg-primary/60 transition-all duration-300 ease-out
                ${direction === 'horizontal'
                    ? 'w-px h-8 group-hover:h-12'
                    : 'h-px w-8 group-hover:w-12'
                }
            `} />

            {/* Invisible hover area for easier grabbing */}
            <div className={`
                absolute 
                ${direction === 'horizontal'
                    ? 'w-4 h-full -left-2'
                    : 'h-4 w-full -top-2'
                }
            `} />
        </PanelResizeHandle>
    );
};

export default ResizeHandle; 