import clsx from 'clsx';
import { motion } from 'framer-motion';
import React from 'react';

import { selectCurrentLine, useTraceStore } from '../../store/traceStore';
import { getArrayColors, VISUALIZER_COLORS } from './colors';
import { renderValue } from './renderValue';
import { valueVariants } from './variants';

interface ArrayVisualizerProps {
    values: any[];
    delta: any[];
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
    return (
        <motion.div
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
        >
            <div className={`${VISUALIZER_COLORS.relationships.keyIndex.popover} px-2 py-1 rounded-md text-xs font-mono font-medium shadow-md`}>
                {arrow.cursorName}
            </div>
            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${VISUALIZER_COLORS.relationships.keyIndex.arrow}`} />
        </motion.div>
    );
}

function ValueIndexPopover({ arrow }: PopoverProps) {
    return (
        <motion.div
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.2 }}
        >
            <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent ${VISUALIZER_COLORS.relationships.valueIndex.arrow}`} />
            <div className={`${VISUALIZER_COLORS.relationships.valueIndex.popover} px-2 py-1 rounded-md text-xs font-mono font-medium shadow-md`}>
                {arrow.cursorName}
            </div>
        </motion.div>
    );
}

interface ArrayItemProps {
    item: any;
    index: number;
    delta: any;
    arrows: ArrowInfo[];
}

function ArrayItem({ item, index, delta, arrows }: ArrayItemProps) {
    const itemArrows = arrows.filter(arrow => arrow.index === index);
    const hasKeyArrow = itemArrows.some(arrow => arrow.type === 'key');
    const hasValueArrow = itemArrows.some(arrow => arrow.type === 'value');
    const keyArrows = itemArrows.filter(arrow => arrow.type === 'key');
    const valueArrows = itemArrows.filter(arrow => arrow.type === 'value');

    const indexClasses = clsx(
        "text-xs font-mono text-slate-500 px-1 py-0.5 rounded text-center min-w-[20px] leading-none",
        {
            [VISUALIZER_COLORS.relationships.keyIndex.highlight]: hasKeyArrow,
            "bg-slate-100": !hasKeyArrow
        }
    );

    const valueWrapperClasses = clsx("rounded-lg", {
        [`ring-2 ${VISUALIZER_COLORS.relationships.valueIndex.ring} ring-offset-1`]: hasValueArrow,
    });

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
            <div className="transition-all duration-200 relative">
                <div className={valueWrapperClasses}>
                    {renderValue(item, delta)}
                </div>

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
        <div className={`text-slate-500 text-xs italic text-center py-1 px-2 ${VISUALIZER_COLORS.empty.background} rounded ${VISUALIZER_COLORS.empty.border}`}>
            Empty
        </div>
    );
}

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({
    values,
    delta,
    variableName
}) => {
    const isNew = delta !== undefined;
    const traceData = useTraceStore(state => state.traceData);
    const current = useTraceStore(selectCurrentLine);

    const relationships = traceData?.relationships || [];
    const currentLocals = current?.locals || {};

    const getArrowInfo = (): ArrowInfo[] => {
        const arrayRelationships = relationships.filter(rel =>
            rel.container === variableName &&
            (rel.type === 'key_index' || rel.type === 'value_index')
        );

        const arrows: ArrowInfo[] = [];

        arrayRelationships.forEach(rel => {
            const cursorValue = currentLocals[rel.cursor];

            if (rel.type === 'key_index') {
                if (typeof cursorValue === 'number' && cursorValue >= 0 && cursorValue < values.length) {
                    arrows.push({
                        index: cursorValue,
                        type: 'key',
                        cursorName: rel.cursor,
                        cursorValue
                    });
                }
            } else if (rel.type === 'value_index') {
                const valueIndex = values.findIndex(val => val === cursorValue);
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
        "inline-block border rounded-md p-2 transition-all duration-200 relative self-start",
        getArrayColors(isNew)
    );

    return (
        <motion.div
            className={containerClasses}
            initial={isNew ? "initial" : false}
            animate="animate"
            variants={valueVariants}
        >
            {isEmpty ? (
                <EmptyArray />
            ) : (
                <div className="flex flex-wrap gap-1">
                    {values.map((item, idx) => (
                        <ArrayItem
                            key={idx}
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