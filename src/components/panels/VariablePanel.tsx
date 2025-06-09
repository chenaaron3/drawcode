import { AnimatePresence, motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { selectCurrentLine, useTraceStore } from '../../store/traceStore';
import { getChangeColors, getVariableColors } from '../visualizers/colors';
import { renderValue } from '../visualizers/renderValue';
import { fadeInScale, fadeInUp } from '../visualizers/variants';

interface VariableItemProps {
    name: string;
    value: any;
    delta: any;
    isComplex?: boolean;
    isAnimating?: boolean;
}

function VariableItem({ name, value, delta, isComplex = false, isAnimating = false }: VariableItemProps) {
    const stepIndex = useTraceStore(state => state.stepIndex);
    const isEvaluating = useTraceStore(state => state.isEvaluating);
    const isChanged = delta !== undefined && stepIndex === 0;
    const changeColors = getChangeColors(isChanged);

    const labelClasses = `
      font-mono text-xs lg:text-sm font-semibold 
      ${changeColors.text}
    `;

    // Choose ring color based on evaluation stage
    const getRingColor = () => {
        if (!isAnimating) return '';
        if (isEvaluating) {
            // Stage 1: evaluating (yellow like highlight)
            return 'ring-2 ring-yellow-400 ring-opacity-70 shadow-lg rounded-lg';
        } else {
            // Stage 2: copying/moving (blue with shadow)
            return 'ring-2 ring-blue-300 ring-opacity-50 shadow-lg rounded-lg';
        }
    };

    // Unified renderer with conditional styling based on complexity
    const containerClasses = `
      flex flex-col items-center transition-all duration-200 border rounded-lg
      ${isComplex ? 'gap-2 lg:gap-3 p-3 lg:p-4' : 'gap-1 lg:gap-2 p-2 lg:p-3'}
      ${getVariableColors(isChanged)}
      ${getRingColor()}
    `;

    return (
        <motion.div
            className={containerClasses}
            {...fadeInUp}
        >
            <div className="flex items-center justify-center gap-2">
                <span className={labelClasses}>{name}</span>
            </div>

            <div>
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={`${name}-${JSON.stringify(value)}`}
                        initial={{ opacity: 1, scale: 1 }}
                        animate={{
                            scale: isAnimating ? 1.05 : 1,
                            opacity: isAnimating ? 0.7 : 1,
                        }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                            scale: {
                                type: "spring",
                                stiffness: 300,
                                damping: 30
                            },
                            opacity: {
                                duration: 0.3
                            }
                        }}
                        style={{
                            transformOrigin: "center center",
                        }}
                    >
                        <div className={getRingColor()}>
                            {renderValue(value, delta, {
                                variableName: name
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

function FinalResult({ result }: { result: any }) {
    return (
        <motion.div {...fadeInScale}>
            <Separator className="my-4 lg:my-6" />
            <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100/30 shadow-sm">
                <CardContent className="pt-3 lg:pt-4">
                    <div className="flex items-center gap-2 mb-2 lg:mb-3">
                        <div className="w-1.5 lg:w-2 h-1.5 lg:h-2 bg-emerald-500 rounded-full" />
                        <span className="font-semibold text-emerald-800 text-sm lg:text-base">Final Result</span>
                    </div>
                    <div className="font-mono text-xs lg:text-sm bg-white/60 p-2 lg:p-3 rounded-md border border-emerald-200">
                        {JSON.stringify(result)}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function EmptyState() {
    return (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
            No variables in scope
        </div>
    );
}

export default function VariablePanel() {
    const { lineIndex: line, maxLine: maxStep, traceData } = useTraceStore();
    const current = useTraceStore(selectCurrentLine);
    const animatingVariable = useTraceStore(state => state.animatingVariable);

    if (!traceData || !current) return null;

    const variables = Object.entries(current.locals);
    const isSimpleValue = (value: any) => {
        return typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean' ||
            value === null ||
            value === undefined;
    };

    const simpleVars = variables.filter(([_, value]) => isSimpleValue(value));
    const complexVars = variables.filter(([_, value]) => !isSimpleValue(value));
    const hasVariables = variables.length > 0;
    const showFinalResult = line === maxStep;

    return (
        <div className="h-full flex flex-col">
            <Card className="h-full flex flex-col overflow-visible">
                <CardHeader className="pb-3 flex-shrink-0">
                    <CardTitle className="text-base lg:text-lg">Variables</CardTitle>
                </CardHeader>

                <CardContent className="flex-1 min-h-0 overflow-visible">
                    <div className="h-full overflow-y-auto overflow-x-visible space-y-4">
                        {!hasVariables ? (
                            <EmptyState />
                        ) : (
                            <>
                                {/* Simple Variables */}
                                {simpleVars.length > 0 && (
                                    <div className="flex flex-wrap gap-6 items-start p-2">
                                        {simpleVars.map(([name, value]) => (
                                            <div key={name} className="p-1">
                                                <VariableItem
                                                    name={name}
                                                    value={value}
                                                    delta={current.delta?.[name]}
                                                    isAnimating={animatingVariable === name}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Complex Variables */}
                                {complexVars.length > 0 && (
                                    <>
                                        {simpleVars.length > 0 && <Separator />}
                                        <div className="flex flex-wrap gap-6 items-start p-2">
                                            {complexVars.map(([name, value]) => (
                                                <div key={name} className="p-1">
                                                    <VariableItem
                                                        name={name}
                                                        value={value}
                                                        delta={current.delta?.[name]}
                                                        isComplex
                                                        isAnimating={animatingVariable === name}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {showFinalResult && <FinalResult result={traceData.result} />}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 