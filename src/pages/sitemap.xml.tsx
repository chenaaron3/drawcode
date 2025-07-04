import type { GetServerSideProps } from 'next';

import { getAllCourses } from '@/lib/lessons';
import { getAllPostSlugs } from '@/lib/posts';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

function generateSitemapXml(urls: string[]): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${BASE_URL}${url}</loc></url>`).join("\n")}
</urlset>`;
}

function SiteMap() {
    // getServerSideProps will handle the response
    return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    // Landing page
    const urls: string[] = ["/"];

    // Blog posts
    const blogSlugs = getAllPostSlugs();
    blogSlugs.forEach(({ params }) => {
        urls.push(`/blog/${params.slug}`);
    });

    // Lessons
    const courses = getAllCourses();
    courses.forEach((course) => {
        course.modules.forEach((module) => {
            module.lessons.forEach((lesson) => {
                urls.push(`/lesson/${course.id}/${module.id}/${lesson.id}`);
            });
        });
    });

    const xml = generateSitemapXml(urls);

    res.setHeader("Content-Type", "text/xml");
    res.write(xml);
    res.end();

    return {
        props: {},
    };
};

export default SiteMap; 