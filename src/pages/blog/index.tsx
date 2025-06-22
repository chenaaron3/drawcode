import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';

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
            <Card>
                <CardHeader>
                    <CardTitle className="text-4xl font-bold">Blog</CardTitle>
                    <CardDescription>All the latest news and posts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        {allPostsData.map(({ slug, date, title, description }) => (
                            <Card key={slug}>
                                <CardHeader>
                                    <CardTitle>{title}</CardTitle>
                                    <CardDescription>{date}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p>{description || 'No description available.'}</p>
                                </CardContent>
                                <CardFooter>
                                    <Link href={`/blog/${slug}`} passHref>
                                        <Button>Read More</Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BlogIndex; 