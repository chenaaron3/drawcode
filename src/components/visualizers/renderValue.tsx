import { ArrayVisualizer } from './ArrayVisualizer';
import { DictionaryVisualizer } from './DictionaryVisualizer';
import { PrimitiveBox } from './PrimitiveBox';

export function renderValue(val: any, delta: any) {
    if (Array.isArray(val)) {
        return <ArrayVisualizer
            values={val}
            delta={delta}
        />;
    }
    if (val && typeof val === 'object') {
        return <DictionaryVisualizer
            dict={val}
            delta={delta}
        />;
    }
    // primitive
    return <PrimitiveBox value={val} delta={delta} />;
} 