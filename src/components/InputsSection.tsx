import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InputsSectionProps {
    inputs: Record<string, any>;
    onInputChange: (key: string, value: any) => void;
}

export function InputsSection({ inputs, onInputChange }: InputsSectionProps) {
    const handleInputChange = (key: string, value: string) => {
        try {
            // Try to parse as JSON for arrays/objects, otherwise treat as string/number
            const parsedValue = JSON.parse(value);
            onInputChange(key, parsedValue);
        } catch {
            // If JSON parsing fails, treat as string or number
            const numValue = Number(value);
            onInputChange(key, isNaN(numValue) ? value : numValue);
        }
    };

    return (
        <div className="border-b bg-muted/30 py-3">
            <div className="flex flex-wrap gap-3">
                {Object.entries(inputs).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 min-w-0 flex-grow">
                        <Label
                            htmlFor={`input-${key}`}
                            className="text-xs font-mono font-medium whitespace-nowrap text-foreground"
                        >
                            {key}
                        </Label>
                        <span className="text-xs text-muted-foreground">=</span>
                        <Input
                            id={`input-${key}`}
                            type="text"
                            value={typeof value === 'string' ? value : JSON.stringify(value)}
                            onChange={(e) => handleInputChange(key, e.target.value)}
                            className="font-mono text-xs h-7 w-fit flex-1"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
} 