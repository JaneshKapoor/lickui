"use client";

import { useEffect, useRef, useMemo } from "react";
import parse, { Element, domToReact, HTMLReactParserOptions, DOMNode } from "html-react-parser";

interface HtmlRendererProps {
    html: string;
    css: string;
    baseUrl: string;
    onElementClick?: (element: HTMLElement, path: string) => void;
}

/**
 * HtmlRenderer Component
 * 
 * Renders HTML string as React components with scoped CSS.
 * Supports element selection for AI modifications.
 */
export default function HtmlRenderer({ html, css, baseUrl, onElementClick }: HtmlRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const styleRef = useRef<HTMLStyleElement | null>(null);

    // Scope CSS to our container to avoid conflicts
    const scopedCss = useMemo(() => {
        if (!css) return "";

        // Add a scope prefix to all CSS rules
        const scopedRules = css
            // Handle @import statements - remove them (already inlined)
            .replace(/@import[^;]+;/g, "")
            // Handle @font-face - keep as is
            .replace(/(@font-face\s*\{[^}]+\})/g, "$1")
            // Handle @keyframes - keep as is
            .replace(/(@keyframes\s+[^{]+\{[\s\S]+?\}\s*\})/g, "$1")
            // Handle @media queries
            .replace(/@media([^{]+)\{([\s\S]*?)\}\s*\}/g, (match, query, rules) => {
                const scopedInner = rules.replace(/([^{}]+)\{/g, ".html-preview $1{");
                return `@media${query}{${scopedInner}}`;
            })
            // Scope regular rules
            .replace(/([^@{}][^{]*)\{/g, (match, selector) => {
                // Skip if already scoped or is a special selector
                if (selector.includes(".html-preview") || selector.trim().startsWith("@")) {
                    return match;
                }
                const selectors = selector.split(",").map((s: string) => `.html-preview ${s.trim()}`).join(", ");
                return `${selectors}{`;
            });

        return scopedRules;
    }, [css]);

    // Inject scoped CSS
    useEffect(() => {
        if (scopedCss && containerRef.current) {
            // Remove existing style if any
            if (styleRef.current) {
                styleRef.current.remove();
            }

            // Create and inject new style element
            const style = document.createElement("style");
            style.textContent = scopedCss;
            document.head.appendChild(style);
            styleRef.current = style;
        }

        return () => {
            if (styleRef.current) {
                styleRef.current.remove();
                styleRef.current = null;
            }
        };
    }, [scopedCss]);

    // Generate a unique path for each element
    const getElementPath = (node: Element, index: number): string => {
        const tag = node.name;
        const id = node.attribs?.id ? `#${node.attribs.id}` : "";
        const className = node.attribs?.class ? `.${node.attribs.class.split(" ")[0]}` : "";
        return `${tag}${id}${className}[${index}]`;
    };

    // Parser options for html-react-parser
    const parserOptions: HTMLReactParserOptions = useMemo(() => ({
        replace(domNode) {
            if (domNode instanceof Element) {
                const node = domNode as Element;

                // Handle images - ensure absolute URLs
                if (node.name === "img" && node.attribs?.src) {
                    const src = node.attribs.src;
                    if (!src.startsWith("http") && !src.startsWith("data:")) {
                        node.attribs.src = src.startsWith("/")
                            ? `${baseUrl}${src}`
                            : `${baseUrl}/${src}`;
                    }
                }

                // Handle links - make them open in new tab or prevent navigation
                if (node.name === "a") {
                    node.attribs = {
                        ...node.attribs,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: "event.stopPropagation()",
                    };
                }

                // Handle forms - prevent submission
                if (node.name === "form") {
                    node.attribs = {
                        ...node.attribs,
                        onSubmit: "event.preventDefault()",
                    };
                }

                // Remove script-related attributes
                if (node.attribs) {
                    Object.keys(node.attribs).forEach(attr => {
                        if (attr.startsWith("on") || attr === "javascript") {
                            delete node.attribs[attr];
                        }
                    });
                }
            }
        },
    }), [baseUrl]);

    // Handle click on elements for selection
    const handleClick = (e: React.MouseEvent) => {
        if (!onElementClick) return;

        e.stopPropagation();
        const target = e.target as HTMLElement;

        // Generate a CSS selector path
        const path = generateSelectorPath(target);
        onElementClick(target, path);
    };

    return (
        <div
            ref={containerRef}
            className="html-preview"
            onClick={handleClick}
            style={{
                background: "white",
                color: "black",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                minHeight: "100%",
                overflow: "auto",
            }}
        >
            {parse(html, parserOptions)}
        </div>
    );
}

/**
 * Generate a CSS selector path for an element
 */
function generateSelectorPath(element: HTMLElement): string {
    const parts: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current !== document.body) {
        let selector = current.tagName.toLowerCase();

        if (current.id) {
            selector += `#${current.id}`;
            parts.unshift(selector);
            break; // ID is unique, no need to go further
        }

        if (current.className && typeof current.className === "string") {
            const classes = current.className.trim().split(/\s+/).slice(0, 2).join(".");
            if (classes) {
                selector += `.${classes}`;
            }
        }

        parts.unshift(selector);
        current = current.parentElement;
    }

    return parts.join(" > ");
}
