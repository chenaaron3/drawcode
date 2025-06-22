import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import Link from 'next/link';

import { getAllPosts } from '../../lib/posts';

export const getStaticProps: GetStaticProps<{
    allPostsData: ReturnType<typeof getAllPosts>;
}> = async () => {
    const allPostsData = getAllPosts();
    return {
        props: {
            allPostsData,
        },
    };
};

const BlogIndex = ({ allPostsData }: InferGetStaticPropsType<typeof getStaticProps>) => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8">Blog</h1>
            <section>
                <ul>
                    {allPostsData.map(({ slug, date, title }) => (
                        <li key={slug} className="mb-4">
                            <Link href={`/blog/${slug}`} className="text-xl font-semibold text-blue-600 hover:underline">
                                {title}
                            </Link>
                            <br />
                            <small className="text-gray-500">{date}</small>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
};

export default BlogIndex; 