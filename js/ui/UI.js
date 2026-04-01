class UI {
    constructor(game) {
        this.game = game;
        this.toastTimeout = null;
        this.researchZoom = 1;
        this.researchZoomMin = 0.55;
        this.researchZoomMax = 2;
        this.researchZoomStep = 0.1;
        
        // Market selection defaults
        this.leftSelectedParticle = { type: 'sand', count: 0 };
        this.rightSelectedParticle = { type: 'iron', price: '1/150' };
        
        // Get DOM elements
        this.walletBalanceElement = document.getElementById('walletBalance');
        this.sandCountElement = document.getElementById('sandCount');
        this.ironCountElement = document.getElementById('ironCount');
        this.copperCountElement = document.getElementById('copperCount');
        this.silverCountElement = document.getElementById('silverCount');
        this.goldCountElement = document.getElementById('goldCount');
        this.emeraldCountElement = document.getElementById('emeraldCount');
        this.rubyCountElement = document.getElementById('rubyCount');
        this.sellCapElement = document.getElementById('sellCap');
        this.sellButton = document.getElementById('sellButton');
        this.sellIronButton = document.getElementById('sellIronButton');
        this.sellCopperButton = document.getElementById('sellCopperButton');
        this.sellSilverButton = document.getElementById('sellSilverButton');
        this.sellGoldButton = document.getElementById('sellGoldButton');
        this.sellEmeraldButton = document.getElementById('sellEmeraldButton');
        this.sellRubyButton = document.getElementById('sellRubyButton');
        this.upgradeButton = document.getElementById('upgradeButton');
        this.tradeButton = document.getElementById('tradeButton');
        this.marketSlider = document.getElementById('marketSlider');
        this.tradeSummaryElement = document.getElementById('tradeSummary');
        this.marketSliderMaxElement = document.getElementById('marketSliderMax');
        this.leftSelectedElement = document.getElementById('leftSelected');
        this.rightSelectedElement = document.getElementById('rightSelected');
        this.leftMarketItems = document.querySelectorAll('.market-column:first-child .particle-item');
        this.rightMarketItems = document.querySelectorAll('.market-column:last-child .particle-item');
        this.researchModal = document.getElementById('researchModal');
        this.researchGridElement = document.getElementById('researchGrid');
        this.researchGridBoardElement = document.getElementById('researchGridBoard');
        this.researchGridHelperElement = document.getElementById('researchGridHelper');
        this.researchEmptyStateElement = document.getElementById('researchEmptyState');
        this.researchTooltipElement = document.getElementById('researchTooltip');
        this.researchModalContent = document.querySelector('.research-modal-content');
        this.traderCardElement = document.getElementById('traderCard');
        this.traderDescriptionElement = document.getElementById('traderDescription');
        this.traderSelectButton = document.getElementById('traderSelectButton');
        this.traderUpgradeButton = document.getElementById('traderUpgradeButton');
        this.traderToggleLink = document.getElementById('traderToggleLink');
        this.toastElement = this.createToastElement();
        
        // Setup sell button event listeners
        this.sellButton.addEventListener('click', () => this.invokeGameMethod('sellAll'));
        
        this.sellIronButton.addEventListener('click', () => this.invokeGameMethod('sellIron'));
        
        this.sellCopperButton.addEventListener('click', () => this.invokeGameMethod('sellCopper'));
        
        this.sellSilverButton.addEventListener('click', () => this.invokeGameMethod('sellSilver'));
        
        this.sellGoldButton.addEventListener('click', () => this.invokeGameMethod('sellGold'));

        this.sellEmeraldButton.addEventListener('click', () => this.invokeGameMethod('sellEmerald'));

        this.sellRubyButton.addEventListener('click', () => this.invokeGameMethod('sellRuby'));
        
        // Setup upgrade button event listener
        this.upgradeButton.addEventListener('click', () => this.invokeGameMethod('upgradeExtractor'));
        this.traderSelectButton.addEventListener('click', () => this.invokeGameMethod('cycleTraderParticle'));
        this.traderUpgradeButton.addEventListener('click', () => this.invokeGameMethod('upgradeTrader'));
        this.traderToggleLink.addEventListener('click', () => {
            this.game.setTraderEnabled(this.game.getTraderState().enabled === false);
        });
        
        // Setup research and market event listeners
        document.querySelector('.research-section').addEventListener('click', () => this.invokeGameMethod('openResearch'));
        
        document.querySelector('.market-section').addEventListener('click', () => this.invokeGameMethod('openMarket'));
        
        // Setup market modal event listeners
        document.getElementById('closeMarketModal').addEventListener('click', () => this.invokeGameMethod('closeMarket'));
        document.getElementById('closeResearchModal').addEventListener('click', () => this.invokeGameMethod('closeResearch'));
        this.researchModal.addEventListener('wheel', (event) => this.handleResearchZoom(event), { passive: false });
        
        // Setup slider event listener
        const sliderValue = document.querySelector('.slider-value');
        
        // Add multiple event listeners to ensure slider works
        this.marketSlider.addEventListener('input', (e) => {
            console.log('Slider input event:', e.target.value);
            sliderValue.textContent = e.target.value;
            this.updateTradeButton();
            this.updateRightSelectedDisplay();
        });
        
        this.marketSlider.addEventListener('change', (e) => {
            console.log('Slider change event:', e.target.value);
            sliderValue.textContent = e.target.value;
            this.updateTradeButton();
            this.updateRightSelectedDisplay();
        });
        
        // Setup trade button
        this.tradeButton.addEventListener('click', () => {
            this.executeTrade();
        });
        
        // Setup particle selection for market modal
        this.setupMarketSelection();
        this.updateTraderCard();
        
        this.updateDisplay();
        
        // Initialize research/market card position
        setTimeout(() => this.updateResearchMarketCardPosition(), 100);
    }
}
