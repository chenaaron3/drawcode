import { BookOpen, Check, ChevronDown, ChevronRight, Lock, Play, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

import { useLessonNavigation } from '@/hooks/useLessonNavigation';
import { getAllCourses, getCourseById } from '@/lib/lessons';
import { useProgressStore } from '@/store/progressStore';

import type { GetStaticPaths, GetStaticProps } from 'next';
import type { LinkedLessonCourse } from '@/lib/lessons';
interface Props {
    course: LinkedLessonCourse;
}

export const getStaticPaths: GetStaticPaths = async () => {
    const courses = getAllCourses();
    return {
        paths: courses.map((course) => ({ params: { course: course.id } })),
        fallback: false,
    };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
    const courseId = params?.course as string;
    const course = getCourseById(courseId);
    if (!course) {
        return { notFound: true };
    }
    return { props: { course } };
};

function getLessonCount(course: LinkedLessonCourse) {
    return course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
}

export default function CourseSyllabusPage({ course }: Props) {
    const [expanded, setExpanded] = useState<string | null>(null);
    const { getUnlockedLesson, gotoDefaultLesson } = useLessonNavigation();
    const progressStore = useProgressStore();
    const lessonCount = getLessonCount(course);

    return (
        <main className="w-full max-w-5xl mx-auto py-6 sm:py-12 px-2 sm:px-6 overflow-x-hidden">
            {/* Hero Section */}
            <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50 rounded-lg p-4 sm:p-10 mb-8 gap-6 sm:gap-0 w-full">
                {/* Left: Title, Description, Button */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">{course.title}</h1>
                    <p className="text-slate-700 mb-4 text-sm sm:text-base line-clamp-3">{course.description}</p>
                    <button
                        onClick={gotoDefaultLesson}
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded transition-colors text-sm sm:text-base shadow"
                    >
                        Start Course
                    </button>
                </div>
                {/* Right: Stats */}
                <div className="flex flex-col gap-4 w-full sm:w-auto sm:min-w-[220px]">
                    <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                        <BookOpen className="w-5 h-5 text-slate-700" />
                        <span className="font-semibold">{lessonCount}</span>
                        <span className="text-slate-700">Lessons</span>
                    </div>
                    <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                        <TrendingUp className="w-5 h-5 text-slate-700" />
                        <span className="capitalize text-slate-700">{course.difficulty} Level</span>
                    </div>
                </div>
            </section>
            {/* Syllabus Section */}
            <div className="space-y-4 sm:space-y-6 w-full">
                {course.modules.map((module, idx) => (
                    <div key={module.id} className="border rounded-lg bg-white w-full">
                        {/* Module Dropdown Trigger */}
                        <button
                            type="button"
                            className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-100 hover:bg-slate-200 transition-colors rounded-t-lg"
                            onClick={() => setExpanded(expanded === module.id ? null : module.id)}
                            aria-expanded={expanded === module.id}
                        >
                            <div>
                                <div className="font-semibold text-base sm:text-lg text-slate-900 line-clamp-2">{idx + 1}. {module.title}</div>
                                <div className="text-slate-600 text-xs sm:text-sm mt-1 line-clamp-2">{module.description}</div>
                            </div>
                            <span>
                                {expanded === module.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            </span>
                        </button>
                        {/* Module Lessons Dropdown */}
                        <div className={`transition-all duration-300 overflow-hidden ${expanded === module.id ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                            <ul className="divide-y divide-slate-200">
                                {module.lessons.map((lesson) => {
                                    const isCompleted = progressStore.isLessonCompleted(course.id, module.id, lesson.id);
                                    const unlockedLesson = getUnlockedLesson();
                                    const isAvailable = isCompleted || lesson.id === unlockedLesson?.id;
                                    let icon = null;
                                    if (isCompleted) {
                                        icon = <Check className="w-4 h-4 text-green-900" />;
                                    } else if (isAvailable) {
                                        icon = <Play className="w-4 h-4 text-slate-700" />;
                                    } else {
                                        icon = <Lock className="w-4 h-4 text-slate-700" />;
                                    }
                                    return (
                                        <li key={lesson.id}>
                                            <Link
                                                href={`/lesson/${course.id}/${module.id}/${lesson.id}`}
                                                className={`flex items-center gap-3 px-6 sm:px-8 py-2 sm:py-3 transition-colors ${isAvailable ? 'hover:bg-blue-50' : 'pointer-events-none opacity-50'}`}
                                                tabIndex={isAvailable ? 0 : -1}
                                                aria-disabled={!isAvailable}
                                            >
                                                <span className="flex-shrink-0">{icon}</span>
                                                <span className="flex-1 min-w-0 text-slate-900 font-medium truncate text-sm sm:text-base">{lesson.title}</span>
                                                <span className="text-xs text-slate-500">{lesson.time} min</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
} 