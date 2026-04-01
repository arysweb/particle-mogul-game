Object.assign(UI.prototype, {
    setupMarketSelection() {
        this.leftMarketItems.forEach(item => {
            item.addEventListener('click', () => {
                this.selectLeftParticle(item);
            });
        });

        this.rightMarketItems.forEach(item => {
            item.addEventListener('click', () => {
                this.selectRightParticle(item);
            });
        });

        this.leftSelectedParticle = { type: 'sand', count: 0 };
        const defaultRightItem = this.rightMarketItems[0];
        if (defaultRightItem) {
            this.rightSelectedParticle = {
                type: this.getParticleType(defaultRightItem.querySelector('.particle-icon').className),
                price: defaultRightItem.querySelector('.particle-price').textContent
            };
        }
        this.updateRightColumnPrices();
        this.updateSelectedItemStyles();
        this.updateLeftSelectedDisplay();
        this.updateRightSelectedDisplay();

        setTimeout(() => {
            this.updateTradeButton();
            this.updateRightSelectedDisplay();
        }, 100);
    },

    selectLeftParticle(item) {
        const icon = item.querySelector('.particle-icon').className;
        const count = item.querySelector('.particle-count').textContent;

        this.leftSelectedParticle = {
            type: this.getParticleType(icon),
            count: parseInt(count)
        };

        this.updateSelectedItemStyles();
        this.updateLeftSelectedDisplay();
        this.updateRightColumnPrices();
        this.updateTradeButton();
        this.updateRightSelectedDisplay();
    },

    updateRightColumnPrices() {
        if (!this.leftSelectedParticle) {
            return;
        }

        const rightColumn = document.querySelector('.market-column:last-child .particle-list');
        const rightItems = rightColumn.querySelectorAll('.particle-item');

        rightItems.forEach(item => {
            const icon = item.querySelector('.particle-icon');
            const priceSpan = item.querySelector('.particle-price');
            const rightType = this.getParticleType(icon.className);
            const requiredAmount = this.game.getMarketTradeRate(this.leftSelectedParticle.type, rightType);
            priceSpan.textContent = `1/${requiredAmount}`;
        });
    },

    selectRightParticle(item) {
        const icon = item.querySelector('.particle-icon').className;
        const price = item.querySelector('.particle-price').textContent;

        this.rightSelectedParticle = {
            type: this.getParticleType(icon),
            price: price
        };

        this.updateSelectedItemStyles();
        this.updateRightSelectedDisplay();
        this.updateTradeButton();
        this.updateRightSelectedDisplay();
    },

    updateSelectedItemStyles() {
        this.leftMarketItems.forEach(item => {
            const itemType = this.getParticleType(item.querySelector('.particle-icon').className);
            item.classList.toggle('is-selected', this.leftSelectedParticle && itemType === this.leftSelectedParticle.type);
        });

        this.rightMarketItems.forEach(item => {
            const itemType = this.getParticleType(item.querySelector('.particle-icon').className);
            item.classList.toggle('is-selected', this.rightSelectedParticle && itemType === this.rightSelectedParticle.type);
        });
    },

    updateTradeSummary() {
        if (!this.leftSelectedParticle || !this.rightSelectedParticle) {
            this.tradeSummaryElement.textContent = 'Select what you want to trade.';
            return;
        }

        const sliderValue = parseInt(this.marketSlider.value);
        const requiredAmount = this.getRequiredAmount();
        const totalCost = requiredAmount * sliderValue;

        if (sliderValue === 0) {
            this.tradeSummaryElement.textContent = `Choose how many ${this.rightSelectedParticle.type} you want to receive.`;
            return;
        }

        this.tradeSummaryElement.textContent = `Trade ${totalCost} ${this.leftSelectedParticle.type} for ${sliderValue} ${this.rightSelectedParticle.type}`;
    },

    updateTradeButton() {
        const sliderValue = parseInt(document.querySelector('.slider-value').textContent);

        if (!this.leftSelectedParticle || !this.rightSelectedParticle) {
            this.tradeButton.disabled = true;
            this.tradeButton.textContent = 'SELECT TRADE';
            this.marketSliderMaxElement.textContent = 'Max: 0';
            this.marketSlider.value = 0;
            document.querySelector('.slider-value').textContent = '0';
            this.updateTradeSummary();
            return;
        }

        const availableAmount = this.getParticleCount(this.leftSelectedParticle.type);
        const requiredAmount = this.getRequiredAmount();
        const maxPossible = Math.floor(availableAmount / requiredAmount);
        this.marketSliderMaxElement.textContent = `Max: ${Math.max(0, maxPossible)}`;
        this.marketSlider.min = 0;
        this.marketSlider.max = Math.max(0, maxPossible);

        if (sliderValue > this.marketSlider.max) {
            this.marketSlider.value = this.marketSlider.max;
            document.querySelector('.slider-value').textContent = this.marketSlider.max;
        }

        if (maxPossible <= 0) {
            this.marketSlider.value = 0;
            document.querySelector('.slider-value').textContent = '0';
        }

        if (parseInt(this.marketSlider.value) === 0) {
            this.tradeButton.disabled = true;
            this.tradeButton.textContent = 'CHOOSE AMOUNT';
        } else if (availableAmount >= requiredAmount * parseInt(this.marketSlider.value)) {
            this.tradeButton.disabled = false;
            this.tradeButton.textContent = 'TRADE';
        } else {
            this.tradeButton.disabled = true;
            this.tradeButton.textContent = 'NOT ENOUGH';
        }

        this.updateRightSelectedDisplay();
        this.updateTradeSummary();
    },

    updateRightSelectedDisplay() {
        if (!this.rightSelectedParticle) {
            return;
        }

        const sliderValue = parseInt(document.querySelector('.slider-value').textContent);
        const availableAmount = this.getParticleCount(this.leftSelectedParticle.type);
        const requiredAmount = this.getRequiredAmount();
        const canAfford = Math.min(sliderValue, Math.floor(availableAmount / requiredAmount));
        const iconClass = this.getIconClass(this.rightSelectedParticle.type);

        this.rightSelectedElement.innerHTML = `
            <span class="selected-particle-label">Receive</span>
            <div class="${iconClass}"></div>
            <span class="selected-count">${canAfford}</span>
        `;
    },

    getRequiredAmount() {
        return this.game.getMarketTradeRate(this.leftSelectedParticle.type, this.rightSelectedParticle.type);
    },

    executeTrade() {
        const sliderValue = parseInt(document.querySelector('.slider-value').textContent);
        const leftType = this.leftSelectedParticle.type;
        const rightType = this.rightSelectedParticle.type;
        const rate = this.getRequiredAmount();

        // Track the event in the database
        this.game.saveManager.trackEvent('market_trade', {
            from_type: leftType,
            to_type: rightType,
            from_amount: sliderValue * rate,
            to_amount: sliderValue,
            rate: rate
        });

        this.game.tradeParticles(leftType, rightType, sliderValue);
    },

    updateLeftSelectedDisplay() {
        if (!this.leftSelectedParticle) {
            return;
        }

        const particleType = this.leftSelectedParticle.type;
        const count = this.getParticleCount(particleType);
        const iconClass = this.getIconClass(particleType);

        this.leftSelectedElement.innerHTML = `
            <span class="selected-particle-label">Spend</span>
            <div class="${iconClass}"></div>
            <span class="selected-count">${count}</span>
        `;
    }
});
