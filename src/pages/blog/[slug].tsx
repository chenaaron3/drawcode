import type { GetStaticProps, GetStaticPaths, InferGetStaticPropsType } from 'next';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { DebuggerViewTrigger } from '@/components/blog/DebuggerViewTrigger';
import { ResizeHandle } from '@/components/common';
import { TraceVisualizer } from '@/components/layout';
import { SeoHead } from '@/components/SeoHead';
import { Card, CardContent } from '@/components/ui';
import { useIsMobile } from '@/hooks/useIsMobile';
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

const TABS = [
    { key: 'blog', label: 'Blog' },
    { key: 'code', label: 'Code' },
] as const;
type TabKey = typeof TABS[number]['key'];

const PostPage = ({ postData }: InferGetStaticPropsType<typeof getStaticProps>) => {
    const setMode = useTraceStore(s => s.setMode);
    const setCurrentProblem = useTraceStore(s => s.setCurrentProblem);
    const currentProblem = useTraceStore(s => s.currentProblemId);
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState<TabKey>('blog');

    useEffect(() => {
        const firstProblem = postData.traces[0];
        if (firstProblem) {
            setCurrentProblem(firstProblem)
        }
        setMode('step');
    }, []);

    useEffect(() => {
        // If we assign a different problem, lets switch tabs
        if (currentProblem != postData.traces[0]) {
            setActiveTab('code');
        }
    }, [currentProblem])

    if (isMobile) {
        return (
            <>
                <SeoHead
                    title={postData.title}
                    description={postData.description}
                    url={`/blog/${postData.slug}`}
                />
                <div className="h-full w-full p-0 md:p-6 relative overflow-hidden">
                    <div className="flex flex-col h-full">
                        <div className="h-full overflow-y-auto">
                            <div
                                className={
                                    (activeTab === 'blog'
                                        ? 'transition-opacity duration-300 opacity-100 relative'
                                        : 'transition-opacity duration-300 opacity-0 pointer-events-none absolute inset-0') +
                                    ' w-full h-full'
                                }
                                aria-hidden={activeTab !== 'blog'}
                            >
                                <BlogContent postData={postData} />
                            </div>
                            <div
                                className={
                                    (activeTab === 'code'
                                        ? 'transition-opacity duration-300 opacity-100 relative'
                                        : 'transition-opacity duration-300 opacity-0 pointer-events-none absolute inset-0') +
                                    ' w-full h-full'
                                }
                                aria-hidden={activeTab !== 'code'}
                            >
                                <TraceVisualizer stacked />
                            </div>
                        </div>
                        <nav className="bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex justify-around items-center h-12 md:hidden">
                            {TABS.map(tab => (
                                <button
                                    key={tab.key}
                                    className={`flex-1 h-full flex flex-col items-center justify-center text-xs font-medium transition-colors ${activeTab === tab.key ? 'text-blue-600' : 'text-slate-500'}`}
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="flex h-full p-0 md:p-6">
            <PanelGroup direction="horizontal" className="h-full">
                <Panel defaultSize={50} minSize={25}>
                    <BlogContent postData={postData} />
                </Panel>
                <ResizeHandle direction="horizontal" />
                <Panel defaultSize={50} minSize={25}>
                    <TraceVisualizer stacked />
                </Panel>
            </PanelGroup>
        </div>
    );
};

function BlogContent({ postData }: { postData: ReturnType<typeof getPostData> }) {
    return <Card className="h-full flex flex-col lg:py-0">
        <CardContent className="p-3 flex-1 overflow-y-auto">
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
}

export default PostPage; 