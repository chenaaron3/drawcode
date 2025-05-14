import { ArrayVisualizer } from './ArrayVisualizer';
import { DictionaryVisualizer } from './DictionaryVisualizer';
import { PrimitiveBox } from './PrimitiveBox';

export function renderValue(val: any, isNew: boolean = false) {
    if (Array.isArray(val)) {
        return <ArrayVisualizer values={val} isNew={isNew} />;
    }
    if (val && typeof val === 'object') {
        return <DictionaryVisualizer dict={val} isNew={isNew} />;
    }
    // primitive
    return <PrimitiveBox value={val} isNew={isNew} />;
} 