"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import UrlInput from "@/components/UrlInput";
import PreviewFrame from "@/components/PreviewFrame";
import AiChatTeaser from "@/components/AiChatTeaser";

/**
 * LickUI Landing Page
 * 
 * Main landing page showcasing the product's core value proposition:
 * Paste a URL → Preview locally → Remix the UI with AI chat.
 */
export default function Home() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate loading a website (mock - no real backend)
  const handleUrlSubmit = async (url: string) => {
    setIsLoading(true);

    // Simulate network delay for loading animation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setPreviewUrl(url);
    setIsLoading(false);
  };

  // Reset to initial state
  const handleReset = () => {
    setPreviewUrl(null);
  };

  return (
    <main className="min-h-screen bg-gradient-subtle">
      {/* Fixed Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="relative pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero & Input Section - Always visible but positioned differently */}
          <AnimatePresence mode="wait">
            {!previewUrl ? (
              // Initial state: Centered hero and input
              <motion.div
                key="hero-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center min-h-[70vh]"
              >
                <Hero />
                <UrlInput onSubmit={handleUrlSubmit} isLoading={isLoading} />
              </motion.div>
            ) : (
              // Preview state: Compact header with preview frame
              <motion.div
                key="preview-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* Compact Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-8"
                >
                  <h2 className="text-2xl font-semibold text-white mb-2">
                    Editing: <span className="text-[var(--accent-secondary)]">{new URL(previewUrl).hostname}</span>
                  </h2>
                  <button
                    onClick={handleReset}
                    className="text-sm text-[var(--text-muted)] hover:text-white transition-colors underline underline-offset-4"
                  >
                    ← Load a different site
                  </button>
                </motion.div>

                {/* Preview Frame */}
                <PreviewFrame url={previewUrl} />

                {/* AI Chat Teaser */}
                <AiChatTeaser />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Subtle Footer */}
      <footer className="py-8 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          Built with ❤️ for the future of web design
        </p>
      </footer>
    </main>
  );
}
