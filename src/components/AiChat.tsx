"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface AiChatProps {
    selectedElement?: {
        path: string;
        element: HTMLElement;
    } | null;
    apiKey?: string;
}

/**
 * AI Chat Component
 * 
 * Functional chat interface for AI-driven UI modifications.
 * Simplified version without full Tambo integration (pending API key).
 */
export default function AiChat({ selectedElement, apiKey }: AiChatProps) {
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
    const [inputValue, setInputValue] = useState("");
    const [isPending, setIsPending] = useState(false);

    const examplePrompts = [
        "Make the header background dark blue",
        "Increase the font size of all headings",
        "Hide the navigation bar",
        "Change all buttons to have rounded corners",
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isPending) return;

        const userMessage = selectedElement
            ? `[Selected element: ${selectedElement.path}] ${inputValue}`
            : inputValue;

        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInputValue("");
        setIsPending(true);

        // Simulate AI response (will be replaced with actual Tambo integration)
        setTimeout(() => {
            // Apply the modification to the preview
            applyModification(inputValue, selectedElement?.path);

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `✓ Applied modification${selectedElement ? ` to ${selectedElement.path}` : ''}: ${inputValue}`
            }]);
            setIsPending(false);
        }, 1000);
    };

    const handleExampleClick = (prompt: string) => {
        setInputValue(prompt);
    };

    // Apply CSS modification to the preview
    const applyModification = (prompt: string, selector?: string) => {
        if (typeof document === "undefined") return;

        const preview = document.querySelector('.html-preview');
        if (!preview) return;

        const target = selector
            ? preview.querySelector(selector) as HTMLElement
            : preview as HTMLElement;

        if (!target) return;

        // Parse the prompt and apply modifications
        const lowerPrompt = prompt.toLowerCase();

        if (lowerPrompt.includes('dark blue') || lowerPrompt.includes('blue background')) {
            target.style.backgroundColor = '#1e3a5f';
            target.style.color = 'white';
        } else if (lowerPrompt.includes('font size') || lowerPrompt.includes('larger')) {
            const headings = preview.querySelectorAll('h1, h2, h3, h4, h5, h6');
            headings.forEach(h => {
                (h as HTMLElement).style.fontSize = '120%';
            });
        } else if (lowerPrompt.includes('hide')) {
            const nav = preview.querySelector('nav, header, .navbar, .header');
            if (nav) (nav as HTMLElement).style.display = 'none';
        } else if (lowerPrompt.includes('rounded')) {
            const buttons = preview.querySelectorAll('button, .btn, a.button, input[type="button"], input[type="submit"]');
            buttons.forEach(btn => {
                (btn as HTMLElement).style.borderRadius = '12px';
            });
        } else if (lowerPrompt.includes('red')) {
            target.style.backgroundColor = '#dc2626';
        } else if (lowerPrompt.includes('green')) {
            target.style.backgroundColor = '#16a34a';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-5xl mx-auto mt-6"
        >
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] overflow-hidden">
                {/* Chat Header */}
                <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-white">AI Assistant</span>
                    <span className="text-xs text-[var(--text-muted)] ml-auto">
                        {apiKey ? "Powered by Tambo" : "Local Mode"}
                    </span>
                </div>

                {/* Selected Element Indicator */}
                {selectedElement && (
                    <div className="px-4 py-2 bg-purple-500/10 border-b border-purple-500/30 flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                        <span className="text-xs text-purple-300">
                            Selected: <code className="bg-purple-500/20 px-1 rounded">{selectedElement.path}</code>
                        </span>
                    </div>
                )}

                {/* Messages Area */}
                <div className="p-4 max-h-60 overflow-y-auto space-y-3">
                    {messages.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-sm text-[var(--text-muted)] mb-4">
                                Ask me to modify the website's UI. Try:
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {examplePrompts.map((prompt, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleExampleClick(prompt)}
                                        className="px-3 py-1.5 text-xs rounded-full bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-white transition-colors"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg text-sm ${message.role === "user"
                                        ? "bg-[var(--accent-primary)]/20 ml-8 text-[var(--text-primary)]"
                                        : "bg-[var(--surface-secondary)] mr-8 text-green-400"
                                    }`}
                            >
                                {message.content}
                            </div>
                        ))
                    )}

                    {/* Loading indicator */}
                    {isPending && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--surface-secondary)] mr-8">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 rounded-full border-2 border-[var(--surface-hover)] border-t-[var(--accent-primary)]"
                            />
                            <span className="text-sm text-[var(--text-muted)]">Applying changes...</span>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--border-subtle)]">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Describe your UI changes..."
                            disabled={isPending}
                            className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--border-subtle)] text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isPending}
                            className="px-4 py-2.5 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
