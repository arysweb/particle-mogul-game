class SaveManager {
    constructor(storageKey) {
        this.storageKey = storageKey;
        this.version = 1;
        this.obfuscationSalt = 'particle_mogul_2026';
        this.sessionId = null;
    }

    createSaveData(game) {
        return {
            state: {
                inventory: { ...game.state.inventory },
                walletBalance: game.state.walletBalance,
                sellCap: game.state.sellCap,
                goldDrops: game.state.goldDrops,
                rareParticlesUnlocked: game.state.rareParticlesUnlocked
            },
            researchState: {
                completedResearchIds: [...game.researchState.completedResearchIds],
                activeResearchId: game.researchState.activeResearchId,
                activeResearchEndsAt: game.researchState.activeResearchEndsAt,
                researchSpeedMultiplier: game.researchState.researchSpeedMultiplier
            },
            traderState: {
                selectedParticle: game.traderState.selectedParticle,
                enabled: game.traderState.enabled,
                sellAmount: game.traderState.sellAmount,
                intervalMs: game.traderState.intervalMs,
                lastSellAt: game.traderState.lastSellAt,
                level: game.traderState.level,
                upgradeCost: game.traderState.upgradeCost
            },
            extractorLevel: game.extractorLevel,
            extractorUpgradeCost: game.extractorUpgradeCost,
            currentDropInterval: game.currentDropInterval,
            totalParticlesDropped: game.totalParticlesDropped,
            savedAt: Date.now()
        };
    }

    applySaveData(game, saveData) {
        if (!saveData || typeof saveData !== 'object') {
            return;
        }

        if (saveData.state && typeof saveData.state === 'object') {
            const inventory = saveData.state.inventory || {};
            game.state.inventory = {
                sand: Math.max(0, inventory.sand || 0),
                iron: Math.max(0, inventory.iron || 0),
                copper: Math.max(0, inventory.copper || 0),
                silver: Math.max(0, inventory.silver || 0),
                gold: Math.max(0, inventory.gold || 0),
                emerald: Math.max(0, inventory.emerald || 0),
                ruby: Math.max(0, inventory.ruby || 0)
            };
            game.state.walletBalance = Math.max(0, saveData.state.walletBalance || 0);
            game.state.sellCap = Math.max(0, saveData.state.sellCap || 10);
            game.state.goldDrops = Math.max(0, saveData.state.goldDrops || 0);
            game.state.rareParticlesUnlocked = saveData.state.rareParticlesUnlocked === true || game.state.goldDrops >= 3;
        }

        if (saveData.researchState && typeof saveData.researchState === 'object') {
            game.researchState.completedResearchIds = Array.isArray(saveData.researchState.completedResearchIds)
                ? [...saveData.researchState.completedResearchIds]
                : [];
            game.researchState.activeResearchId = saveData.researchState.activeResearchId || null;
            game.researchState.activeResearchEndsAt = saveData.researchState.activeResearchEndsAt || null;
            game.researchState.researchSpeedMultiplier = Math.max(1, saveData.researchState.researchSpeedMultiplier || 1);
        }

        if (saveData.traderState && typeof saveData.traderState === 'object') {
            game.traderState.selectedParticle = saveData.traderState.selectedParticle || 'sand';
            game.traderState.enabled = saveData.traderState.enabled !== false;
            game.traderState.sellAmount = Math.max(1, saveData.traderState.sellAmount || 15);
            game.traderState.intervalMs = Math.max(1500, saveData.traderState.intervalMs || 4000);
            game.traderState.lastSellAt = saveData.traderState.lastSellAt || 0;
            game.traderState.level = Math.max(1, saveData.traderState.level || 1);
            game.traderState.upgradeCost = Math.max(0, saveData.traderState.upgradeCost || 250);
        }

        game.extractorLevel = Math.max(1, saveData.extractorLevel || 1);
        game.extractorUpgradeCost = Math.max(0, saveData.extractorUpgradeCost || 500);
        game.currentDropInterval = Math.max(1, saveData.currentDropInterval || (1000 / game.extractorLevel));
        game.totalParticlesDropped = Math.max(0, saveData.totalParticlesDropped || 0);
    }

    save(game) {
        const payload = this.createSaveData(game);
        const jsonPayload = JSON.stringify(payload);
        const checksum = this.calculateChecksum(jsonPayload);
        const envelope = {
            version: this.version,
            checksum: checksum,
            payload: jsonPayload
        };
        const encoded = this.obfuscate(JSON.stringify(envelope));
        localStorage.setItem(this.storageKey, encoded);

        // Sync to Database in background
        this.syncToDatabase(payload);
        
        // Push session heartbeat
        this.updateSession(game);

        return true;
    }

    trackEvent(eventType, eventData) {
        let uid = localStorage.getItem('particle_mogul_uid');
        if (!uid) return;

        fetch('api/event.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                player_uid: uid,
                event_type: eventType,
                event_data: eventData
            })
        }).catch(err => console.warn("Event tracking failed:", err));
    }

    startSession() {
        let uid = localStorage.getItem('particle_mogul_uid');
        if (!uid) return;

        fetch('api/event.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                player_uid: uid,
                event_type: 'session_start'
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.session_id) this.sessionId = data.session_id;
        });
    }

    updateSession(game) {
        if (!this.sessionId) return;
        
        let uid = localStorage.getItem('particle_mogul_uid');
        this.trackEvent('session_update', {
            session_id: this.sessionId,
            particles_dropped: game.totalParticlesDropped,
            money_earned: game.state.walletBalance
        });
    }

    syncToDatabase(payload) {
        // Ensure player UID exists even if they skipped index.html logic
        let uid = localStorage.getItem('particle_mogul_uid');
        let name = localStorage.getItem('particle_mogul_name') || 'Anonymous';
        
        if (!uid) {
            uid = 'anon_' + Math.random().toString(16).substring(2, 10);
            localStorage.setItem('particle_mogul_uid', uid);
            localStorage.setItem('particle_mogul_name', name);
        }

        const dataToSend = {
            player_uid: uid,
            player_name: name,
            save_data: payload
        };

        fetch('api/save.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        })
        .then(async res => {
            const body = await res.text();
            if (!res.ok) {
                console.error("Server returned error response:", body);
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return body;
        })
        .then(text => {
            try {
                const data = JSON.parse(text);
                if (data.success) {
                    console.log("Database sync successful for player:", uid);
                } else {
                    console.error("Database sync returned error:", data.error);
                }
            } catch (e) {
                console.error("Database sync returned invalid JSON:", text);
            }
        })
        .catch(err => {
            console.error("Database sync failed completely:", err);
        });
    }

    load(game) {
        const rawSave = localStorage.getItem(this.storageKey);
        if (!rawSave) {
            return false;
        }

        const decodedEnvelope = this.deobfuscate(rawSave);
        const envelope = JSON.parse(decodedEnvelope);
        if (!envelope || typeof envelope !== 'object' || !envelope.payload || !envelope.checksum) {
            throw new Error('Invalid save structure');
        }

        const actualChecksum = this.calculateChecksum(envelope.payload);
        if (actualChecksum !== envelope.checksum) {
            throw new Error('Save checksum mismatch');
        }

        const saveData = JSON.parse(envelope.payload);
        this.applySaveData(game, saveData);
        return true;
    }

    calculateChecksum(input) {
        let hash = 2166136261;

        for (let i = 0; i < input.length; i++) {
            hash ^= input.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }

        return (hash >>> 0).toString(16).padStart(8, '0');
    }

    obfuscate(input) {
        let transformed = '';

        for (let i = 0; i < input.length; i++) {
            const saltCode = this.obfuscationSalt.charCodeAt(i % this.obfuscationSalt.length);
            transformed += String.fromCharCode(input.charCodeAt(i) ^ saltCode);
        }

        return btoa(transformed);
    }

    deobfuscate(input) {
        const decoded = atob(input);
        let transformed = '';

        for (let i = 0; i < decoded.length; i++) {
            const saltCode = this.obfuscationSalt.charCodeAt(i % this.obfuscationSalt.length);
            transformed += String.fromCharCode(decoded.charCodeAt(i) ^ saltCode);
        }

        return transformed;
    }
}
