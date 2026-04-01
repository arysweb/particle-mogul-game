class Physics {
    constructor(particleSize) {
        this.particleSize = particleSize;
        this.gravity = 0.5;
        this.maxVelocity = 8;
    }

    updateParticles(particles, sandGrid, canvasHeight, canvasWidth) {
        // Iterate backwards since particles get modified
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            
            if (particle.settled) continue;

            // 1. Calculate proposed physics tick continuously
            particle.vy += this.gravity;
            particle.vy = Math.min(particle.vy, this.maxVelocity);
            
            let nextX = particle.x + particle.vx;
            let nextY = particle.y + particle.vy;

            // Handle horizontal screen boundaries securely
            if (nextX < 0 || nextX > canvasWidth - this.particleSize) {
                particle.vx *= -0.5; // bounce
                nextX = Math.max(0, Math.min(canvasWidth - this.particleSize, nextX));
            }

            // 2. Identify current and upcoming grid coordinates using logical visual center
            let particleCenterX = particle.x + (this.particleSize / 2);
            let currentGridX = Math.floor(particleCenterX / this.particleSize);
            
            // Safety grid clamp laterally
            if (currentGridX < 0) currentGridX = 0;
            if (currentGridX >= sandGrid[0].length) currentGridX = sandGrid[0].length - 1;

            // Check the leading edge for vertical collision prediction
            // Subtracting a tiny epsilon so perfect flush alignments aren't counted inside the next cell until crossed logically
            let nextGridY = Math.floor((nextY + this.particleSize - 0.1) / this.particleSize);

            let currentGridY = Math.floor((particle.y + this.particleSize - 0.1) / this.particleSize);
            if (currentGridY < 0) currentGridY = 0;

            // 3. Absolute Floor Collision Check
            if (nextY >= canvasHeight - this.particleSize) {
                particle.y = canvasHeight - this.particleSize;
                particle.x = nextX;
                particle.vy = 0;
                particle.vx = 0;
                
                let finalX = Math.floor(particle.x / this.particleSize);
                let finalY = Math.floor(particle.y / this.particleSize);
                
                // Prevent over-writing if multiple particles hit exactly the same floor slot
                while(finalY >= 0 && sandGrid[finalY] && sandGrid[finalY][finalX]) {
                    finalY--;
                }
                if (finalY < 0) finalY = 0;
                
                particle.y = finalY * this.particleSize;
                particle.settle(finalX, finalY);
                if (finalY >= 0 && finalY < sandGrid.length && finalX >= 0 && finalX < sandGrid[0].length) {
                    sandGrid[finalY][finalX] = particle;
                }
                continue; 
            }

            // 4. Sand Grid Collision Check
            let blockedBeneath = false;
            if (nextGridY >= 0 && nextGridY < sandGrid.length) {
                if (sandGrid[nextGridY][currentGridX]) {
                    blockedBeneath = true;
                }
            }

            if (!blockedBeneath) {
                // Space is free, execute continuous fall!
                particle.x = nextX;
                particle.y = nextY;
            } else {
                // 5. Blocked beneath! Stop and settle immediately so the Cellular Automata pass can avalanche it naturally.
                let safeGridY = nextGridY - 1;
                
                // Bullet-thru-paper safety loop: ensure we are fully flushed to the absolute top of the pile 
                while(safeGridY >= 0 && sandGrid[safeGridY] && sandGrid[safeGridY][currentGridX]) {
                    safeGridY--;
                }
                if (safeGridY < 0) safeGridY = 0; // Don't overflow out the roof

                particle.vy = 0;
                particle.vx = 0;
                particle.x = currentGridX * this.particleSize;
                particle.y = safeGridY * this.particleSize;
                
                particle.settle(currentGridX, safeGridY);
                if (safeGridY >= 0 && safeGridY < sandGrid.length) {
                    sandGrid[safeGridY][currentGridX] = particle;
                }
            }
        }

        // 6. Cellular Automata Avalanche Pass for perfectly natural mounds
        // Traverse the grid from bottom up
        for (let y = sandGrid.length - 2; y >= 0; y--) {
            // Randomize X traversal direction to prevent directional bias in avalanches
            let startX = 0, endX = sandGrid[0].length, step = 1;
            if (Math.random() > 0.5) {
                startX = sandGrid[0].length - 1; endX = -1; step = -1;
            }
            
            for (let x = startX; x !== endX; x += step) {
                let p = sandGrid[y][x];
                if (p && p.settled) {
                    // 1. Check direct bottom first (for holes that opened up beneath)
                    if (sandGrid[y+1][x] === null) {
                        sandGrid[y+1][x] = p;
                        sandGrid[y][x] = null;
                        p.settle(x, y+1);
                    } else {
                        // 2. Check diagonals to avalanche down the mound
                        let leftEmpty = x > 0 && sandGrid[y+1][x-1] === null;
                        let rightEmpty = x < sandGrid[0].length - 1 && sandGrid[y+1][x+1] === null;
                        
                        if (leftEmpty && rightEmpty) {
                            if (Math.random() > 0.5) leftEmpty = false;
                            else rightEmpty = false;
                        }

                        if (leftEmpty) {
                            sandGrid[y+1][x-1] = p;
                            sandGrid[y][x] = null;
                            p.settle(x-1, y+1);
                        } else if (rightEmpty) {
                            sandGrid[y+1][x+1] = p;
                            sandGrid[y][x] = null;
                            p.settle(x+1, y+1);
                        }
                    }
                }
            }
        }
    }
}
