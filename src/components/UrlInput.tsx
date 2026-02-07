"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface UrlInputProps {
    onSubmit: (url: string) => void;
    isLoading?: boolean;
}

/**
 * UrlInput Component
 * 
 * Large centered input for entering website URLs.
 * Includes validation, focus animations, and loading state.
 */
export default function UrlInput({ onSubmit, isLoading = false }: UrlInputProps) {
    const [url, setUrl] = useState("");
    const [error, setError] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    // Validate URL format
    const validateUrl = (value: string): boolean => {
        try {
            const urlObj = new URL(value);
            return urlObj.protocol === "http:" || urlObj.protocol === "https:";
        } catch {
            return false;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!url.trim()) {
            setError("Please enter a URL");
            return;
        }

        if (!validateUrl(url)) {
            setError("Please enter a valid URL (e.g., https://example.com)");
            return;
        }

        onSubmit(url);
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
            className="w-full max-w-2xl mx-auto"
        >
            {/* Input Container */}
            <motion.div
                animate={{
                    scale: isFocused ? 1.02 : 1,
                    boxShadow: isFocused
                        ? "0 0 0 2px var(--accent-primary), 0 0 30px rgba(124, 58, 237, 0.2)"
                        : "0 0 0 1px var(--border-muted)"
                }}
                transition={{ duration: 0.2 }}
                className="relative flex items-center gap-2 p-2 rounded-2xl bg-[var(--surface-primary)] border border-[var(--border-subtle)]"
            >
                {/* URL Input */}
                <input
                    type="text"
                    value={url}
                    onChange={(e) => {
                        setUrl(e.target.value);
                        if (error) setError("");
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="https://example.com"
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-transparent text-white text-lg placeholder:text-[var(--text-muted)] focus:outline-none disabled:opacity-50"
                />

                {/* Submit Button */}
                <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-medium text-base hover:bg-[var(--accent-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed glow-primary"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Loading...
                        </span>
                    ) : (
                        "Load Website"
                    )}
                </motion.button>
            </motion.div>

            {/* Error Message */}
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-sm text-red-400 text-center"
                >
                    {error}
                </motion.p>
            )}
        </motion.form>
    );
}
