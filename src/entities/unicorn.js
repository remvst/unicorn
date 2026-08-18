class Unicorn extends Entity {

    constructor() {
        super();
        this.renderable = new UnicornRenderable();
        this.facing = 1;
        this.walking = false;
    }

    render() {
        ctx.translate(this.position.x, this.position.y);

        const ground = firstItem(this.world.category('ground'));
        ctx.rotate(atan2(ground.curve.slopeFor(this.position.x), 1));

        ctx.scale(this.facing, 1);

        this.renderable.age = this.walking ? this.age : 0;
        this.renderable.render();
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        const ground = firstItem(this.world.category('ground'));
        this.position.y = ground.curveAt(this.position.x) - 40;
    }
}

class AudienceUnicorn extends Unicorn {
    constructor() {
        super();
        this.facing = random() > 0.5 ? 1 : -1;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        const camera = firstItem(this.world.category('camera'));
        if (this.position.x < camera.position.x - CANVAS_WIDTH) {
            this.position.x = camera.position.x + CANVAS_WIDTH + random(500, 1000);
        }

        for (const player of this.world.category('player')) {
            if (distance(player.position, this.position) > AUDIENCE_RADIUS) continue;
            for (const trick of player.comboTracker.unfinishedTricks()) {
                trick.inFrontOfAudience = true;
            }
        }
    }

    render() {
        if (DEBUG_COLLISIONS) ctx.wrap(() => {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 5;
            ctx.translate(this.position.x, this.position.y);
            ctx.beginPath();
            ctx.arc(0, 0, AUDIENCE_RADIUS, 0, PI * 2);
            ctx.stroke();
        });

        super.render();
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
            .add(setColor('#fff'))
            .add(setLineCap('butt'))
            .add(setThickness(6))
            .add(lineRenderable(this.backLegAttach, this.rightBackFoot))
            .add(lineRenderable(this.frontLegAttach, this.rightFrontFoot))
            .add(lineRenderable(this.backLegAttach, this.leftBackFoot))
            .add(lineRenderable(this.frontLegAttach, this.leftFrontFoot))
            .add(setThickness(5))
            .add(lineRenderable(this.tailBase, this.tailTip))
            .add(setThickness(15))
            .add(lineRenderable(this.neckBase, this.head))
            .add(setThickness(2))
            .add(lineRenderable(this.head, this.hornTip))
            .add(setThickness(25))
            .add(lineRenderable(this.butt, this.shoulders))
            .add(setLineCap('square'))
            .add(setThickness(12))
            .add(lineRenderable(this.head, this.nose))
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

        const footSine = sin(this.age * PI * 2 * 2) * 10;
        this.leftBackFoot.x += footSine;
        this.rightBackFoot.x -= footSine;
        this.leftFrontFoot.x += footSine;
        this.rightFrontFoot.x -= footSine;

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
