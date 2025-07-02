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
            arrowTop: 'border-t-orange-500',
            arrowBottom: 'border-b-orange-500'
        };
    } else if (isAnimating) {
        return {
            container: 'bg-purple-500 text-white shadow-lg shadow-purple-300/50 ring-2 ring-purple-300',
            arrowTop: 'border-t-purple-500',
            arrowBottom: 'border-b-purple-500'
        };
    } else if (hasChanged) {
        return {
            container: 'bg-green-500 text-white shadow-lg shadow-green-300/50 ring-2 ring-green-300',
            arrowTop: 'border-t-green-500',
            arrowBottom: 'border-b-green-500'
        };
    } else {
        return {
            container: type === 'key' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white',
            arrowTop: type === 'key' ? 'border-t-blue-600' : '',
            arrowBottom: type === 'value' ? 'border-b-green-600' : ''
        };
    }
}

interface ArrayVisualizerProps {
    values: ObjectDescriptor[];
    delta?: any[];
    variableName?: string; // Name of this array variable
}

interface ArrowInfo {
    index: number;
    type: 'key' | 'value';
    cursorName: string;
    cursorValue: any;
}

interface PopoverProps {
    arrow: ArrowInfo;
    type: 'key' | 'value';
}

function KeyIndexPopover({ arrow }: PopoverProps) {
    const { animatingVariable, isEvaluating, stepIndex } = useTraceStore();
    const current = useTraceStore(selectCurrentLine);
    const isAnimating = animatingVariable === arrow.cursorName;
    const isEvaluatingThis = isEvaluating && animatingVariable === arrow.cursorName;
    const hasChanged = current?.delta?.[arrow.cursorName] !== undefined && stepIndex === 0;

    const styles = getPopoverStyles({ isEvaluating: isEvaluatingThis, isAnimating, hasChanged }, 'key');

    return (
        <motion.div
            layoutId={`key-popover-${arrow.cursorName}`}
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{
                opacity: 1,
                scale: isEvaluatingThis ? [1, 1.1, 1] : 1, // Animate scale only when evaluating
                y: 0
            }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
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
                "absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent",
                styles.arrowTop
            )} />
        </motion.div>
    );
}

function ValueIndexPopover({ arrow }: PopoverProps) {
    const { animatingVariable, isEvaluating, stepIndex } = useTraceStore();
    const current = useTraceStore(selectCurrentLine);
    const isAnimating = animatingVariable === arrow.cursorName;
    const isEvaluatingThis = isEvaluating && animatingVariable === arrow.cursorName;
    const hasChanged = current?.delta?.[arrow.cursorName] !== undefined && stepIndex === 0;

    const styles = getPopoverStyles({ isEvaluating: isEvaluatingThis, isAnimating, hasChanged }, 'value');

    return (
        <motion.div
            layoutId={`value-popover-${arrow.cursorName}`}
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{
                opacity: 1,
                scale: isEvaluatingThis ? [1, 1.1, 1] : 1, // Animate scale only when evaluating
                y: 0
            }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
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
                "absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent",
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

interface ArrayItemProps {
    item: ObjectDescriptor;
    index: number;
    delta?: any;
    arrows: ArrowInfo[];
}

function ArrayItem({ item, index, delta, arrows }: ArrayItemProps) {
    const itemArrows = arrows.filter(arrow => arrow.index === index);
    const hasKeyArrow = itemArrows.some(arrow => arrow.type === 'key');
    const keyArrows = itemArrows.filter(arrow => arrow.type === 'key');
    const valueArrows = itemArrows.filter(arrow => arrow.type === 'value');

    const indexClasses = clsx(
        "text-xs font-mono px-1 py-0.5 rounded text-center min-w-[18px] lg:min-w-[20px] leading-none transition-all duration-200",
        hasKeyArrow
            ? "bg-blue-100 text-blue-800 font-semibold" // Highlighted when arrow points to it
            : "bg-slate-100 text-slate-500" // Default state
    );

    return (
        <div className="flex flex-col items-center gap-0.5 relative">
            {/* Key index popovers */}
            {keyArrows.map((arrow, arrowIdx) => (
                <KeyIndexPopover
                    key={`${arrow.cursorName}-key-${arrowIdx}`}
                    arrow={arrow}
                    type="key"
                />
            ))}

            {/* Index label */}
            <span className={indexClasses}>{index}</span>

            {/* Value with popovers */}
            <div className="transition-all h-full duration-200 relative flex items-center">
                {/* Render value (either a handle or primitive) */}
                {item && item.isCollection
                    ? renderValue(item, delta, undefined, `item-${index}-handle`)
                    : renderValue(item, delta)}
                {/* Value index popovers */}
                {valueArrows.map((arrow, arrowIdx) => (
                    <ValueIndexPopover
                        key={`${arrow.cursorName}-value-${arrowIdx}`}
                        arrow={arrow}
                        type="value"
                    />
                ))}
            </div>
        </div>
    );
}

function EmptyArray() {
    return (
        <div className="text-slate-500 text-xs italic text-center py-1 px-2 bg-slate-50/80 border-slate-200/60 rounded">
            Empty
        </div>
    );
}

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({
    values,
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
        const arrayRelationships = relationships.filter(rel =>
            rel.container === variableName &&
            (rel.type === 'key_index' || rel.type === 'key_access' || rel.type === 'value_index')
        );

        const arrows: ArrowInfo[] = [];

        arrayRelationships.forEach(rel => {
            const cursorValue = currentLocals[rel.cursor];
            if (rel.type === 'key_index' || rel.type === 'key_access') {
                if (typeof cursorValue === 'number' && cursorValue >= 0 && cursorValue < values.length) {
                    arrows.push({
                        index: cursorValue,
                        type: 'key',
                        cursorName: rel.cursor,
                        cursorValue
                    });
                }
            } else if (rel.type === 'value_index') {
                const valueIndex = values.findIndex(val => val.value === cursorValue);
                if (valueIndex !== -1) {
                    arrows.push({
                        index: valueIndex,
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
    const isEmpty = values.length === 0;

    const containerClasses = clsx(
        "inline-block border rounded-md p-1.5 lg:p-2 transition-all duration-200 relative self-start",
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
                <EmptyArray />
            ) : (
                <div className="flex flex-wrap gap-0.5 lg:gap-1">
                    {values.map((item, idx) => (
                        <ArrayItem
                            key={item ? item.id : idx}
                            item={item}
                            index={idx}
                            delta={delta && delta[idx]}
                            arrows={arrows}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
}; 