Object.assign(Game.prototype, {
    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.initializeGrid();
            
            // Update research/market card position on resize
            if (this.ui && this.ui.updateResearchMarketCardPosition) {
                setTimeout(() => this.ui.updateResearchMarketCardPosition(), 100);
            }
        });
    },

    initializeGrid() {
        const cols = Math.ceil(this.canvas.width / this.particleSize);
        const rows = Math.ceil(this.canvas.height / this.particleSize);

        this.sandGrid = Array(rows).fill().map(() => Array(cols).fill(null));
    },

    setupEventListeners() {
        this.canvas.addEventListener('click', () => {
            const x = this.canvas.width / 2;
            this.dropSandAt(x, 50);
        });

        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const x = this.canvas.width / 2;
            this.dropSandAt(x, 50);
        });

        window.addEventListener('beforeunload', () => {
            this.saveGame();
        });
    },

    dropSandAt(x, y) {
        this.totalParticlesDropped++;
        this.recentDrops.push(Date.now());

        let particleType = 'sand';
        const rareParticlesUnlocked = this.hasRareParticlesUnlocked();

        // Check for rare particle drops (if unlocked) - check FIRST
        if (rareParticlesUnlocked && this.totalParticlesDropped % 10000 === 0) {
            particleType = 'ruby';
        } else if (rareParticlesUnlocked && this.totalParticlesDropped % 3000 === 0) {
            particleType = 'emerald';
        } else if (this.totalParticlesDropped % 1000 === 0) {
            particleType = 'gold';
        } else if (this.totalParticlesDropped % 500 === 0) {
            particleType = 'silver';
        } else if (this.totalParticlesDropped % 300 === 0) {
            particleType = 'copper';
        } else if (this.totalParticlesDropped % 100 === 0) {
            particleType = 'iron';
        }

        const particle = new Particle(x, y, this.particleSize, particleType);
        this.particles.push(particle);

        if (particleType === 'gold') {
            this.incrementGoldDrops();
            if (this.getGoldDrops() >= 3) {
                this.unlockRareParticles();
                // Check if this drop should also spawn a rare particle
                if (this.totalParticlesDropped % 3000 === 0) {
                    // Keep the gold AND add an emerald
                    const emeraldParticle = new Particle(x, y, this.particleSize, 'emerald');
                    this.particles.push(emeraldParticle);
                    this.incrementUIInventory('emerald');
                    this.ui.showParticleDropPopup('emerald');
                } else if (this.totalParticlesDropped % 10000 === 0) {
                    // Keep the gold AND add a ruby
                    const rubyParticle = new Particle(x, y, this.particleSize, 'ruby');
                    this.particles.push(rubyParticle);
                    this.incrementUIInventory('ruby');
                    this.ui.showParticleDropPopup('ruby');
                }
            }
        }

        this.incrementUIInventory(particleType);

        if (particleType !== 'sand') {
            this.ui.showParticleDropPopup(particleType);
        }
    },

    startAutoDrop() {
        if (this.autoDropInterval) {
            clearInterval(this.autoDropInterval);
        }

        const effectiveDropInterval = this.getEffectiveDropInterval();
        this.autoDropInterval = setInterval(() => {
            const x = this.canvas.width / 2;
            this.dropSandAt(x, 50);
        }, effectiveDropInterval);
    },

    startExtractorUpdates() {
        setInterval(() => {
            this.updateExtractorStats();
        }, 1000);
    },

    startResearchUpdates() {
        setInterval(() => {
            this.updateResearchProgress();
            this.updateTrader();
        }, 250);
    },

    updateExtractorStats() {
        const dropRate = this.getEffectiveExtractorDropRate();
        const extractorBonusLabel = document.getElementById('extractorBonusLabel');
        document.getElementById('dropRate').textContent = dropRate.toFixed(2).replace(/\.00$/, '');

        if (extractorBonusLabel) {
            const bonusPercent = this.getExtractorBonusPercent();
            extractorBonusLabel.textContent = bonusPercent > 0 ? `+${bonusPercent}%` : '';
        }

        const upgradeButton = document.getElementById('upgradeButton');
        upgradeButton.textContent = `UPGRADE SPEED (${this.extractorUpgradeCost})`;
    },

    upgradeExtractor() {
        if (this.spendMoney(this.extractorUpgradeCost)) {
            this.ui.updateDisplay();
            this.extractorLevel++;
            if (this.extractorLevel === 2) {
                this.extractorUpgradeCost = 850;
            } else {
                this.extractorUpgradeCost += 350;
            }

            this.currentDropInterval = 1000 / this.extractorLevel;
            this.startAutoDrop();
            console.log(`Extractor upgraded to level ${this.extractorLevel}, new drop rate: ${1000 / this.currentDropInterval} particles/sec`);
            this.updateExtractorStats();
        }
    },

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.backgroundImage.complete) {
            const zoom = 1.12;
            const drawWidth = this.canvas.width * zoom;
            const drawHeight = this.canvas.height * zoom;
            const offsetX = (this.canvas.width - drawWidth) / 2;
            const offsetY = (this.canvas.height - drawHeight) / 2;

            this.ctx.save();
            this.ctx.globalAlpha = 0.32;
            this.ctx.drawImage(this.backgroundImage, offsetX, offsetY, drawWidth, drawHeight);
            this.ctx.restore();
        }

        for (let y = 0; y < this.sandGrid.length; y++) {
            for (let x = 0; x < this.sandGrid[0].length; x++) {
                const settledParticle = this.sandGrid[y][x];

                if (settledParticle) {
                    settledParticle.draw(this.ctx, true);
                }
            }
        }

        this.particles.forEach(particle => {
            if (!particle.settled) {
                particle.draw(this.ctx, false);
            }
        });
    },

    animate() {
        this.physics.updateParticles(this.particles, this.sandGrid, this.canvas.height, this.canvas.width);
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
});
