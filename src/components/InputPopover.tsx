import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { usePyodide } from '../hooks/usePyodide';
import { useTraceStore } from '../store/traceStore';

interface ProblemData {
    id: string;
    title: string;
    number: number;
    inputs: Record<string, any>;
    entrypoint: string;
    solution: string;
}

interface InputPopoverProps {
    problemData: ProblemData;
    isOpen: boolean;
    onClose: () => void;
}

function ArrayInput({ value, onChange, onValidatorReady }: {
    value: any[],
    onChange: (value: any[]) => void,
    onValidatorReady: (validator: () => { isValid: boolean; value?: any[]; error?: string }) => void
}) {
    const [textValue, setTextValue] = useState(JSON.stringify(value));

    useEffect(() => {
        setTextValue(JSON.stringify(value));
    }, [value]);

    const handleChange = (newText: string) => {
        setTextValue(newText);
        // Always try to parse and update if valid, but don't show errors while typing
        try {
            const parsed = JSON.parse(newText);
            if (Array.isArray(parsed)) {
                onChange(parsed);
            }
        } catch {
            // Silently ignore parsing errors while user is typing
        }
    };

    // Validate the current text value and return if it's valid
    const validateAndGetValue = (): { isValid: boolean; value?: any[]; error?: string } => {
        try {
            const parsed = JSON.parse(textValue);
            if (Array.isArray(parsed)) {
                return { isValid: true, value: parsed };
            } else {
                return { isValid: false, error: 'Value must be an array' };
            }
        } catch {
            return { isValid: false, error: 'Invalid JSON format' };
        }
    };

    // Register validator with parent
    useEffect(() => {
        onValidatorReady(validateAndGetValue);
    }, [textValue, onValidatorReady]);

    return (
        <div className="space-y-1">
            <textarea
                value={textValue}
                onChange={(e) => handleChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm min-h-[60px]"
                placeholder="[1, 2, 3]"
            />
            <p className="text-xs text-gray-500">
                Enter a valid JSON array, e.g., [1, 2, 3] or ["a", "b", "c"]
            </p>
        </div>
    );
}

export default function InputPopover({ problemData, isOpen, onClose }: InputPopoverProps) {
    const { generateTrace, loadTracer, pyodide } = usePyodide();
    const { setInputOverride, getInputOverrides, setTraceData, setCurrentProblem } = useTraceStore();

    const [localInputs, setLocalInputs] = useState<Record<string, any>>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tracerReady, setTracerReady] = useState(false);
    const [arrayValidators, setArrayValidators] = useState<Record<string, () => { isValid: boolean; value?: any[]; error?: string }>>({});

    // Initialize local inputs with overrides or default values
    useEffect(() => {
        if (isOpen) {
            // Set current problem to ensure we're tracking the right overrides
            setCurrentProblem(problemData.id);
            const overrides = getInputOverrides();
            const initialInputs = { ...problemData.inputs, ...overrides };
            setLocalInputs(initialInputs);
            setError(null);
            setArrayValidators({});
        }
    }, [isOpen, problemData]);

    // Initialize tracer when pyodide is ready
    useEffect(() => {
        if (pyodide && !tracerReady) {
            loadTracer()
                .then(() => setTracerReady(true))
                .catch((err) => setError(`Failed to load tracer: ${err.message}`));
        }
    }, [pyodide, tracerReady, loadTracer]);

    const updateInput = (key: string, value: any) => {
        setLocalInputs(prev => ({ ...prev, [key]: value }));
    };

    const registerArrayValidator = (key: string, validator: () => { isValid: boolean; value?: any[]; error?: string }) => {
        setArrayValidators(prev => ({ ...prev, [key]: validator }));
    };

    const parseValue = (rawValue: string, originalType: string) => {
        if (originalType === 'number') {
            const parsed = parseFloat(rawValue);
            return isNaN(parsed) ? 0 : parsed;
        }
        if (originalType === 'boolean') {
            return rawValue.toLowerCase() === 'true';
        }
        if (originalType === 'object' || originalType === 'array') {
            try {
                const parsed = JSON.parse(rawValue);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                // If JSON parsing fails, try to return the original array or empty array
                return [];
            }
        }
        return rawValue;
    };

    const getInputType = (value: any): string => {
        if (typeof value === 'number') return 'number';
        if (typeof value === 'boolean') return 'boolean';
        if (Array.isArray(value)) return 'array';
        return 'string';
    };

    const handleSaveAndGenerate = async () => {
        if (!tracerReady) {
            setError('Tracer not ready. Please wait...');
            return;
        }

        // Validate all arrays before proceeding
        const arrayValidationErrors: string[] = [];
        const finalInputs = { ...localInputs };

        for (const [key, validator] of Object.entries(arrayValidators)) {
            const validation = validator();
            if (!validation.isValid) {
                arrayValidationErrors.push(`${key}: ${validation.error}`);
            } else if (validation.value) {
                finalInputs[key] = validation.value;
            }
        }

        if (arrayValidationErrors.length > 0) {
            setError(`Array validation errors:\n${arrayValidationErrors.join('\n')}`);
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            // Save overrides to store
            Object.entries(finalInputs).forEach(([key, value]) => {
                setInputOverride(key, value);
            });

            // Generate trace with new inputs
            const traceData = await generateTrace(problemData.solution, problemData.entrypoint, finalInputs);

            if (traceData.error) {
                setError(traceData.error);
            } else {
                console.log(traceData);
                setTraceData(traceData);
                onClose();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate trace');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleReset = () => {
        setLocalInputs({ ...problemData.inputs });
        setArrayValidators({});
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-[500px] max-h-[80vh] overflow-y-auto">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Edit Inputs - {problemData.number}. {problemData.title}</span>
                        <Button variant="outline" size="sm" onClick={onClose}>×</Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Object.entries(localInputs).map(([key, value]) => {
                        const inputType = getInputType(value);

                        return (
                            <div key={key} className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    {key} ({inputType})
                                </label>

                                {inputType === 'array' ? (
                                    <ArrayInput
                                        value={value}
                                        onChange={(newValue) => updateInput(key, newValue)}
                                        onValidatorReady={(validator) => registerArrayValidator(key, validator)}
                                    />
                                ) : inputType === 'boolean' ? (
                                    <select
                                        value={value.toString()}
                                        onChange={(e) => updateInput(key, e.target.value === 'true')}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="true">true</option>
                                        <option value="false">false</option>
                                    </select>
                                ) : (
                                    <input
                                        type={inputType === 'number' ? 'number' : 'text'}
                                        value={value.toString()}
                                        onChange={(e) => updateInput(key, parseValue(e.target.value, inputType))}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                )}

                            </div>
                        );
                    })}

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm whitespace-pre-line">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2 pt-4">
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            className="flex-1"
                        >
                            Reset to Defaults
                        </Button>
                        <Button
                            onClick={handleSaveAndGenerate}
                            disabled={isGenerating || !tracerReady}
                            className="flex-1"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Generating...
                                </>
                            ) : (
                                'Apply & Generate Trace'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 