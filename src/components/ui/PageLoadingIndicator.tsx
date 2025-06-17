import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export const PageLoadingIndicator = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleStart = () => setLoading(true);
        const handleComplete = () => setLoading(false);

        router.events.on('routeChangeStart', handleStart);
        router.events.on('routeChangeComplete', handleComplete);
        router.events.on('routeChangeError', handleComplete);

        return () => {
            router.events.off('routeChangeStart', handleStart);
            router.events.off('routeChangeComplete', handleComplete);
            router.events.off('routeChangeError', handleComplete);
        };
    }, [router]);

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="h-full bg-blue-600"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{
                            repeat: Infinity,
                            duration: 1,
                            ease: "easeInOut"
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}; 