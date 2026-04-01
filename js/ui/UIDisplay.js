Object.defineProperties(UI.prototype, {
    sandCount: {
        get() {
            return this.game.getParticleCount('sand');
        },
        set(value) {
            this.game.setParticleCount('sand', value);
        }
    },
    ironCount: {
        get() {
            return this.game.getParticleCount('iron');
        },
        set(value) {
            this.game.setParticleCount('iron', value);
        }
    },
    copperCount: {
        get() {
            return this.game.getParticleCount('copper');
        },
        set(value) {
            this.game.setParticleCount('copper', value);
        }
    },
    silverCount: {
        get() {
            return this.game.getParticleCount('silver');
        },
        set(value) {
            this.game.setParticleCount('silver', value);
        }
    },
    goldCount: {
        get() {
            return this.game.getParticleCount('gold');
        },
        set(value) {
            this.game.setParticleCount('gold', value);
        }
    },
    emeraldCount: {
        get() {
            return this.game.getParticleCount('emerald');
        },
        set(value) {
            this.game.setParticleCount('emerald', value);
        }
    },
    rubyCount: {
        get() {
            return this.game.getParticleCount('ruby');
        },
        set(value) {
            this.game.setParticleCount('ruby', value);
        }
    },
    walletBalance: {
        get() {
            return this.game.getWalletBalance();
        },
        set(value) {
            this.game.setWalletBalance(value);
        }
    },
    sellCap: {
        get() {
            return this.game.getSellCap();
        }
    }
});

