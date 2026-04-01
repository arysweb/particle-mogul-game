Object.assign(UI.prototype, {
    handleResearchZoom(event) {
        if (!this.researchModal || this.researchModal.style.display !== 'block') {
            return;
        }

        event.preventDefault();
        const direction = event.deltaY < 0 ? 1 : -1;
        const nextZoom = this.researchZoom + (direction * this.researchZoomStep);
        this.researchZoom = Math.max(this.researchZoomMin, Math.min(this.researchZoomMax, nextZoom));
        this.updateResearchZoom();
    },

    updateResearchZoom() {
        if (!this.researchGridBoardElement) {
            return;
        }

        this.researchGridBoardElement.style.setProperty('--research-grid-zoom', this.researchZoom);
    },

    renderResearchGridHelper() {
        if (!this.researchGridHelperElement) {
            return;
        }

        this.researchGridHelperElement.innerHTML = '';

        for (let row = 1; row <= 8; row++) {
            for (let col = 1; col <= 8; col++) {
                const helperCell = document.createElement('div');
                helperCell.className = 'research-grid-helper-cell';
                this.researchGridHelperElement.appendChild(helperCell);
            }
        }
    },

    formatResearchCost(cost = {}) {
        const parts = [];
        const particleCosts = cost.particles || {};

        if (cost.coins) {
            parts.push(`${cost.coins} coins`);
        }

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

        if (minutes <= 0) {
            return `${seconds}s`;
        }

        return `${minutes}m ${seconds}s`;
    },

    showResearchTooltip(research, event) {
        this.researchTooltipElement.innerHTML = `
            <div class="research-tooltip-title">${research.name}</div>
            <div class="research-tooltip-copy">${research.description}</div>
            <div class="research-tooltip-meta-row">
                <div class="research-tooltip-cost">
                    <div class="research-cost-list">${this.getResearchCostMarkup(research.cost)}</div>
                </div>
                <div class="research-tooltip-time">${this.formatDuration(this.game.getAdjustedResearchDuration(research.durationMs))}</div>
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

    getResearchGridPlacement(research, index) {
        const defaultPlacement = index === 0
            ? { col: 4, row: 4 }
            : { col: null, row: null };
        const placement = research.gridPosition || defaultPlacement;
        const parsedCol = Number.parseInt(placement.col, 10);
        const parsedRow = Number.parseInt(placement.row, 10);
        const col = Number.isInteger(parsedCol) ? Math.max(1, Math.min(8, parsedCol)) : defaultPlacement.col;
        const row = Number.isInteger(parsedRow) ? Math.max(1, Math.min(8, parsedRow)) : defaultPlacement.row;

        return { col, row };
    },

    renderResearchModal() {
        const researches = this.game.getResearchDefinitions();
        const researchState = this.game.getResearchState();

        this.renderResearchGridHelper();
        this.updateResearchZoom();

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
            const placement = this.getResearchGridPlacement(research, index);

            card.className = `research-card${index === 0 ? ' is-primary' : ''}${isCompleted ? ' is-completed' : ''}${isActive ? ' is-active' : ''}${!canStart && !isCompleted && !isActive ? ' is-disabled' : ''}`;
            if (placement.col) {
                card.style.gridColumn = `${placement.col}`;
            }
            if (placement.row) {
                card.style.gridRow = `${placement.row}`;
            }
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
            card.addEventListener('click', () => {
                if (this.game.startResearch(research.id)) {
                    this.renderResearchModal();
                }
            });

            this.researchGridElement.appendChild(card);
        });
    },

    updateResearchDisplayIfOpen() {
        this.renderResearchModal();
    }
});
