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
        if (cost.coins) {
            entries.push(`
                <div class="research-cost-item">
                    <img src="https://pub-136c85f7b0db4549ba25bf23723988bf.r2.dev/assets/image/coin.png" alt="Coins" class="research-cost-icon research-cost-coin-icon">
                    <span>${cost.coins}</span>
                </div>
            `);
        }
        Object.entries(particleCosts).forEach(([type, amount]) => {
            entries.push(`
                <div class="research-cost-item">
                    <div class="research-cost-particle-icon ${this.getIconClass(type)}"></div>
                    <span>${amount}</span>
                </div>
            `);
        });
        return entries.length ? entries.join('') : '<div class="research-cost-item"><span>Free</span></div>';
    },

    formatDuration(durationMs) {
        const totalSeconds = Math.ceil(durationMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return minutes <= 0 ? `${seconds}s` : `${minutes}m ${seconds}s`;
    },

    showResearchTooltip(research, event) {
        this.researchTooltipElement.innerHTML = `
            <div class="research-tooltip-title">${research.name}</div>
            <div class="research-tooltip-copy">${research.description}</div>
            <div class="research-tooltip-meta-row">
                <div class="research-tooltip-meta-header">Resource Cost</div>
                <div class="research-cost-list">${this.getResearchCostMarkup(research.cost)}</div>
                <div class="research-tooltip-time">${this.formatDuration(this.game.getAdjustedResearchDuration(research.durationMs))} Estimated Time</div>
            </div>
        `;
        this.researchTooltipElement.style.display = 'block';
        this.positionResearchTooltip(event.currentTarget);
    },

    positionResearchTooltip(targetElement) {
        const bounds = this.researchModalContent.getBoundingClientRect();
        const targetBounds = targetElement.getBoundingClientRect();
        const tooltipX = targetBounds.right - bounds.left + 2;
        const tooltipY = targetBounds.top - bounds.top + 4;
        this.researchTooltipElement.style.left = `${tooltipX}px`;
        this.researchTooltipElement.style.top = `${tooltipY}px`;
    },

    hideResearchTooltip() {
        this.researchTooltipElement.style.display = 'none';
    },

    getResearchGridPlacement(research) {
        // Space nodes: X and Y are multiplied by cell size
        // If (x+y) % 2 != 0, it's not a visually "valid" cell in the spaced pattern (though we allow it in data)
        const pos = research.gridPosition || { x: 0, y: 0 };
        return {
            left: `calc(50% + ${pos.x * (this.cellSize || 150)}px)`,
            top: `calc(50% + ${pos.y * (this.cellSize || 150)}px)`
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

        researches.forEach((research, index) => {
            const card = document.createElement('div');
            const isCompleted = this.game.isResearchCompleted(research.id);
            const isActive = researchState.activeResearchId === research.id;
            const canStart = this.game.canStartResearch(research.id);
            const adjustedDuration = this.game.getAdjustedResearchDuration(research.durationMs);
            const remainingTime = isActive ? this.game.getResearchRemainingTime() : adjustedDuration;
            const progressPercent = isActive && adjustedDuration > 0 ? (adjustedDuration - remainingTime) / adjustedDuration : 0;
            const fillPercent = isCompleted ? 100 : isActive ? Math.max(0, Math.min(100, progressPercent * 100)) : 0;
            
            const placement = this.getResearchGridPlacement(research);

            card.className = `research-card${index === 0 ? ' is-primary' : ''}${isCompleted ? ' is-completed' : ''}${isActive ? ' is-active' : ''}${!canStart && !isCompleted && !isActive ? ' is-disabled' : ''}`;
            card.style.left = placement.left;
            card.style.top = placement.top;
            card.style.setProperty('--research-fill', `${fillPercent}%`);
            
            card.innerHTML = `
                <div class="research-card-content">
                    <div class="research-card-title">${research.name}</div>
                    <img src="${research.image || 'https://pub-136c85f7b0db4549ba25bf23723988bf.r2.dev/assets/image/research-item.png'}" alt="Research" class="research-card-icon">
                </div>
            `;

            card.addEventListener('mouseenter', (event) => this.showResearchTooltip(research, event));
            card.addEventListener('mousemove', () => this.positionResearchTooltip(card));
            card.addEventListener('mouseleave', () => this.hideResearchTooltip());
            card.addEventListener('click', (e) => {
                if (this.isDraggingResearch) return; // Don't click while dragging
                if (this.game.startResearch(research.id)) {
                    this.renderResearchModal();
                }
            });

            this.researchGridElement.appendChild(card);
        });
    },

    updateResearchDisplayIfOpen() {
        if (this.researchModal && this.researchModal.style.display === 'block') {
            this.renderResearchModal();
        }
    }
});
