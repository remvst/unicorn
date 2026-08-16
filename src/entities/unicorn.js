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
            this.position.y = ground.curveAt(this.position.x) - 20;
        }
    }
}

class UnicornRenderable extends SkeletonRenderable {
    constructor() {
        super();

        this.butt = {};
        this.shoulders = {};

        this.frontLegAttach = {};
        this.backLegAttach = {};

        this.rightFrontFoot = {};
        this.rightBackFoot = {};
        this.leftFrontFoot = {};
        this.leftBackFoot = {};

        this.tailBase = {};
        this.tailTip = {};

        this.neckBase = {};
        this.head = {};
        this.nose = {};
        this.hornTip = {};

        this
            .add(lineRenderable(this.backLegAttach, this.rightBackFoot, 6, 'butt'))
            .add(lineRenderable(this.frontLegAttach, this.rightFrontFoot, 6, 'butt'))
            .add(lineRenderable(this.backLegAttach, this.leftBackFoot, 6, 'butt'))
            .add(lineRenderable(this.frontLegAttach, this.leftFrontFoot, 6, 'butt'))
            .add(lineRenderable(this.tailBase, this.tailTip, 5, 'butt'))
            .add(lineRenderable(this.neckBase, this.head, 15, 'butt'))
            .add(lineRenderable(this.head, this.nose, 12, 'square'))
            .add(lineRenderable(this.head, this.hornTip, 2, 'butt'))
            .add(lineRenderable(this.butt, this.shoulders, 25, 'butt'))
            ;
    }

    render() {
        this.butt.x = -25;
        this.butt.y = 0;

        this.shoulders.x = 25;
        this.shoulders.y = 0;

        const legHalfThickness = 3;

        // Legs
        this.frontLegAttach.x = this.shoulders.x - legHalfThickness;
        this.frontLegAttach.y = this.shoulders.y;

        this.backLegAttach.x = this.butt.x + legHalfThickness;
        this.backLegAttach.y = this.butt.y;

        this.rightFrontFoot.x = this.frontLegAttach.x - 4;
        this.rightFrontFoot.y = this.shoulders.y + 40;

        this.rightBackFoot.x = this.backLegAttach.x + 4;
        this.rightBackFoot.y = this.shoulders.y + 40;

        this.leftFrontFoot.x = this.frontLegAttach.x;
        this.leftFrontFoot.y = this.shoulders.y + 42;

        this.leftBackFoot.x = this.backLegAttach.x;
        this.leftBackFoot.y = this.shoulders.y + 42;

        // Tail
        this.tailBase.x = this.butt.x + 3;
        this.tailBase.y = this.shoulders.y - 10;

        const tailAngle = PI / 2 + PI / 6;
        const tailLength = 40;
        this.tailTip.x = this.tailBase.x + cos(tailAngle) * tailLength;
        this.tailTip.y = this.tailBase.y + sin(tailAngle) * tailLength;

        // Head
        this.neckBase.x = this.shoulders.x - 7;
        this.neckBase.y = this.shoulders.y - 6;

        const neckAngle = -PI / 4;
        const neckToHeadLength = 24;
        this.head.x = this.neckBase.x + cos(neckAngle) * neckToHeadLength;
        this.head.y = this.neckBase.y + sin(neckAngle) * neckToHeadLength;

        const headAngle = neckAngle + (PI / 2 + PI / 16);
        const headLength = 20;
        this.nose.x = this.head.x + cos(headAngle) * headLength;
        this.nose.y = this.head.y + sin(headAngle) * headLength;

        this.hornTip.x = interpolateUnbounded(this.neckBase.x, this.head.x, 2);
        this.hornTip.y = interpolateUnbounded(this.neckBase.y, this.head.y, 2);

        super.render();
    }
}
