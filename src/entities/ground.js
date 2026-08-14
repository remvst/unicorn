class Ground extends Entity {
    render() {
        const camera = firstItem(this.world.category('camera'));

        ctx.strokeStyle = 'red';
        ctx.beginPath();
        for (let x = camera.x - CANVAS_WIDTH / 2 ; x < camera.x + CANVAS_WIDTH / 2 ; x += 20) {
            ctx.lineTo(x, Math.sin(x * PI * 2 / 200) * 100);
        }
        ctx.stroke();
    }
}
