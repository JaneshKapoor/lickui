"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import HtmlRenderer from "./HtmlRenderer";

interface ProxyResponse {
  html: string;
  css: string;
  baseUrl: string;
  title: string;
  success: boolean;
  error?: string;
}

interface PreviewFrameProps {
  url: string;
  onElementSelect?: (element: HTMLElement, path: string) => void;
}

/**
 * PreviewFrame Component
 * 
 * Renders external websites as React components using HtmlRenderer.
 * No iframes - full HTML parsing and React rendering.
 */
export default function PreviewFrame({ url, onElementSelect }: PreviewFrameProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proxyData, setProxyData] = useState<ProxyResponse | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    setProxyData(null);
    setRefreshKey(prev => prev + 1);
  };

  // Fetch website content via proxy
  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
        const data: ProxyResponse = await response.json();

        if (!data.success) {
          setError(data.error || "Failed to load website");
          return;
        }

        setProxyData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch website");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [url, refreshKey]);

  const handleElementClick = (element: HTMLElement, path: string) => {
    // Highlight the selected element
    const prevHighlight = document.querySelector(".lickui-selected");
    if (prevHighlight) {
      prevHighlight.classList.remove("lickui-selected");
      (prevHighlight as HTMLElement).style.outline = "";
    }

    element.classList.add("lickui-selected");
    element.style.outline = "2px solid #8b5cf6";

    if (onElementSelect) {
      onElementSelect(element, path);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-5xl mx-auto"
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
                className="w-4 h-4 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span className="text-[var(--text-secondary)] truncate">
                {proxyData?.title || url}
              </span>
              {isLoading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-3 h-3 rounded-full ml-auto"
                  style={{
                    borderWidth: "2px",
                    borderStyle: "solid",
                    borderColor: "var(--surface-hover)",
                    borderTopColor: "var(--accent-primary)"
                  }}
                />
              )}
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
            title="Reload"
          >
            <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Open in new tab */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
            title="Open in new tab"
          >
            <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Preview Content */}
        <div
          ref={containerRef}
          className="relative bg-white overflow-auto"
          style={{ height: "70vh" }}
        >
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--background)]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 rounded-full"
                style={{
                  borderWidth: "3px",
                  borderStyle: "solid",
                  borderColor: "var(--surface-secondary)",
                  borderTopColor: "var(--accent-primary)"
                }}
              />
              <p className="mt-4 text-sm text-[var(--text-muted)]">
                Fetching {new URL(url).hostname}...
              </p>
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Parsing HTML and reconstructing as React components
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--background)] p-8">
              <div className="w-16 h-16 mb-4 rounded-2xl bg-[var(--surface-secondary)] flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Unable to load preview</h3>
              <p className="text-sm text-[var(--text-muted)] text-center max-w-md mb-4">
                {error}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 rounded-lg bg-[var(--surface-secondary)] text-white text-sm hover:bg-[var(--surface-hover)] transition-colors"
                >
                  Try again
                </button>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm hover:bg-[var(--accent-secondary)] transition-colors"
                >
                  Open in new tab →
                </a>
              </div>
            </div>
          )}

          {/* Rendered HTML Content */}
          {proxyData && !isLoading && !error && (
            <HtmlRenderer
              html={proxyData.html}
              css={proxyData.css}
              baseUrl={proxyData.baseUrl}
              onElementClick={handleElementClick}
            />
          )}
        </div>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 px-4 py-3 rounded-lg bg-[var(--surface-primary)] border border-[var(--border-subtle)] flex items-center gap-3"
      >
        <svg className="w-5 h-5 text-[var(--accent-secondary)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-[var(--text-secondary)]">
          <span className="text-white font-medium">React Rendered:</span> Website HTML is parsed and rendered as React components. Click any element to select it.
        </p>
      </motion.div>
    </motion.div>
  );
}
