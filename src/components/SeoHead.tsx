import Head from 'next/head';

interface SeoHeadProps {
    title: string;
    description: string;
    url?: string;
}

export function SeoHead({ title, description, url }: SeoHeadProps) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const canonicalUrl = url ? `${baseUrl}${url}` : baseUrl;

    return (
        <Head>
            <title>{title} | PyViz</title>
            <meta name="description" content={description} />
            {/* Open Graph */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="article" />
            <meta property="og:url" content={canonicalUrl} />
            {/* Twitter */}
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
        </Head>
    );
} 