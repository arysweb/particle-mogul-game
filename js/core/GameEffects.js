Object.assign(Game.prototype, {
    initResearchEffects() {
        if (!this.activeEffects) {
            this.activeEffects = {};
        }

        const completedIds = this.researchState.completedResearchIds || [];
        const definitions = this.researchDefinitions || [];

        // Scan all completed research for "Active" effects (spawners, etc.)
        completedIds.forEach(id => {
            const research = definitions.find(r => r.id === id);
            if (research && research.effect) {
                this.applyResearchEffect(research.effect);
            }
        });
    },

    applyResearchEffect(effect) {
        if (!effect || !effect.type) return;

        switch (effect.type) {
            case 'luck_spawner':
                this.activateLuckSpawner(effect.min_sec || 60, effect.max_sec || 300);
                break;
            case 'unlock_trader':
                // Handled in UI/GameTrade logic, but can trigger initial state here
                break;
            // Future effects can be added here
        }
    },

    activateLuckSpawner(minSec, maxSec) {
        // Prevent double activation
        if (this.activeEffects.luckInterval) {
            clearTimeout(this.activeEffects.luckInterval);
        }

        const scheduleNext = () => {
            const delayMs = (Math.random() * (maxSec - minSec) + minSec) * 1000;
            console.log(`🍀 Luck: Next drop scheduled in ${Math.round(delayMs/1000)}s`);
            
            this.activeEffects.luckInterval = setTimeout(() => {
                this.triggerLuckDrop();
                scheduleNext(); // Loop
            }, delayMs);
        };

        scheduleNext();
    },

    triggerLuckDrop() {
        // 1. Identify Available Particles
        const available = ['sand', 'iron', 'copper', 'silver', 'gold'];
        if (this.hasRareParticlesUnlocked()) {
            available.push('emerald', 'ruby');
        }

        // 2. Pick Random
        const picked = available[Math.floor(Math.random() * available.length)];
        
        // 3. Award
        console.log(`🍀 LUCK! Awarding 1x ${picked.toUpperCase()}`);
        this.incrementParticleCount(picked, 1);
        
        // 4. Notify User
        if (this.ui) {
            this.ui.showToast(`🍀 LUCK! Found a ${picked.toUpperCase()} particle!`);
            this.ui.showParticleDropPopup(picked);
            this.ui.updateDisplay();
        }
    }
});
