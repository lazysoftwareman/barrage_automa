// @ts-check

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
    for (let i = 0; i < 4; i++) {
        if (!playersChosen[i]) {
            document.getElementById('playerP' + (i + 1)).addEventListener('click', function () { changePlayer((i + 1)); }, false);
            document.getElementById('colorP' + (i + 1)).style.backgroundColor = 'transparent';
        } else {
            document.getElementById('colorP' + (i + 1)).style.backgroundColor = colorsCss[colorChosen[i]];
        }
        document.getElementById('colorP' + (i + 1)).addEventListener('click', function () { changeColor((i + 1)); }, false);
    }
}

export function changeColor(player) {

}

export function changePlayer(num) {
    if (num == 4 && !playersChosen[2]) {
        return;
    }
    let players = [];
    if (num == 3) {
        players = ['U2', 'A2'];
    } else {
        const chosen3 = playersChosen[2];
        const other = chosen3 == 'U2' ? 'A2' : 'U2';
        players = [other, 'U3', 'A3'];
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
        const text = letter == 'A' ? 'AUTOMA ' + number : 'UMANO ' + number;
        document.getElementById('playerP' + num).innerHTML = text;
    } else {
        if (num == 3) {
            if (colorChosen[3]) {
                colorChosen.splice(3, 1);
                document.getElementById('colorP4').style.backgroundColor = 'transparent';
            }
            if (playersChosen[3]) {
                playersChosen.splice(3, 1);
                document.getElementById('playerP4').innerHTML = '';
            }
        }
        if (colorChosen[2]) {
            colorChosen.splice(2, 1);
            document.getElementById('colorP3').style.backgroundColor = 'transparent';
        }
        if (playersChosen[2]) {
            playersChosen.splice(2, 1);
            document.getElementById('playerP3').innerHTML = '';
        }
    }



}