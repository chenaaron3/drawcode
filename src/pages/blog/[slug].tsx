import type { GetStaticProps, GetStaticPaths, InferGetStaticPropsType } from 'next';
import ReactMarkdown from 'react-markdown';

import { DebuggerViewTrigger } from '@/components/blog/DebuggerViewTrigger';
import BlogCodePanel from '@/components/panels/BlogPanel';
import { remarkDebuggerPlugin } from '@/lib/remark-debugger-plugin';

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
    return (
        <div className="flex h-full">
            <main className="w-1/2 overflow-y-auto p-8">
                <article className="prose max-w-none">
                    <header className="mb-8">
                        <h1 className="text-4xl font-bold">{postData.title}</h1>
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
                </article>
            </main>
            <div className="w-1/2 h-full">
                <BlogCodePanel />
            </div>
        </div>
    );
};

export default PostPage; 