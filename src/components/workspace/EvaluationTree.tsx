import type { EvaluationNode } from './utils';
import { EvaluationNodeRenderer } from './EvaluationNodeRenderer';

// Component for rendering the evaluation tree
interface EvaluationTreeProps {
    evaluationTree: EvaluationNode | null;
    animatingVariable: string | null;
    currentLocals: Record<string, any> | null;
    overlayMode?: boolean;
}

export function EvaluationTree({ evaluationTree, animatingVariable, currentLocals, overlayMode = false }: EvaluationTreeProps) {
    if (!evaluationTree) return null;


    if (overlayMode) {
        return (
            <div className="whitespace-pre-wrap">
                <EvaluationNodeRenderer
                    node={evaluationTree}
                    animatingVariable={animatingVariable}
                    currentLocals={currentLocals}
                />
            </div>
        );
    }

    return (
        <div className="font-mono text-sm lg:text-lg bg-slate-50 p-3 lg:p-4 rounded-lg border relative">
            <div className="whitespace-pre-wrap">
                <EvaluationNodeRenderer
                    node={evaluationTree}
                    animatingVariable={animatingVariable}
                    currentLocals={currentLocals}
                />
            </div>
        </div>
    );
} 