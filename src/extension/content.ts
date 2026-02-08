/**
 * LickUI Chrome Extension - Content Script
 * 
 * Injects a floating chat button and panel on every webpage.
 * Uses OpenAI to understand natural language and generate DOM modifications.
 */

// Declare chrome for TypeScript
declare const chrome: any;

// OPENAI API KEY - Injected at build time from .env file
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

interface Message {
    role: "user" | "assistant";
    content: string;
    type?: "success" | "error";
}

class LickUI {
    private root: HTMLDivElement | null = null;
    private panel: HTMLDivElement | null = null;
    private fab: HTMLButtonElement | null = null;
    private input: HTMLInputElement | null = null;
    private messagesContainer: HTMLDivElement | null = null;
    private messages: Message[] = [];
    private selectedElement: HTMLElement | null = null;
    private selectedPath: string = "";
    private isOpen: boolean = false;
    private isSelecting: boolean = false;
    private conversationHistory: Array<{ role: string; content: string }> = [];

    constructor() {
        this.init();
    }

    private init() {
        // Create root container
        this.root = document.createElement("div");
        this.root.id = "lickui-root";
        document.body.appendChild(this.root);

        // Create floating action button
        this.createFAB();

        // Create chat panel
        this.createPanel();

        console.log("[LickUI] Extension initialized with OpenAI");
    }

