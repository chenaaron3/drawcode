import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import TraceVisualizer from '../components/TraceVisualizer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { usePyodide } from '../hooks/usePyodide';
import { useTraceStore } from '../store/traceStore';

interface ErrorDisplayProps {
    error: string;
}

function ErrorDisplay({ error }: ErrorDisplayProps) {
    return (
        <Card className="border-l-4 border-l-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">
                    Error Loading Trace
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{error}</p>
            </CardContent>
        </Card>
    );
}

const DebuggerPage: React.FC = () => {
    const { problemId } = useParams<{ problemId: string }>();
    const {
        getCurrentProblemId,
        setCurrentProblem,
        setCurrentCode,
        setTraceData,
    } = useTraceStore();

    const { generateTrace, isLoading: pyodideLoading } = usePyodide();
    const currentProblemId = getCurrentProblemId();

    // Set problem from URL parameter if provided, or default if none specified
    useEffect(() => {
        if (problemId && problemId !== currentProblemId) {
            // URL has a problemId and it's different from current - use URL
            setCurrentProblem(problemId);
        } else if (!currentProblemId && !problemId) {
            // No problem in store and no URL param - default to two-sum
            setCurrentProblem('two-sum');
        }
        // If currentProblemId exists but no URL param, keep the current problem (from store)
    }, [problemId, currentProblemId, setCurrentProblem]);

    // Handle shared code from URL parameters (existing functionality)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const codeParam = urlParams.get('code');

        if (codeParam && !pyodideLoading) {
            const compileSharedCode = async () => {
                try {
                    const decodedCode = decodeURIComponent(atob(codeParam));
                    console.log('Pyodide ready, compiling shared code...');

                    // Use sandbox problem for shared code
                    setCurrentProblem('sandbox');
                    setCurrentCode(decodedCode);

                    // Auto-compile if we have problem data
                    const problemsJson = await import('../data/problems.json');
                    const problemData = problemsJson.problems.find(p => p.id === 'sandbox');

                    if (problemData) {
                        const traceData = await generateTrace(
                            decodedCode,
                            problemData.entrypoint,
                            problemData.inputs,
                            problemData.inputs
                        );

                        if (!traceData.error) {
                            setTraceData(traceData);
                            console.log('Shared code compiled successfully');
                        } else {
                            console.error('Error compiling shared code:', traceData.error);
                        }
                    }
                } catch (err) {
                    console.error('Failed to compile shared code:', err);
                }
            };

            compileSharedCode();
            // Clear the URL parameter to avoid reloading the shared code on refresh
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, [pyodideLoading, generateTrace, setTraceData, setCurrentProblem, setCurrentCode]);

    if (!currentProblemId) {
        return <ErrorDisplay error="No problem selected" />;
    }

    return (
        <div className="px-4 lg:px-24 w-full p-6 my-auto min-h-[calc(100vh-120px)] lg:h-[90vh] overflow-visible">
            <TraceVisualizer />
        </div>
    );
};

export default DebuggerPage; 