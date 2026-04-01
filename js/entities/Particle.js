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


    draw(ctx, isSettled) {
        ctx.fillStyle = this.color;
        
        // Always draw correctly from top-left coordinates whether falling or settled
        ctx.fillRect(this.x, this.y, this.particleSize, this.particleSize);
        
        // Add subtle border for depth
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.particleSize, this.particleSize);
    }

    settle(gridX, gridY) {
        this.settled = true;
        this.x = gridX * this.particleSize;
        this.y = gridY * this.particleSize;
    }
}
