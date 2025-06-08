import React, { useState } from 'react';

import DebuggerPage from '../pages/DebuggerPage';
import RoadmapPage from '../pages/RoadmapPage';

const ProblemMode: React.FC = () => {
    const [showDebugger, setShowDebugger] = useState(false);

    if (showDebugger) {
        return <DebuggerPage />;
    }

    return <RoadmapPage onNavigateToDebugger={() => setShowDebugger(true)} />;
};

export default ProblemMode; 