updateControls = controls => {
    controls.spin = 0;
    if (downKeys[37]) controls.spin--;
    if (downKeys[39]) controls.spin++;
    controls.spin ||= gamepadAxisValue(0);
    controls.jump = downKeys[32] || gamepadButtonValue(0);
    controls.brake = downKeys[40] || gamepadButtonValue(6);
    controls.accelerate = downKeys[38] || gamepadButtonValue(7);
};
