/**
 * @name BetterTimestamps
 * @author TSFAlex
 * @description A multi-step timestamp generator wizard built directly into your Discord client.
 * @version 0.3.3
 * @source https://github.com/TSFAlex1/Better-Timestamps
 */

module.exports = class BetterTimestamps {
    constructor() {
        this.selectedFormatCode = 'f';
        this.selectedFormatLabel = 'Short Date/Time (e.g., 14 June 2026 16:20)';
        this.activePage = 'page-format';
        
        this.settings = {
            autoCloseOnCopy: true,
            use24HourFormat: true
        };
    }

    start() {
        this.loadSettings();
        BdApi.DOM.addStyle("BetterTimestamps", this.getPluginStyles());
        this.createToolbarButton();
        this.observerChatBar();
        
        this.pollInterval = setInterval(() => {
            this.createToolbarButton();
        }, 300);
    }

    stop() {
        if (this.chatObserver) this.chatObserver.disconnect();
        if (this.pollInterval) clearInterval(this.pollInterval);
        
        const wrapper = document.getElementById("bt-toolbar-wrapper");
        if (wrapper) wrapper.remove();
        
        BdApi.DOM.removeStyle("BetterTimestamps");
        this.closeModal();
    }

    loadSettings() {
        try {
            const saved = BdApi.Data.load("BetterTimestamps", "settings");
            if (saved) this.settings = Object.assign(this.settings, saved);
        } catch (e) {
            console.error("BetterTimestamps: Could not load saved plugin settings.", e);
        }
    }

    saveSettings() {
        BdApi.Data.save("BetterTimestamps", "settings", this.settings);
    }

    getSettingsPanel() {
        const panel = document.createElement("div");
        panel.style.padding = "16px";
        panel.style.color = "#dbdee1";
        panel.style.fontFamily = "var(--font-primary)";

        const title = document.createElement("h2");
        title.textContent = "Better Timestamps Settings";
        title.style.color = "#f2f3f5";
        title.style.marginBottom = "20px";
        panel.appendChild(title);

        const row1 = this.createSettingToggle(
            "Auto-close Window on Copy",
            "Automatically closes the configuration modal assistant immediately after clicking 'Copy'.",
            this.settings.autoCloseOnCopy,
            (checked) => {
                this.settings.autoCloseOnCopy = checked;
                this.saveSettings();
            }
        );
        panel.appendChild(row1);

        const row2 = this.createSettingToggle(
            "Enforce 24-Hour Selection List",
            "Toggles selection hours logic representation values between military time indexes (00-23) and plain integers.",
            this.settings.use24HourFormat,
            (checked) => {
                this.settings.use24HourFormat = checked;
                this.saveSettings();
            }
        );
        panel.appendChild(row2);

        return panel;
    }

    createSettingToggle(label, desc, isChecked, onChange) {
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.justifyContent = "space-between";
        container.style.alignItems = "center";
        container.style.marginBottom = "16px";
        container.style.borderBottom = "1px solid #3f4147";
        container.style.paddingBottom = "12px";

        const textSubBlock = document.createElement("div");
        textSubBlock.style.maxWidth = "75%";
        
        const nameText = document.createElement("div");
        nameText.style.fontWeight = "600";
        nameText.style.color = "#f2f3f5";
        nameText.textContent = label;

        const descText = document.createElement("div");
        descText.style.fontSize = "12px";
        descText.style.color = "#949ba4";
        descText.style.marginTop = "4px";
        descText.textContent = desc;

        textSubBlock.appendChild(nameText);
        textSubBlock.appendChild(descText);
        container.appendChild(textSubBlock);

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = isChecked;
        checkbox.style.cursor = "pointer";
        checkbox.style.width = "18px";
        checkbox.style.height = "18px";
        checkbox.style.accentColor = "#5865f2";
        
        checkbox.addEventListener("change", (e) => onChange(e.target.checked));
        container.appendChild(checkbox);

        return container;
    }

    getPluginStyles() {
        return `
            .bt-button-wrapper {
                position: relative;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                margin-right: 4px;
            }
            #bt-toolbar-btn {
                background: none;
                border: none;
                padding: 0;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                color: #b5bac1 !important;
                height: 32px;
                width: 32px;
                border-radius: 4px;
                transition: color 0.15s ease, background-color 0.15s ease;
            }
            .bt-button-wrapper:hover #bt-toolbar-btn {
                color: #f2f3f5 !important;
                background-color: rgba(78, 80, 88, 0.3);
            }
            #bt-toolbar-btn:active {
                transform: scale(0.95);
            }
            .bt-tooltip {
                position: absolute;
                bottom: 40px;
                left: 50%;
                transform: translateX(-50%) scale(0.95);
                background-color: #111214 !important;
                color: #f2f3f5 !important;
                padding: 6px 12px;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 600;
                white-space: nowrap;
                box-shadow: var(--elevation-high);
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.1s ease, transform 0.1s ease;
                z-index: 10001;
                font-family: var(--font-primary);
            }
            .bt-tooltip::after {
                content: "";
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                border-width: 5px;
                border-style: solid;
                border-color: #111214 transparent transparent transparent;
            }
            .bt-button-wrapper:hover .bt-tooltip {
                opacity: 1;
                transform: translateX(-50%) scale(1);
            }
            .bt-modal-backdrop {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .bt-modal-container {
                background-color: #313338 !important;
                width: 460px;
                min-height: 380px;
                border-radius: 8px;
                padding: 24px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.3);
                display: flex;
                flex-direction: column;
                position: relative;
                overflow: hidden;
                color: #dbdee1;
                font-family: var(--font-primary);
            }
            .bt-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 24px;
                border-bottom: 1px solid #3f4147;
                padding-bottom: 14px;
            }
            .bt-header-left {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .bt-header h1 {
                font-size: 19px;
                color: #f2f3f5;
                font-weight: 700;
                margin: 0;
            }
            .bt-close-btn {
                cursor: pointer;
                color: #949ba4;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 4px;
                border-radius: 4px;
                transition: color 0.15s ease, background-color 0.15s ease;
            }
            .bt-close-btn:hover {
                color: #fa777c;
                background-color: rgba(250, 119, 124, 0.1);
            }
            .bt-icon-box {
                width: 28px;
                height: 28px;
                background: #2b2d31;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .bt-page {
                display: none;
                flex-direction: column;
                flex-grow: 1;
                opacity: 0;
                transform: translate3d(15px, 0, 0);
                transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.25s ease;
            }
            .bt-page.active {
                display: flex;
                opacity: 1;
                transform: translate3d(0, 0, 0);
            }
            .bt-page-title {
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                color: #949ba4;
                margin-bottom: 16px;
                letter-spacing: 0.5px;
            }
            .bt-footer {
                margin-top: auto;
                display: flex;
                justify-content: space-between;
                padding-top: 24px;
            }
            .bt-btn {
                background-color: #5865f2;
                color: #fff !important;
                border: none;
                border-radius: 4px;
                padding: 10px 24px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.15s ease, transform 0.1s ease;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            .bt-btn:hover { background-color: #4752c4; }
            .bt-btn:active { transform: scale(0.98); }
            .bt-btn-sec { background: #2b2d31; color: #dbdee1; }
            .bt-btn-sec:hover { background: #35373c; color: #fff; }
            .bt-btn-success { background-color: #248046; }
            .bt-btn-success:hover { background-color: #1a6535; }
            
            .bt-select {
                background: #1e1f22;
                border: 1px solid #3f4147;
                color: #dbdee1;
                padding: 10px 12px;
                border-radius: 4px;
                width: 100%;
                outline: none;
                cursor: pointer;
                font-size: 14px;
                appearance: none;
                -webkit-appearance: none;
                background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23b5bac1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>');
                background-repeat: no-repeat;
                background-position: right 12px center;
                transition: border-color 0.15s ease;
            }
            .bt-select:focus { border-color: #5865f2; }
            .bt-select option {
                background-color: #1e1f22;
                color: #dbdee1;
                padding: 10px;
            }

            .bt-input-row { display: flex; gap: 12px; margin-bottom: 12px; }
            .bt-input-col { flex: 1; display: flex; flex-direction: column; }
            .bt-label { font-size: 11px; color: #949ba4; text-transform: uppercase; margin-bottom: 6px; font-weight: 700; }
            
            .bt-input {
                background: #1e1f22;
                border: 1px solid #3f4147;
                color: #dbdee1;
                padding: 10px;
                border-radius: 4px;
                outline: none;
                font-size: 14px;
                transition: border-color 0.15s ease;
                font-family: var(--font-primary);
            }
            .bt-input:focus { border-color: #5865f2; }
            ::-webkit-calendar-picker-indicator {
                background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23b5bac1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>');
                cursor: pointer;
                filter: invert(0);
                padding: 2px;
                border-radius: 3px;
                transition: background-color 0.1s ease;
            }
            ::-webkit-calendar-picker-indicator:hover {
                background-color: rgba(78, 80, 88, 0.4);
            }

            .bt-card { background: #2b2d31; padding: 16px; border-radius: 6px; border: 1px solid #3f4147; }
            .bt-card-item { margin-bottom: 12px; }
            .bt-card-item:last-child { margin-bottom: 0; }
            
            .bt-output-box {
                background: #1e1f22;
                padding: 12px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 12px;
                border: 1px solid #3f4147;
            }
            .bt-code { font-family: var(--font-code); color: #23a55a; overflow-x: auto; white-space: nowrap; flex-grow: 1; margin-right: 12px; font-size: 13px; }
            .bt-preview { border-left: 4px solid #5865f2; background: #2b2d31; padding: 14px; margin-bottom: 14px; border-radius: 0 6px 6px 0; border: 1px solid #3f4147; border-left-width: 4px; }
        `;
    }

    observerChatBar() {
        this.chatObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    this.createToolbarButton();
                }
            }
        });
        this.chatObserver.observe(document.body, { childList: true, subtree: true });
    }

    createToolbarButton() {
        if (document.getElementById("bt-toolbar-wrapper")) return;

        const nativeMarker = document.querySelector('button[aria-label="Mute"]') || 
                             document.querySelector('button[aria-label="Unmute"]') || 
                             document.querySelector('button[aria-label="User Settings"]');
        
        if (!nativeMarker || !nativeMarker.parentElement) return;
        const targetContainer = nativeMarker.parentElement;

        const wrapper = document.createElement("div");
        wrapper.id = "bt-toolbar-wrapper";
        wrapper.className = "bt-button-wrapper";

        const btn = document.createElement("button");
        btn.id = "bt-toolbar-btn";
        btn.type = "button";

        btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
        `;
        
        const tooltip = document.createElement("div");
        tooltip.className = "bt-tooltip";
        tooltip.textContent = "Better Timestamps";

        wrapper.appendChild(btn);
        wrapper.appendChild(tooltip);
        
        wrapper.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openWizardModal();
        });
        
        targetContainer.insertBefore(wrapper, targetContainer.firstChild);
    }

    openWizardModal() {
        if (document.getElementById("bt-modal-root")) return;

        const modalRoot = document.createElement("div");
        modalRoot.id = "bt-modal-root";
        modalRoot.className = "bt-modal-backdrop";
        modalRoot.addEventListener("click", (e) => { if(e.target === modalRoot) this.closeModal(); });

        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const currentHour = now.getHours().toString().padStart(2, '0');
        const currentMin = now.getMinutes().toString().padStart(2, '0');

        modalRoot.innerHTML = `
            <div class="bt-modal-container">
                <div class="bt-header">
                    <div class="bt-header-left">
                        <div class="bt-icon-box">
                            <svg viewBox="0 0 24 24" fill="none" style="width:18px; height:18px;"><circle cx="12" cy="12" r="10" stroke="#5865f2" stroke-width="2.5"/><path d="M12 6V12L16 14" stroke="#5865f2" stroke-width="2.5" stroke-linecap="round"/></svg>
                        </div>
                        <h1>Better Timestamps</h1>
                    </div>
                    <div class="bt-close-btn" id="bt-modal-close" title="Close Panel">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                </div>

                <div class="bt-page active" id="bt-p1">
                    <div class="bt-page-title">Step 1: Choose Format</div>
                    <select id="bt-sel-format" class="bt-select">
                        <option value="t">Short Time (e.g., 16:20)</option>
                        <option value="T">Long Time (e.g., 16:20:30)</option>
                        <option value="d">Short Date (e.g., 14/06/2026)</option>
                        <option value="D">Long Date (e.g., 14 June 2026)</option>
                        <option value="f" selected>Short Date/Time (e.g., 14 June 2026 16:20)</option>
                        <option value="F">Long Date/Time (e.g., Sunday, 14 June 2026 16:20)</option>
                        <option value="R">Relative Time (e.g., in 2 hours)</option>
                    </select>
                    <div class="bt-footer">
                        <div></div>
                        <button class="bt-btn" id="bt-b1-next">Next</button>
                    </div>
                </div>

                <div class="bt-page" id="bt-p2">
                    <div class="bt-page-title">Step 2: Select Date & Time</div>
                    <div class="bt-input-col" style="margin-bottom:12px;">
                        <span class="bt-label">Date</span>
                        <input type="date" id="bt-date" class="bt-input" value="${currentDate}">
                    </div>
                    <div class="bt-input-row">
                        <div class="bt-input-col">
                            <span class="bt-label">Hour</span>
                            <select id="bt-hour" class="bt-select"></select>
                        </div>
                        <div class="bt-input-col">
                            <span class="bt-label">Minute</span>
                            <select id="bt-min" class="bt-select"></select>
                        </div>
                    </div>
                    <div class="bt-footer">
                        <button class="bt-btn bt-btn-sec" id="bt-b2-back">Back</button>
                        <button class="bt-btn" id="bt-b2-next">Next</button>
                    </div>
                </div>

                <div class="bt-page" id="bt-p3">
                    <div class="bt-page-title">Step 3: Confirm Details</div>
                    <div class="bt-card">
                        <div class="bt-card-item">
                            <div class="bt-label">Format</div>
                            <div id="bt-sum-fmt" style="color: #dbdee1; font-weight: 500;">-</div>
                        </div>
                        <div class="bt-card-item" style="margin-top:12px;">
                            <div class="bt-label">Target Window</div>
                            <div id="bt-sum-time" style="color: #dbdee1; font-weight: 500;">-</div>
                        </div>
                    </div>
                    <div class="bt-footer">
                        <button class="bt-btn bt-btn-sec" id="bt-b3-back">Back</button>
                        <button class="bt-btn" id="bt-b3-conf">Confirm & Generate</button>
                    </div>
                </div>

                <div class="bt-page" id="bt-p4">
                    <div class="bt-page-title">Step 4: Copy Timestamp</div>
                    <div class="bt-preview">
                        <div class="bt-label">Live Preview Approximation</div>
                        <div id="bt-prev-text" style="font-size:14px; color: #dbdee1; font-weight: 500;">-</div>
                    </div>
                    <div class="bt-output-box">
                        <div class="bt-code" id="bt-output-str">-</div>
                        <button class="bt-btn" id="bt-copy" style="padding:6px 16px; font-size:12px;">Copy</button>
                    </div>
                    <div class="bt-footer">
                        <button class="bt-btn bt-btn-sec" id="bt-restart" style="width:100%;">Start Again</button>
                    </div>
                </div>
            </div>
        </div>`;

        document.body.appendChild(modalRoot);
        this.setupModalLogic(currentHour, currentMin);
    }

    setupModalLogic(defHour, defMin) {
        const hourSel = document.getElementById("bt-hour");
        const minSel = document.getElementById("bt-min");

        for(let i=0; i<24; i++) {
            let opt = document.createElement("option");
            let displayVal = this.settings.use24HourFormat ? i.toString().padStart(2, '0') : (i === 0 ? "12 AM" : (i < 12 ? `${i} AM` : (i === 12 ? "12 PM" : `${i-12} PM`)));
            opt.value = i.toString().padStart(2, '0');
            opt.textContent = displayVal;
            hourSel.appendChild(opt);
        }
        for(let i=0; i<60; i++) {
            let opt = document.createElement("option");
            opt.value = opt.textContent = i.toString().padStart(2, '0');
            minSel.appendChild(opt);
        }
        hourSel.value = defHour;
        minSel.value = defMin;

        document.getElementById("bt-modal-close").onclick = () => this.closeModal();
        document.getElementById("bt-b1-next").onclick = () => this.switchPage("bt-p1", "bt-p2");
        document.getElementById("bt-b2-back").onclick = () => this.switchPage("bt-p2", "bt-p1");
        document.getElementById("bt-b2-next").onclick = () => {
            const sel = document.getElementById("bt-sel-format");
            this.selectedFormatCode = sel.value;
            this.selectedFormatLabel = sel.options[sel.selectedIndex].text;
            
            document.getElementById("bt-sum-fmt").textContent = this.selectedFormatLabel;
            document.getElementById("bt-sum-time").textContent = `${document.getElementById("bt-date").value} at ${hourSel.value}:${minSel.value}`;
            this.switchPage("bt-p2", "bt-p3");
        };
        document.getElementById("bt-b3-back").onclick = () => this.switchPage("bt-p3", "bt-p2");
        document.getElementById("bt-b3-conf").onclick = () => {
            this.calculateTimestamp();
            this.switchPage("bt-p3", "bt-p4");
        };
        document.getElementById("bt-restart").onclick = () => this.switchPage("bt-p4", "bt-p1");

        const copyBtn = document.getElementById("bt-copy");
        copyBtn.onclick = () => {
            const txt = document.getElementById("bt-output-str").textContent;
            
            if (typeof BetterDiscord !== "undefined" && BetterDiscord.Electron && BetterDiscord.Electron.clipboard) {
                BetterDiscord.Electron.clipboard.writeText(txt);
            } else {
                navigator.clipboard.writeText(txt);
            }
            
            copyBtn.textContent = "Copied!";
            copyBtn.style.backgroundColor = "#248046";
            
            setTimeout(() => {
                copyBtn.textContent = "Copy";
                copyBtn.style.backgroundColor = "#5865f2";
                if (this.settings.autoCloseOnCopy) this.closeModal();
            }, 1000);
        };
    }

    switchPage(currId, targetId) {
        const curr = document.getElementById(currId);
        const tgt = document.getElementById(targetId);
        if(!curr || !tgt) return;

        curr.style.opacity = "0";
        curr.style.transform = "translate3d(-15px, 0, 0)";
        setTimeout(() => {
            curr.classList.remove("active");
            tgt.classList.add("active");
            tgt.offsetWidth;
            tgt.style.opacity = "1";
            tgt.style.transform = "translate3d(0,0,0)";
        }, 200);
    }

    calculateTimestamp() {
        const d = document.getElementById("bt-date").value;
        const h = document.getElementById("bt-hour").value;
        const m = document.getElementById("bt-min").value;
        const targetDate = new Date(`${d}T${h}:${m}:00`);
        const unix = Math.floor(targetDate.getTime() / 1000);

        document.getElementById("bt-output-str").textContent = `<t:${unix}:${this.selectedFormatCode}>`;
        
        let preview = "";
        switch(this.selectedFormatCode) {
            case 't': preview = targetDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); break;
            case 'T': preview = targetDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'}); break;
            case 'd': preview = targetDate.toLocaleDateString(); break;
            case 'D': preview = targetDate.toLocaleDateString([], {day:'numeric', month:'long', year:'numeric'}); break;
            case 'f': preview = `${targetDate.toLocaleDateString([], {day:'numeric', month:'long', year:'numeric'})} ${targetDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`; break;
            case 'F': preview = `${targetDate.toLocaleDateString([], {weekday:'long', day:'numeric', month:'long', year:'numeric'})} ${targetDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`; break;
            case 'R': 
                const diff = targetDate - new Date();
                const mins = Math.round(Math.abs(diff)/60000);
                preview = diff > 0 ? `in ${mins} minutes` : `${mins} minutes ago`;
                break;
        }
        document.getElementById("bt-prev-text").textContent = preview;
    }

    closeModal() {
        const root = document.getElementById("bt-modal-root");
        if (root) root.remove();
    }
};
