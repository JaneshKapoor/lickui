"use client";

import { motion } from "framer-motion";

/**
 * Hero Component
 * 
 * Main hero section with animated headline and subheadline.
 * Uses Framer Motion for smooth fade and slide entrance.
 */
export default function Hero() {
    return (
        <div className="text-center mb-12">
            {/* Main Headline */}
            <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
            >
                Remix any website.{" "}
                <span className="gradient-text">Instantly.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed"
            >
                Paste a website URL, preview it locally, and reshape the UI using AI-powered chat.
            </motion.p>
        </div>
    );
}
