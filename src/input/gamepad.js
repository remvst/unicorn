gamepads = () => (navigator.getGamepads ? [...navigator.getGamepads()] : []).filter(x => !!x);

gamepadButtonValue = buttonIndex => {
    for (const pad of gamepads()) {
        try {
            if (pad.buttons[buttonIndex].pressed) {
                return pad.buttons[buttonIndex].value;
            }
        } catch (e) {}
    }
    return 0;
};

gamepadAxisValue = (axisIndex) => {
    for (const pad of gamepads()) {
        try {
            if (abs(pad.axes[axisIndex]) > 0.2) {
                return pad.axes[axisIndex];
            }
        } catch (e) {}
    }
    return 0;
};
