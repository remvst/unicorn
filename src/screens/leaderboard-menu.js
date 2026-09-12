class LeaderboardMenu extends Menu {
    absorb = false;

    constructor(maxAge) {
        super();

        this.maxAge = maxAge;

        this.lines = [];
        for (let i = 0; i < 10; i++) {
            this.lines.push(['-', '-', '-']);
        }

        this.calculateWidest();

        (async () => {
            const lb = await TRICK_ATTACK_LEADERBOARD;
            const entries = await Wavedash.listLeaderboardEntriesAroundUser(lb.data.id, 5, 4, !!false);

            for (let i = 0; i < entries.data.length; i++) {
                const line = entries.data[i];
                this.lines[i] = [
                    '#' + line.globalRank.toLocaleString('en'),
                    line.username,
                    line.score.toLocaleString('en'),
                    line.userId === Wavedash.getUserId(),
                ];
            }

            this.calculateWidest();
        })();
    }

    calculateWidest() {
        this.widest = [0, 0, 0];

        for (const line of this.lines) {
            for (let col = 0; col < 3; col++) {
                ctx.font = '24pt Impact';
                const { w } = epicText(
                    line[col],
                    0,
                    0,
                    0,
                );
                this.widest[col] = Math.max(this.widest[col], w);
            }
        }
    }

    render() {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#fff';
        ctx.lineWidth = 20;

        let y = CANVAS_HEIGHT / 5;

        ctx.font = '48pt Impact';
        y = epicText(
            'TRICK ATTACK LEADERBOARD',
            CANVAS_WIDTH / 2,
            y,
            this.age * 400,
        ).b + 50;

        const lineWidth = Math.max(
            300,
            this.widest.reduce((acc, w) => Math.max(acc, w), 0) + 40,
        );

        const startX = CANVAS_WIDTH / 2 - lineWidth / 2;
        const endX = CANVAS_WIDTH / 2 + lineWidth / 2;

        for (let i = 0; i < this.lines.length; i++) {
            const [rank, name, score, highlight] = this.lines[i];

            ctx.fillStyle = highlight ? RAINBOW_PATTERN : '#fff'; // TODO only for current player
            ctx.font = '24pt Impact';

            ctx.textAlign = 'right';
            epicText(
                rank,
                startX + this.widest[0],
                y,
                this.age * 400,
            );

            ctx.textAlign = 'left';
            epicText(
                name,
                startX + this.widest[0] + 20,
                y,
                this.age * 400,
            );

            ctx.textAlign = 'right';
            epicText(
                score,
                endX,
                y,
                this.age * 400,
            );

            y += 40;
        }

        this.nextButtonY = CANVAS_HEIGHT * 4 / 5;
        this.renderButton(
            '[ESC] BACK' + (this.maxAge ? ` (${floor(this.maxAge - this.age)})` : ''),
        );
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        if (this.maxAge && this.age > this.maxAge) {
            G.screens = G.screens.filter(x => x !== this);
        }

        const [pauseBefore, pauseAfter] = this.pauseChange.change(downKeys[27] || gamepadButtonValue(9));
        if (this.isForeground && !pauseBefore && pauseAfter) {
            G.screens = G.screens.filter(x => x !== this);
        }
    }
}
