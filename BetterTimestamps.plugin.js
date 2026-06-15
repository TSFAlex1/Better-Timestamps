/**
 * @name BetterTimestamps
 * @author TSFAlex
 * @description A multi-step timestamp generator wizard built directly into your Discord client.
 * @version 1.0.0
 * @source https://github.com
 */

module.exports = class BetterTimestamps {
    constructor() {
        this.selectedFormatCode = 'f';
        this.selectedFormatLabel = 'Short Date/Time (e.g., 14 June 2026 16:20)';
        this.activePage = 'page-format';
    }

    start() {
        this.injectStyles();
        this.createToolbarButton();
    }

    stop() {
        const btn = document.getElementById("bt-toolbar-btn");
        if (btn) btn.remove();
        const styles = document.getElementById("bt-plugin-styles");
        if (styles) styles.remove();
        this.closeModal();
    }

    injectStyles() {
        if (document.getElementById("bt-plugin-styles")) return;
        const style = document.createElement("style");
        style.id = "bt-plugin-styles";
        style.innerHTML = `
            #bt-toolbar-btn {
                cursor: pointer;
                margin: 0 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--interactive-normal);
            }
            #bt-toolbar-btn:hover {
                color: var(--interactive-hover);
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
                background-color: var(--background-secondary);
                width: 480px;
                min-height: 380px;
                border-radius: 8px;
                padding: 24px;
                box-shadow: var(--elevation-high);
                display: flex;
                flex-direction: column;
                position: relative;
                overflow: hidden;
                color: var(--text-normal);
                font-family: var(--font-primary);
            }
            .bt-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 20px;
                border-bottom: 1px solid var(--background-modifier-accent);
                padding-bottom: 12px;
            }
            .bt-header h1 {
                font-size: 18px;
                color: var(--header-primary);
                font-weight: 700;
            }
            .bt-icon-box {
                width: 28px;
                height: 28px;
                background: #ffffff;
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
                transform: translate3d(20px, 0, 0);
                transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease;
            }
            .bt-page.active {
                display: flex;
                opacity: 1;
                transform: translate3d(0, 0, 0);
            }
            .bt-page-title {
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                color: var(--text-muted);
                margin-bottom: 14px;
                letter-spacing: 0.5px;
            }
            .bt-footer {
                margin-top: auto;
                display: flex;
                justify-content: space-between;
                padding-top: 20px;
            }
            .bt-btn {
                background-color: var(--brand-experiment);
                color: #fff;
                border: none;
                border-radius: 3px;
                padding: 8px 20px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.15s ease;
            }
            .bt-btn:hover { background-color: var(--brand-experiment-560); }
            .bt-btn-sec { background: transparent; color: #fff; }
            .bt-btn-sec:hover { text-decoration: underline; }
            .bt-btn-success { background-color: var(--status-positive); }
            .bt-btn-success:hover { background-color: var(--status-positive-background); }
            
            /* Custom Select Matrix */
            .bt-select {
                background: var(--background-tertiary);
                border: 1px solid var(--background-modifier-accent);
                color: var(--text-normal);
                padding: 10px;
                border-radius: 4px;
                width: 100%;
                outline: none;
                cursor: pointer;
            }
            .bt-input-row { display: flex; gap: 10px; margin-bottom: 10px; }
            .bt-input-col { flex: 1; display: flex; flex-direction: column; }
            .bt-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; font-weight: 600; }
            .bt-input {
                background: var(--background-tertiary);
                border: 1px solid var(--background-modifier-accent);
                color: #fff;
                padding: 8px;
                border-radius: 4px;
                outline: none;
            }
            .bt-card { background: var(--background-tertiary); padding: 14px; border-radius: 4px; }
            .bt-card-item { margin-bottom: 10px; }
            .bt-card-item:last-child { margin-bottom: 0; }
            
            .bt-output-box {
                background: var(--background-tertiary);
                padding: 10px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 10px;
                border: 1px solid var(--background-modifier-accent);
            }
            .bt-code { font-family: var(--font-code); color: var(--text-positive); overflow-x: auto; white-space: nowrap; flex-grow: 1; }
            .bt-preview { border-left: 4px solid var(--brand-experiment); background: var(--background-tertiary); padding: 10px; margin-bottom: 10px; border-radius: 0 4px 4px 0; }
        `;
        document.head.appendChild(style);
    }

    createToolbarButton() {
        const target = document.querySelector(".buttonsInner-0"); 
        if (!target && !document.getElementById("bt-toolbar-btn")) {
            setTimeout(() => this.createToolbarButton(), 1000);
            return;
        }

        const btn = document.createElement("div");
        btn.id = "bt-toolbar-btn";
        btn.setAttribute("aria-label", "Better Timestamps");
        btn.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
        `;
        btn.addEventListener("click", () => this.openWizardModal());
        target.insertBefore(btn, target.firstChild);
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
                    <div class="bt-icon-box">
                        <svg viewBox="0 0 24 24" fill="none" style="width:18px; height:18px;"><circle cx="12" cy="12" r="10" stroke="#5865f2" stroke-width="2.5"/><path d="M12 6V12L16 14" stroke="#5865f2" stroke-width="2.5" stroke-linecap="round"/></svg>
                    </div>
                    <h1>Better Timestamps</h1>
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
                            <div id="bt-sum-fmt" style="color:#fff;">-</div>
                        </div>
                        <div class="bt-card-item" style="margin-top:12px;">
                            <div class="bt-label">Target Window</div>
                            <div id="bt-sum-time" style="color:#fff;">-</div>
                        </div>
                    </div>
                    <div class="bt-footer">
                        <button class="bt-btn bt-btn-sec" id="bt-b3-back">Back</button>
                        <button class="bt-btn bt-btn-success" id="bt-b3-conf">Confirm & Generate</button>
                    </div>
                </div>

                <div class="bt-page" id="bt-p4">
                    <div class="bt-page-title">Step 4: Copy Timestamp</div>
                    <div class="bt-preview">
                        <div class="bt-label">Live Preview Approximation</div>
                        <div id="bt-prev-text" style="font-size:14px; color:#fff;">-</div>
                    </div>
                    <div class="bt-output-box">
                        <div class="bt-code" id="bt-output-str">-</div>
                        <button class="bt-btn" id="bt-copy" style="padding:4px 12px; font-size:12px;">Copy</button>
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
            opt.value = opt.textContent = i.toString().padStart(2, '0');
            hourSel.appendChild(opt);
        }
        for(let i=0; i<60; i++) {
            let opt = document.createElement("option");
            opt.value = opt.textContent = i.toString().padStart(2, '0');
            minSel.appendChild(opt);
        }
        hourSel.value = defHour;
        minSel.value = defMin;

        // Wire Navigation triggers
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

        // Copy Hook logic
        const copyBtn = document.getElementById("bt-copy");
        copyBtn.onclick = () => {
            const txt = document.getElementById("bt-output-str").textContent;
            BetterDiscord.Electron.clipboard.writeText(txt);
            copyBtn.textContent = "Copied!";
            copyBtn.style.backgroundColor = "var(--status-positive)";
            setTimeout(() => {
                copyBtn.textContent = "Copy";
                copyBtn.style.backgroundColor = "var(--brand-experiment)";
            }, 1500);
        };
    }

    switchPage(currId, targetId) {
        const curr = document.getElementById(currId);
        const tgt = document.getElementById(targetId);
        if(!curr || !tgt) return;

        curr.style.opacity = "0";
        curr.style.transform = "translate3d(-20px, 0, 0)";
        setTimeout(() => {
            curr.classList.remove("active");
            tgt.classList.add("active");
            tgt.offsetWidth; // Reflow push
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
        
        // Approximate presentation string layout
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