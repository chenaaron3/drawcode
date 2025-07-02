import clsx from 'clsx';
import { motion } from 'framer-motion';
import React from 'react';

import { selectCurrentLine, useTraceStore } from '../../store/traceStore';
import { getVisualizerStyles } from './colors';
import { renderValue } from './renderValue';
import { valueVariants } from './variants';

import type { ObjectDescriptor } from "@/types/ObjectDescriptor";
// Helper function for popover state-based styling
interface PopoverState {
    isEvaluating?: boolean;
    isAnimating?: boolean;
    hasChanged?: boolean;
}

function getPopoverStyles(state: PopoverState, type: 'key' | 'value') {
    const { isEvaluating, isAnimating, hasChanged } = state;

    if (isEvaluating) {
        return {
            container: 'bg-orange-500 text-white shadow-lg shadow-orange-300/50 ring-2 ring-orange-300',
            arrowTop: 'border-l-orange-500', // Key popover arrow points right
            arrowBottom: 'border-r-orange-500' // Value popover arrow points left
        };
    } else if (isAnimating) {
        return {
            container: 'bg-purple-500 text-white shadow-lg shadow-purple-300/50 ring-2 ring-purple-300',
            arrowTop: 'border-l-purple-500',
            arrowBottom: 'border-r-purple-500'
        };
    } else if (hasChanged) {
        return {
            container: 'bg-green-500 text-white shadow-lg shadow-green-300/50 ring-2 ring-green-300',
            arrowTop: 'border-l-green-500',
            arrowBottom: 'border-r-green-500'
        };
    } else {
        return {
            container: type === 'key' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white',
            arrowTop: type === 'key' ? 'border-l-blue-600' : '', // Key popover arrow
            arrowBottom: type === 'value' ? 'border-r-green-600' : '' // Value popover arrow
        };
    }
}

interface DictionaryVisualizerProps {
    entries: { key: string, value: ObjectDescriptor }[];
    delta?: Record<string, any>;
    variableName?: string;
}

interface ArrowInfo {
    key: string;
    type: 'key' | 'value';
    cursorName: string;
    cursorValue: any;
}

interface PopoverProps {
    arrow: ArrowInfo;
    type: 'key' | 'value';
}

function KeyPopover({ arrow }: PopoverProps) {
    const { animatingVariable, isEvaluating, stepIndex } = useTraceStore();
    const current = useTraceStore(selectCurrentLine);
    const isAnimating = animatingVariable === arrow.cursorName;
    const isEvaluatingThis = isEvaluating && animatingVariable === arrow.cursorName;
    const hasChanged = current?.delta?.[arrow.cursorName] !== undefined && stepIndex === 0;

    const styles = getPopoverStyles({ isEvaluating: isEvaluatingThis, isAnimating, hasChanged }, 'key');

    return (
        <motion.div
            layoutId={`dict-key-popover-${arrow.cursorName}`}
            className="absolute -left-8 top-1/2 transform -translate-y-1/2 z-50 pointer-events-none"
            initial={{ opacity: 0, scale: 0.8, x: 10 }}
            animate={{
                opacity: 1,
                scale: isEvaluatingThis ? [1, 1.1, 1] : 1,
                x: 0
            }}
            exit={{ opacity: 0, scale: 0.8, x: 10 }}
            transition={{
                duration: 0.2,
                scale: isEvaluatingThis ? {
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: 'reverse'
                } : {}
            }}
            data-variable={arrow.cursorName}
        >
            <div className={clsx(
                "px-2 py-1 rounded-md text-xs font-mono font-medium shadow-md transition-all duration-200",
                styles.container
            )}>
                {arrow.cursorName}
            </div>
            <div className={clsx(
                "absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent",
                styles.arrowTop
            )} />
        </motion.div>
    );
}

function ValuePopover({ arrow }: PopoverProps) {
    const { animatingVariable, isEvaluating, stepIndex } = useTraceStore();
    const current = useTraceStore(selectCurrentLine);
    const isAnimating = animatingVariable === arrow.cursorName;
    const isEvaluatingThis = isEvaluating && animatingVariable === arrow.cursorName;
    const hasChanged = current?.delta?.[arrow.cursorName] !== undefined && stepIndex === 0;

    const styles = getPopoverStyles({ isEvaluating: isEvaluatingThis, isAnimating, hasChanged }, 'value');

    return (
        <motion.div
            layoutId={`dict-value-popover-${arrow.cursorName}`}
            className="absolute -right-8 top-1/2 transform -translate-y-1/2 z-50 pointer-events-none"
            initial={{ opacity: 0, scale: 0.8, x: -10 }}
            animate={{
                opacity: 1,
                scale: isEvaluatingThis ? [1, 1.1, 1] : 1,
                x: 0
            }}
            exit={{ opacity: 0, scale: 0.8, x: -10 }}
            transition={{
                duration: 0.2,
                scale: isEvaluatingThis ? {
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: 'reverse'
                } : {}
            }}
            data-variable={arrow.cursorName}
        >
            <div className={clsx(
                "absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent",
                styles.arrowBottom
            )} />
            <div className={clsx(
                "px-2 py-1 rounded-md text-xs font-mono font-medium shadow-md transition-all duration-200",
                styles.container
            )}>
                {arrow.cursorName}
            </div>
        </motion.div>
    );
}

