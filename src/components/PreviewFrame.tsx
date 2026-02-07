"use client";

import { motion } from "framer-motion";

interface PreviewFrameProps {
    url: string;
}

/**
 * PreviewFrame Component
 * 
 * Browser-like frame showing a mock preview of the loaded website.
 * Styled like a native browser window with traffic lights.
 */
export default function PreviewFrame({ url }: PreviewFrameProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-4xl mx-auto"
        >
            {/* Browser Window */}
            <div className="rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-2xl">
                {/* Browser Header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-[var(--surface-secondary)] border-b border-[var(--border-subtle)]">
                    {/* Traffic Lights */}
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>

                    {/* URL Bar */}
                    <div className="flex-1 mx-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--background)] text-sm">
                            <svg
                                className="w-4 h-4 text-[var(--text-muted)]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                                />
                            </svg>
                            <span className="text-[var(--text-secondary)] truncate">{url}</span>
                        </div>
                    </div>
                </div>

                {/* Preview Content */}
                <div className="relative aspect-video bg-[var(--background)]">
                    {/* Placeholder Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                        {/* Animated loading/preview indicator */}
                        <motion.div
                            animate={{
                                opacity: [0.5, 1, 0.5],
                                scale: [0.98, 1, 0.98]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="text-center"
                        >
                            {/* Preview Icon */}
                            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[var(--surface-secondary)] flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-[var(--accent-primary)]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>

                            <h3 className="text-lg font-medium text-white mb-2">
                                Live Preview (Local Render)
                            </h3>
                            <p className="text-sm text-[var(--text-muted)] max-w-md">
                                Website is being rendered locally. The AI assistant will help you modify the UI in real-time.
                            </p>
                        </motion.div>

                        {/* Decorative Grid */}
                        <div
                            className="absolute inset-0 opacity-5"
                            style={{
                                backgroundImage: `
                  linear-gradient(var(--border-subtle) 1px, transparent 1px),
                  linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)
                `,
                                backgroundSize: "40px 40px"
                            }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
