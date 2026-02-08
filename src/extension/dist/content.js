"use strict";(()=>{var c="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",l=class{constructor(){this.root=null;this.panel=null;this.fab=null;this.input=null;this.messagesContainer=null;this.messages=[];this.selectedElement=null;this.selectedPath="";this.isOpen=!1;this.isSelecting=!1;this.conversationHistory=[];this.init()}init(){this.root=document.createElement("div"),this.root.id="lickui-root",document.body.appendChild(this.root),this.createFAB(),this.createPanel(),console.log("[LickUI] Extension initialized with OpenAI")}createFAB(){this.fab=document.createElement("button"),this.fab.id="lickui-fab",this.fab.innerHTML=`
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" fill="none"/>
      </svg>
    `,this.fab.addEventListener("click",()=>this.togglePanel()),this.root.appendChild(this.fab)}createPanel(){this.panel=document.createElement("div"),this.panel.id="lickui-panel",this.panel.innerHTML=`
      <div class="lickui-header">
        <span class="status"></span>
        <h3>LickUI Assistant</h3>
        <span class="badge">\u{1F916} OpenAI</span>
      </div>
      <div id="lickui-selected-indicator" class="lickui-selected-indicator" style="display: none;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/>
        </svg>
        Selected: <code id="lickui-selected-path"></code>
        <button id="lickui-clear-selection" style="margin-left:auto;background:none;border:none;color:#a78bfa;cursor:pointer;font-size:11px;">\u2715</button>
      </div>
      <div id="lickui-messages" class="lickui-messages">
        <div class="lickui-examples">
          <p>What would you like to change?</p>
          <div class="lickui-examples-grid">
            <button class="lickui-example-btn" data-prompt="[SELECT]">\u{1F4CD} Select element</button>
            <button class="lickui-example-btn" data-prompt="Apply dark mode to this page">Dark mode</button>
            <button class="lickui-example-btn" data-prompt="Hide the navigation bar">Hide nav</button>
            <button class="lickui-example-btn" data-prompt="Make all text larger">Larger text</button>
          </div>
        </div>
      </div>
      <div class="lickui-input-area">
        <input type="text" class="lickui-input" id="lickui-chat-input" placeholder="Describe any UI change you want..." />
        <button class="lickui-send-btn" id="lickui-send-btn">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `,this.root.appendChild(this.panel),this.messagesContainer=this.panel.querySelector("#lickui-messages"),this.input=this.panel.querySelector("#lickui-chat-input"),this.input?.addEventListener("keydown",s=>{s.key==="Enter"&&this.handleSend()}),this.panel.querySelector("#lickui-send-btn")?.addEventListener("click",()=>this.handleSend()),this.panel.querySelector("#lickui-clear-selection")?.addEventListener("click",()=>this.clearSelection()),this.panel.querySelectorAll(".lickui-example-btn").forEach(s=>{s.addEventListener("click",t=>{let e=t.target.dataset.prompt;e==="[SELECT]"?this.startElementSelection():e&&this.input&&(this.input.value=e,this.handleSend())})}),this.initConversation()}initConversation(){this.conversationHistory=[{role:"user",content:`You are LickUI, an AI that modifies website UI using CSS and DOM manipulation.

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

Acknowledge with: {"message": "Ready to help! Select an element or describe what you want to change.", "css": [], "actions": []}`}]}getPageContext(){let s=[];return document.querySelectorAll("header, nav, .header, .navbar, [role='banner']").forEach((t,e)=>{e<2&&s.push(`- Header/Nav: ${this.getBestSelector(t)}`)}),document.querySelectorAll("main, article, .main, .content, [role='main']").forEach((t,e)=>{e<2&&s.push(`- Main content: ${this.getBestSelector(t)}`)}),document.querySelectorAll("footer, .footer").forEach((t,e)=>{e<1&&s.push(`- Footer: ${this.getBestSelector(t)}`)}),document.querySelectorAll("input[type='search'], .search-box, [role='search']").forEach((t,e)=>{e<2&&s.push(`- Search: ${this.getBestSelector(t)}`)}),s.join(`
`)||"No specific elements identified"}getBestSelector(s){if(s.id)return`#${s.id}`;let t=s.tagName.toLowerCase();if(s.className&&typeof s.className=="string"){let e=s.className.split(" ").filter(i=>i&&!i.startsWith("lickui")&&i.length<30).slice(0,2);e.length&&(t+="."+e.join("."))}return t}togglePanel(){this.isOpen=!this.isOpen,this.panel?.classList.toggle("open",this.isOpen),this.fab?.classList.toggle("active",this.isOpen),this.isOpen&&this.input&&this.input.focus()}async handleSend(){if(!this.input||!this.input.value.trim())return;let s=this.input.value.trim();this.input.value="";let t=s;if(this.selectedElement){let e=window.getComputedStyle(this.selectedElement);t=`[Selected element: ${this.selectedPath}
Tag: ${this.selectedElement.tagName.toLowerCase()}
Current styles: position=${e.position}, display=${e.display}, width=${e.width}, height=${e.height}
Text content: "${this.selectedElement.textContent?.slice(0,50)}..."]

User request: ${s}`}this.addMessage({role:"user",content:s}),this.conversationHistory.push({role:"user",content:t}),this.showLoading(),await this.callOpenAI(t)}addMessage(s){this.messages.push(s),this.renderMessages()}renderMessages(){if(!this.messagesContainer)return;let s=this.messages.map(t=>`
      <div class="lickui-message ${t.role} ${t.type||""}">
        ${t.content}
      </div>
    `).join("");this.messagesContainer.innerHTML=s,this.messagesContainer.scrollTop=this.messagesContainer.scrollHeight}showLoading(){this.messagesContainer&&(this.messagesContainer.innerHTML+=`
      <div class="lickui-loading" id="lickui-loading">
        <div class="lickui-spinner"></div>
        <span style="font-size: 13px; color: rgba(255,255,255,0.7);">Thinking...</span>
      </div>
    `,this.messagesContainer.scrollTop=this.messagesContainer.scrollHeight)}hideLoading(){document.getElementById("lickui-loading")?.remove()}async callOpenAI(s){if(!c){this.hideLoading(),this.addMessage({role:"assistant",content:"API key not configured. Please contact the developer.",type:"error"});return}try{let e=[{role:"system",content:this.conversationHistory.length>0?this.conversationHistory[0].content:""},{role:"user",content:s}],i=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${c}`},body:JSON.stringify({model:"gpt-4o-mini",messages:e,temperature:.7,max_tokens:1024})});if(!i.ok){let a=(await i.json()).error?.message||`API error: ${i.status}`;throw new Error(a)}let n=await i.json();this.hideLoading();let o=n.choices?.[0]?.message?.content||"";try{let r=o.match(/\{[\s\S]*\}/);if(r){let a=JSON.parse(r[0]);a.css&&Array.isArray(a.css)&&this.applyCssChanges(a.css),a.actions&&Array.isArray(a.actions)&&this.applyActions(a.actions);let d=a.message||"Changes applied!";this.addMessage({role:"assistant",content:`\u2713 ${d}`,type:"success"}),this.conversationHistory.push({role:"assistant",content:r[0]})}else this.addMessage({role:"assistant",content:o})}catch(r){console.error("[LickUI] Parse error:",r),this.addMessage({role:"assistant",content:o})}}catch(t){console.error("[LickUI] OpenAI API error:",t),this.hideLoading(),this.addMessage({role:"assistant",content:`Error: ${t instanceof Error?t.message:"Failed to connect to AI"}`,type:"error"})}}applyCssChanges(s){for(let t of s)try{let e=document.querySelectorAll(t.selector);if(e.length===0){console.warn(`[LickUI] No elements found for selector: ${t.selector}`),this.selectedElement&&Object.entries(t.styles).forEach(([i,n])=>{this.selectedElement.style[i]=n});continue}e.forEach(i=>{Object.entries(t.styles).forEach(([n,o])=>{i.style[n]=o})}),console.log(`[LickUI] Applied styles to ${e.length} element(s): ${t.selector}`)}catch(e){console.error("[LickUI] Failed to apply CSS:",e)}}applyActions(s){for(let t of s)try{let e=document.querySelectorAll(t.selector);switch(e.length===0&&this.selectedElement&&(e=[this.selectedElement]),t.type){case"hide":e.forEach(i=>i.style.display="none");break;case"show":e.forEach(i=>i.style.display="");break;case"text":t.value&&e[0]&&(e[0].textContent=t.value);break;case"move":if(t.target&&e[0]){let i=document.querySelector(t.target);if(i){let n=e[0].cloneNode(!0);t.position==="before"?i.parentNode?.insertBefore(n,i):t.position==="after"?i.parentNode?.insertBefore(n,i.nextSibling):i.appendChild(n),e[0].remove()}}break;case"remove":e.forEach(i=>i.remove());break}console.log(`[LickUI] Applied action: ${t.type} on ${t.selector}`)}catch(e){console.error("[LickUI] Failed to apply action:",e)}}startElementSelection(){this.isSelecting=!0,document.body.classList.add("lickui-selecting"),this.addMessage({role:"assistant",content:"\u{1F446} Click on any element to select it. Press Escape to cancel."});let s=i=>{if(!this.isSelecting)return;let n=i.target;n.closest("#lickui-root")||(i.preventDefault(),i.stopPropagation(),this.selectElement(n),this.stopElementSelection(),document.removeEventListener("click",s,!0),document.removeEventListener("keydown",t))},t=i=>{i.key==="Escape"&&(this.stopElementSelection(),this.addMessage({role:"assistant",content:"Selection cancelled."}),document.removeEventListener("click",s,!0),document.removeEventListener("keydown",t))};document.addEventListener("click",s,!0),document.addEventListener("keydown",t);let e=i=>{if(!this.isSelecting){document.removeEventListener("mouseover",e);return}let n=i.target;n.closest("#lickui-root")||(document.querySelectorAll(".lickui-highlight").forEach(o=>o.classList.remove("lickui-highlight")),n.classList.add("lickui-highlight"))};document.addEventListener("mouseover",e)}stopElementSelection(){this.isSelecting=!1,document.body.classList.remove("lickui-selecting"),document.querySelectorAll(".lickui-highlight").forEach(s=>s.classList.remove("lickui-highlight"))}selectElement(s){document.querySelectorAll(".lickui-selected").forEach(o=>o.classList.remove("lickui-selected")),this.selectedElement=s,s.classList.add("lickui-selected"),this.selectedPath=this.generateDetailedSelector(s);let t=document.getElementById("lickui-selected-indicator"),e=document.getElementById("lickui-selected-path");t&&e&&(t.style.display="flex",e.textContent=this.selectedPath);let i=s.tagName.toLowerCase(),n=s.textContent?.slice(0,30)||"";this.addMessage({role:"assistant",content:`\u2713 Selected: <${i}>${n?` "${n}..."`:""}

Now describe what you want to do with it in natural language!`,type:"success"})}clearSelection(){document.querySelectorAll(".lickui-selected").forEach(t=>t.classList.remove("lickui-selected")),this.selectedElement=null,this.selectedPath="";let s=document.getElementById("lickui-selected-indicator");s&&(s.style.display="none")}generateDetailedSelector(s){if(s.id)return`#${s.id}`;let t=[],e=s;for(;e&&e!==document.body&&t.length<4;){let i=e.tagName.toLowerCase();if(e.id){i=`#${e.id}`,t.unshift(i);break}if(e.className&&typeof e.className=="string"){let n=e.className.split(" ").filter(o=>o&&!o.startsWith("lickui")&&o.length<25).slice(0,2);n.length&&(i+="."+n.join("."))}t.unshift(i),e=e.parentElement}return t.join(" > ")}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>new l):new l;})();