Object.assign(UI.prototype, {
    invokeGameMethod(methodName) {
        if (this.game) {
            this.game[methodName]();
        }
    },

    updateRareParticleVisibility() {
        const isUnlocked = this.game.hasRareParticlesUnlocked();
        const rareSelectors = [
            '[data-particle-type="emerald"]',
            '[data-particle-type="ruby"]'
        ];

        rareSelectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((element) => {
                element.style.display = isUnlocked ? '' : 'none';
            });
        });

        if (!isUnlocked) {
            if (this.leftSelectedParticle && (this.leftSelectedParticle.type === 'emerald' || this.leftSelectedParticle.type === 'ruby')) {
                this.leftSelectedParticle = { type: 'sand', count: this.getParticleCount('sand') };
            }

            if (this.rightSelectedParticle && (this.rightSelectedParticle.type === 'emerald' || this.rightSelectedParticle.type === 'ruby')) {
                this.rightSelectedParticle = { type: 'iron', price: '1/150' };
            }
        }

        this.updateSelectedItemStyles();
        this.updateLeftSelectedDisplay();
        this.updateRightSelectedDisplay();
        this.updateTradeButton();
        this.updateResearchMarketCardPosition();
    },

    updateResearchMarketCardPosition() {
        const legend = document.querySelector('.legend');
        const researchMarketCard = document.querySelector('.research-market-card');
        
        if (legend && researchMarketCard) {
            const legendHeight = legend.offsetHeight;
            const gap = 15; // Space between legend and research/market card
            researchMarketCard.style.top = `${legendHeight + gap}px`;
        }
    },

    syncParticleCountUI(options = {}) {
        this.updateDisplay();

        if (this.game) {
            this.game.updateMarketDisplayIfOpen();
            this.game.updateResearchDisplayIfOpen();
        }

        if (options.updateTradeButton) {
            this.updateTradeButton();
        }

        if (options.updateLeftSelectedDisplay) {
            this.updateLeftSelectedDisplay();
        }

        if (options.updateRightSelectedDisplay) {
            this.updateRightSelectedDisplay();
        }
    },

    incrementParticleCount(type) {
        this.game.incrementParticleCount(type);
        this.syncParticleCountUI({
            updateTradeButton: type === 'sand',
            updateLeftSelectedDisplay: true,
            updateRightSelectedDisplay: type === 'sand'
        });
    },

    resetParticleCount(type) {
        this.game.setParticleCount(type, 0);
        this.updateDisplay();
    },

    updateTraderCard() {
        const traderState = this.game.getTraderState();
        const isUnlocked = this.game.isTraderUnlocked();
        const selectedParticle = traderState.selectedParticle;
        const isEnabled = traderState.enabled !== false;
        const nextSellSeconds = (traderState.intervalMs / 1000).toFixed(traderState.intervalMs % 1000 === 0 ? 0 : 1);
        const iconClass = this.getIconClass(selectedParticle);

        if (!isUnlocked) {
            this.traderCardElement.style.display = 'none';
            this.traderDescriptionElement.textContent = 'Unlock the Trader from Research.';
            this.traderSelectButton.textContent = 'LOCKED';
            this.traderUpgradeButton.textContent = 'LOCKED';
            this.traderSelectButton.disabled = true;
            this.traderUpgradeButton.disabled = true;
            this.traderToggleLink.textContent = 'TURN ON';
            this.traderToggleLink.disabled = true;
            this.traderToggleLink.classList.remove('is-on', 'is-off');
            this.traderCardElement.classList.add('is-locked');
            return;
        }

        this.traderCardElement.style.display = 'block';
        this.traderDescriptionElement.innerHTML = `Sell ${traderState.sellAmount} <div class="${iconClass}"></div> every ${nextSellSeconds} sec.`;
        this.traderSelectButton.innerHTML = `Sell: <div class="${iconClass}"></div>`;
        this.traderUpgradeButton.textContent = `UPGRADE (${traderState.upgradeCost})`;
        this.traderToggleLink.textContent = isEnabled ? 'TURN OFF' : 'TURN ON';
        this.traderToggleLink.disabled = false;
        this.traderToggleLink.classList.toggle('is-on', !isEnabled);
        this.traderToggleLink.classList.toggle('is-off', isEnabled);
        this.traderSelectButton.disabled = false;
        this.traderUpgradeButton.disabled = this.walletBalance < traderState.upgradeCost;
        this.traderCardElement.classList.remove('is-locked');
    },

    getParticleType(iconClass) {
        if (iconClass.includes('sand')) return 'sand';
        if (iconClass.includes('iron')) return 'iron';
        if (iconClass.includes('copper')) return 'copper';
        if (iconClass.includes('silver')) return 'silver';
        if (iconClass.includes('gold')) return 'gold';
        if (iconClass.includes('emerald')) return 'emerald';
        if (iconClass.includes('ruby')) return 'ruby';
        return 'sand';
    },

    getParticleCount(type) {
        return this.game.getParticleCount(type);
    },

    getIconClass(type) {
        switch (type) {
            case 'sand': return 'particle-icon sand-icon';
            case 'iron': return 'particle-icon iron-icon';
            case 'copper': return 'particle-icon copper-icon';
            case 'silver': return 'particle-icon silver-icon';
            case 'gold': return 'particle-icon gold-icon';
            case 'emerald': return 'particle-icon emerald-icon';
            case 'ruby': return 'particle-icon ruby-icon';
            default: return 'particle-icon sand-icon';
        }
    },

    resetSandCount() {
        this.resetParticleCount('sand');
    },

    resetIronCount() {
        this.resetParticleCount('iron');
    },

    resetCopperCount() {
        this.resetParticleCount('copper');
    },

    resetSilverCount() {
        this.resetParticleCount('silver');
    },

    resetGoldCount() {
        this.resetParticleCount('gold');
    },

    resetEmeraldCount() {
        this.resetParticleCount('emerald');
    },

    resetRubyCount() {
        this.resetParticleCount('ruby');
    },

    addMoney(amount) {
        this.game.addMoney(amount);
        this.updateDisplay();
    },

    updateDisplay() {
        this.walletBalanceElement.textContent = this.walletBalance;
        this.sandCountElement.textContent = this.sandCount;
        this.ironCountElement.textContent = this.ironCount;
        this.copperCountElement.textContent = this.copperCount;
        this.silverCountElement.textContent = this.silverCount;
        this.goldCountElement.textContent = this.goldCount;
        this.emeraldCountElement.textContent = this.emeraldCount;
        this.rubyCountElement.textContent = this.rubyCount;
        this.sellCapElement.textContent = this.sellCap;
        this.updateTraderCard();
    }
});
