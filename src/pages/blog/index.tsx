import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import Image from 'next/image';
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
                    <div className="flex flex-wrap gap-8 justify-center">
                        {allPostsData.map(({ slug, date, title, description, image }) => (
                            <Link href={`/blog/${slug}`} passHref key={slug} className="w-full sm:w-[350px]">
                                <Card
                                    className="pt-0 rounded-xl shadow-lg flex flex-col transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl cursor-pointer w-full h-full border border-border hover:ring-2 hover:ring-primary hover:bg-accent/40"
                                >
                                    {/* Image */}
                                    {image && (
                                        <div className="h-48 w-full overflow-hidden rounded-t-xl relative">
                                            <Image
                                                src={image}
                                                alt={title}
                                                fill
                                                className="object-cover"
                                                style={{ borderRadius: '0.75rem 0.75rem 0 0' }}
                                                sizes="(max-width: 600px) 100vw, 350px"
                                            />
                                        </div>
                                    )}
                                    <CardHeader className="flex-1">
                                        {/* Date */}
                                        <div className="text-xs text-muted-foreground font-semibold mb-1">{date}</div>
                                        {/* Title */}
                                        <CardTitle className="text-lg font-bold mb-2">{title}</CardTitle>
                                        {/* Description */}
                                        <CardDescription className="text-sm text-muted-foreground">
                                            {description || 'No description available.'}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BlogIndex; 