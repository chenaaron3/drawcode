import type { EvaluationNode } from './utils';
import { EvaluationNodeRenderer } from './EvaluationNodeRenderer';

// Component for rendering the evaluation tree
interface EvaluationTreeProps {
    evaluationTree: EvaluationNode | null;
    animatingVariable: string | null;
    currentLocals: Record<string, any> | null;
}

export function EvaluationTree({ evaluationTree, animatingVariable, currentLocals }: EvaluationTreeProps) {
    if (!evaluationTree) return null;

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