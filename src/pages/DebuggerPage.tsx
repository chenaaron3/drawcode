import React, { useEffect } from 'react';

import TraceVisualizer from '../components/TraceVisualizer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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
    const {
        getCurrentProblemId,
        setCurrentProblem,
    } = useTraceStore();
    const currentProblemId = getCurrentProblemId();

    // Default to two-sum if no problem is set
    useEffect(() => {
        if (!currentProblemId) {
            setCurrentProblem('two-sum');
        }
    }, [currentProblemId, setCurrentProblem]);



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