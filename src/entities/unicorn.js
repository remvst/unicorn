class Unicorn extends Entity {

    constructor() {
        super();
        this.renderable = new UnicornRenderable();
        this.facing = 1;
        this.walking = false;
    }

    render() {
        ctx.translate(this.position.x, this.position.y);

        const ground = firstItem(this.world.category(Ground));
        ctx.rotate(atan2(ground.curve.slopeFor(this.position.x), 1));

        ctx.scale(this.facing, 1);

        this.renderable.age = this.walking ? this.age : 0;
        this.renderable.render();
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        const ground = firstItem(this.world.category(Ground));
        this.position.y = ground.curveAt(this.position.x) - 40;
    }
}

class UnicornGenerator extends EntityGenerator {
    constructor() {
        super(AudienceUnicorn, CANVAS_WIDTH * 2, 3, 120);
    }
}

class AudienceUnicorn extends Unicorn {
    constructor() {
        super();
        this.facing = random() > 0.5 ? 1 : -1;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        for (const player of this.world.category(Player)) {
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

        this.maineTop = {};
        this.maineBottom = {};

        this.add(
            setLineCap('butt'),

            setColor('#ff0'),
            () => {
                ctx.beginPath();
                ctx.lineTo(this.head.x - 4, this.head.y);
                ctx.lineTo(this.head.x + 4, this.head.y);
                ctx.lineTo(this.hornTip.x, this.hornTip.y);
                ctx.fill();
            },

            setColor('#ccc'),
            setThickness(6),
            lineRenderable(this.backLegAttach, this.rightBackFoot),
            lineRenderable(this.frontLegAttach, this.rightFrontFoot),

            setColor('#a167a4'),
            setThickness(5),
            lineRenderable(this.tailBase, this.tailTip),

            setColor('#fff'),
            lineRenderable(this.backLegAttach, this.leftBackFoot),
            lineRenderable(this.frontLegAttach, this.leftFrontFoot),

            setThickness(15),
            lineRenderable(this.neckBase, this.head),
            setThickness(25),
            lineRenderable(this.butt, this.shoulders),
            setLineCap('square'),
            setThickness(12),
            lineRenderable(this.head, this.nose),

            setColor('#a6a'),
            setThickness(5),
            lineRenderable(this.maineBottom, this.maineTop),
        );
        this.prependShadow();
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

        this.maineTop.x = this.head.x;
        this.maineTop.y = this.head.y - 8;

        this.maineBottom.x = this.neckBase.x;
        this.maineBottom.y = this.neckBase.y - 8;

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
