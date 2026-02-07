"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

/**
 * Navbar Component
 * 
 * Fixed navigation bar with glassmorphism effect on scroll.
 * Contains brand name and minimal navigation links.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "glass border-b border-[var(--border-subtle)]" 
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand */}
        <Link 
          href="/" 
          className="text-xl font-semibold tracking-tight text-white hover:opacity-80 transition-opacity"
        >
          LickUI
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          <Link
            href="#how-it-works"
            className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            How it works
          </Link>
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            GitHub
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
