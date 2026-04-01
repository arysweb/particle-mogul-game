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

            // 2. Identify current and upcoming grid coordinates 
            let currentGridX = Math.floor(particle.x / this.particleSize);
            
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
                // 5. Blocked beneath! Try sliding down diagonally if possible.
                let blockedLeft = true;
                let blockedRight = true;

                // Only check laterally if they exist within grid boundaries
                if (currentGridX > 0) {
                    blockedLeft = sandGrid[currentGridY][currentGridX - 1] || sandGrid[nextGridY][currentGridX - 1];
                }
                
                if (currentGridX < sandGrid[0].length - 1) {
                    blockedRight = sandGrid[currentGridY][currentGridX + 1] || sandGrid[nextGridY][currentGridX + 1];
                }

                // If both are free, pick a random side to tumble down like real sand
                if (!blockedLeft && !blockedRight) {
                    if (Math.random() > 0.5) blockedLeft = true;
                    else blockedRight = true;
                }

                if (!blockedLeft) {
                    particle.y = nextY; // Still falling
                    particle.x = (currentGridX - 1) * this.particleSize; // Snap left securely
                    particle.vx = (Math.random() - 0.5) * 2; // Slight natural lateral momentum
                } else if (!blockedRight) {
                    particle.y = nextY;
                    particle.x = (currentGridX + 1) * this.particleSize; // Snap right securely 
                    particle.vx = (Math.random() - 0.5) * 2;
                } else {
                    // Completely blocked! Stop and settle exactly right here.
                    let safeGridY = nextGridY - 1;
                    
                    // Bullet-thru-paper safety loop: ensure we are fully flushed to the absolute top of the pile 
                    while(safeGridY >= 0 && sandGrid[safeGridY][currentGridX]) {
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
        }
    }
}
