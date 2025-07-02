import type { GetStaticProps, GetStaticPaths, InferGetStaticPropsType } from 'next';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { DebuggerViewTrigger } from '@/components/blog/DebuggerViewTrigger';
import { ResizeHandle } from '@/components/common';
import { TraceVisualizer } from '@/components/layout';
import { Card, CardContent } from '@/components/ui';
import { BLOG_TRACES } from '@/data/blog_traces';
import { remarkDebuggerPlugin } from '@/lib/remark-debugger-plugin';
import { useTraceStore } from '@/store/traceStore';

import { markdownComponents } from '../../components/common/markdownComponents';
import { getAllPostSlugs, getPostData } from '../../lib/posts';

export const getStaticPaths: GetStaticPaths = async () => {
    const paths = getAllPostSlugs();
    return {
        paths,
        fallback: false,
    };
};

export const getStaticProps: GetStaticProps<{
    postData: ReturnType<typeof getPostData>;
}> = async ({ params }) => {
    if (!params?.slug || Array.isArray(params.slug)) {
        return { notFound: true };
    }
    const postData = getPostData(params.slug);
    return {
        props: {
            postData,
        },
    };
};

const PostPage = ({ postData }: InferGetStaticPropsType<typeof getStaticProps>) => {
    const setMode = useTraceStore(s => s.setMode);
    const setCurrentProblem = useTraceStore(s => s.setCurrentProblem);

    useEffect(() => {
        const firstProblem = postData.traces[0];
        if (firstProblem) {
            setCurrentProblem(firstProblem)
        }
        setMode('step');
    });

    return (
        <div className="flex h-full p-0 md:p-6">
            <PanelGroup direction="horizontal" className="h-full">
                {/* Left: Lesson Content (1/3) */}
                <Panel defaultSize={33.33} minSize={25}>
                    <Card className="h-full flex flex-col">
                        <CardContent className="flex-1 overflow-y-auto">
                            <header className="mb-4">
                                <h1 className="text-2xl font-bold">{postData.title}</h1>
                                <div className="text-gray-500 mt-2">
                                    {postData.date} by {postData.author}
                                </div>
                            </header>
                            <ReactMarkdown
                                remarkPlugins={[remarkDebuggerPlugin]}
                                components={{
                                    ...markdownComponents(),
                                    debuggerviewtrigger: DebuggerViewTrigger,
                                } as any}
                            >
                                {postData.content}
                            </ReactMarkdown>
                        </CardContent>
                    </Card>
                </Panel>
                <ResizeHandle direction="horizontal" />
                {/* Right: TraceVisualizer (2/3, split 50/50 internally) */}
                <Panel defaultSize={66.67} minSize={50}>
                    <div className="h-full overflow-visible">
                        <TraceVisualizer />
                    </div>
                </Panel>
            </PanelGroup>
        </div>
    );
};

export default PostPage; 