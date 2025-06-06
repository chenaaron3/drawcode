import { Code, Map } from 'lucide-react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button } from './ui/button';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine current view based on route
    const currentView = location.pathname === '/roadmap' ? 'roadmap' : 'debugger';

    const handleViewChange = (view: 'roadmap' | 'debugger') => {
        if (view === 'roadmap') {
            navigate('/roadmap');
        } else {
            navigate('/debugger');
        }
    };

    return (
        <div className="border-b bg-card">
            <div className="container mx-auto p-2 lg:p-4">
                <div className="flex items-center justify-between">
                    {/* Title */}
                    <h1 className="text-lg lg:text-xl font-bold text-foreground">
                        Leetcode Guide
                    </h1>

                    {/* Centered Navigation */}
                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                        <Button
                            variant={currentView === 'roadmap' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => handleViewChange('roadmap')}
                            className="h-8 px-3"
                        >
                            <Map className="h-4 w-4 mr-1" />
                            Roadmap
                        </Button>
                        <Button
                            variant={currentView === 'debugger' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => handleViewChange('debugger')}
                            className="h-8 px-3"
                        >
                            <Code className="h-4 w-4 mr-1" />
                            Debugger
                        </Button>
                    </div>

                    {/* Empty space for balance */}
                    <div className="w-32"></div>
                </div>
            </div>
        </div>
    );
};

export default Header; 