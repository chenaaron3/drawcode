import React, { useEffect, useState } from 'react';

import { TraceVisualizer } from '@/components/layout';

// Simple hook for mobile detection (tailwind md breakpoint ~768px)
function useIsMobile() {
    const [isMobile, setIsMobile] = React.useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    return isMobile;
}

const DebuggerPage: React.FC = () => {
    const isMobile = useIsMobile();
    return <TraceVisualizer stacked={isMobile} />
};

export default DebuggerPage; 