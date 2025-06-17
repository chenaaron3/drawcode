import {
    ArrowRight, BookOpen, CheckCircle, Eye, Github, Heart, Play, Users, X, Zap
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

// Import images
import lessonsImage from '@/assets/lessons.png';
import programImage from '@/assets/program.png';
import variablesImage from '@/assets/variables.png';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const LandingPage: React.FC = () => {
    const [activeStep, setActiveStep] = useState(1);
    const router = useRouter();

    const onGetStarted = () => {
        router.push('/lesson');
    }

    const steps = [
        {
            id: 1,
            title: "Choose Your Topic",
            description: "Pick from guided story adventures, coding exercises, or free exploration mode. Start with fundamentals and progress at your own pace.",
            image: lessonsImage,
            alt: "Learning interface showing lesson selection"
        },
        {
            id: 2,
            title: "Watch Code Execute",
            description: "Step through execution line-by-line or expression-by-expression. See variables change, data structures evolve, and logic unfold.",
            image: programImage,
            alt: "Code editor showing step-by-step execution"
        },
        {
            id: 3,
            title: "See Data Move in Real Time",
            description: "Watch variables update instantly as your code runs. Visual feedback makes complex concepts easy to understand.",
            image: variablesImage,
            alt: "Variable panel showing real-time data changes"
        }
    ];

    return (
        <div className="w-full h-full overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Hero Section */}
            <section className="px-6 py-20">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                            Master Python Through
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                Visual Adventures
                            </span>
                        </h1>
                        <p className="text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed">
                            Learning to code doesn&apos;t have to be frustrating. Watch your Python code come alive with
                            step-by-step visualizations that make programming concepts crystal clear.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                onClick={onGetStarted}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-4"
                            >
                                Start Learning
                                <Play className="h-5 w-5 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="px-6 py-20 bg-white/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Why Python Quest?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Learning to code doesn&apos;t have to be frustrating. We make programming visual, interactive, and fun.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Visual Debugging */}
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                                    <Eye className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Visual Debugging</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Watch your code execute step-by-step with beautiful visualizations.
                                    See variables change, data flow, and algorithm logic in real-time.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Interactive Learning */}
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                                    <Play className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Interactive Exploration</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Edit code, modify inputs, and experiment freely. Learn by doing with
                                    instant feedback and error-friendly environment.
                                </p>
                            </CardContent>
                        </Card>

                        {/* No Setup Required */}
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-amber-50">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-6">
                                    <Zap className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Instant Access</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    No downloads, no setup, no configuration. Run Python in your browser
                                    with our advanced WebAssembly integration.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Story Adventures */}
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-pink-50 to-rose-50">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center mb-6">
                                    <BookOpen className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Story Adventures</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Learn through engaging narratives and adventures. Make coding
                                    feel like a game, not a chore.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Beginner Friendly */}
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-teal-50 to-cyan-50">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center mb-6">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Beginner Focused</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Designed specifically for learners who find traditional debugging
                                    overwhelming. Start simple, grow confident across any language.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Completely Free */}
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-violet-50">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                                    <Heart className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Completely Free</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Access all features, lessons, and visualizations at no cost. No subscriptions,
                                    no hidden fees, no premium tiers. Quality programming education for everyone.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="px-6 py-20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            How Python Quest Works
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Master programming through our proven visual learning approach
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
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Python Quest?</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            See how our visual approach compares to traditional learning methods
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