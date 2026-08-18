starShape = (pointyCount, outerRadius, innerRadius) => {
    ctx.beginPath();
    for (let i = 0 ; i < pointyCount * 2 ; i++) {
        const angle = (i / (pointyCount * 2)) * PI * 2 - PI / 2;
        const radius = i % 2 ? innerRadius: outerRadius;
        ctx.lineTo(cos(angle) * radius, sin(angle) * radius);
    }
    ctx.closePath();
}
