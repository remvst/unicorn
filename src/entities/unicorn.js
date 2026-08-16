class Unicorn extends Entity {
    render() {
        ctx.translate(this.position.x, this.position.y);
        ctx.fillStyle = '#fff';
        ctx.fillRect(-10, -10, 20, 20);
    }

    cycle(elapsed) {
        const camera = firstItem(this.world.category('camera'));
        if (this.position.x < camera.position.x - CANVAS_WIDTH) {
            const ground = firstItem(this.world.category('ground'));
            this.position.x = camera.position.x + CANVAS_WIDTH + random(500, 1000);
            this.position.y = ground.curveAt(this.position.x);
        }
    }
}
