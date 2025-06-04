import { MdError } from 'react-icons/md';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorPanelProps {
    error: {
        message: string;
        type: 'validation' | 'general';
        invalidField?: string;
    } | null;
}

export function ErrorPanel({ error }: ErrorPanelProps) {
    if (!error) return null;

    const isValidationError = error.type === 'validation';

    return (
        <Alert variant="destructive" data-testid="error-panel">
            <MdError className="h-4 w-4" />
            <AlertTitle>
                {isValidationError ? 'Input Validation Error' : 'Error'}
            </AlertTitle>
            <AlertDescription>
                {error.message}
                {isValidationError && error.invalidField && (
                    <div className="mt-1 text-xs opacity-90">
                        Please check the <strong>{error.invalidField}</strong> field and try again.
                    </div>
                )}
            </AlertDescription>
        </Alert>
    );
} 