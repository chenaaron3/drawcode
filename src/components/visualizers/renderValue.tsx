import clsx from 'clsx';
import { Handle, Position } from 'reactflow';

import { PrimitiveBox } from './PrimitiveBox';

import type { ObjectDescriptor } from '@/types/ObjectDescriptor';
interface RenderContext {
    variableName?: string;
}

export function renderValue(
    obj: ObjectDescriptor,
    delta: any,
    context?: RenderContext,
    handleId?: string
) {
    if (!obj) return null;
    if (obj.isCollection) {
        // Use similar styling as PrimitiveBox, but only show the handle dot
        const containerClasses = clsx(
            "border rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 min-w-[50px] lg:min-w-[60px] flex items-center justify-center transition-all duration-200 shadow-sm bg-white relative",
        );
        return (
            <div className={containerClasses} style={{ justifyContent: 'center', zIndex: 1 }}>
                <Handle
                    type="source"
                    position={Position.Right}
                    id={handleId}
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10,
                    }}
                />
            </div>
        );
    }
    // Render primitive for immutables
    return <PrimitiveBox value={obj.value} delta={delta} variableName={context?.variableName} />;
} 