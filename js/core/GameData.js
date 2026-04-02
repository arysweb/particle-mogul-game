class GameData {
    static createState() {
        return {
            inventory: {
                sand: 0,
                iron: 0,
                copper: 0,
                silver: 0,
                gold: 0,
                emerald: 0,
                ruby: 0
            },
            walletBalance: 0,
            sellCap: 10,
            goldDrops: 0,
            rareParticlesUnlocked: false,
            clickDropAmount: 0
        };
    }

    static createResearchState() {
        return {
            completedResearchIds: [],
            activeResearchId: null,
            activeResearchEndsAt: null,
            researchSpeedMultiplier: 1
        };
    }

    static createTraderState() {
        return {
            selectedParticle: 'sand',
            enabled: true,
            sellAmount: 15,
            intervalMs: 4000,
            lastSellAt: 0,
            level: 1,
            upgradeCost: 250
        };
    }

    static createMarketRates() {
        return {
            'sand-iron': 120,
            'sand-copper': 250,
            'sand-silver': 600,
            'sand-gold': 1200,
            'sand-emerald': 3000,
            'sand-ruby': 10000,
            'iron-sand': 180,
            'iron-copper': 2,
            'iron-silver': 5,
            'iron-gold': 8,
            'iron-emerald': 24,
            'iron-ruby': 80,
            'copper-sand': 350,
            'copper-iron': 1,
            'copper-silver': 3,
            'copper-gold': 5,
            'copper-emerald': 12,
            'copper-ruby': 34,
            'silver-sand': 800,
            'silver-iron': 4,
            'silver-copper': 2,
            'silver-gold': 2,
            'silver-emerald': 5,
            'silver-ruby': 10,
            'gold-sand': 1600,
            'gold-iron': 12,
            'gold-copper': 6,
            'gold-silver': 2,
            'gold-emerald': 3,
            'gold-ruby': 5,
            'emerald-sand': 4500,
            'emerald-iron': 36,
            'emerald-copper': 18,
            'emerald-silver': 6,
            'emerald-gold': 2,
            'emerald-ruby': 3,
            'ruby-sand': 15000,
            'ruby-iron': 120,
            'ruby-copper': 50,
            'ruby-silver': 16,
            'ruby-gold': 6,
            'ruby-emerald': 2
        };
    }

    static createResearchDefinitions() {
        return [
            {
                id: 'unlock-trader',
                name: 'Trader',
                description: 'Auto-sells particles.',
                gridPosition: {
                    x: 0,
                    y: 0
                },
                cost: {
                    coins: 100,
                    particles: {
                        sand: 100
                    }
                },
                durationMs: 5000,
                effect: {
                    type: 'unlock_trader'
                }
            },
            {
                id: 'extractor-output-boost-1',
                name: 'Extractor',
                description: 'Boosts extractor output by 5%.',
                image: 'https://pub-136c85f7b0db4549ba25bf23723988bf.r2.dev/assets/image/extractor.png',
                gridPosition: {
                    x: 2,
                    y: 0
                },
                cost: {
                    coins: 250,
                    particles: {
                        sand: 250,
                        iron: 10
                    }
                },
                durationMs: 7000,
                effect: {
                    type: 'extractor_output_multiplier',
                    value: 1.05
                }
            },
            {
                id: 'storage-boost-1',
                name: 'Storage',
                description: 'Increases sell capacity by +50.',
                image: 'https://pub-136c85f7b0db4549ba25bf23723988bf.r2.dev/assets/image/sell-cap.png',
                gridPosition: {
                    x: -2,
                    y: 0
                },
                cost: {
                    coins: 500,
                    particles: {
                        iron: 25,
                        copper: 10
                    }
                },
                durationMs: 12000,
                effect: {
                    type: 'sell_cap_boost',
                    value: 50
                }
            }
        ];
    }
}
