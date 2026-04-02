Object.assign(UI.prototype, {
    initResearchSystem() {
        if (this.researchInitialized) return;
        this.researchInitialized = true;
        this.researchPanX = 0;
        this.researchPanY = 0;
        this.isDraggingResearch = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.cellSize = 150; // Matches CSS var
        this.setupResearchNavigation();
    },

    setupResearchNavigation() {
        const board = this.researchGridBoardElement;
        if (!board) return;

        board.addEventListener('mousedown', (e) => {
            this.isDraggingResearch = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            board.style.transition = 'none'; // Instant response while dragging
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDraggingResearch) return;

            const dx = e.clientX - this.lastMouseX;
            const dy = e.clientY - this.lastMouseY;

            this.researchPanX += dx / this.researchZoom;
            this.researchPanY += dy / this.researchZoom;

            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;

            this.updateResearchPan();
        });

        window.addEventListener('mouseup', () => {
            if (this.isDraggingResearch) {
                this.isDraggingResearch = false;
                board.style.transition = 'transform 0.1s linear';
            }
        });
    },

    handleResearchZoom(event) {
        if (!this.researchModal || this.researchModal.style.display !== 'block') {
            return;
        }

        event.preventDefault();
        const direction = event.deltaY < 0 ? 1 : -1;
        const nextZoom = this.researchZoom * (direction > 0 ? 1.1 : 0.9);
        this.researchZoom = Math.max(this.researchZoomMin, Math.min(this.researchZoomMax, nextZoom));
        this.updateResearchZoom();
    },

    updateResearchZoom() {
        if (!this.researchGridBoardElement) return;
        this.researchGridBoardElement.style.setProperty('--research-grid-zoom', this.researchZoom);
    },

    updateResearchPan() {
        if (!this.researchGridBoardElement) return;
        this.researchGridBoardElement.style.setProperty('--research-pan-x', `${this.researchPanX}px`);
        this.researchGridBoardElement.style.setProperty('--research-pan-y', `${this.researchPanY}px`);
    },

    formatResearchCost(cost = {}) {
        const parts = [];
        const particleCosts = cost.particles || {};
        if (cost.coins) parts.push(`${cost.coins} coins`);
        Object.entries(particleCosts).forEach(([type, amount]) => {
            parts.push(`${amount} ${type}`);
        });
        return parts.length ? parts.join(' + ') : 'Free';
    },

    getResearchCostMarkup(cost = {}) {
        const entries = [];
        const particleCosts = cost.particles || {};
        const walletBalance = this.game.getWalletBalance();
        
        if (cost.coins) {
            const canAfford = walletBalance >= cost.coins;
            entries.push(`
                <div class="research-cost-item ${canAfford ? 'is-affordable' : 'is-unaffordable'}">
                    <img src="https://pub-136c85f7b0db4549ba25bf23723988bf.r2.dev/assets/image/coin.png" alt="Coins" class="research-cost-icon research-cost-coin-icon">
                    <span>${cost.coins}</span>
                </div>
            `);
        }
        
        Object.entries(particleCosts).forEach(([type, amount]) => {
            if (amount <= 0) return;
            const currentCount = this.game.getParticleCount(type);
            const canAfford = currentCount >= amount;
            entries.push(`
                <div class="research-cost-item ${canAfford ? 'is-affordable' : 'is-unaffordable'}">
                    <div class="research-cost-particle-icon ${this.getIconClass(type)}"></div>
                    <span>${amount}</span>
                </div>
            `);
        });
        
        return entries.join('') || '<div class="research-cost-item"><span>Free</span></div>';
    },

    formatDuration(durationMs) {
        const totalSeconds = Math.ceil(durationMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return minutes <= 0 ? `${seconds}s` : `${minutes}m ${seconds}s`;
    },

    showResearchTooltip(research, event) {
        // If locked, show a generic "???" tooltip or a hint
        const isLocked = research.parent_id && !this.game.isResearchCompleted(research.parent_id);
        const isCompleted = this.game.isResearchCompleted(research.id);
        
        if (isLocked) {
            const parent = this.game.getResearchById(research.parent_id);
            this.researchTooltipElement.innerHTML = `
                <div class="research-tooltip-title">Mystery Research</div>
                <div class="research-tooltip-copy">Complete <b>${parent ? parent.name : 'prerequisite'}</b> to unlock this technology.</div>
            `;
        } else if (isCompleted) {
            this.researchTooltipElement.innerHTML = `
                <div class="research-tooltip-title">${research.name}</div>
                <div class="research-tooltip-copy">${research.description}</div>
                <div class="research-tooltip-meta-row">
                    <div class="research-status-completed">COMPLETED</div>
                </div>
            `;
        } else {
            const timeStr = this.formatDuration(this.game.getAdjustedResearchDuration(research.durationMs));
            this.researchTooltipElement.innerHTML = `
                <div class="research-tooltip-title">${research.name}</div>
                <div class="research-tooltip-copy">${research.description}</div>
                <div class="research-tooltip-meta-row">
                    <div class="research-cost-list">${this.getResearchCostMarkup(research.cost)}</div>
                    <div class="research-tooltip-time-inline"> ${timeStr}</div>
                </div>
            `;
        }
        
        this.researchTooltipElement.style.display = 'block';
        this.positionResearchTooltip(event.currentTarget);
    },

    positionResearchTooltip(targetElement) {
        const modalBounds = this.researchModalContent.getBoundingClientRect();
        const targetBounds = targetElement.getBoundingClientRect();
        
        // Default position: Right of the card (with safety gap to prevent flickering)
        let tooltipX = targetBounds.right - modalBounds.left + 25;
        let tooltipY = targetBounds.top - modalBounds.top;

        // Check if it goes off-screen to the right
        const tooltipWidth = 340; 
        if (tooltipX + tooltipWidth > modalBounds.width - 20) {
            // Flip to the left of the card (with safety gap)
            tooltipX = targetBounds.left - modalBounds.left - tooltipWidth - 25;
        }

        // Clamp Y to stay within modal
        tooltipY = Math.max(10, Math.min(modalBounds.height - 150, tooltipY));

        this.researchTooltipElement.style.left = `${tooltipX}px`;
        this.researchTooltipElement.style.top = `${tooltipY}px`;
    },

    hideResearchTooltip() {
        this.researchTooltipElement.style.display = 'none';
    },

    getResearchGridPlacement(research) {
        const pos = research.gridPosition || { x: 0, y: 0 };
        const cellSize = this.cellSize || 150;
        return {
            x: 5000 + (pos.x * cellSize), // Use absolute center offset (consistent with Admin)
            y: 5000 + (pos.y * cellSize),
            left: `calc(50% + ${pos.x * cellSize}px)`,
            top: `calc(50% + ${pos.y * cellSize}px)`
        };
    },

    renderResearchModal() {
        this.initResearchSystem();
        const researches = this.game.getResearchDefinitions();
        const researchState = this.game.getResearchState();

        this.updateResearchZoom();
        this.updateResearchPan();

        if (!researches.length) {
            this.researchGridElement.innerHTML = '';
            this.researchEmptyStateElement.style.display = 'block';
            return;
        }

        this.researchEmptyStateElement.style.display = 'none';
        this.researchGridElement.innerHTML = '';
        
        // 1. Create SVG layer for connectors (simple white lines)
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('class', 'research-connector-layer');
        svg.setAttribute('viewBox', '0 0 10000 10000');
        svg.setAttribute('width', '10000');
        svg.setAttribute('height', '10000');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '0'; // Behind cards
        this.researchGridElement.appendChild(svg);

        // 2. Render Cards and draw lines
        researches.forEach((research) => {
            const placement = this.getResearchGridPlacement(research);
            const isCompleted = this.game.isResearchCompleted(research.id);
            const isParentCompleted = !research.parent_id || this.game.isResearchCompleted(research.parent_id);
            const isLocked = !isParentCompleted;
            
            // Progressive Visibility Logic:
            // Only show root nodes (no parent) OR nodes where the parent is already finished.
            if (research.parent_id && !this.game.isResearchCompleted(research.parent_id)) {
                return; // Hide technologies 2+ steps away
            }
            // Draw lines to parents (now simpler white lines for everything)
            if (research.parent_id) {
                const parent = researches.find(r => r.id === research.parent_id);
                if (parent) {
                    const pPos = this.getResearchGridPlacement(parent);
                    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    line.setAttribute('x1', pPos.x);
                    line.setAttribute('y1', pPos.y);
                    line.setAttribute('x2', placement.x);
                    line.setAttribute('y2', placement.y);
                    line.setAttribute('class', 'research-line');
                    svg.appendChild(line);
                }
            }

            const card = document.createElement('div');
            const isActive = researchState.activeResearchId === research.id;
            const canStart = this.game.canStartResearch(research.id) && !isLocked;
            const adjustedDuration = this.game.getAdjustedResearchDuration(research.durationMs);
            const remainingTime = isActive ? this.game.getResearchRemainingTime() : adjustedDuration;
            const progressPercent = isActive && adjustedDuration > 0 ? (adjustedDuration - remainingTime) / adjustedDuration : 0;
            const fillPercent = isCompleted ? 100 : isActive ? Math.max(0, Math.min(100, progressPercent * 100)) : 0;
            
            card.className = `research-card${isCompleted ? ' is-completed' : ''}${isActive ? ' is-active' : ''}${isLocked ? ' is-locked' : ''}${!canStart && !isCompleted && !isActive && !isLocked ? ' is-disabled' : ''}`;
            card.dataset.researchId = research.id;
            card.style.left = placement.left;
            card.style.top = placement.top;
            card.style.setProperty('--research-fill', `${fillPercent}%`);
            
            // Hidden Logic
            const titleText = isLocked ? "" : research.name;
            const finalImg = isLocked ? "https://pub-136c85f7b0db4549ba25bf23723988bf.r2.dev/assets/image/new_hidden.png" : (research.image || 'https://pub-136c85f7b0db4549ba25bf23723988bf.r2.dev/assets/image/research-item.png');

            card.innerHTML = `
                <div class="research-card-content">
                    <div class="research-card-title">${titleText}</div>
                    <img src="${finalImg}" alt="Research" class="research-card-icon">
                </div>
            `;

            card.addEventListener('mouseenter', (event) => this.showResearchTooltip(research, event));
            card.addEventListener('mousemove', () => this.positionResearchTooltip(card));
            card.addEventListener('mouseleave', () => this.hideResearchTooltip());
            card.addEventListener('click', (e) => {
                if (this.isDraggingResearch || isLocked) return; 
                if (this.game.startResearch(research.id)) {
                    this.renderResearchModal();
                }
            });

            this.researchGridElement.appendChild(card);
        });
    },

    updateResearchDisplayIfOpen() {
        if (!this.researchModal || this.researchModal.style.display !== 'block') {
            return;
        }

        const activeId = this.game.getResearchState().activeResearchId;
        if (!activeId) return;

        // Surgical update: Find the specific card and update its fill percentage
        const card = this.researchGridElement.querySelector(`.research-card[data-research-id="${activeId}"]`);
        if (card) {
            const research = this.game.getResearchById(activeId);
            const adjustedDuration = this.game.getAdjustedResearchDuration(research.durationMs);
            const remainingTime = this.game.getResearchRemainingTime();
            const progressPercent = adjustedDuration > 0 ? (adjustedDuration - remainingTime) / adjustedDuration : 0;
            const fillPercent = Math.max(0, Math.min(100, progressPercent * 100));
            card.style.setProperty('--research-fill', `${fillPercent}%`);
        }
    }
});