interface DictionaryEntryProps {
    entryKey: string;
    value: ObjectDescriptor;
    delta?: any;
    arrows: ArrowInfo[];
}

function DictionaryEntry({ entryKey, value, delta, arrows }: DictionaryEntryProps) {
    const stepIndex = useTraceStore(state => state.stepIndex);
    const isChanged = delta !== undefined && stepIndex === 0;

    const keyArrows = arrows.filter(arrow => arrow.key === entryKey && arrow.type === 'key');
    const valueArrows = arrows.filter(arrow => arrow.key === entryKey && arrow.type === 'value');
    const hasKeyArrow = keyArrows.length > 0;

    const containerClasses = clsx(
        "flex items-center gap-2 p-2 transition-all duration-200 relative overflow-visible",
        isChanged
            ? "gap-2 bg-gradient-to-r from-emerald-50/80 to-green-50/80" // Changed state
            : "gap-2 hover:bg-slate-50/80" // Default hover state
    );

    const keyClasses = clsx(
        "font-mono text-xs font-semibold transition-all duration-200",
        hasKeyArrow
            ? "bg-blue-100 text-blue-800 px-1 py-0.5 rounded" // Highlighted when arrow points to it
            : isChanged ? "text-emerald-800" : "text-slate-800"
    );

    return (
        <div className={containerClasses}>
            {/* Key popovers */}
            {keyArrows.map((arrow, arrowIdx) => (
                <KeyPopover
                    key={`${arrow.cursorName}-key-${arrowIdx}`}
                    arrow={arrow}
                    type="key"
                />
            ))}

            <div className="flex items-center gap-1 flex-shrink-0 relative">
                <span className={keyClasses}>{entryKey}</span>
            </div>
            <div className="flex-1 relative flex items-center">
                {/* Render value (either a handle or primitive) */}
                {value.value && value.value.isCollection
                    ? renderValue(value, delta, undefined, `key-${entryKey}-handle`)
                    : renderValue(value, delta)}
                {/* Value popovers */}
                {valueArrows.map((arrow, arrowIdx) => (
                    <ValuePopover
                        key={`${arrow.cursorName}-value-${arrowIdx}`}
                        arrow={arrow}
                        type="value"
                    />
                ))}
            </div>
        </div>
    );
}

function EmptyDictionary() {
    return (
        <div className="text-slate-500 text-xs italic text-center p-2 bg-slate-50/80">
            Empty
        </div>
    );
}

export const DictionaryVisualizer: React.FC<DictionaryVisualizerProps> = ({
    entries,
    delta,
    variableName
}) => {
    const { stepIndex, isEvaluating, animatingVariable } = useTraceStore();
    const isChanged = delta !== undefined && stepIndex === 0;
    const isAnimating = animatingVariable === variableName;
    const isEvaluatingThis = isEvaluating && animatingVariable === variableName;

    const traceData = useTraceStore(state => state.traceData);
    const current = useTraceStore(selectCurrentLine);

    const relationships = traceData?.relationships || [];
    const currentLocals = current?.locals || {};

    const getArrowInfo = (): ArrowInfo[] => {
        const dictRelationships = relationships.filter(rel =>
            rel.container === variableName &&
            (rel.type === 'dict_key' || rel.type === 'dict_value')
        );

        const arrows: ArrowInfo[] = [];

        dictRelationships.forEach(rel => {
            const cursorValue = currentLocals[rel.cursor];

            if (rel.type === 'dict_key') {
                // For dict keys, the cursor value should match a dictionary key
                if (typeof cursorValue === 'string') {
                    const matchingKey = entries.find(entry => entry.key === cursorValue);
                    if (matchingKey) {
                        arrows.push({
                            key: matchingKey.key!,
                            type: 'key',
                            cursorName: rel.cursor,
                            cursorValue
                        });
                    }
                }
            } else if (rel.type === 'dict_value') {
                // For dict values, find which key has this value
                const matchingKey = entries.find(entry => entry.value === cursorValue);
                if (matchingKey !== undefined) {
                    arrows.push({
                        key: matchingKey.key!,
                        type: 'value',
                        cursorName: rel.cursor,
                        cursorValue
                    });
                }
            }
        });

        return arrows;
    };

    const arrows = getArrowInfo();
    const isEmpty = entries.length === 0;

    const containerClasses = clsx(
        "border rounded-md overflow-visible transition-all duration-200 mx-auto relative",
        getVisualizerStyles({ isEvaluating: isEvaluatingThis, isAnimating, hasChanged: isChanged })
    );

    return (
        <motion.div
            className={containerClasses}
            initial={isChanged ? "initial" : false}
            animate="animate"
            variants={valueVariants}
            data-variable={variableName}
        >
            {isEmpty ? (
                <EmptyDictionary />
            ) : (
                <div className="divide-y divide-slate-200 overflow-visible">
                    {entries.map(entry => (
                        <DictionaryEntry
                            key={entry.key}
                            entryKey={entry.key ?? ''}
                            value={entry.value}
                            delta={delta?.[entry.key as string]}
                            arrows={arrows}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
}; 