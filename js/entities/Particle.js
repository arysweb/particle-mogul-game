class Particle {
    constructor(x, y, particleSize, type = 'sand') {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = 0;
        this.settled = false;
        this.particleSize = particleSize;
        this.type = type;
        
        // Set color based on particle type
        if (type === 'iron') {
            // Iron-like gray colors
            const ironColors = [
                '#808080', // Gray
                '#696969', // Dim gray
            ];
            this.color = ironColors[Math.floor(Math.random() * ironColors.length)];
        } else if (type === 'copper') {
            // Copper-like colors
            const copperColors = [
                '#B87333', // Copper
                '#CD7F32', // Peru
            ];
            this.color = copperColors[Math.floor(Math.random() * copperColors.length)];
        } else if (type === 'silver') {
            // Silver-like colors
            const silverColors = [
                '#C0C0C0', // Silver
                '#D3D3D3', // Light gray
            ];
            this.color = silverColors[Math.floor(Math.random() * silverColors.length)];
        } else if (type === 'gold') {
            // Gold-like colors
            const goldColors = [
                '#FFD700', // Gold
                '#FFA500', // Orange
            ];
            this.color = goldColors[Math.floor(Math.random() * goldColors.length)];
        } else if (type === 'emerald') {
            // Emerald-like colors
            const emeraldColors = [
                '#50C878', // Emerald
                '#2E8B57', // Sea green
            ];
            this.color = emeraldColors[Math.floor(Math.random() * emeraldColors.length)];
        } else if (type === 'ruby') {
            // Ruby-like colors
            const rubyColors = [
                '#E0115F', // Ruby
                '#9B111E', // Dark ruby
            ];
            this.color = rubyColors[Math.floor(Math.random() * rubyColors.length)];
        } else {
            // Sand-like colors - different shades of tan/brown
            const sandColors = [
                '#D2B48C', // Tan
                '#DEB887', // Burlywood
                '#BC9A6A', // Sandstone
            ];
            this.color = sandColors[Math.floor(Math.random() * sandColors.length)];
        }
    }

    update(gravity, maxVelocity, canvasWidth) {
        if (this.settled) return;

        // Apply gravity
        this.vy += gravity;
        this.vy = Math.min(this.vy, maxVelocity);
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Check boundaries
        if (this.x < 0 || this.x > canvasWidth) {
            this.vx *= -0.5;
            this.x = Math.max(0, Math.min(canvasWidth, this.x));
        }
    }

    draw(ctx, isSettled) {
        ctx.fillStyle = this.color;
        
        if (isSettled) {
            // Draw as a square when settled (grid-aligned)
            ctx.fillRect(this.x, this.y, this.particleSize, this.particleSize);
            
            // Add subtle border for depth
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.particleSize, this.particleSize);
        } else {
            // Draw as a square when falling (same size as settled)
            ctx.fillRect(this.x - this.particleSize/2, this.y - this.particleSize/2, this.particleSize, this.particleSize);
            
            // Add subtle border for depth
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x - this.particleSize/2, this.y - this.particleSize/2, this.particleSize, this.particleSize);
        }
    }

    settle(gridX, gridY) {
        this.settled = true;
        this.x = gridX * this.particleSize;
        this.y = gridY * this.particleSize;
    }
}
