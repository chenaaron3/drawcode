import { ArrayVisualizer } from './ArrayVisualizer';
import { DictionaryVisualizer } from './DictionaryVisualizer';
import { PrimitiveBox } from './PrimitiveBox';

interface RenderContext {
    variableName?: string;
}

function isArray(value: any): value is any[] {
    return Array.isArray(value);
}

function isObject(value: any): value is Record<string, any> {
    return value && typeof value === 'object' && !Array.isArray(value);
}

export function renderValue(value: any, delta: any, context?: RenderContext) {
    if (isArray(value)) {
        return <ArrayVisualizer
            values={value}
            delta={delta}
            variableName={context?.variableName}
        />;
    }
    if (isObject(value)) {
        return <DictionaryVisualizer
            dict={value}
            delta={delta}
        />;
    }
    // primitive
    return <PrimitiveBox value={value} delta={delta} />;
} 