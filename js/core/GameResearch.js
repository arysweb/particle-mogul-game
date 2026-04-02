Object.assign(Game.prototype, {
    isTraderUnlocked() {
        return this.researchDefinitions.some(research => 
            this.isResearchCompleted(research.id) && 
            research.effect && 
            research.effect.type === 'unlock_trader'
        );
    },

    isResearchCompleted(researchId) {
        return this.researchState.completedResearchIds.includes(researchId);
    },

    isClickerUnlocked() {
        return this.researchDefinitions.some(r => 
            this.isResearchCompleted(r.id) && 
            r.effect && 
            r.effect.type === 'unlock_clicker'
        );
    },

    getEffectiveTraderSellAmount() {
        const base = this.traderState.sellAmount || 15;
        const bonus = this.researchDefinitions.reduce((acc, r) => {
            if (this.isResearchCompleted(r.id) && r.effect && r.effect.type === 'trader_amount_bonus') {
                return acc + (r.effect.value || 0);
            }
            return acc;
        }, 0);
        return base + bonus;
    },

    getResearchById(researchId) {
        return this.researchDefinitions.find(research => research.id === researchId) || null;
    },

    getAdjustedResearchDuration(baseDurationMs) {
        return Math.max(1000, Math.floor(baseDurationMs / this.researchState.researchSpeedMultiplier));
    },

    getResearchRemainingTime() {
        if (!this.researchState.activeResearchId || !this.researchState.activeResearchEndsAt) {
            return 0;
        }

        return Math.max(0, this.researchState.activeResearchEndsAt - Date.now());
    },

    canAffordResearchCost(cost = {}) {
        const coinCost = cost.coins || 0;
        const particleCosts = cost.particles || {};

        if (this.getWalletBalance() < coinCost) {
            return false;
        }

        return Object.entries(particleCosts).every(([type, amount]) => this.getParticleCount(type) >= amount);
    },

    payResearchCost(cost = {}) {
        const coinCost = cost.coins || 0;
        const particleCosts = cost.particles || {};

        if (!this.canAffordResearchCost(cost)) {
            return false;
        }

        if (coinCost > 0) {
            this.setWalletBalance(this.getWalletBalance() - coinCost);
        }

        Object.entries(particleCosts).forEach(([type, amount]) => {
            this.decrementParticleCount(type, amount);
        });

        return true;
    },

    canStartResearch(researchId) {
        const research = this.getResearchById(researchId);

        if (!research) {
            return false;
        }

        if (this.isResearchCompleted(researchId)) {
            return false;
        }

        if (this.researchState.activeResearchId) {
            return false;
        }

        return this.canAffordResearchCost(research.cost);
    },

    startResearch(researchId) {
        const research = this.getResearchById(researchId);

        if (!research || !this.canStartResearch(researchId)) {
            return false;
        }

        if (!this.payResearchCost(research.cost)) {
            return false;
        }

        const adjustedDuration = this.getAdjustedResearchDuration(research.durationMs);
        this.researchState.activeResearchId = researchId;
        this.researchState.activeResearchEndsAt = Date.now() + adjustedDuration;
        this.ui.updateDisplay();
        this.ui.updateResearchDisplayIfOpen();
        return true;
    },

    completeResearch(researchId) {
        const research = this.getResearchById(researchId);

        if (!research) {
            return;
        }

        if (!this.isResearchCompleted(researchId)) {
            this.researchState.completedResearchIds.push(researchId);
        }

        if (research.effect && research.effect.type === 'research_speed_multiplier') {
            this.researchState.researchSpeedMultiplier *= research.effect.value;
        }

        this.researchState.activeResearchId = null;
        this.researchState.activeResearchEndsAt = null;
        
        this.initResearchEffects(); // Refresh all active effects (including the one just completed)
        
        this.startAutoDrop();
        this.updateExtractorStats();
        this.ui.updateTraderCard();
        this.ui.updateResearchDisplayIfOpen();
        
        // Immediate sync to database for the new research record
        this.saveGame({ showToast: true });
    },

    updateResearchProgress() {
        if (!this.researchState.activeResearchId || !this.researchState.activeResearchEndsAt) {
            return;
        }

        if (Date.now() >= this.researchState.activeResearchEndsAt) {
            this.completeResearch(this.researchState.activeResearchId);
            this.ui.updateDisplay();
        } else {
            this.ui.updateResearchDisplayIfOpen();
        }
    },

    openResearch() {
        const modal = document.getElementById('researchModal');
        modal.style.display = 'block';
        this.ui.renderResearchModal();
    },

    closeResearch() {
        const modal = document.getElementById('researchModal');
        modal.style.display = 'none';
    },

    updateResearchDisplayIfOpen() {
        const modal = document.getElementById('researchModal');
        if (modal && modal.style.display === 'block') {
            this.ui.renderResearchModal();
        }
    }
});
