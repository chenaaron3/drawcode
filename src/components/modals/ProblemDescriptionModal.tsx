import { ExternalLink, HelpCircle, Play } from 'lucide-react';
import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TurndownService from 'turndown';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { useTraceGeneration } from '@/hooks/useTraceGeneration';
import { useTraceStore } from '@/store/traceStore';

interface ProblemDescriptionModalProps {
    problemId: string;
}

interface ExampleInput {
    text: string;
    inputs: Record<string, any>;
}

interface InteractiveCodeBlockProps {
    children: string;
    exampleInputs: ExampleInput[];
    onUseExample: (inputs: Record<string, any>) => void;
}

// Custom code block component for interactive examples
function InteractiveCodeBlock({ children, exampleInputs, onUseExample }: InteractiveCodeBlockProps) {
    const [isHovered, setIsHovered] = useState(false);

    // Clean up the content and unescape characters
    const cleanContent = useMemo(() => {
        return children
            .replace(/\\\[/g, '[')
            .replace(/\\\]/g, ']')
            .replace(/\\\*/g, '*')
            .replace(/\\_/g, '_');
    }, [children]);

    // Check if this code block contains an example input
    const exampleIndex = useMemo(() => {
        // Try multiple patterns to match examples
        const patterns = [
            /Input:\s*(.+?)(?=\s*Output:|$)/,
            /\*\*Input:\*\*\s*(.+?)(?=\s*\*\*Output:|$)/,
        ];

        for (const pattern of patterns) {
            const inputMatch = cleanContent.match(pattern);
            if (inputMatch) {
                const inputText = inputMatch[1]!.trim();
                // Try exact match first
                let index = exampleInputs.findIndex(example => example.text === inputText);

                // If no exact match, try fuzzy matching
                if (index === -1) {
                    index = exampleInputs.findIndex(example =>
                        example.text.replace(/\s+/g, ' ').trim() === inputText.replace(/\s+/g, ' ').trim()
                    );
                }

                if (index !== -1) return index;
            }
        }

        return -1;
    }, [cleanContent, exampleInputs]);

    const example = exampleIndex >= 0 ? exampleInputs[exampleIndex] : null;

    if (example) {
        return (
            <div
                className="relative group mb-4 lg:mb-6 p-3 lg:p-4 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="bg-transparent border-none p-0 m-0 overflow-x-auto font-mono text-xs lg:text-sm whitespace-pre-wrap">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ children }) => <span>{children}</span>,
                            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                            code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-xs">{children}</code>,
                        }}
                    >
                        {cleanContent}
                    </ReactMarkdown>
                </div>
                {isHovered && (
                    <Button
                        size="sm"
                        onClick={() => onUseExample(example.inputs)}
                        className="absolute top-2 lg:top-3 right-2 lg:right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground px-2 lg:px-3 py-1 lg:py-1.5 text-xs lg:text-sm shadow-lg"
                    >
                        <Play className="h-3 lg:h-3.5 w-3 lg:w-3.5" />
                        <span className="hidden lg:inline">Use Input</span>
                    </Button>
                )}
            </div>
        );
    }

    // Regular code block
    return (
        <pre className="bg-muted/50 p-3 lg:p-4 rounded-lg border mb-3 lg:mb-4 overflow-x-auto">
            <code className="text-xs lg:text-sm">{cleanContent}</code>
        </pre>
    );
}

