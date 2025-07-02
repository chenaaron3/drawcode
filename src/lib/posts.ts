import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

import { BLOG_TRACES } from '@/data/blog_traces';

const postsDirectory = path.join(process.cwd(), "src/data/blog");

export function getAllPosts() {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const matterResult = matter(fileContents);

      return {
        slug,
        ...(matterResult.data as {
          title: string;
          date: string;
          author: string;
          description?: string;
        }),
        content: matterResult.content,
      };
    });

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostSlugs() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      return {
        params: {
          slug: fileName.replace(/\.md$/, ""),
        },
      };
    });
}

export function getPostData(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);
  const traces = Object.keys(BLOG_TRACES).filter((s) =>
    s.startsWith(slug as string),
  );

  return {
    slug,
    ...(matterResult.data as { title: string; date: string; author: string }),
    content: matterResult.content,
    traces,
  };
}
