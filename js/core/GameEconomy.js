Object.assign(Game.prototype, {
    setTraderEnabled(enabled) {
        this.traderState.enabled = enabled !== false;
        this.traderState.lastSellAt = Date.now();
        this.ui.updateTraderCard();
    },

    cycleTraderParticle() {
        if (!this.isTraderUnlocked()) {
            return;
        }

        const particles = this.hasRareParticlesUnlocked()
            ? ['sand', 'iron', 'copper', 'silver', 'gold', 'emerald', 'ruby']
            : ['sand', 'iron', 'copper', 'silver', 'gold'];
        const currentIndex = particles.indexOf(this.traderState.selectedParticle);
        const nextIndex = (currentIndex + 1) % particles.length;
        this.traderState.selectedParticle = particles[nextIndex];
        this.ui.updateTraderCard();
    },

    upgradeTrader() {
        if (!this.isTraderUnlocked()) {
            return false;
        }

        if (!this.spendMoney(this.traderState.upgradeCost)) {
            return false;
        }

        this.traderState.level += 1;
        this.traderState.sellAmount += 5;
        this.traderState.intervalMs = Math.max(1500, this.traderState.intervalMs - 500);
        this.traderState.upgradeCost += 200;
        this.ui.updateDisplay();
        this.ui.updateTraderCard();
        return true;
    },

    updateTrader() {
        if (!this.isTraderUnlocked()) {
            return;
        }

        if (!this.traderState.enabled) {
            return;
        }

        const now = Date.now();
        if (now - this.traderState.lastSellAt < this.traderState.intervalMs) {
            return;
        }

        const selectedParticle = this.traderState.selectedParticle;
        const availableCount = this.getParticleCount(selectedParticle);
        if (availableCount <= 0) {
            this.traderState.lastSellAt = now;
            this.ui.updateTraderCard();
            return;
        }

        const sellAmount = Math.min(this.traderState.sellAmount, availableCount);
        const soldCount = this.sellParticleType(selectedParticle, this.getSellPrice(selectedParticle), `${selectedParticle}Count`, sellAmount);

        this.traderState.lastSellAt = now;
        if (soldCount > 0) {
            this.ui.showTraderSellPopup(soldCount * this.getSellPrice(selectedParticle));
            this.ui.updateTraderCard();
        }
    },

    removeSettledParticlesByType(type, limit = Infinity) {
        let particlesRemoved = 0;

        for (let i = this.particles.length - 1; i >= 0 && particlesRemoved < limit; i--) {
            if (this.particles[i].settled && this.particles[i].type === type) {
                const gridX = Math.floor(this.particles[i].x / this.particleSize);
                const gridY = Math.floor(this.particles[i].y / this.particleSize);

                if (gridY >= 0 && gridY < this.sandGrid.length && gridX >= 0 && gridX < this.sandGrid[0].length) {
                    this.sandGrid[gridY][gridX] = null;
                }

                this.particles.splice(i, 1);
                particlesRemoved++;
            }
        }

        return particlesRemoved;
    },

    sellParticleType(type, pricePerParticle, countProperty, limit = Infinity) {
        const particleType = countProperty.replace('Count', '');
        const availableCount = this.getParticleCount(particleType);
        const sellAmount = Math.min(availableCount, limit);
        const moneyEarned = sellAmount * pricePerParticle;

        this.addMoney(moneyEarned);
        this.decrementParticleCount(particleType, sellAmount);
        this.removeSettledParticlesByType(type, sellAmount);
        this.ui.updateDisplay();
        this.ui.updateTraderCard();
        return sellAmount;
    },

    incrementUIInventory(particleType) {
        this.ui.incrementParticleCount(particleType);
    },

    sellAll() {
        this.sellParticleType('sand', this.getSellPrice('sand'), 'sandCount', this.getSellCap());
    },

    sellIron() {
        this.sellParticleType('iron', this.getSellPrice('iron'), 'ironCount', this.getSellCap());
    },

    sellCopper() {
        this.sellParticleType('copper', this.getSellPrice('copper'), 'copperCount', this.getSellCap());
    },

    sellSilver() {
        this.sellParticleType('silver', this.getSellPrice('silver'), 'silverCount', this.getSellCap());
    },

    sellGold() {
        this.sellParticleType('gold', this.getSellPrice('gold'), 'goldCount', this.getSellCap());
    },

    sellEmerald() {
        this.sellParticleType('emerald', this.getSellPrice('emerald'), 'emeraldCount', this.getSellCap());
    },

    sellRuby() {
        this.sellParticleType('ruby', this.getSellPrice('ruby'), 'rubyCount', this.getSellCap());
    },

    tradeParticles(fromType, toType, amount) {
        const requiredAmount = this.getMarketTradeRate(fromType, toType) * amount;

        if (amount <= 0 || this.getParticleCount(fromType) < requiredAmount) {
            return false;
        }

        this.decrementParticleCount(fromType, requiredAmount);
        this.incrementParticleCount(toType, amount);
        this.ui.syncParticleCountUI({ updateTradeButton: true, updateLeftSelectedDisplay: true, updateRightSelectedDisplay: true });
        console.log(`Traded ${requiredAmount} ${fromType} for ${amount} ${toType}`);
        return true;
    },

    openMarket() {
        console.log('Market panel opened');
        const modal = document.getElementById('marketModal');
        modal.style.display = 'block';
        this.updateMarketDisplay();
    },

    closeMarket() {
        console.log('Market panel closed');
        const modal = document.getElementById('marketModal');
        modal.style.display = 'none';
    },

    updateMarketDisplay() {
        document.getElementById('marketSandCount').textContent = this.getParticleCount('sand');
        document.getElementById('marketIronCount').textContent = this.getParticleCount('iron');
        document.getElementById('marketCopperCount').textContent = this.getParticleCount('copper');
        document.getElementById('marketSilverCount').textContent = this.getParticleCount('silver');
        document.getElementById('marketGoldCount').textContent = this.getParticleCount('gold');
        document.getElementById('marketEmeraldCount').textContent = this.getParticleCount('emerald');
        document.getElementById('marketRubyCount').textContent = this.getParticleCount('ruby');
    },

    updateMarketDisplayIfOpen() {
        const modal = document.getElementById('marketModal');
        if (modal && modal.style.display === 'block') {
            this.updateMarketDisplay();
        }
    }
});
