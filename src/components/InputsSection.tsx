import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InputsSectionProps {
    inputs: Record<string, any>;
    onInputChange: (key: string, value: any) => void;
    validationError?: {
        message: string;
        type: 'validation' | 'general';
        invalidField?: string;
    } | null;
}

export function InputsSection({ inputs, onInputChange, validationError }: InputsSectionProps) {
    return (
        <div className="border-b bg-muted/30 py-3">
            <div className="flex flex-wrap gap-3">
                {Object.entries(inputs).map(([key, value]) => {
                    const isInvalid = validationError?.type === 'validation' && validationError?.invalidField === key;
                    return (
                        <div key={key} className="flex items-center gap-2 min-w-0 flex-grow">
                            <Label
                                htmlFor={`input-${key}`}
                                className={`text-xs font-mono font-medium whitespace-nowrap ${isInvalid ? 'text-destructive' : 'text-foreground'
                                    }`}
                            >
                                {key}
                            </Label>
                            <span className="text-xs text-muted-foreground">=</span>
                            <Input
                                id={`input-${key}`}
                                type="text"
                                value={typeof value === 'string' ? value : JSON.stringify(value)}
                                onChange={(e) => onInputChange(key, e.target.value)}
                                className="font-mono text-xs h-7 w-fit flex-1"
                                aria-invalid={isInvalid}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 