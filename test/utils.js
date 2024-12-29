const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function getRandomPrefix() {
    let prefix = '';
    const prefixLen = Math.floor(Math.random() * 10) + 1;
    for (let i = 0; i < prefixLen; i++) {
        prefix += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return prefix;
}

module.exports = { getRandomPrefix, possible };