globalVolume = () => {
    const x = parseInt(readLocalStorage('v'));
    return isNaN(x) ? DEFAULT_VOLUME : x;
}
updateVolume = () => zzfxM_GAIN.gain.value = globalVolume() / VOLUME_PRECISION;
cycleVolume = () => {
    writeLocalStorage('v', (globalVolume() + VOLUME_PRECISION) % (100 + VOLUME_PRECISION));
    updateVolume();
}
updateVolume();
