import { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";

/**
 * Tambo Configuration
 * 
 * Register components that the AI can generate in responses.
 */

// Color modification component for changing UI colors
interface ColorChangeProps {
    selector: string;
    property: "background" | "color" | "border-color";
    value: string;
}

function ColorChange({ selector, property, value }: ColorChangeProps) {
    // Apply the color change to the preview
    if (typeof document !== "undefined") {
        const elements = document.querySelectorAll(`.html-preview ${selector}`);
        elements.forEach(el => {
            (el as HTMLElement).style[property as any] = value;
        });
    }

    return (
        <div className= "p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm" >
      ✓ Applied { property }: { value } to { selector }
    </div>
  );
}

// Style modification component
interface StyleChangeProps {
    selector: string;
    styles: Record<string, string>;
}

function StyleChange({ selector, styles }: StyleChangeProps) {
    // Apply styles to the preview
    if (typeof document !== "undefined") {
        const elements = document.querySelectorAll(`.html-preview ${selector}`);
        elements.forEach(el => {
            const element = el as HTMLElement;
            Object.entries(styles).forEach(([prop, value]) => {
                element.style[prop as any] = value;
            });
        });
    }

    return (
        <div className= "p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm" >
      ✓ Applied { Object.keys(styles).length } style changes to { selector }
    </div>
  );
}

// Text modification component
interface TextChangeProps {
    selector: string;
    newText: string;
}

function TextChange({ selector, newText }: TextChangeProps) {
    // Change text content
    if (typeof document !== "undefined") {
        const element = document.querySelector(`.html-preview ${selector}`);
        if (element) {
            element.textContent = newText;
        }
    }

    return (
        <div className= "p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm" >
      ✓ Changed text of { selector }
    </div>
  );
}

// Element visibility component
interface VisibilityChangeProps {
    selector: string;
    visible: boolean;
}

function VisibilityChange({ selector, visible }: VisibilityChangeProps) {
    if (typeof document !== "undefined") {
        const elements = document.querySelectorAll(`.html-preview ${selector}`);
        elements.forEach(el => {
            (el as HTMLElement).style.display = visible ? "" : "none";
        });
    }

    return (
        <div className= "p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm" >
      ✓ { visible ? "Showing" : "Hiding" } { selector }
    </div>
  );
}

// Export Tambo components array
export const tamboComponents: TamboComponent[] = [
    {
        name: "ColorChange",
        description: "Changes the color of elements in the website preview. Use this to modify background colors, text colors, or border colors.",
        component: ColorChange,
        propsSchema: z.object({
            selector: z.string().describe("CSS selector for the element(s) to modify, e.g., 'h1', '.header', '#main-title'"),
            property: z.enum(["background", "color", "border-color"]).describe("The CSS color property to change"),
            value: z.string().describe("The new color value, e.g., '#ff0000', 'blue', 'rgb(255, 0, 0)'"),
        }),
    },
    {
        name: "StyleChange",
        description: "Applies multiple CSS style changes to elements. Use this for comprehensive style modifications like padding, margins, fonts, etc.",
        component: StyleChange,
        propsSchema: z.object({
            selector: z.string().describe("CSS selector for the element(s) to modify"),
            styles: z.record(z.string()).describe("Object with CSS property names and values, e.g., { 'padding': '20px', 'font-size': '16px' }"),
        }),
    },
    {
        name: "TextChange",
        description: "Changes the text content of an element. Use this to modify headlines, paragraphs, button text, etc.",
        component: TextChange,
        propsSchema: z.object({
            selector: z.string().describe("CSS selector for the element to modify"),
            newText: z.string().describe("The new text content"),
        }),
    },
    {
        name: "VisibilityChange",
        description: "Shows or hides elements in the website preview. Use this to remove unwanted elements or show hidden content.",
        component: VisibilityChange,
        propsSchema: z.object({
            selector: z.string().describe("CSS selector for the element(s) to show/hide"),
            visible: z.boolean().describe("Whether to show (true) or hide (false) the element"),
        }),
    },
];

// Export tools for Tambo
export const tamboTools = [
    {
        name: "getCurrentStyles",
        description: "Get the current computed styles of an element in the preview",
        parameters: z.object({
            selector: z.string().describe("CSS selector for the element"),
        }),
        execute: async ({ selector }: { selector: string }) => {
            if (typeof document === "undefined") return { error: "Not in browser" };

            const element = document.querySelector(`.html-preview ${selector}`);
            if (!element) return { error: `Element not found: ${selector}` };

            const styles = window.getComputedStyle(element);
            return {
                background: styles.backgroundColor,
                color: styles.color,
                fontSize: styles.fontSize,
                padding: styles.padding,
                margin: styles.margin,
                display: styles.display,
            };
        },
    },
    {
        name: "getElementText",
        description: "Get the text content of an element in the preview",
        parameters: z.object({
            selector: z.string().describe("CSS selector for the element"),
        }),
        execute: async ({ selector }: { selector: string }) => {
            if (typeof document === "undefined") return { error: "Not in browser" };

            const element = document.querySelector(`.html-preview ${selector}`);
            if (!element) return { error: `Element not found: ${selector}` };

            return { text: element.textContent?.trim() };
        },
    },
];
