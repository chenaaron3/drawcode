import { CheckCircle } from 'lucide-react';
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface Problem {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    number?: number;
}

interface ProblemNodeData extends Problem {
    onClick?: (problemId: string) => void;
    onToggleCompletion?: (problemId: string) => void;
    isCompleted?: boolean;
}

interface ProblemNodeProps {
    data: ProblemNodeData;
    isConnectable?: boolean;
}

const ProblemNode: React.FC<ProblemNodeProps> = ({ data, isConnectable = true }) => {
    const { id, title, difficulty, number, onClick, onToggleCompletion, isCompleted = false } = data;

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    text: 'text-green-700',
                    accent: 'bg-green-500'
                };
            case 'Medium':
                return {
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    text: 'text-yellow-700',
                    accent: 'bg-yellow-500'
                };
            case 'Hard':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    text: 'text-red-700',
                    accent: 'bg-red-500'
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    border: 'border-gray-200',
                    text: 'text-gray-700',
                    accent: 'bg-gray-500'
                };
        }
    };

    const colors = getDifficultyColor(difficulty);

    const handleClick = () => {
        if (onClick) {
            onClick(id);
        }
    };

    const handleRightClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (onToggleCompletion) {
            onToggleCompletion(id);
        }
    };

    return (
        <div className="relative">
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                className="!w-2 !h-2 !bg-gray-400"
            />

            <div
                className={`
          ${colors.bg} ${colors.border} ${colors.text}
          border rounded-lg px-3 py-2 min-w-[200px] max-w-[240px]
          cursor-pointer transition-all duration-200
          hover:shadow-md hover:scale-105 hover:border-opacity-80
          relative overflow-hidden
          ${isCompleted ? 'ring-2 ring-green-400 bg-green-50' : ''}
        `}
                onClick={handleClick}
                onContextMenu={handleRightClick}
            >
                {/* Difficulty accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.accent}`} />

                <div className="ml-2">
                    {/* Problem number and title */}
                    <div className="font-medium text-sm mb-1 leading-tight flex items-center justify-between">
                        <div>
                            {number && <span className="opacity-60 mr-1">#{number}</span>}
                            {title}
                        </div>
                        {isCompleted && (
                            <CheckCircle className="h-4 w-4 text-green-600 ml-2 flex-shrink-0" />
                        )}
                    </div>

                    {/* Difficulty badge */}
                    <div className="flex justify-end">
                        <span className={`
              text-xs px-2 py-1 rounded-full font-medium
              ${colors.bg} ${colors.border} border
            `}>
                            {difficulty}
                        </span>
                    </div>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="!w-2 !h-2 !bg-gray-400"
            />
        </div>
    );
};

export default memo(ProblemNode); 