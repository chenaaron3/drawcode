import fs from 'fs';
import path from 'path';
import React from 'react';

import { LessonPage } from '@/components/lessons/LessonPage';
import { LessonSidebar } from '@/components/lessons/LessonSidebar';
import { SeoHead } from '@/components/SeoHead';
import lessonModulesData from '@/data/lesson-modules.json';
import lessonProblemsData from '@/data/lesson-problems.json';
import { getAllCourses, getLessonById } from '@/lib/lessons';

import type { GetStaticPaths, GetStaticProps } from 'next';
import type { LinkedLessonCourse, LinkedLessonModule } from '@/lib/lessons';
import type { Lesson } from '@/types/lesson';

interface Props {
    lesson: Lesson;
    module: LinkedLessonModule;
    course: LinkedLessonCourse;
}

export const getStaticPaths: GetStaticPaths = async () => {
    const courses = getAllCourses();
    const paths: { params: { course: string; module: string; lesson: string } }[] = [];
    for (const course of courses) {
        for (const module of course.modules) {
            for (const lesson of module.lessons) {
                paths.push({
                    params: {
                        course: course.id,
                        module: module.id,
                        lesson: lesson.id,
                    },
                });
            }
        }
    }
    return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
    const courseId = params?.course as string;
    const moduleId = params?.module as string;
    const lessonId = params?.lesson as string;
    const result = getLessonById(lessonId);
    if (!result) return { notFound: true };
    const { lesson, module, course } = result;
    return {
        props: {
            lesson,
            module: module as LinkedLessonModule,
            course: course as LinkedLessonCourse,
        },
    };
};

const LessonProblemPage: React.FC<Props> = ({ lesson, module, course }) => {
    return (
        <>
            <SeoHead
                title={`${lesson.title} | ${module.title} | ${course.title}`}
                description={lesson.description}
                url={`/lesson/${course.id}/${module.id}/${lesson.id}`}
            />
            <div className="h-full w-full flex">
                {/* Sidebar */}
                <LessonSidebar
                    currentLesson={lesson}
                    currentCourse={course}
                    currentModule={module}
                    modules={lessonModulesData as any}
                    lessons={lessonProblemsData as any}
                />
                {/* Main Content */}
                <main className="flex-1 h-full w-full">
                    <LessonPage
                        lesson={lesson}
                        currentCourse={course}
                        currentModule={module}
                    />
                </main>
            </div>
        </>
    );
};

export default LessonProblemPage; 