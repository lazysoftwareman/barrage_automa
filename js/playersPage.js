// @ts-check
import { salvaParametri } from './barrage.js';
import { checkVecchiaPartita, locale, setLocale } from './init.js';
import { localize } from './provider.js';
import { initDiminesions } from './view.js';


// @ts-ignore
window.initPlayersPage = initPlayersPage;

export const colors = ['G', 'R', 'B', 'W'];
export const playersChosen = ['U1', 'A1'];
export const colorChosen = ['G', 'R'];

export const colorsCss = [];
colorsCss['G'] = 'var(--greenPlayer)';
colorsCss['R'] = 'var(--redPlayer)';
colorsCss['B'] = 'var(--blackPlayer)';
colorsCss['W'] = 'var(--whitePlayer)';

export function initPlayersPage() {
    if (!navigator.language.toLowerCase().includes('it')) {
        setLocale('en');
    } else {
        setLocale('it');
    }
    checkVecchiaPartita();
    initDiminesions();
    for (let i = 0; i < 4; i++) {
        if (!playersChosen[i]) {
            document.getElementById('playerP' + (i + 1)).addEventListener('click', function () { changePlayer((i + 1)); }, false);
            document.getElementById('colorP' + (i + 1)).style.backgroundColor = 'transparent';
        } else {
            document.getElementById('colorP' + (i + 1)).style.backgroundColor = colorsCss[colorChosen[i]];
        }
        document.getElementById('colorP' + (i + 1)).addEventListener('click', function () { changeColor((i + 1)); }, false);
    }
    document.getElementById('langIT').addEventListener('click', function () { changeLocale('it'); }, false);
    document.getElementById('langEN').addEventListener('click', function () { changeLocale('en'); }, false);
}

export function changeLocale(loc) {
    if (loc != locale) {
        setLocale(loc);
        aggiornaParametri();
    }
}

export function changeColor(num) {
    const actualColor = colorChosen[num - 1];
    if (!actualColor) {
        return;
    }
    let idx = colors.indexOf(actualColor);
    idx++;
    if (idx > 3) {
        idx = 0;
    }
    const newColor = colors[idx];
    // let oldIdx = colorChosen.indexOf(newColor);
    // if (oldIdx >= 0) {
    //     colorChosen[oldIdx] = actualColor;
    //     document.getElementById('colorP' + (oldIdx + 1)).style.backgroundColor = colorsCss[actualColor];
    // }
    colorChosen[num - 1] = newColor;
    document.getElementById('colorP' + num).style.backgroundColor = colorsCss[newColor];
    // Controllo duplicati
    if (new Set(colorChosen).size != colorChosen.length) {
        document.getElementById('errColore').style.visibility = 'visible';
        document.getElementById('aMain').href = 'javascript: void(0)';
    } else {
        document.getElementById('errColore').style.visibility = 'hidden';
        aggiornaParametri();
    }

}

export function changePlayer(num) {
    if (num == 4 && !playersChosen[2]) {
        return;
    }
    let players = [];
    if (num == 3) {
        const chosen4 = playersChosen[3];
        if (!chosen4) {
            players = ['U2', 'A2'];
        } else {
            const num = chosen4.substr(1, 1);
            if (num == '3') {
                players = ['U2', 'A2'];
            } else {
                const lettera = chosen4.substr(0, 1);
                const altra = lettera == 'A' ? 'U' : 'A';
                players = [altra + '2', lettera + '3'];
            }
        }
    } else {
        // quarto posto
        const chosen3 = playersChosen[2];
        const num = chosen3.substr(1, 1);
        const lettera = chosen3.substr(0, 1);
        const altra = lettera == 'A' ? 'U' : 'A';
        if (num == '2') {
            players = [altra + '2', lettera + '3'];
        } else {
            players = ['U2', 'A2'];
        }
    }
    let actualPlayer = playersChosen[num - 1];
    if (!actualPlayer) {
        actualPlayer = players[0];
    } else {
        let idx = players.indexOf(actualPlayer);
        idx++;
        if (idx == players.length) {
            actualPlayer = undefined;
        } else {
            actualPlayer = players[idx];
        }
    }
    if (actualPlayer) {
        if (!colorChosen[num - 1]) {
            const color = colors.filter(x => !colorChosen.includes(x))[0];
            colorChosen.push(color);
            document.getElementById('colorP' + num).style.backgroundColor = colorsCss[color];
        }
        if (playersChosen[num - 1]) {
            playersChosen[num - 1] = actualPlayer;
        } else {
            playersChosen.push(actualPlayer);
        }
        const letter = actualPlayer.substr(0, 1);
        const number = actualPlayer.substr(1, 1);
        const text = letter == 'A' ? 'AUTOMA ' + number : localize('HUMAN') + ' ' + number;
        document.getElementById('playerP' + num).innerHTML = text;
    } else {
        if (num == 3) {
            if (colorChosen[3]) {
                colorChosen.splice(3, 1);
                document.getElementById('colorP4').style.backgroundColor = 'transparent';
            }
            if (playersChosen[3]) {
                playersChosen.splice(3, 1);
                document.getElementById('playerP4').innerHTML = '&nbsp;';
            }
        }
        if (colorChosen[num - 1]) {
            colorChosen.splice(num - 1, 1);
            document.getElementById('colorP' + num).style.backgroundColor = 'transparent';
        }
        if (playersChosen[num - 1]) {
            playersChosen.splice(num - 1, 1);
            document.getElementById('playerP' + num).innerHTML = '&nbsp;';
        }
    }
    // Controllo duplicati
    if (new Set(colorChosen).size != colorChosen.length) {
        document.getElementById('errColore').style.visibility = 'visible';
        document.getElementById('aMain').href = 'javascript: void(0)';
    } else {
        document.getElementById('errColore').style.visibility = 'hidden';
        aggiornaParametri();
    }
}

export function aggiornaParametri() {
    let href = 'main.html?';
    let parametri = '';
    for (let i = 0; i < playersChosen.length; i++) {
        if (i != 0) {
            parametri += '&';
        }
        parametri += playersChosen[i] + '=' + colorChosen[i];
    }
    parametri += '&locale=' + locale;
    document.getElementById('aMain').href = href + parametri;
    salvaParametri(parametri);
}