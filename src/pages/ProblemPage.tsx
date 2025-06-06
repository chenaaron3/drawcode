import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { useTraceStore } from '../store/traceStore';

const ProblemPage: React.FC = () => {
    const { problemId } = useParams<{ problemId: string }>();
    const { setCurrentProblem, getAllProblems } = useTraceStore();
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
        if (problemId) {
            // Check if the problem exists
            const allProblems = getAllProblems();
            const problemExists = allProblems.some(p => p.id === problemId);
            if (problemExists) {
                setCurrentProblem(problemId);
                setShouldRedirect(true);
            } else {
                // Problem doesn't exist, redirect immediately
                setShouldRedirect(true);
            }
        }
    }, [problemId]);

    // Only redirect after we've set the problem
    if (shouldRedirect) {
        return <Navigate to="/debugger" replace />;

    }

    // Show loading or nothing while setting up
    return null;
};

export default ProblemPage;
