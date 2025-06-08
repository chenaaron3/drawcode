import { Code, Target, Zap } from 'lucide-react';
import React, { useState } from 'react';

import DebuggerPage from '../pages/DebuggerPage';
import RoadmapPage from '../pages/RoadmapPage';

type ProblemView = 'welcome' | 'debugger' | 'roadmap';

const ProblemMode: React.FC = () => {
    const [currentView, setCurrentView] = useState<ProblemView>('welcome');

    if (currentView === 'debugger') {
        return <DebuggerPage />;
    }

    if (currentView === 'roadmap') {
        return <RoadmapPage onNavigateToDebugger={() => setCurrentView('debugger')} />;
    }

    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-lg">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Code className="h-10 w-10 text-purple-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Problem Mode
                </h2>

                <p className="text-gray-600 mb-6">
                    Practice coding challenges and explore the Python debugger with complete freedom.
                    Perfect for experienced learners who want to dive deep into code execution.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <button
                        onClick={() => setCurrentView('debugger')}
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
                    >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 transition-colors">
                            <Target className="h-4 w-4 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-sm text-gray-900 mb-1">
                            Coding Challenges
                        </h3>
                        <p className="text-xs text-gray-600">
                            Solve algorithmic problems with step-by-step debugging
                        </p>
                    </button>

                    <button
                        onClick={() => setCurrentView('debugger')}
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group"
                    >
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-green-200 transition-colors">
                            <Zap className="h-4 w-4 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-sm text-gray-900 mb-1">
                            Free Exploration
                        </h3>
                        <p className="text-xs text-gray-600">
                            Write any Python code and visualize execution
                        </p>
                    </button>

                    <button
                        onClick={() => setCurrentView('roadmap')}
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group"
                    >
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-purple-200 transition-colors">
                            <Code className="h-4 w-4 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-sm text-gray-900 mb-1">
                            Learning Roadmap
                        </h3>
                        <p className="text-xs text-gray-600">
                            Explore the structured learning path
                        </p>
                    </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        🎉 <strong>Now Available:</strong> Your existing debugger and roadmap are integrated here!
                        Click any option above to start, or switch to <strong>Lesson Mode</strong> to try the new interactive learning experience.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProblemMode; 