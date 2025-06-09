import React from 'react';

import TraceVisualizer from '@/components/layout/TraceVisualizer';

const DebuggerPage: React.FC = () => {
    return (
        <div className="px-4 lg:px-24 w-full p-6 my-auto min-h-[calc(100vh-120px)] lg:h-[90vh] overflow-visible">
            <TraceVisualizer />
        </div>
    );
};

export default DebuggerPage; 