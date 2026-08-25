readLocalStorage = (key) => {
    try {
        return localStorage[key];
    } catch (e) {}
    try {
        return sessionStorage[key];
    } catch (e) {}
}

writeLocalStorage = (key, value) => {
    try {
        localStorage[key] = value;
    } catch (e) { }
    try {
        sessionStorage[key] = value;
    } catch (e) {}
}
