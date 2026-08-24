renderArrow = () => {
    ctx.beginPath();
    ctx.moveTo(MOBILE_BUTTON_SIZE / 2, 0);
    ctx.lineTo(-MOBILE_BUTTON_SIZE / 2, MOBILE_BUTTON_SIZE / 2);
    ctx.lineTo(-MOBILE_BUTTON_SIZE / 2, -MOBILE_BUTTON_SIZE / 2);
    ctx.fill();
}

class HUD extends Entity {
    constructor() {
        super();
        this.comboChange = new ValueChangeHelper();
        this.objectivesChange = new ValueChangeHelper();
    }

    renderCombo(comboTracker) {
        const {
            failed,
            validated,
            comboPower,
            points,
            totalPoints,
            multiplier,
            startedTricks,
        } = comboTracker;

        ctx.lineWidth = 20;

        if (startedTricks.length) ctx.wrap(() => {
            ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.7);
            ctx.fillStyle = failed ? '#900' : '#fff';
            ctx.strokeStyle = failed ? '#400' : '#000';
            ctx.font = 'bold 24pt Impact';
            ctx.textAlign = 'center';

            ctx.textBaseline = 'alphabetic';

            if ((validated || failed) && this.age - this.comboValidateTime > 2) return;
            const animRatio = interpolate(0, 1, easeOutBounce((this.age - this.comboValidateTime) / 0.2));
            ctx.scale(animRatio, animRatio);

            const comboNumber = failed || validated
                ? totalPoints.toLocaleString('en')
                : `${points.toLocaleString('en')}   X ${multiplier}`;
            const comboNumberSize = ctx.wrap(() => {
                if (failed) {
                    ctx.fillStyle = '#900';
                    ctx.strokeStyle = '#400';
                } else if (validated) {
                    ctx.fillStyle = '#0f0';
                    ctx.strokeStyle = '#040';
                } else {
                    ctx.globalAlpha = 0.5;
                    ctx.fillStyle = '#fff';
                    ctx.strokeStyle = '#000';
                }
                return epicText(comboNumber, 0, 0);
            });

            if (!failed && !validated) ctx.wrap(() => {
                const w = comboNumberSize.w + 50;
                ctx.beginPath();
                ctx.rect(-w / 2, -100, w * (validated ? 1 : comboPower), 200);
                ctx.clip();

                const z = ctx.fillStyle;
                ctx.fillStyle = ctx.strokeStyle;
                ctx.strokeStyle = z;
                epicText(comboNumber, 0, 0);
            });

            let y = 20;

            ctx.font = 'bold 18pt Impact';
            ctx.textBaseline = 'top';

            const lines = [[]];
            for (const trick of startedTricks) {
                const l = lines[lines.length - 1];
                l.push(trick.label.toUpperCase()); // TODO these should all be uppercase in the first place so we don't need to call toUpperCase()
                if (l.length > 5) lines.push([]);
            }
            for (const l of lines) {
                if (l.length) y += epicText(l.join(' + '), 0, y).h;
            }
        });
    }

    render() {
        if (!G || !(G.screens[G.screens.length - 1] instanceof WorldScreen)) return;

        this.cancelCameraTransformations();

        const player = firstItem(this.world.category(Player));
        if (player?.comboTracker.startedTricks.length) this.lastComboTracker = player.comboTracker;

        const [validatedBefore, validatedAfter] = this.comboChange.change(this.lastComboTracker?.validated || this.lastComboTracker?.failed);
        if (validatedBefore != validatedAfter) {
            this.comboValidateTime = this.age;
        }

        if (this.lastComboTracker) this.renderCombo(this.lastComboTracker);

        ctx.textBaseline = 'top';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 20;

        const [objectiveBefore, objectiveAfter] = this.objectivesChange.change(firstItem(this.world.category(Objective)));
        if (objectiveBefore != objectiveAfter) {
            this.objectiveChangeAge = this.age;
        }

        if (objectiveAfter) {
            ctx.wrap(() => {
                ctx.translate(CANVAS_WIDTH - 40, 40);
                ctx.translate(
                    interpolate(CANVAS_WIDTH / 2, 0, (this.age - this.objectiveChangeAge) / 0.3),
                    0,
                );

                ctx.textAlign = 'right';

                let y = 0;

                ctx.font = 'bold 36pt Arial';
                ctx.fillStyle = '#5ca5c7';
                y += epicText(nomangle('GOALS:'), 0, y).h + 15;

                ctx.font = 'bold 18pt Arial';
                ctx.fillStyle = '#fff';
                for (const objective of this.world.category(Objective)) {
                    const deet = objective.detail ? ':   ' + objective.detail : '';
                    ctx.globalAlpha = objective.completed ? 0.5 : 1;
                    const { w, h } = epicText(objective.label + deet, 0, y);

                    if (objective.completed) {
                        ctx.fillRect(-w + ctx.lineWidth, y + h / 2, w, 2);
                    }
                    y += h + 15;
                }
            });
        }

        if (G.bestCombo) ctx.wrap(() => {
            ctx.translate(40, 40);
            ctx.textAlign = 'left';

            let y = 0;

            ctx.font = 'bold 36pt Arial';
            ctx.fillStyle = '#5ca5c7';
            y += epicText(nomangle('BEST COMBO:'), 0, y).h + 15;

            ctx.font = 'bold 18pt Arial';
            ctx.fillStyle = '#fff';
            y += epicText(G.bestCombo.toLocaleString('en'), 0, y).h + 15;
        });

        if (inputMode === INPUT_MODE_TOUCH) ctx.wrap(() => {
            const arrows = [
                [-PI / 2, player?.controls.accelerate],
                [PI / 2, player?.controls.brake],
                [PI, player?.controls.raiseWheel],
                [0, player?.controls.lowerWheel],
            ];
            for (let i = 0; i < arrows.length; i++) {
                ctx.wrap(() => {
                    ctx.globalAlpha = arrows[i][1] ? 1 : 0.5;
                    ctx.translate((i + 0.5) * CANVAS_WIDTH / 4, CANVAS_HEIGHT - 100);
                    ctx.rotate(arrows[i][0]);
                    renderArrow();
                });
            }

            ctx.wrap(() => {
                ctx.globalAlpha = player?.controls.jump ? 1 : 0.5;
                ctx.translate(CANVAS_WIDTH * 7 / 8, CANVAS_HEIGHT - 375);
                ctx.rotate(-PI / 2);
                renderArrow();
            });
        });
    }
}
