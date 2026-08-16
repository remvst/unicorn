class Unicorn extends Entity {

    constructor() {
        super();
        this.renderable = new UnicornRenderable();
    }

    render() {
        ctx.translate(this.position.x, this.position.y);
        ctx.fillStyle = '#f00';
        ctx.fillRect(-10, -10, 20, 20);

        // ctx.fillRect();

        this.renderable.render();


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

class UnicornRenderable extends SkeletonRenderable {
    constructor() {
        super();

        this.butt = {
            x: -20,
            y: 0,
        }

        this.shoulders = {
            x: 20,
            y: 0,
        };

        this.leftFrontFoot = {
            x: this.shoulders.x,
            y: this.shoulders.y + 20,
        };

        this.leftBackFoot = {
            x: this.butt.x,
            y: this.shoulders.y + 20,
        };

        this.head = {
            x: this.shoulders.x + 10,
            y: this.shoulders.y - 10,
        };

        this.nose = {
            x: this.head.x + 5,
            y: this.head.y + 5,
        };

        this
            .add(lineRenderable(this.butt, this.shoulders, 4))
            .add(lineRenderable(this.shoulders, this.leftFrontFoot, 4))
            .add(lineRenderable(this.butt, this.leftBackFoot, 4))
            .add(lineRenderable(this.shoulders, this.head, 4))
            .add(lineRenderable(this.head, this.nose, 4))
            ;
    }
}
