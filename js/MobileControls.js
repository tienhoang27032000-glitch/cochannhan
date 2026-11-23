/**
 * VẠN CỔ TIÊN ĐỒ - MODULE GIAO DIỆN & ĐIỀU KHIỂN MOBILE (MobileControls.js)
 * Hỗ trợ:
 *  - Chế độ Toàn Màn Hình (Fullscreen API) & Khóa Xoay Ngang (Landscape).
 *  - Virtual Joystick 360° đa điểm chạm (kéo sát rìa tự bật Chạy Nhanh).
 *  - Cụm 8 nút Cổ Trùng, 4 nút Sát Chiêu, Lướt Thân Pháp, Tương Tác [E], Hồi Nguyên & Trị Thương.
 *  - Smart Auto-Aim (Tự khóa Boss/Quái gần nhất trong tầm hoặc nhắm theo chạm màn hình/hướng chạy).
 *  - Tối ưu Hub (Ngăn kéo Thiên Cơ Nhật Ký & chuyển đổi chế độ Mobile/PC trong Cài đặt).
 */

(function (global) {
    "use strict";

    const MOBILE_MODE_STORAGE_KEY = "van_co_tien_do_mobile_ui_mode"; // "auto" | "on" | "off"

    class MobileControls {
        constructor(gameEngine) {
            this.game = gameEngine;
            this.isMobileActive = false;
            this.modePreference = localStorage.getItem(MOBILE_MODE_STORAGE_KEY) || "auto";

            this.joystickPointerId = null;
            this.lastMoveAngle = 0;

            this.manualAim = {
                active: false,
                worldX: 0,
                worldY: 0,
                expireAt: 0
            };

            this.el = {};
            this._init();
        }

        _init() {
            this._injectRotateOverlay();
            this._injectHubUtilities();
            this._injectBattleControls();
            this._injectSettingsOption();

            this._bindGlobalViewportEvents();
            this._bindCanvasTouchAim();
            this._evaluateMobileMode();

            setInterval(() => this._syncMobileBattleUI(), 75);
        }

        // =====================================================================
        // 1. NHẬN DIỆN MOBILE, TOÀN MÀN HÌNH & KHÓA XOAY NGANG
        // =====================================================================

        _detectTouchDevice() {
            const hasTouch = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);
            const smallSide = Math.min(window.innerWidth, window.innerHeight);
            return hasTouch && smallSide <= 920;
        }

        _evaluateMobileMode() {
            if (this.modePreference === "on") {
                this.isMobileActive = true;
            } else if (this.modePreference === "off") {
                this.isMobileActive = false;
            } else {
                this.isMobileActive = this._detectTouchDevice();
            }

            document.body.classList.toggle("mobile-ui", this.isMobileActive);

            if (this.game && typeof this.game._handleResize === "function") {
                this.game._handleResize();
            }
        }

        async enterFullscreenAndLandscape() {
            try {
                const docEl = document.documentElement;
                const reqFs =
                    docEl.requestFullscreen ||
                    docEl.webkitRequestFullscreen ||
                    docEl.mozRequestFullScreen ||
                    docEl.msRequestFullscreen;

                if (reqFs && !document.fullscreenElement && !document.webkitFullscreenElement) {
                    await reqFs.call(docEl);
                }
            } catch (e) {}

            try {
                if (screen.orientation && typeof screen.orientation.lock === "function") {
                    await screen.orientation.lock("landscape");
                }
            } catch (e) {}

            setTimeout(() => {
                if (this.game && typeof this.game._handleResize === "function") {
                    this.game._handleResize();
                }
            }, 220);
        }

        async toggleFullscreen() {
            const isFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
            if (!isFs) {
                await this.enterFullscreenAndLandscape();
            } else {
                try {
                    const exitFs = document.exitFullscreen || document.webkitExitFullscreen;
                    if (exitFs) await exitFs.call(document);
                } catch (e) {}
            }
        }

        _bindGlobalViewportEvents() {
            const onViewportChange = () => {
                this._evaluateMobileMode();
                setTimeout(() => {
                    if (this.game && typeof this.game._handleResize === "function") {
                        this.game._handleResize();
                    }
                }, 150);
            };

            window.addEventListener("orientationchange", onViewportChange);
            window.addEventListener("fullscreenchange", onViewportChange);
            window.addEventListener("webkitfullscreenchange", onViewportChange);
            window.addEventListener("resize", () => this._evaluateMobileMode());

            document.addEventListener("pointerdown", () => {
                if (
                    this.isMobileActive &&
                    this.game &&
                    this.game.currentScreen === "battle" &&
                    !document.fullscreenElement &&
                    !this._triedAutoFs
                ) {
                    this._triedAutoFs = true;
                    this.enterFullscreenAndLandscape();
                }
            }, { passive: true });
        }

        // =====================================================================
        // 2. DỰNG LỚP PHỦ NHẮC XOAY NGANG & TIỆN ÍCH HUB
        // =====================================================================

        _injectRotateOverlay() {
            if (document.getElementById("mobile-rotate-overlay")) return;

            const overlay = document.createElement("div");
            overlay.id = "mobile-rotate-overlay";
            overlay.innerHTML = `
                <div class="rotate-phone-icon">📱</div>
                <h2>VẠN CỔ TIÊN ĐỒ</h2>
                <p>Hãy xoay ngang điện thoại và bật chế độ Toàn Màn Hình để có tầm nhìn chiến trường rộng nhất và bố cục nút bấm hợp lý.</p>
                <div class="rotate-actions">
                    <button id="btn-mobile-enter-landscape" class="btn-primary">⛶ Toàn Màn Hình & Xoay Ngang</button>
                    <button id="btn-mobile-bypass-portrait" class="btn-secondary">Tạm bỏ qua (Dùng màn hình dọc)</button>
                </div>
            `;
            document.body.appendChild(overlay);

            overlay.querySelector("#btn-mobile-enter-landscape").addEventListener("click", () => {
                this.enterFullscreenAndLandscape();
            });
            overlay.querySelector("#btn-mobile-bypass-portrait").addEventListener("click", () => {
                document.body.classList.add("ignore-portrait-lock");
            });
        }

        _injectHubUtilities() {
            const topbar = document.querySelector(".hub-topbar");
            const rightLog = document.querySelector(".hub-right-log");
            if (!topbar) return;

            const utilWrap = document.createElement("div");
            utilWrap.className = "mobile-hub-utility-btns";
            utilWrap.innerHTML = `
                <button id="btn-mobile-toggle-log" class="btn-mobile-util" title="Mở Thiên Cơ Nhật Ký">📜</button>
                <button id="btn-mobile-hub-fs" class="btn-mobile-util" title="Toàn màn hình & Xoay ngang">⛶</button>
            `;
            topbar.appendChild(utilWrap);

            utilWrap.querySelector("#btn-mobile-hub-fs").addEventListener("click", () => {
                this.toggleFullscreen();
            });

            utilWrap.querySelector("#btn-mobile-toggle-log").addEventListener("click", () => {
                if (rightLog) rightLog.classList.toggle("drawer-open");
            });

            if (rightLog) {
                const logHeader = rightLog.querySelector(".log-header");
                if (logHeader) {
                    const closeBtn = document.createElement("button");
                    closeBtn.className = "btn-mini";
                    closeBtn.textContent = "✕";
                    closeBtn.style.marginLeft = "6px";
                    closeBtn.addEventListener("click", () => rightLog.classList.remove("drawer-open"));
                    logHeader.appendChild(closeBtn);
                }
            }
        }

        _injectSettingsOption() {
            const keybindSelect = document.getElementById("keybind-mode-select");
            if (!keybindSelect || !keybindSelect.parentElement) return;

            const group = document.createElement("div");
            group.className = "form-group";
            group.innerHTML = `
                <label for="mobile-ui-mode-select">Giao diện Điều Khiển Mobile (Cảm ứng & Xoay ngang):</label>
                <select id="mobile-ui-mode-select">
                    <option value="auto">Tự động nhận diện thiết bị</option>
                    <option value="on">Luôn bật giao diện Mobile</option>
                    <option value="off">Tắt (Chỉ dùng giao diện PC)</option>
                </select>
            `;
            keybindSelect.parentElement.insertAdjacentElement("afterend", group);

            const selectEl = group.querySelector("#mobile-ui-mode-select");
            selectEl.value = this.modePreference;
            selectEl.addEventListener("change", () => {
                this.modePreference = selectEl.value;
                localStorage.setItem(MOBILE_MODE_STORAGE_KEY, this.modePreference);
                this._evaluateMobileMode();
            });
        }

        // =====================================================================
        // 3. DỰNG BỘ ĐIỀU KHIỂN TRONG TRẬN CHIẾN (BATTLE SCREEN)
        // =====================================================================

        _injectBattleControls() {
            const battleScreen = document.getElementById("battle-screen");
            if (!battleScreen) return;

            const topRight = battleScreen.querySelector(".battle-hud-top-right");
            if (topRight && !document.getElementById("btn-mobile-battle-fs")) {
                const fsBtn = document.createElement("button");
                fsBtn.id = "btn-mobile-battle-fs";
                fsBtn.textContent = "⛶ Toàn Màn Hình";
                fsBtn.addEventListener("click", () => this.toggleFullscreen());
                topRight.appendChild(fsBtn);
            }

            const wrapper = document.createElement("div");
            wrapper.id = "mobile-battle-controls";

            const killerKeys = ["Z", "X", "C", "V"];
            const killerBtnsHtml = killerKeys.map((k, idx) => `
                <button class="m-btn m-skill-btn m-killer-btn" data-mkiller="${idx}">
                    <span class="m-key">${k}</span>
                    <span class="m-icon"></span>
                    <span class="m-cost"></span>
                    <div class="m-cd-overlay"></div>
                    <span class="m-cd-text"></span>
                </button>
            `).join("");

            const guBtnsHtml = [0, 1, 2, 3, 4, 5, 6, 7].map((idx) => `
                <button class="m-btn m-skill-btn m-gu-btn" data-mgu="${idx}">
                    <span class="m-key">${idx + 1}</span>
                    <span class="m-icon"></span>
                    <span class="m-cost"></span>
                    <div class="m-cd-overlay"></div>
                    <span class="m-cd-text"></span>
                    <div class="m-no-essence hidden">Cạn</div>
                </button>
            `).join("");

            wrapper.innerHTML = `
                <div id="mobile-interact-toast" class="hidden"></div>

                <div id="mobile-joystick-zone">
                    <div class="joystick-base" id="mobile-joystick-base">
                        <div class="joystick-knob" id="mobile-joystick-knob"></div>
                    </div>
                    <span class="joystick-hint" id="mobile-joystick-hint">Di chuyển</span>
                </div>

                <div id="mobile-action-cluster">
                    <div class="mobile-aux-column">
                        <div class="mobile-quick-items-row">
                            <button class="m-btn m-btn-small" id="m-btn-stone" title="Hấp thu Nguyên Thạch">
                                <span>💎</span>
                                <span class="m-sub" id="m-stone-count">0</span>
                            </button>
                            <button class="m-btn m-btn-small" id="m-btn-herb" title="Dùng Thảo Dược hồi máu">
                                <span>🌿</span>
                                <span class="m-sub" id="m-herb-count">0</span>
                            </button>
                        </div>

                        <button class="m-btn m-btn-interact" id="m-btn-interact" title="Tương tác NPC / Thu thập Cổ Tài">
                            <span>🤝</span>
                            <span class="m-sub">Tương tác</span>
                        </button>

                        <button class="m-btn m-btn-dash" id="m-btn-dash" title="Phá Không Thân Pháp">
                            <span>💨</span>
                            <span class="m-sub" id="m-dash-cd">Lướt</span>
                        </button>
                    </div>

                    <div class="mobile-skills-panel">
                        <div class="mobile-killer-row">${killerBtnsHtml}</div>
                        <div class="mobile-gu-grid">${guBtnsHtml}</div>
                    </div>
                </div>
            `;

            battleScreen.appendChild(wrapper);

            this.el.joystickZone = wrapper.querySelector("#mobile-joystick-zone");
            this.el.joystickBase = wrapper.querySelector("#mobile-joystick-base");
            this.el.joystickKnob = wrapper.querySelector("#mobile-joystick-knob");
            this.el.joystickHint = wrapper.querySelector("#mobile-joystick-hint");
            this.el.interactToast = wrapper.querySelector("#mobile-interact-toast");
            this.el.btnInteract = wrapper.querySelector("#m-btn-interact");
            this.el.btnDash = wrapper.querySelector("#m-btn-dash");
            this.el.dashCdText = wrapper.querySelector("#m-dash-cd");
            this.el.btnStone = wrapper.querySelector("#m-btn-stone");
            this.el.btnHerb = wrapper.querySelector("#m-btn-herb");
            this.el.stoneCount = wrapper.querySelector("#m-stone-count");
            this.el.herbCount = wrapper.querySelector("#m-herb-count");
            this.el.guBtns = Array.from(wrapper.querySelectorAll(".m-gu-btn"));
            this.el.killerBtns = Array.from(wrapper.querySelectorAll(".m-killer-btn"));

            this._bindJoystickEvents();
            this._bindBattleActionButtons();
        }

        // =====================================================================
        // 4. XỬ LÝ JOYSTICK ĐA ĐIỂM CHẠM & NGẮM THÔNG MINH (SMART AUTO-AIM)
        // =====================================================================

        _bindJoystickEvents() {
            const zone = this.el.joystickZone;
            const base = this.el.joystickBase;
            const knob = this.el.joystickKnob;
            if (!zone || !base || !knob) return;

            const updateStickFromClientPos = (clientX, clientY) => {
                const rect = base.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const maxR = Math.max(28, rect.width * 0.38);

                let dx = clientX - cx;
                let dy = clientY - cy;
                const dist = Math.hypot(dx, dy);

                if (dist > maxR) {
                    dx = (dx / dist) * maxR;
                    dy = (dy / dist) * maxR;
                }

                knob.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;

                const normX = dx / maxR;
                const normY = dy / maxR;
                const magnitude = Math.min(1, dist / maxR);
                const inp = this.game.input;

                if (magnitude > 0.14) {
                    this.lastMoveAngle = Math.atan2(normY, normX);
                    inp.analogX = normX;
                    inp.analogY = normY;

                    inp.left = normX < -0.32;
                    inp.right = normX > 0.32;
                    inp.up = normY < -0.32;
                    inp.down = normY > 0.32;

                    const isSprint = magnitude >= 0.84;
                    inp.sprint = isSprint;
                    base.classList.toggle("sprinting", isSprint);
                    if (this.el.joystickHint) {
                        this.el.joystickHint.textContent = isSprint ? "Chạy nhanh" : "Di chuyển";
                    }
                } else {
                    this._resetJoystickInput();
                }
            };

            zone.addEventListener("pointerdown", (e) => {
                e.preventDefault();
                if (this.joystickPointerId !== null) return;
                this.joystickPointerId = e.pointerId;
                zone.setPointerCapture(e.pointerId);
                updateStickFromClientPos(e.clientX, e.clientY);
            });

            zone.addEventListener("pointermove", (e) => {
                if (e.pointerId !== this.joystickPointerId) return;
                e.preventDefault();
                updateStickFromClientPos(e.clientX, e.clientY);
            });

            const releaseStick = (e) => {
                if (e.pointerId !== this.joystickPointerId) return;
                this.joystickPointerId = null;
                knob.style.transform = "translate3d(0px, 0px, 0)";
                base.classList.remove("sprinting");
                if (this.el.joystickHint) this.el.joystickHint.textContent = "Di chuyển";
                this._resetJoystickInput();
            };

            zone.addEventListener("pointerup", releaseStick);
            zone.addEventListener("pointercancel", releaseStick);
        }

        _resetJoystickInput() {
            if (!this.game || !this.game.input) return;
            const inp = this.game.input;
            inp.analogX = 0;
            inp.analogY = 0;
            inp.up = false;
            inp.down = false;
            inp.left = false;
            inp.right = false;
            inp.sprint = false;
        }

        _bindCanvasTouchAim() {
            const canvas = document.getElementById("gameCanvas");
            if (!canvas) return;

            const activePointers = new Map();
            let pinchStartDist = 0;
            let pinchStartZoom = 1.0;

            canvas.addEventListener("pointerdown", (e) => {
                if (!this.game || this.game.currentScreen !== "battle" || !this.game.map) return;
                if (this.game.isBattlePaused || this.game.isPermadead) return;

                activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

                if (activePointers.size === 2) {
                    const pts = Array.from(activePointers.values());
                    pinchStartDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
                    pinchStartZoom = this.game.map.camera.zoom || 1.0;
                    return;
                }

                if (!this.isMobileActive) return;

                const worldPt = this.game.map.screenToWorld(e.clientX, e.clientY);
                this.manualAim = {
                    active: true,
                    worldX: worldPt.x,
                    worldY: worldPt.y,
                    expireAt: performance.now() + 1800
                };
                this.game.input.mouseX = e.clientX;
                this.game.input.mouseY = e.clientY;
                this.game.input.mouseWorldX = worldPt.x;
                this.game.input.mouseWorldY = worldPt.y;
            });

            canvas.addEventListener("pointermove", (e) => {
                if (!activePointers.has(e.pointerId)) return;
                activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

                if (activePointers.size === 2 && pinchStartDist > 12 && this.game && this.game.currentScreen === "battle") {
                    const pts = Array.from(activePointers.values());
                    const curDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
                    const scaleFactor = curDist / pinchStartDist;
                    this.game.setBattleZoom(pinchStartZoom * scaleFactor, true);
                }
            });

            const clearPtr = (e) => {
                activePointers.delete(e.pointerId);
                if (activePointers.size < 2) {
                    pinchStartDist = 0;
                }
            };
            canvas.addEventListener("pointerup", clearPtr);
            canvas.addEventListener("pointercancel", clearPtr);
        }

        _resolveMobileAimTarget() {
            const pl = this.game.player;
            if (!pl) return { x: 2400, y: 2400 };

            const now = performance.now();
            if (this.manualAim.active && now <= this.manualAim.expireAt) {
                this._syncCursorToWorld(this.manualAim.worldX, this.manualAim.worldY);
                return { x: this.manualAim.worldX, y: this.manualAim.worldY };
            }

            if (this.game.enemies) {
                const candidates = this.game.enemies.getHostileTargetsInRadius(pl.x, pl.y, 620);
                if (candidates.length > 0) {
                    candidates.sort((a, b) => {
                        const dA = Math.hypot(a.x - pl.x, a.y - pl.y) - (a.isBoss ? 80 : 0);
                        const dB = Math.hypot(b.x - pl.x, b.y - pl.y) - (b.isBoss ? 80 : 0);
                        return dA - dB;
                    });
                    const best = candidates[0];
                    this._syncCursorToWorld(best.x, best.y);
                    return { x: best.x, y: best.y };
                }
            }

            const tx = pl.x + Math.cos(this.lastMoveAngle) * 240;
            const ty = pl.y + Math.sin(this.lastMoveAngle) * 240;
            this._syncCursorToWorld(tx, ty);
            return { x: tx, y: ty };
        }

        _syncCursorToWorld(wx, wy) {
            if (!this.game || !this.game.input || !this.game.map) return;
            this.game.input.mouseWorldX = wx;
            this.game.input.mouseWorldY = wy;
            const scr = this.game.map.worldToScreen(wx, wy);
            this.game.input.mouseX = scr.x;
            this.game.input.mouseY = scr.y;
        }

        _bindBattleActionButtons() {
            this.el.guBtns.forEach((btn) => {
                btn.addEventListener("pointerdown", (e) => {
                    e.preventDefault();
                    const slotIdx = parseInt(btn.getAttribute("data-mgu"), 10);
                    const aim = this._resolveMobileAimTarget();
                    if (this.game && this.game.combat) {
                        this.game.combat.activateGuSlot(slotIdx, aim.x, aim.y);
                    }
                });
            });

            this.el.killerBtns.forEach((btn) => {
                btn.addEventListener("pointerdown", (e) => {
                    e.preventDefault();
                    const kIdx = parseInt(btn.getAttribute("data-mkiller"), 10);
                    const aim = this._resolveMobileAimTarget();
                    if (this.game && this.game.combat) {
                        this.game.combat.activateKillerMoveSlot(kIdx, aim.x, aim.y);
                    }
                });
            });

            if (this.el.btnDash) {
                this.el.btnDash.addEventListener("pointerdown", (e) => {
                    e.preventDefault();
                    if (this.game && this.game.combat) {
                        this.game.player.aimAngle = this.lastMoveAngle;
                        this.game.combat.performPhantomDash(false);
                    }
                });
            }

            if (this.el.btnInteract) {
                this.el.btnInteract.addEventListener("pointerdown", (e) => {
                    e.preventDefault();
                    if (this.game && typeof this.game._handleInteractKeyInBattle === "function") {
                        this.game._handleInteractKeyInBattle();
                    }
                });
            }

            if (this.el.btnStone) {
                this.el.btnStone.addEventListener("pointerdown", (e) => {
                    e.preventDefault();
                    const orig = document.getElementById("btn-battle-use-stone");
                    if (orig) orig.click();
                });
            }
            if (this.el.btnHerb) {
                this.el.btnHerb.addEventListener("pointerdown", (e) => {
                    e.preventDefault();
                    const orig = document.getElementById("btn-battle-use-herb");
                    if (orig) orig.click();
                });
            }
        }

        // =====================================================================
        // 5. ĐỒNG BỘ HIỂN THỊ ICON, HỒI CHIÊU & TRẠNG THÁI NÚT TRONG TRẬN
        // =====================================================================

        _syncMobileBattleUI() {
            if (!this.isMobileActive || !this.game || this.game.currentScreen !== "battle") return;

            const guSys = this.game.guSystem;
            const combat = this.game.combat;
            const ap = this.game.aperture;
            const pl = this.game.player;
            if (!guSys || !combat || !ap || !pl) return;

            this.el.guBtns.forEach((btn, idx) => {
                const gu = guSys.getEquippedGuAt(idx);
                const iconEl = btn.querySelector(".m-icon");
                const costEl = btn.querySelector(".m-cost");
                const cdOverlay = btn.querySelector(".m-cd-overlay");
                const cdText = btn.querySelector(".m-cd-text");
                const noEssEl = btn.querySelector(".m-no-essence");

                if (!gu) {
                    btn.classList.add("empty-slot");
                    iconEl.textContent = "";
                    costEl.textContent = "";
                    cdOverlay.style.height = "0%";
                    cdText.textContent = "";
                    noEssEl.classList.add("hidden");
                    return;
                }

                btn.classList.remove("empty-slot");
                iconEl.textContent = gu.icon;
                const calc = ap.calculateEssenceCost(gu.essenceCost, gu.rank, gu.path);
                costEl.textContent = calc.isImmortalCost ? `${calc.cost}T` : `${calc.cost}%`;

                const cdRem = combat.getGuCooldownRemaining(gu.instanceId);
                const cdPct = gu.cooldown > 0 ? Math.min(100, (cdRem / gu.cooldown) * 100) : 0;
                cdOverlay.style.height = `${cdPct}%`;
                cdText.textContent = cdRem > 0.05 ? cdRem.toFixed(1) : "";

                const enough = ap.hasEnoughEssence(gu.essenceCost, gu.rank, gu.path);
                noEssEl.classList.toggle("hidden", enough);
            });

            this.el.killerBtns.forEach((btn, idx) => {
                const move = guSys.getEquippedKillerMoveAt(idx);
                const iconEl = btn.querySelector(".m-icon");
                const costEl = btn.querySelector(".m-cost");
                const cdOverlay = btn.querySelector(".m-cd-overlay");
                const cdText = btn.querySelector(".m-cd-text");

                if (!move) {
                    btn.classList.add("empty-slot");
                    iconEl.textContent = "";
                    costEl.textContent = "";
                    cdOverlay.style.height = "0%";
                    cdText.textContent = "";
                    return;
                }

                btn.classList.remove("empty-slot");
                iconEl.textContent = move.icon || "⚡";
                costEl.textContent = move.moveRank >= 6 ? `${move.essenceCost}T` : `${move.essenceCost}%`;

                const cdRem = combat.getKillerMoveCooldownRemaining(move.id);
                const cdPct = move.cooldown > 0 ? Math.min(100, (cdRem / move.cooldown) * 100) : 0;
                cdOverlay.style.height = `${cdPct}%`;
                cdText.textContent = cdRem > 0.05 ? cdRem.toFixed(1) : "";
            });

            if (this.el.dashCdText) {
                this.el.dashCdText.textContent = combat.dashCooldown > 0.05
                    ? `${combat.dashCooldown.toFixed(1)}s`
                    : "Lướt";
                this.el.btnDash.style.opacity = combat.dashCooldown > 0.05 ? "0.55" : "1";
            }

            if (this.el.stoneCount) {
                this.el.stoneCount.textContent = pl.primevalStones > 999 ? "999+" : pl.primevalStones;
            }
            if (this.el.herbCount) {
                const herbs = pl.getItemCount("spirit_herb") + pl.getItemCount("ration_meat");
                this.el.herbCount.textContent = herbs;
            }

            const origPrompt = document.getElementById("interaction-prompt");
            const hasTarget = origPrompt && !origPrompt.classList.contains("hidden");
            if (this.el.btnInteract) {
                this.el.btnInteract.classList.toggle("active-prompt", Boolean(hasTarget));
            }
            if (this.el.interactToast) {
                if (hasTarget) {
                    this.el.interactToast.textContent = origPrompt.textContent.replace("Nhấn E", "Chạm nút 🤝 để").trim();
                    this.el.interactToast.classList.remove("hidden");
                } else {
                    this.el.interactToast.classList.add("hidden");
                }
            }
        }
    }

    global.MobileControls = MobileControls;

    window.addEventListener("DOMContentLoaded", () => {
        const waitEngine = () => {
            if (global.vanCoTienDoGame) {
                global.vanCoMobileControls = new MobileControls(global.vanCoTienDoGame);
            } else {
                setTimeout(waitEngine, 60);
            }
        };
        waitEngine();
    });

})(window);