    private createFAB() {
        this.fab = document.createElement("button");
        this.fab.id = "lickui-fab";
        this.fab.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" fill="none"/>
      </svg>
    `;
        this.fab.addEventListener("click", () => this.togglePanel());
        this.root!.appendChild(this.fab);
    }

    private createPanel() {
        this.panel = document.createElement("div");
        this.panel.id = "lickui-panel";
        this.panel.innerHTML = `
      <div class="lickui-header">
        <span class="status"></span>
        <h3>LickUI Assistant</h3>
        <span class="badge">🤖 OpenAI</span>
      </div>
      <div id="lickui-selected-indicator" class="lickui-selected-indicator" style="display: none;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/>
        </svg>
        Selected: <code id="lickui-selected-path"></code>
        <button id="lickui-clear-selection" style="margin-left:auto;background:none;border:none;color:#a78bfa;cursor:pointer;font-size:11px;">✕</button>
      </div>
      <div id="lickui-messages" class="lickui-messages"></div>
      <div class="lickui-quick-actions">
        <button class="lickui-example-btn" data-prompt="[SELECT]">📍 Select element</button>
        <button class="lickui-example-btn" data-prompt="Apply dark mode to this page">🌙 Dark mode</button>
        <button class="lickui-example-btn" data-prompt="Hide the navigation bar">🙈 Hide nav</button>
        <button class="lickui-example-btn" data-prompt="Make all text larger">🔤 Larger text</button>
      </div>
      <div class="lickui-input-area">
        <textarea class="lickui-input" id="lickui-chat-input" placeholder="Describe any UI change..." rows="1"></textarea>
        <button class="lickui-send-btn" id="lickui-send-btn">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;
        this.root!.appendChild(this.panel);

        // Get references
        this.messagesContainer = this.panel.querySelector("#lickui-messages");
        this.input = this.panel.querySelector("#lickui-chat-input") as HTMLInputElement;

        // Event listeners - support Shift+Enter for new line, Enter to send
        this.input?.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
            // Shift+Enter allows default behavior (new line in textarea)
        });

        // Auto-resize textarea
        this.input?.addEventListener("input", () => {
            if (this.input) {
                this.input.style.height = "auto";
                this.input.style.height = Math.min(this.input.scrollHeight, 100) + "px";
            }
        });

        this.panel.querySelector("#lickui-send-btn")?.addEventListener("click", () => this.handleSend());
        this.panel.querySelector("#lickui-clear-selection")?.addEventListener("click", () => this.clearSelection());

        // Example prompts - attach to all buttons
        this.panel.querySelectorAll(".lickui-example-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const prompt = (e.target as HTMLElement).dataset.prompt;
                if (prompt === "[SELECT]") {
                    this.startElementSelection();
                } else if (prompt && this.input) {
                    this.input.value = prompt;
                    this.handleSend();
                }
            });
        });

        // Initialize system prompt
        this.initConversation();

        // Show welcome message
        this.addMessage({
            role: "assistant",
            content: "👋 Hi! Select an element or describe what you want to change."
        });
    }

    private initConversation() {
        this.conversationHistory = [{
            role: "user",
            content: `You are LickUI, an AI that modifies website UI using CSS and DOM manipulation.

When the user describes a change, respond ONLY with valid JSON in this exact format:
{
  "css": [{"selector": "CSS_SELECTOR", "styles": {"property": "value"}}],
  "actions": [{"type": "move|hide|show|text", "selector": "CSS_SELECTOR", "target": "TARGET_SELECTOR", "position": "before|after|inside", "value": "TEXT"}],
  "message": "Brief description of what was done"
}

Rules:
1. Use camelCase for CSS properties (backgroundColor, not background-color)
2. For "move" actions, clone the element to the target location
3. For "hide" set display:none, for "show" remove display:none
4. If user says something like "bottom right", use position:fixed and right:0, bottom:0
5. Be creative with selectors - use IDs, classes, tag names, or combinations
6. If unsure, make your best guess based on typical website structure
7. ALWAYS respond with valid JSON only, no extra text

The current page is: ${window.location.hostname}
Page title: ${document.title}

Key elements on this page:
${this.getPageContext()}

Acknowledge with: {"message": "Ready to help! Select an element or describe what you want to change.", "css": [], "actions": []}`
        }];
    }

    private getPageContext(): string {
        const elements: string[] = [];

        // Get key elements with their selectors
        document.querySelectorAll("header, nav, .header, .navbar, [role='banner']").forEach((el, i) => {
            if (i < 2) elements.push(`- Header/Nav: ${this.getBestSelector(el as HTMLElement)}`);
        });

        document.querySelectorAll("main, article, .main, .content, [role='main']").forEach((el, i) => {
            if (i < 2) elements.push(`- Main content: ${this.getBestSelector(el as HTMLElement)}`);
        });

        document.querySelectorAll("footer, .footer").forEach((el, i) => {
            if (i < 1) elements.push(`- Footer: ${this.getBestSelector(el as HTMLElement)}`);
        });

        document.querySelectorAll("input[type='search'], .search-box, [role='search']").forEach((el, i) => {
            if (i < 2) elements.push(`- Search: ${this.getBestSelector(el as HTMLElement)}`);
        });

        return elements.join("\n") || "No specific elements identified";
    }

    private getBestSelector(el: HTMLElement): string {
        if (el.id) return `#${el.id}`;
        let selector = el.tagName.toLowerCase();
        if (el.className && typeof el.className === "string") {
            const classes = el.className.split(" ")
                .filter(c => c && !c.startsWith("lickui") && c.length < 30)
                .slice(0, 2);
            if (classes.length) selector += "." + classes.join(".");
        }
        return selector;
    }



    private togglePanel() {
        this.isOpen = !this.isOpen;
        this.panel?.classList.toggle("open", this.isOpen);
        this.fab?.classList.toggle("active", this.isOpen);

        if (this.isOpen && this.input) {
            this.input.focus();
        }
    }

    private async handleSend() {
        if (!this.input || !this.input.value.trim()) return;

        const userPrompt = this.input.value.trim();
        this.input.value = "";

        // Build context message
        let contextPrompt = userPrompt;
        if (this.selectedElement) {
            const computedStyles = window.getComputedStyle(this.selectedElement);
            contextPrompt = `[Selected element: ${this.selectedPath}
Tag: ${this.selectedElement.tagName.toLowerCase()}
Current styles: position=${computedStyles.position}, display=${computedStyles.display}, width=${computedStyles.width}, height=${computedStyles.height}
Text content: "${this.selectedElement.textContent?.slice(0, 50)}..."]

User request: ${userPrompt}`;
        }

        // Add user message
        this.addMessage({ role: "user", content: userPrompt });
        this.conversationHistory.push({ role: "user", content: contextPrompt });

        // Show loading
        this.showLoading();

        // Call Gemini AI
        await this.callOpenAI(contextPrompt);
    }

    private addMessage(message: Message) {
        this.messages.push(message);
        this.renderMessages();
    }

    private renderMessages() {
        if (!this.messagesContainer) return;

        const messagesHTML = this.messages.map(msg => `
      <div class="lickui-message ${msg.role} ${msg.type || ""}">
        ${msg.content}
      </div>
    `).join("");

        this.messagesContainer.innerHTML = messagesHTML;
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    private showLoading() {
        if (!this.messagesContainer) return;
        this.messagesContainer.innerHTML += `
      <div class="lickui-loading" id="lickui-loading">
        <div class="lickui-spinner"></div>
        <span style="font-size: 13px; color: rgba(255,255,255,0.7);">Thinking...</span>
      </div>
    `;
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    private hideLoading() {
        document.getElementById("lickui-loading")?.remove();
    }

    private async callOpenAI(prompt: string): Promise<void> {
        // Check if API key is set
        if (!OPENAI_API_KEY) {
            this.hideLoading();
            this.addMessage({
                role: "assistant",
                content: "API key not configured. Please contact the developer.",
                type: "error"
            });
            return;
        }

        try {
            // Build messages for OpenAI
            const systemPrompt = this.conversationHistory.length > 0 ? this.conversationHistory[0].content : "";

            const messages = [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ];

            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 1024,
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error?.message || `API error: ${response.status}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            this.hideLoading();

            // Extract the response text from OpenAI format
            const responseText = data.choices?.[0]?.message?.content || "";

            // Try to parse as JSON
            try {
                // Extract JSON from the response (in case there's extra text)
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);

                    // Apply CSS changes
                    if (parsed.css && Array.isArray(parsed.css)) {
                        this.applyCssChanges(parsed.css);
                    }

                    // Apply DOM actions
                    if (parsed.actions && Array.isArray(parsed.actions)) {
                        this.applyActions(parsed.actions);
                    }

                    // Show message
                    const message = parsed.message || "Changes applied!";
                    this.addMessage({ role: "assistant", content: `✓ ${message}`, type: "success" });

                    // Add to conversation history
                    this.conversationHistory.push({ role: "assistant", content: jsonMatch[0] });
                } else {
                    // No JSON found, show the response as-is
                    this.addMessage({ role: "assistant", content: responseText });
                }
            } catch (parseError) {
                console.error("[LickUI] Parse error:", parseError);
                // Show raw response if JSON parsing fails
                this.addMessage({ role: "assistant", content: responseText });
            }

        } catch (error) {
            console.error("[LickUI] OpenAI API error:", error);
            this.hideLoading();
            this.addMessage({
                role: "assistant",
                content: `Error: ${error instanceof Error ? error.message : "Failed to connect to AI"}`,
                type: "error"
            });
        }
    }

    private applyCssChanges(cssChanges: Array<{ selector: string; styles: Record<string, string> }>) {
        for (const change of cssChanges) {
            try {
                const elements = document.querySelectorAll(change.selector);
                if (elements.length === 0) {
                    console.warn(`[LickUI] No elements found for selector: ${change.selector}`);
                    // Try with selected element if available
                    if (this.selectedElement) {
                        Object.entries(change.styles).forEach(([prop, value]) => {
                            (this.selectedElement as any).style[prop] = value;
                        });
                    }
                    continue;
                }

                elements.forEach(el => {
                    Object.entries(change.styles).forEach(([prop, value]) => {
                        (el as HTMLElement).style[prop as any] = value;
                    });
                });
                console.log(`[LickUI] Applied styles to ${elements.length} element(s): ${change.selector}`);
            } catch (e) {
                console.error(`[LickUI] Failed to apply CSS:`, e);
            }
        }
    }

    private applyActions(actions: Array<{ type: string; selector: string; target?: string; position?: string; value?: string }>) {
        for (const action of actions) {
            try {
                let elements = document.querySelectorAll(action.selector);

                // If no elements found and we have a selected element, use that
                if (elements.length === 0 && this.selectedElement) {
                    elements = [this.selectedElement] as any;
                }

                switch (action.type) {
                    case "hide":
                        elements.forEach(el => (el as HTMLElement).style.display = "none");
                        break;
                    case "show":
                        elements.forEach(el => (el as HTMLElement).style.display = "");
                        break;
                    case "text":
                        if (action.value && elements[0]) {
                            elements[0].textContent = action.value;
                        }
                        break;
                    case "move":
                        if (action.target && elements[0]) {
                            const targetEl = document.querySelector(action.target);
                            if (targetEl) {
                                const clone = elements[0].cloneNode(true) as HTMLElement;
                                if (action.position === "before") {
                                    targetEl.parentNode?.insertBefore(clone, targetEl);
                                } else if (action.position === "after") {
                                    targetEl.parentNode?.insertBefore(clone, targetEl.nextSibling);
                                } else {
                                    targetEl.appendChild(clone);
                                }
                                elements[0].remove();
                            }
                        }
                        break;
                    case "remove":
                        elements.forEach(el => el.remove());
                        break;
                }
                console.log(`[LickUI] Applied action: ${action.type} on ${action.selector}`);
            } catch (e) {
                console.error(`[LickUI] Failed to apply action:`, e);
            }
        }
    }

    private startElementSelection() {
        this.isSelecting = true;
        document.body.classList.add("lickui-selecting");

        this.addMessage({
            role: "assistant",
            content: "👆 Click on any element to select it. Press Escape to cancel."
        });

        const handleClick = (e: MouseEvent) => {
            if (!this.isSelecting) return;

            const target = e.target as HTMLElement;
            if (target.closest("#lickui-root")) return;

            e.preventDefault();
            e.stopPropagation();

            this.selectElement(target);
            this.stopElementSelection();
            document.removeEventListener("click", handleClick, true);
            document.removeEventListener("keydown", handleKeydown);
        };

        const handleKeydown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                this.stopElementSelection();
                this.addMessage({ role: "assistant", content: "Selection cancelled." });
                document.removeEventListener("click", handleClick, true);
                document.removeEventListener("keydown", handleKeydown);
            }
        };

        document.addEventListener("click", handleClick, true);
        document.addEventListener("keydown", handleKeydown);

        // Highlight on hover
        const handleHover = (e: MouseEvent) => {
            if (!this.isSelecting) {
                document.removeEventListener("mouseover", handleHover);
                return;
            }
            const target = e.target as HTMLElement;
            if (target.closest("#lickui-root")) return;

            document.querySelectorAll(".lickui-highlight").forEach(el => el.classList.remove("lickui-highlight"));
            target.classList.add("lickui-highlight");
        };

        document.addEventListener("mouseover", handleHover);
    }

    private stopElementSelection() {
        this.isSelecting = false;
        document.body.classList.remove("lickui-selecting");
        document.querySelectorAll(".lickui-highlight").forEach(el => el.classList.remove("lickui-highlight"));
    }

    private selectElement(element: HTMLElement) {
        document.querySelectorAll(".lickui-selected").forEach(el => el.classList.remove("lickui-selected"));

        this.selectedElement = element;
        element.classList.add("lickui-selected");

        this.selectedPath = this.generateDetailedSelector(element);

        const indicator = document.getElementById("lickui-selected-indicator");
        const pathEl = document.getElementById("lickui-selected-path");
        if (indicator && pathEl) {
            indicator.style.display = "flex";
            pathEl.textContent = this.selectedPath;
        }

        const tagName = element.tagName.toLowerCase();
        const text = element.textContent?.slice(0, 30) || "";

        this.addMessage({
            role: "assistant",
            content: `✓ Selected: <${tagName}>${text ? ` "${text}..."` : ""}\n\nNow describe what you want to do with it in natural language!`,
            type: "success"
        });
    }

    private clearSelection() {
        document.querySelectorAll(".lickui-selected").forEach(el => el.classList.remove("lickui-selected"));
        this.selectedElement = null;
        this.selectedPath = "";

        const indicator = document.getElementById("lickui-selected-indicator");
        if (indicator) indicator.style.display = "none";
    }

    private generateDetailedSelector(element: HTMLElement): string {
        if (element.id) return `#${element.id}`;

        const path: string[] = [];
        let current: HTMLElement | null = element;

        while (current && current !== document.body && path.length < 4) {
            let selector = current.tagName.toLowerCase();

            if (current.id) {
                selector = `#${current.id}`;
                path.unshift(selector);
                break;
            }

            if (current.className && typeof current.className === "string") {
                const classes = current.className.split(" ")
                    .filter(c => c && !c.startsWith("lickui") && c.length < 25)
                    .slice(0, 2);
                if (classes.length) selector += "." + classes.join(".");
            }

            path.unshift(selector);
            current = current.parentElement;
        }

        return path.join(" > ");
    }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => new LickUI());
} else {
    new LickUI();
}
