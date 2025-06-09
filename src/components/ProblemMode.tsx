import React from 'react';

import { useTraceStore } from '@/store/traceStore';

import DebuggerPage from '../pages/DebuggerPage';
import RoadmapPage from '../pages/RoadmapPage';

const ProblemMode: React.FC = () => {
    const { getCurrentProblemId } = useTraceStore();
    const currentProblemId = getCurrentProblemId();

    if (currentProblemId) {
        return <DebuggerPage />;
    }

    return <RoadmapPage />;
};

export default ProblemMode; 