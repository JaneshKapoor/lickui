"use client";

import { motion } from "framer-motion";

/**
 * AiChatTeaser Component
 * 
 * Showcases example AI chat prompts to demonstrate the product capability.
 * Purely visual - no real chat functionality yet.
 */

const examplePrompts = [
    "Make the navbar floating",
    "Switch to dark mode",
    "Move hero section below pricing",
    "Add a gradient background",
    "Make buttons more rounded",
];

export default function AiChatTeaser() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="w-full max-w-2xl mx-auto mt-8"
        >
            {/* Chat Container */}
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)]">
                    {/* AI Icon */}
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
                        <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-white">AI Assistant</h4>
                        <p className="text-xs text-[var(--text-muted)]">Powered by Tambo + React</p>
                    </div>
                </div>

                {/* Chat Body */}
                <div className="p-4 space-y-3">
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                        Try saying something like:
                    </p>

                    {/* Example Prompts */}
                    <div className="flex flex-wrap gap-2">
                        {examplePrompts.map((prompt, index) => (
                            <motion.button
                                key={prompt}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
                                whileHover={{
                                    scale: 1.03,
                                    backgroundColor: "var(--surface-hover)"
                                }}
                                whileTap={{ scale: 0.98 }}
                                className="px-3 py-2 rounded-lg bg-[var(--surface-secondary)] text-sm text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-white hover:border-[var(--accent-primary)] transition-colors cursor-pointer"
                            >
                                "{prompt}"
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Input Area (Visual Only) */}
                <div className="px-4 pb-4">
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border-subtle)]">
                        <input
                            type="text"
                            placeholder="Describe the UI changes you want..."
                            disabled
                            className="flex-1 bg-transparent text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none cursor-not-allowed opacity-50"
                        />
                        <button
                            disabled
                            className="p-2 rounded-lg bg-[var(--accent-primary)] opacity-50 cursor-not-allowed"
                        >
                            <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
