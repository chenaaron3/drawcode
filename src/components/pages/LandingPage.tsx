import { ArrowRight, BookOpen, CheckCircle, Eye, Play, Users, X, Zap } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

// Import images
import lessonsImage from '@/assets/lessons.png';
import programImage from '@/assets/program.png';
import variablesImage from '@/assets/variables.png';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTraceStore } from '@/store/traceStore';

import { DemoPanel } from '../panels';

export const LandingPage: React.FC = () => {
    const { setMode, setCurrentProblem, setPlaySpeed } = useTraceStore();
    const [activeStep, setActiveStep] = useState(1);
    const router = useRouter();

    useEffect(() => {
        setMode("step");
        setCurrentProblem("demo");
        setPlaySpeed(500);
    }, [setMode, setCurrentProblem, setPlaySpeed]);

    const onGetStarted = async () => {
        router.push('lesson');
    }

    const steps = [
        {
            id: 1,
            title: "Choose Your Learning Path",
            description: "Start with guided story adventures that make coding feel like a game, or dive into focused exercises. We guide you step by step, so you never feel lost or overwhelmed.",
            image: lessonsImage,
            alt: "Learning interface showing lesson selection"
        },
        {
            id: 2,
            title: "Watch Code Execute Step by Step",
            description: "See exactly what happens inside your code - line by line, expression by expression. No more guessing or adding print statements everywhere. Watch variables change and logic unfold in real-time.",
            image: programImage,
            alt: "Code editor showing step-by-step execution"
        },
        {
            id: 3,
            title: "Understand Data Flow Visually",
            description: "Watch variables update instantly as your code runs. See data structures evolve, values change, and understand the &apos;why&apos; behind every operation. Visual feedback makes complex concepts crystal clear.",
            image: variablesImage,
            alt: "Variable panel showing real-time data changes"
        }
    ];

    return (
        <div className="w-full h-full overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Hero Section */}
            <section className="px-6 py-20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left side - Text content */}
                        <div className="space-y-8">
                            <div>
                                <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                                    See Python Code
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                        Come Alive
                                    </span>
                                </h1>
                                <p className="text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed">
                                    Instantly visualize variables, data structures, and logic in real time. If you're a beginner programmer struggling to learning Python, this app is for you.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    size="lg"
                                    onClick={onGetStarted}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-4"
                                >
                                    Start Learning
                                    <Play className="h-5 w-5 ml-2" />
                                </Button>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span>Step-by-step visualization</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span>Created by Meta Engineer</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span>No setup required</span>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Interactive Demo */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                            <DemoPanel />
                        </div>
                    </div>
                </div>
            </section>

            {/* Pain Points Section */}
            <section className="px-6 py-20 bg-white/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Struggling with Python? You&apos;re Not Alone
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Most learners face these common roadblocks. We guide you through each one, step by step.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Pain Point 1: Stuck and Don't Know Why */}
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-50 to-pink-50">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mb-6">
                                    <X className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">&quot;I&apos;m Stuck and Don&apos;t Know Why&quot;</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    You&apos;ve been staring at your code for hours, adding print statements everywhere,
                                    but still can&apos;t figure out why it&apos;s not working. Traditional debugging feels like
                                    shooting in the dark.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Pain Point 2: Read But Don't Understand */}
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-amber-50">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-6">
                                    <BookOpen className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">&quot;I Read But Don&apos;t Understand&quot;</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Textbooks and videos explain concepts, but they&apos;re abstract. You understand the
                                    theory but can&apos;t connect it to real code. You need to see it in action.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Pain Point 5: Just Copying Without Learning */}
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-violet-50">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">&quot;I&apos;m Just Copying Code&quot;</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    You follow tutorials and get the right output, but you don&apos;t understand why
                                    it works. You want to learn the &quot;why&quot; behind the &quot;what.&quot;
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* How We Solve This */}
            <section className="px-6 py-20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            How We Solve These Problems
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            We guide you step by step through every concept, making programming visual and understandable
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left side - Interactive Steps */}
                        <div className="space-y-6">
                            {steps.map((step) => {
                                const isActive = activeStep === step.id;
                                const bgColors = ['bg-blue-600', 'bg-indigo-600', 'bg-purple-600'];

                                return (
                                    <div
                                        key={step.id}
                                        className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer ${isActive
                                            ? 'bg-blue-50 border-2 border-blue-200 shadow-lg'
                                            : 'hover:bg-gray-50 border-2 border-transparent'
                                            }`}
                                        onClick={() => setActiveStep(step.id)}
                                    >
                                        <div className={`w-12 h-12 ${bgColors[step.id - 1]} rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : ''
                                            }`}>
                                            <span className="text-lg font-bold text-white">{step.id}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${isActive ? 'text-blue-900' : 'text-gray-900'
                                                }`}>
                                                {step.title}
                                            </h3>
                                            <p className={`leading-relaxed transition-colors duration-300 ${isActive ? 'text-blue-700' : 'text-gray-600'
                                                }`}>
                                                {step.description}
                                            </p>
                                        </div>
                                        {isActive && (
                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right side - Image Display */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                            <div className="p-6 border-b border-gray-100">
                                <h4 className="text-lg font-bold text-gray-900">
                                    {steps.find(step => step.id === activeStep)?.title}
                                </h4>
                            </div>
                            <div className="relative aspect-video bg-gray-50">
                                {steps.map((step) => (
                                    <Image
                                        key={step.id}
                                        src={step.image}
                                        alt={step.alt}
                                        fill
                                        className={`object-contain transition-opacity duration-500 ${activeStep === step.id ? 'opacity-100' : 'opacity-0'}`}
                                    />
                                ))}
                            </div>
                            <div className="p-4">
                                <div className="flex justify-center space-x-2">
                                    {steps.map((step) => (
                                        <button
                                            key={step.id}
                                            onClick={() => setActiveStep(step.id)}
                                            className={`w-3 h-3 rounded-full transition-all duration-300 ${activeStep === step.id
                                                ? 'bg-blue-600 scale-125'
                                                : 'bg-gray-300 hover:bg-gray-400'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section className="px-6 py-20 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">How We Compare to Traditional Learning</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            See how our visual approach solves problems that traditional methods can&apos;t
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Python Quest Column */}
                        <div className="lg:col-span-1">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white text-center mb-6">
                                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Zap className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Python Quest</h3>
                                <p className="text-blue-100">Visual Learning Platform</p>
                            </div>
                        </div>

                        {/* Comparison Grid */}
                        <div className="lg:col-span-3">
                            <div className="bg-gray-50 rounded-2xl overflow-hidden">
                                {/* Header Row */}
                                <div className="grid grid-cols-4 bg-gray-100 text-sm font-semibold text-gray-700">
                                    <div className="p-4">Feature</div>
                                    <div className="p-4 text-center">Python Quest</div>
                                    <div className="p-4 text-center">Textbooks</div>
                                    <div className="p-4 text-center">Video Tutorials</div>
                                </div>

                                {/* Comparison Rows */}
                                <div className="divide-y divide-gray-200">
                                    <div className="grid grid-cols-4 items-center">
                                        <div className="p-4 font-medium text-gray-900">Visual Code Execution</div>
                                        <div className="p-4 text-center">
                                            <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                                        </div>
                                        <div className="p-4 text-center">
                                            <X className="h-6 w-6 text-red-400 mx-auto" />
                                        </div>
                                        <div className="p-4 text-center">
                                            <X className="h-6 w-6 text-red-400 mx-auto" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 items-center bg-blue-50/50">
                                        <div className="p-4 font-medium text-gray-900">Interactive Practice</div>
                                        <div className="p-4 text-center">
                                            <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                                        </div>
                                        <div className="p-4 text-center">
                                            <X className="h-6 w-6 text-red-400 mx-auto" />
                                        </div>
                                        <div className="p-4 text-center">
                                            <X className="h-6 w-6 text-red-400 mx-auto" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 items-center">
                                        <div className="p-4 font-medium text-gray-900">Instant Feedback</div>
                                        <div className="p-4 text-center">
                                            <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                                        </div>
                                        <div className="p-4 text-center">
                                            <X className="h-6 w-6 text-red-400 mx-auto" />
                                        </div>
                                        <div className="p-4 text-center">
                                            <X className="h-6 w-6 text-red-400 mx-auto" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 items-center bg-blue-50/50">
                                        <div className="p-4 font-medium text-gray-900">Step-by-Step Debugging</div>
                                        <div className="p-4 text-center">
                                            <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                                        </div>
                                        <div className="p-4 text-center">
                                            <X className="h-6 w-6 text-red-400 mx-auto" />
                                        </div>
                                        <div className="p-4 text-center">
                                            <X className="h-6 w-6 text-red-400 mx-auto" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 items-center">
                                        <div className="p-4 font-medium text-gray-900">No Setup Required</div>
                                        <div className="p-4 text-center">
                                            <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                                        </div>
                                        <div className="p-4 text-center">
                                            <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                                        </div>
                                        <div className="p-4 text-center">
                                            <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 items-center bg-blue-50/50">
                                        <div className="p-4 font-medium text-gray-900">Story-Based Learning</div>
                                        <div className="p-4 text-center">
                                            <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                                        </div>
                                        <div className="p-4 text-center">
                                            <X className="h-6 w-6 text-red-400 mx-auto" />
                                        </div>
                                        <div className="p-4 text-center">
                                            <X className="h-6 w-6 text-red-400 mx-auto" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 items-center">
                                        <div className="p-4 font-medium text-gray-900">Completely Free</div>
                                        <div className="p-4 text-center">
                                            <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                                        </div>
                                        <div className="p-4 text-center">
                                            <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                                        </div>
                                        <div className="p-4 text-center">
                                            <X className="h-6 w-6 text-red-400 mx-auto" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="px-6 py-20 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                        Ready to Start Your
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Python Quest?
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                        Join thousands of learners who are mastering Python through visual,
                        interactive adventures. No downloads, no setup required.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            onClick={onGetStarted}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-4"
                        >
                            Begin Your Adventure
                            <ArrowRight className="h-5 w-5 ml-2" />
                        </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                        100% free • No account required • Works in any modern browser
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-12 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Python Quest</h1>
                            <p className="text-sm text-gray-400">Learn Python Through Adventure</p>
                        </div>
                    </div>
                    <p className="text-gray-400 mb-4">
                        Making Python learning visual, interactive, and fun for everyone.
                    </p>
                    <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                        <a href="#" className="hover:text-white transition-colors">About</a>
                        <a href="https://github.com/chenaaron3/drawcode" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}; 