export function ProblemDescriptionModal({ problemId }: ProblemDescriptionModalProps) {
    const { getCurrentProblemData, setInputOverride } = useTraceStore();
    const { generateTraceFromState } = useTraceGeneration();

    const problem = getCurrentProblemData(problemId);
    const problemData = problem?.details;

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Hard': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    // Convert HTML to Markdown
    const markdownContent = useMemo(() => {
        if (!problemData?.question) {
            return '';
        }

        const turndownService = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced'
        });

        // Custom rule for inline code (keep <code> as inline)
        turndownService.addRule('inlineCode', {
            filter: function (node) {
                return node.nodeName === 'CODE' && node.parentNode?.nodeName !== 'PRE';
            },
            replacement: function (content: string) {
                return '`' + content + '`';
            }
        });

        // Custom rule for preserving code blocks with proper formatting
        turndownService.addRule('preserveCodeBlocks', {
            filter: 'pre',
            replacement: function (content: string) {
                return '\n```\n' + content + '\n```\n';
            }
        });

        const markdown = turndownService.turndown(problemData.question);
        return markdown;
    }, [problemData?.question]);

    // Parse example inputs from the original HTML (more reliable than markdown)
    const exampleInputs = useMemo(() => {
        if (!problemData?.question) {
            return [];
        }

        const examples: ExampleInput[] = [];

        // Match HTML format: <strong>Input:</strong> nums = [2,7,11,15], target = 9
        const inputRegex = /<strong>Input:<\/strong>\s*([^<\n]+?)(?=\s*<strong>Output:|$)/g;
        let match;

        while ((match = inputRegex.exec(problemData.question)) !== null) {
            const inputText = match[1]!.trim();
            const inputs: Record<string, any> = {};

            // Smart parsing that respects brackets
            const parseAssignments = (text: string) => {
                const assignments = [];
                let current = '';
                let bracketDepth = 0;
                let i = 0;

                while (i < text.length) {
                    const char = text[i];

                    if (char === '[' || char === '{') {
                        bracketDepth++;
                    } else if (char === ']' || char === '}') {
                        bracketDepth--;
                    } else if (char === ',' && bracketDepth === 0) {
                        assignments.push(current.trim());
                        current = '';
                        i++;
                        continue;
                    }

                    current += char;
                    i++;
                }

                if (current.trim()) {
                    assignments.push(current.trim());
                }

                return assignments;
            };

            const assignments = parseAssignments(inputText);

            for (const assignment of assignments) {
                const [key, value] = assignment.split('=').map(s => s.trim());
                if (key && value) {
                    try {
                        inputs[key] = JSON.parse(value);
                    } catch {
                        inputs[key] = value;
                    }
                }
            }

            if (Object.keys(inputs).length > 0) {
                examples.push({
                    text: inputText,
                    inputs
                });
            }
        }

        return examples;
    }, [problemData?.question]);

    const handleUseExample = async (inputs: Record<string, any>) => {
        // Set the input overrides in global state
        Object.entries(inputs).forEach(([key, value]) => {
            setInputOverride(key, value);
        });
        // Generate trace from the updated global state
        await generateTraceFromState();
    };

    // Don't render if no problem data
    if (!problemData) {
        return null;
    }
    // Don't render anything for sandbox problems
    if (problemId === 'sandbox') {
        return null;
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <HelpCircle className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0 border-b pb-3 lg:pb-4">
                    <DialogTitle className="flex items-center gap-2 lg:gap-3 text-lg lg:text-xl">
                        <span>{problemData?.questionTitle || 'Problem'}</span>
                        {problemData?.difficulty && (
                            <Badge className={getDifficultyColor(problemData.difficulty)}>
                                {problemData.difficulty}
                            </Badge>
                        )}
                        {problemData?.link && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(problemData.link, '_blank')}
                                className="ml-auto"
                            >
                                <ExternalLink className="h-4 w-4" />
                                <span className="hidden lg:inline">View on LeetCode</span>
                            </Button>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    <div className="prose prose-sm lg:prose-base max-w-none leading-relaxed">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ children, className, ...props }: any) {
                                    const content = String(children);
                                    const isBlock = content.includes('\n') || content.length > 50; // Multi-line or long content = block

                                    if (isBlock) {
                                        return (
                                            <InteractiveCodeBlock
                                                exampleInputs={exampleInputs}
                                                onUseExample={handleUseExample}
                                            >
                                                {content.replace(/\n$/, '')}
                                            </InteractiveCodeBlock>
                                        );
                                    }

                                    // Inline code
                                    return (
                                        <code className="bg-muted px-1 lg:px-1.5 py-0.5 rounded text-xs lg:text-sm font-mono" {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                                pre({ children }) {
                                    return <>{children}</>;
                                },
                                p({ children }) {
                                    return <p className="text-sm lg:text-base leading-6 lg:leading-7">{children}</p>;
                                },
                                h1({ children }) {
                                    return <h1 className="text-xl lg:text-2xl font-bold">{children}</h1>;
                                },
                                h2({ children }) {
                                    return <h2 className="text-lg lg:text-xl font-bold">{children}</h2>;
                                },
                                h3({ children }) {
                                    return <h3 className="text-base lg:text-lg font-semibold">{children}</h3>;
                                },
                                strong({ children }) {
                                    return <strong className="font-semibold">{children}</strong>;
                                },
                                em({ children }) {
                                    return <em className="italic">{children}</em>;
                                },
                                ul({ children }) {
                                    return <ul className="list-disc pl-4 lg:pl-6">{children}</ul>;
                                },
                                ol({ children }) {
                                    return <ol className="list-decimal pl-4 lg:pl-6">{children}</ol>;
                                },
                                li({ children }) {
                                    return <li className="text-sm lg:text-base leading-5 lg:leading-6">{children}</li>;
                                },
                                blockquote({ children }) {
                                    return <blockquote className="border-l-4 border-muted pl-3 lg:pl-4 italic text-muted-foreground">{children}</blockquote>;
                                },
                                hr() {
                                    return <hr className="border-border" />;
                                }
                            }}
                        >
                            {markdownContent}
                        </ReactMarkdown>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 