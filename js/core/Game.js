class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.saveStorageKey = 'particle_mogul_save';
        this.saveManager = new SaveManager(this.saveStorageKey);
        this.autosaveIntervalMs = 60000;
        this.autosaveInterval = null;
        this.particles = [];
        this.sandGrid = [];
        this.particleSize = 20;
        this.totalParticlesDropped = 0;
        this.state = GameData.createState();
        this.researchDefinitions = GameData.createResearchDefinitions();
        this.researchState = GameData.createResearchState();
        this.traderState = GameData.createTraderState();
        this.marketRates = GameData.createMarketRates();
        this.recentDrops = [];
        this.extractorLevel = 1;
        this.extractorUpgradeCost = 500;
        this.baseDropInterval = 1000;
        this.currentDropInterval = 1000;
        this.autoDropInterval = null;

        this.physics = new Physics(this.particleSize);
        this.ui = new UI(this);

        this.coinImage = new Image();
        this.coinImage.src = 'assets/img/coin.png';
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'https://pub-136c85f7b0db4549ba25bf23723988bf.r2.dev/assets/image/game_bg.jpg';

        this.setupCanvas();
        this.initializeGrid();
        this.loadGame();
        this.setupEventListeners();
        this.startAutoDrop();
        this.startExtractorUpdates();
        this.startResearchUpdates();
        this.startAutosave();
        this.refreshUIFromState();
        this.animate();
    }

    getParticleCount(type) {
        return this.state.inventory[type] || 0;
    }

    setParticleCount(type, amount) {
        this.state.inventory[type] = Math.max(0, amount);
    }

    incrementParticleCount(type, amount = 1) {
        this.setParticleCount(type, this.getParticleCount(type) + amount);
    }

    decrementParticleCount(type, amount = 1) {
        this.setParticleCount(type, this.getParticleCount(type) - amount);
    }

    getWalletBalance() {
        return this.state.walletBalance;
    }

    setWalletBalance(amount) {
        this.state.walletBalance = Math.max(0, amount);
    }

    addMoney(amount) {
        this.setWalletBalance(this.getWalletBalance() + amount);
    }

    spendMoney(amount) {
        if (this.getWalletBalance() < amount) {
            return false;
        }

        this.setWalletBalance(this.getWalletBalance() - amount);
        return true;
    }

    getSellPrice(type) {
        switch (type) {
            case 'sand': return 1;
            case 'iron': return 10;
            case 'copper': return 30;
            case 'silver': return 100;
            case 'gold': return 300;
            case 'emerald': return 500;
            case 'ruby': return 3000;
            default: return 0;
        }
    }

    getSellCap() {
        return this.state.sellCap;
    }

    getGoldDrops() {
        return this.state.goldDrops || 0;
    }

    incrementGoldDrops(amount = 1) {
        this.state.goldDrops = this.getGoldDrops() + amount;
    }

    hasRareParticlesUnlocked() {
        return this.state.rareParticlesUnlocked === true;
    }

    unlockRareParticles() {
        if (this.hasRareParticlesUnlocked()) {
            return false;
        }

        this.state.rareParticlesUnlocked = true;
        if (this.ui) {
            this.ui.updateRareParticleVisibility();
            this.ui.showToast('Emerald and Ruby unlocked');
        }

        return true;
    }

    getMarketTradeRate(fromType, toType) {
        return this.marketRates[`${fromType}-${toType}`] || 1;
    }

    getResearchDefinitions() {
        return this.researchDefinitions;
    }

    getResearchState() {
        return this.researchState;
    }

    getTraderState() {
        return this.traderState;
    }

    getExtractorResearchMultiplier() {
        return this.researchDefinitions.reduce((multiplier, research) => {
            if (!this.isResearchCompleted(research.id)) {
                return multiplier;
            }

            if (!research.effect || research.effect.type !== 'extractor_output_multiplier') {
                return multiplier;
            }

            return multiplier * research.effect.value;
        }, 1);
    }

    getExtractorBonusPercent() {
        return Math.round((this.getExtractorResearchMultiplier() - 1) * 100);
    }

    getBaseExtractorDropRate() {
        return 1000 / this.currentDropInterval;
    }

    getEffectiveExtractorDropRate() {
        return this.getBaseExtractorDropRate() * this.getExtractorResearchMultiplier();
    }

    getEffectiveDropInterval() {
        return Math.max(1, this.currentDropInterval / this.getExtractorResearchMultiplier());
    }

    loadGame() {
        try {
            return this.saveManager.load(this);
        } catch (error) {
            console.error('Failed to load save data:', error);
            return false;
        }
    }

    saveGame(options = {}) {
        try {
            this.saveManager.save(this);

            if (options.showToast && this.ui) {
                this.ui.showToast('Game autosaved');
            }

            return true;
        } catch (error) {
            console.error('Failed to save game data:', error);
            return false;
        }
    }

    startAutosave() {
        if (this.autosaveInterval) {
            clearInterval(this.autosaveInterval);
        }

        this.autosaveInterval = setInterval(() => {
            this.saveGame({ showToast: true });
        }, this.autosaveIntervalMs);
    }

    refreshUIFromState() {
        this.ui.updateDisplay();
        this.ui.updateRareParticleVisibility();
        this.ui.updateLeftSelectedDisplay();
        this.ui.updateTradeButton();
        this.ui.updateRightSelectedDisplay();
        this.ui.updateTraderCard();
        this.updateExtractorStats();
        this.updateMarketDisplayIfOpen();
        this.updateResearchDisplayIfOpen();
    }
}
