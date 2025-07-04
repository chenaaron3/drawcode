import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { getAllCourses } from '@/lib/lessons';

import type { GetStaticProps } from 'next';
import type { LinkedLessonCourse } from '@/lib/lessons';
interface Props {
    courses: LinkedLessonCourse[];
}

function getLessonCount(course: LinkedLessonCourse) {
    return course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
}

export const getStaticProps: GetStaticProps<Props> = async () => {
    const courses = getAllCourses();
    return { props: { courses } };
};

export default function LessonCourseIndex({ courses }: Props) {
    const router = useRouter();

    useEffect(() => {
        // If there is only one course, automatically redirect to it
        if (courses.length === 1) {
            router.push(`/lesson/${courses[0]!.id}`);
        }
    }, [courses, router]);

    return (
        <main className="max-w-5xl mx-auto py-8 sm:py-12 px-2 sm:px-4">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Courses</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
                {courses.map((course) => (
                    <Link
                        key={course.id}
                        href={`/lesson/${course.id}`}
                        className="block bg-white border border-slate-200 rounded-lg shadow-sm p-4 sm:p-6 transition-transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <h2 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2">{course.title}</h2>
                        <p className="text-gray-600 mb-4 line-clamp-2 sm:line-clamp-3 text-sm sm:text-base">{course.description}</p>
                        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-700 mt-4">
                            <span>{getLessonCount(course)} lessons</span>
                            <span className="px-2 py-1 rounded bg-slate-100 text-xs font-medium">
                                {course.difficulty}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}
