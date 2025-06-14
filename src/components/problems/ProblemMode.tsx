import React from 'react';

import DebuggerPage from '@/pages/DebuggerPage';
import RoadmapPage from '@/pages/RoadmapPage';
import { useTraceStore } from '@/store/traceStore';

const ProblemMode: React.FC = () => {
    const { getCurrentProblemId } = useTraceStore();
    const currentProblemId = getCurrentProblemId();

    return (
        <div className="h-full w-full overflow-hidden">
            {currentProblemId ? <DebuggerPage /> : <RoadmapPage />}
        </div>
    );
};

export default ProblemMode; 