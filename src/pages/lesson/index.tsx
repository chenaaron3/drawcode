import React, { useState } from 'react';

import { TraceVisualizer } from '@/components/layout';
import CodePanel from '@/components/panels/CodePanel';
import ExecutionPanel from '@/components/panels/ExecutionPanel';

// Simple hook for mobile detection (tailwind md breakpoint ~768px)
function useIsMobile() {
    const [isMobile, setIsMobile] = React.useState(false);
    React.useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    return isMobile;
}

const TABS = [
    { key: 'code', label: 'Code' },
    { key: 'output', label: 'Output' },
] as const;
type TabKey = typeof TABS[number]['key'];

const DebuggerPage: React.FC = () => {
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState<TabKey>('code');

    const renderMobilePanel = () => {
        if (activeTab === 'code') return <CodePanel />;
        if (activeTab === 'output') return <ExecutionPanel />;
        return null;
    };

    return (
        <div className="h-full w-full overflow-hidden relative">
            {isMobile ? (
                <>
                    <div
                        className="absolute left-0 right-0"
                        style={{
                            top: 0,
                            bottom: '4rem', // leave space for tab bar
                            height: 'calc(100vh - 4rem - 4rem)', // header + tab bar
                            marginTop: '4rem', // header height
                            overflowY: 'auto',
                            WebkitOverflowScrolling: 'touch',
                        }}
                    >
                        {renderMobilePanel()}
                    </div>
                    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex justify-around items-center h-16 md:hidden">
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                className={`flex-1 h-full flex flex-col items-center justify-center text-xs font-medium transition-colors ${activeTab === tab.key ? 'text-blue-600' : 'text-slate-500'}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </>
            ) : (
                <div className="px-4 lg:px-24 w-full p-6 my-auto min-h-[calc(100vh-120px)] lg:h-[90vh] overflow-visible">
                    <TraceVisualizer />
                </div>
            )}
        </div>
    );
};

export default DebuggerPage; 