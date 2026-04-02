<?php
require 'auth_check.php';
checkAdmin();
?>
<!DOCTYPE html>
<html>
<head>
    <title>Research Creator - Particle Mogul</title>
    <link rel="icon" type="image/png" href="https://pub-136c85f7b0db4549ba25bf23723988bf.r2.dev/assets/image/particles/sand.png">
    <link rel="stylesheet" href="../assets/css/research.css">
    <style>
        body { margin: 0; background: #0b0b0b; color: #fff; font-family: 'Courier New', monospace; overflow: hidden; }
        .admin-header { position: fixed; top: 0; left: 0; right: 0; height: 60px; background: #222; border-bottom: 2px solid #444; z-index: 1000; display: flex; align-items: center; padding: 0 20px; justify-content: space-between; }
        .admin-sidebar { position: fixed; top: 60px; right: 0; bottom: 0; width: 400px; background: #1a1a1a; border-left: 2px solid #444; z-index: 1000; padding: 20px; overflow-y: auto; transform: translateX(100%); transition: transform 0.3s ease; }
        .admin-sidebar.open { transform: translateX(0); }
        .grid-container { width: 100vw; height: 100vh; position: relative; }
        
        /* Override for Admin */
        .research-grid-viewport { width: 100%; height: 100%; top: 0; left: 0; background: #001a1a; border: none; border-radius: 0; overflow: hidden; }
        .research-grid-board { 
            --research-board-size: 10000px; /* Synchronized with centering logic */
            --research-grid-zoom: 0.8; 
            --research-cell-size: 150px;
            width: var(--research-board-size);
            height: var(--research-board-size);
        }
        
        .form-group { margin-bottom: 15px; }
        label { display: block; font-size: 12px; color: #aaa; margin-bottom: 5px; }
        input, textarea, select { width: 100%; padding: 10px; background: #333; border: 1px solid #444; color: #fff; border-radius: 4px; box-sizing: border-box; }
        button.save-btn { background: #ffd700; color: #000; font-weight: bold; padding: 12px; width: 100%; border: none; border-radius: 6px; cursor: pointer; margin-top: 10px; }
        button.delete-btn { background: #ff5555; color: #fff; padding: 8px; width: 100%; border: none; border-radius: 6px; cursor: pointer; margin-top: 5px; }
        
        .grid-clicker { position: absolute; inset: 0; z-index: 1; }
        #gridItems { position: absolute; inset: 0; z-index: 5; pointer-events: none; }
        .research-card { pointer-events: auto; }
        
        .click-dot { position: absolute; width: 10px; height: 10px; background: #00ff00; border-radius: 50%; transform: translate(-50%, -50%); pointer-events: none; opacity: 0; }
        
        /* Mark invalid spaced cells */
        .invalid-cell-marker { position: absolute; width: 40px; height: 40px; border: 1px solid rgba(255,0,0,0.1); transform: translate(-50%, -50%); pointer-events: none; font-size: 8px; color: rgba(255,0,0,0.2); display: flex; align-items: center; justify-content: center; }
    </style>
</head>
<body>

<div class="admin-header">
    <div style="font-weight: bold; color: #ffd700;">RESEARCH CREATOR DASHBOARD</div>
    <div>
        <span id="coordDisplay">X: 0, Y: 0</span>
        <a href="login.php" style="color: #ff5555; margin-left: 20px; text-decoration: none;">LOGOUT</a>
    </div>
</div>


<div class="grid-container">
    <div class="research-grid-viewport" id="viewport">
        <div class="research-grid-board" id="board">
            <div id="gridItems"></div>
            <div class="grid-clicker" id="clicker"></div>
            <div class="click-dot" id="cursorDot"></div>
        </div>
    </div>
</div>

<div class="admin-sidebar" id="sidebar">
    <h3 id="formTitle">Add New Research</h3>
    <form id="researchForm">
        <input type="hidden" id="field_x" name="grid_x">
        <input type="hidden" id="field_y" name="grid_y">
        <input type="hidden" id="field_id" name="id">
        
        <div class="form-group">
            <label>Name</label>
            <input type="text" id="field_name" name="name" required placeholder="e.g. Advanced Extraction">
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea id="field_description" name="description" rows="3"></textarea>
        </div>
        <div class="form-group">
            <label>Image URL (Optional)</label>
            <input type="text" id="field_image" name="image_url" placeholder="https://...">
        </div>
        <div class="form-group">
            <label>Duration (Seconds)</label>
            <input type="number" id="field_duration_sec" name="duration_sec" value="5" step="0.1">
        </div>
        
        <div class="form-group">
            <label style="color: #ffd700; margin-top: 10px; border-top: 1px solid #444; padding-top: 10px;">Research Costs</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                    <label>Coins</label>
                    <input type="number" id="cost_coins" name="cost_coins" value="0">
                </div>
                <div>
                    <label>Sand</label>
                    <input type="number" id="cost_sand" name="cost_sand" value="0">
                </div>
                <div>
                    <label>Iron</label>
                    <input type="number" id="cost_iron" name="cost_iron" value="0">
                </div>
                <div>
                    <label>Copper</label>
                    <input type="number" id="cost_copper" name="cost_copper" value="0">
                </div>
                <div>
                    <label>Silver</label>
                    <input type="number" id="cost_silver" name="cost_silver" value="0">
                </div>
                <div>
                    <label>Gold</label>
                    <input type="number" id="cost_gold" name="cost_gold" value="0">
                </div>
                <div>
                    <label>Emerald</label>
                    <input type="number" id="cost_emerald" name="cost_emerald" value="0">
                </div>
                <div>
                    <label>Ruby</label>
                    <input type="number" id="cost_ruby" name="cost_ruby" value="0">
                </div>
            </div>
        </div>

        <div class="form-group">
            <label style="color: #ffd700; border-top: 1px solid #444; padding-top: 10px;">Parent Research (Prerequisite)</label>
            <select id="field_parent" name="parent_id">
                <option value="">None (Starting Point)</option>
            </select>
        </div>

        <div class="form-group">
            <label style="color: #ffd700;">Effect (JSON logic)</label>
            <textarea id="field_effect" name="effect_json" rows="3" placeholder='{"type": "multiplier", "value": 1.1}'></textarea>
        </div>
        
        <button type="submit" class="save-btn">SAVE TO DATABASE</button>
        <button type="button" class="delete-btn" id="deleteBtn" style="display:none;">DELETE RESEARCH</button>
        <button type="button" onclick="document.getElementById('sidebar').classList.remove('open')" style="margin-top:20px; background:none; border: 1px solid #444; color:#aaa; width:100%; padding:10px; border-radius:6px; cursor:pointer;">CANCEL</button>
    </form>
</div>

<script>
    const state = {
        zoom: 0.8,
        panX: 0,
        panY: 0,
        isDragging: false,
        startX: 0,
        startY: 0,
        cellSize: 150,
        researches: [],
        currentX: 0,
        currentY: 0
    };

    const board = document.getElementById('board');
    const gridItems = document.getElementById('gridItems');
    const sidebar = document.getElementById('sidebar');
    const form = document.getElementById('researchForm');
    const clicker = document.getElementById('clicker');

    // Load Data
    async function fetchResearch() {
        console.log("Fetching research definitions...");
        try {
            const res = await fetch('../api/get_research_definitions.php');
            if (!res.ok) throw new Error("HTTP error " + res.status);
            state.researches = await res.json();
            console.log("Loaded researches:", state.researches.length);
            
            // Populate parent dropdown
            const parentSelect = document.getElementById('field_parent');
            parentSelect.innerHTML = '<option value="">None (Starting Point)</option>';
            state.researches.forEach(r => {
                const opt = document.createElement('option');
                opt.value = r.id;
                opt.textContent = r.name;
                parentSelect.appendChild(opt);
            });

            renderTree();
        } catch (e) {
            console.error("Fetch failed:", e);
            alert("Failed to load research items. Check the console.");
        }
    }

    function renderTree() {
        gridItems.innerHTML = '';
        
        // Draw lines first (so they are below cards)
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.style.position = 'absolute';
        svg.style.inset = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '2';
        gridItems.appendChild(svg);

        state.researches.forEach(res => {
            // Draw line to parent if exists
            if (res.parent_id) {
                const parent = state.researches.find(r => r.id === res.parent_id);
                if (parent) {
                    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    const x1 = 5000 + (parent.gridPosition.x * state.cellSize);
                    const y1 = 5000 + (parent.gridPosition.y * state.cellSize);
                    const x2 = 5000 + (res.gridPosition.x * state.cellSize);
                    const y2 = 5000 + (res.gridPosition.y * state.cellSize);
                    line.setAttribute('x1', x1);
                    line.setAttribute('y1', y1);
                    line.setAttribute('x2', x2);
                    line.setAttribute('y2', y2);
                    line.setAttribute('stroke', 'rgba(255, 215, 0, 0.3)');
                    line.setAttribute('stroke-width', '4');
                    svg.appendChild(line);
                }
            }

            const card = document.createElement('div');
            card.className = 'research-card';
            card.style.left = `calc(50% + ${res.gridPosition.x * state.cellSize}px)`;
            card.style.top = `calc(50% + ${res.gridPosition.y * state.cellSize}px)`;
            card.style.zIndex = '10';
            card.innerHTML = `
                <div class="research-card-content">
                    <div class="research-card-title">${res.name}</div>
                    <img src="${res.image}" class="research-card-icon" style="width:40px; height:40px;">
                </div>
            `;
            card.onclick = (e) => {
                e.stopPropagation();
                openEditor(res);
            };
            gridItems.appendChild(card);
        });
    }
    
    // Navigation
    board.addEventListener('mousedown', (e) => {
        if (e.target !== clicker && e.target !== board) return;
        state.isDragging = true;
        state.startX = e.clientX;
        state.startY = e.clientY;
        board.style.transition = 'none';
    });

    window.addEventListener('mousemove', (e) => {
        const bounds = board.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Calc Coordinates
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;
        
        const relativeX = (mouseX - centerX) / state.zoom;
        const relativeY = (mouseY - centerY) / state.zoom;
        
        state.currentX = Math.round(relativeX / state.cellSize);
        state.currentY = Math.round(relativeY / state.cellSize);
        
        const isSpaced = (Math.abs(state.currentX) + Math.abs(state.currentY)) % 2 === 0;
        
        document.getElementById('coordDisplay').textContent = `X: ${state.currentX}, Y: ${state.currentY} ${isSpaced ? '✅' : '❌'}`;

        if (!state.isDragging) return;
        
        const dx = e.clientX - state.startX;
        const dy = e.clientY - state.startY;

        state.panX += dx / state.zoom;
        state.panY += dy / state.zoom;

        state.startX = e.clientX;
        state.startY = e.clientY;

        updateTransform();
    });

    window.addEventListener('mouseup', () => {
        state.isDragging = false;
        board.style.transition = 'transform 0.1s linear';
    });
    
    // Zoom
    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        const direction = e.deltaY < 0 ? 1 : -1;
        const nextZoom = state.zoom * (direction > 0 ? 1.1 : 0.9);
        state.zoom = Math.max(0.1, Math.min(2.0, nextZoom));
        updateTransform();
    }, { passive: false });

    function updateTransform() {
        board.style.setProperty('--research-pan-x', `${state.panX}px`);
        board.style.setProperty('--research-pan-y', `${state.panY}px`);
        board.style.setProperty('--research-grid-zoom', state.zoom);
    }

    // Interaction
    clicker.onclick = () => {
        const isSpaced = (Math.abs(state.currentX) + Math.abs(state.currentY)) % 2 === 0;
        if (!isSpaced) return; // Silent return to avoid interrupting pan/drag
        
        openEditor({
            id: '',
            name: '',
            description: '',
            image_url: 'https://pub-136c85f7b0db4549ba25bf23723988bf.r2.dev/assets/image/research-item.png',
            gridPosition: { x: state.currentX, y: state.currentY },
            durationMs: 5000,
            cost: { coins: 100, particles: { sand: 50 } },
            effect: { type: 'multiplier', value: 1.1 }
        });
    };

    function openEditor(res) {
        document.getElementById('formTitle').textContent = res.id ? "Edit Research" : "Add New Research";
        
        // Hide/Show delete
        document.getElementById('deleteBtn').style.display = res.id ? 'block' : 'none';
        
        // Basic fields
        document.getElementById('field_id').value = res.id || '';
        document.getElementById('field_name').value = res.name || '';
        document.getElementById('field_description').value = res.description || '';
        document.getElementById('field_image').value = res.image || res.image_url || '';
        document.getElementById('field_x').value = res.gridPosition ? res.gridPosition.x : state.currentX;
        document.getElementById('field_y').value = res.gridPosition ? res.gridPosition.y : state.currentY;
        document.getElementById('field_parent').value = res.parent_id || '';
        
        // Duration: ms -> sec
        document.getElementById('field_duration_sec').value = res.durationMs ? (res.durationMs / 1000) : 5;
        
        // Costs: Distribute JSON to fields
        const cost = typeof res.cost === 'string' ? JSON.parse(res.cost) : (res.cost || {});
        document.getElementById('cost_coins').value = cost.coins || 0;
        const particles = cost.particles || {};
        document.getElementById('cost_sand').value = particles.sand || 0;
        document.getElementById('cost_iron').value = particles.iron || 0;
        document.getElementById('cost_copper').value = particles.copper || 0;
        document.getElementById('cost_silver').value = particles.silver || 0;
        document.getElementById('cost_gold').value = particles.gold || 0;
        document.getElementById('cost_emerald').value = particles.emerald || 0;
        document.getElementById('cost_ruby').value = particles.ruby || 0;

        // Effect
        document.getElementById('field_effect').value = JSON.stringify(res.effect || {type: 'multiplier', value: 1.1}, null, 2);
        
        sidebar.classList.add('open');
    }

    // ... slugify ...

    function slugify(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    }

    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const rawData = Object.fromEntries(formData.entries());
        
        // 1. Generate ID if new
        let id = rawData.id;
        if (!id) {
            id = slugify(rawData.name);
            console.log("Generated ID:", id);
        }

        // 2. Format Costs
        const costObj = {
            coins: parseInt(rawData.cost_coins) || 0,
            particles: {
                sand: parseInt(rawData.cost_sand) || 0,
                iron: parseInt(rawData.cost_iron) || 0,
                copper: parseInt(rawData.cost_copper) || 0,
                silver: parseInt(rawData.cost_silver) || 0,
                gold: parseInt(rawData.cost_gold) || 0,
                emerald: parseInt(rawData.cost_emerald) || 0,
                ruby: parseInt(rawData.cost_ruby) || 0
            }
        };

        // 3. Assemble Final Payload
        const payload = {
            id: id,
            name: rawData.name,
            description: rawData.description,
            image_url: rawData.image_url || 'https://pub-136c85f7b0db4549ba25bf23723988bf.r2.dev/assets/image/research-item.png',
            grid_x: rawData.grid_x,
            grid_y: rawData.grid_y,
            parent_id: rawData.parent_id || null,
            duration_ms: (parseFloat(rawData.duration_sec) || 5) * 1000,
            cost_json: JSON.stringify(costObj),
            effect_json: rawData.effect_json
        };
        
        const res = await fetch('../api/admin_upsert_research.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await res.json();
        if (result.success) {
            alert("Saved successfully!");
            sidebar.classList.remove('open');
            fetchResearch();
        } else {
            alert("Error: " + result.error);
        }
    };

    document.getElementById('deleteBtn').onclick = async () => {
        if (!confirm("Are you sure you want to delete this research item?")) return;
        const id = document.getElementById('field_id').value;
        const res = await fetch('../api/admin_delete_research.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const result = await res.json();
        if (result.success) {
            sidebar.classList.remove('open');
            fetchResearch();
        }
    };

    fetchResearch();
</script>
</body>
</html>
