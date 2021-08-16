// @ts-check
import { actualColoreContratti, actualResult, playerColor, playerMap, playerSelected } from './barrage.js';
import { azioni, carteAzioni, curCartaAzioni, curCartaCriteri, deckSize, indice } from './deck.js';
import { centraliFree, centraliPay, condotte, digheFree, dighePay } from './mappa.js';
import { sleep } from './provider.js';

const coloriText = [];
coloriText['R'] = ' rosso';
coloriText['W'] = ' bianco';
coloriText['B'] = ' nero';
coloriText['G'] = ' verde';

export function initDiminesions() {
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    const mappa = document.getElementById('mappa');
    if (mappa) {
        const height = mappa.clientHeight * 0.01;
        const width = mappa.clientWidth * 0.01;
        document.documentElement.style.setProperty('--mh', `${(height)}px`);
        document.documentElement.style.setProperty('--mw', `${width}px`);
    }
}

export function showMappa() {
    document.getElementById('deckContainer').style.display = 'none';
    const element = document.getElementById('mappaContainer');
    element.style.display = 'block';
    if (element.className.includes(' animated slideInLeft')) {
        element.className = element.className.replace(' animated slideInLeft', '');
    }
    element.className = element.className + ' animated slideInLeft';
}

export function hideMappa() {
    document.getElementById('mappaContainer').style.display = 'none';
    const element = document.getElementById('deckContainer');
    element.style.display = 'block';
    if (element.className.includes(' animated slideInLeft')) {
        element.className = element.className.replace(' animated slideInLeft', '');
    }
    element.className = element.className + ' animated slideInLeft';
}

export async function mostraCarte(oldCartaAzioni) {
    let CartaDaFlippare = oldCartaAzioni ? oldCartaAzioni : curCartaAzioni;
    if (curCartaAzioni) {
        document.getElementById('cartaF').src = 'img/deck/f_' + curCartaAzioni + '.jpg';
    } else {
        document.getElementById('cartaF').src = '';
    }
    if (curCartaCriteri) {
        const flipCard = document.getElementById('flipCardInner');
        flipCard.className = flipCard.className + ' flip';
        document.getElementById('flipCardFrontImg').src = 'img/deck/f_' + CartaDaFlippare + '.jpg';
        document.getElementById('flipCardBackImg').src = 'img/deck/b_' + CartaDaFlippare + '.jpg';
        flipCard.style.visibility = 'visible';
        await sleep(1000);
        if (flipCard.className.includes(' flip')) {
            flipCard.className = flipCard.className.replace(' flip', '');
        }
        document.getElementById('cartaB').src = 'img/deck/b_' + curCartaCriteri + '.jpg';
        flipCard.style.visibility = 'hidden';
    } else {
        if (curCartaAzioni) {
            document.getElementById('cartaF').src = 'img/deck/f_' + curCartaAzioni + '.jpg';
        } else {
            document.getElementById('cartaF').src = '';
        }
        document.getElementById('cartaB').src = '';
    }
    document.getElementById('cartePescate').innerHTML = '' + indice + ' / ' + deckSize;
}

export function mostraPlayers() {
    let playersCount = 0;
    for (const player in playerMap) {
        playersCount++;
    }
    if (playersCount < 5) {
        document.getElementById('P0_Selector').style.left = 'calc(var(--mw)*7.7)';
        document.getElementById('P4_Selector').style.display = 'none';
        if (playersCount < 4) {
            document.getElementById('P3_Selector').style.display = 'none';
        }
    }
    for (const player in playerColor) {
        const pNum = playerMap[player];
        if (pNum != 'P0') {
            const color = playerColor[player];
            let colorCss;
            if (color == 'G') {
                colorCss = 'var(--greenPlayer)';
            } else if (color == 'R') {
                colorCss = 'var(--redPlayer)';
            } else if (color == 'W') {
                colorCss = 'var(--whitePlayer)';
            } else {
                colorCss = 'var(--blackPlayer)';
            }
            document.getElementById(pNum + '_Selector').innerHTML = player;
            document.getElementById(pNum + '_Selector').style.backgroundColor = colorCss;
            if (color == 'W') {
                document.getElementById(pNum + '_Selector').style.color = 'var(--blackPlayer)';
            } else {
                document.getElementById(pNum + '_Selector').style.color = 'var(--whiteBorder)';
            }
        }

    }
}

export function mostraPlayerSelected(player) {
    for (let player in playerMap) {
        let p = playerMap[player];
        document.getElementById(p + '_Selector').style.borderColor = 'var(--borderColor)';
        document.getElementById(p + '_Selector').style.borderWidth = '1px';
    }
    if (playerSelected) {
        let p = playerMap[playerSelected];
        document.getElementById(p + '_Selector').style.borderColor = 'var(--selectionColor)';
        document.getElementById(p + '_Selector').style.borderWidth = '3px';
        document.getElementById('giocatoreText').innerHTML = playerSelected;
    } else {
        document.getElementById('giocatoreText').innerHTML = '';
    }
}

export function mostraAzioni() {
    let currentAzioni = carteAzioni[curCartaAzioni];
    let azioniInCarta = currentAzioni ? currentAzioni.split('_').filter((az) => az.startsWith('C')) : [];
    azioniInCarta = ['PROD', ...azioniInCarta];
    for (const az of azioni) {
        document.getElementById('azione_' + az).style.borderColor = 'var(--borderColor)';
    }
    for (const az of azioniInCarta) {
        document.getElementById('azione_' + az).style.borderColor = 'var(--selectionColor)';
    }
    //Riordino
    const divs = [];
    for (const azione of azioni) {
        divs[azione] = document.getElementById('azione_' + azione);
    }
    document.getElementById('mappaToolbar').innerHTML = '';
    for (const az of azioniInCarta) {
        document.getElementById('mappaToolbar').appendChild(divs[az]);
    }
    for (const az of azioni) {
        if (!azioniInCarta.includes(az)) {
            document.getElementById('mappaToolbar').appendChild(divs[az]);
        }
    }
}

/**
 * Mostra i risultati del filtraggio
 */
export function mostraRisultati() {
    for (const output of actualResult) {
        const element = document.getElementById('area' + output);
        if (element) {
            element.style.borderColor = 'var(--selectionColor)';
            element.style.borderWidth = '3px';
            element.style.backgroundColor = 'rgba(227, 175, 84, 0.5)';
            if (element.className.includes(' animated flash')) {
                element.className = element.className.replace(' animated flash', '');
            }
            element.className = element.className + ' animated flash';
        }
    }
    // alert(printArray(actualResult));
}

export function resetRisultati() {
    const elems = [...dighePay, ...digheFree, ...condotte, ...centraliPay, ...centraliFree];
    for (const elem of elems) {
        const element = document.getElementById('area' + elem);
        if (element) {
            element.style.borderColor = 'var(--whiteBorder)';
            element.style.borderWidth = '0px';
            element.style.backgroundColor = 'transparent';
            if (element.className.includes(' animated flash')) {
                element.className = element.className.replace(' animated flash', '');
            }
        }
    }
}

export function mostraInfo() {
    const info = document.getElementById('info');
    if (!info.className.includes(' animated slideInUp')) {
        info.className = 'info animated slideInUp';
    } else {
        info.className = ('info animated slideOutDown');
    }
}

export function chiudiInfo() {
    const info = document.getElementById('info');
    info.className = ('info animated slideOutDown');
}

export async function mostraTutto() {
    await sleep(1200);
    document.getElementById('splash').className = ('animated fadeOut');
    await sleep(1000);
    document.getElementById('splash').style.display = 'none';
}

function mostraColoreAutoma() {
    let automa;
    if (!playerSelected || !playerSelected.startsWith('A')) {
        return;
    } else {
        automa = playerSelected;
    }
    const color = playerColor[automa];
    if (color) {
        const colorText = coloriText[color];
        if (!colorText) {
            return;
        }
        const spans = document.getElementsByClassName('coloreAutoma');
        for (const span of spans) {
            span.innerHTML = colorText;
        }
    }
}

function mostraColoreEValoreContratti() {
    if (!actualColoreContratti) {
        return;
    }
    const span = document.getElementById('coloreContratti');
    const colorText = actualColoreContratti == 'R' ? ' rossi' : actualColoreContratti == 'G' ? ' gialli' : ' verdi';
    span.innerHTML = colorText;
    const select = document.getElementById('valContratti');
    select.innerHtml = '';
    const numDaAggiungere = actualColoreContratti == 'R' ? 6 : actualColoreContratti == 'G' ? 3 : 0;
    for (let i = -1; i < 5; i++) {
        const option = document.createElement('option');
        option.value = '' + (i + numDaAggiungere);
        option.text = '' + (i + numDaAggiungere)
        select.appendChild(option);
    }
}

export function chiediEscavatori() {
    mostraColoreAutoma();
    document.getElementById('quantiEscavatori').className = ('richiesta animated slideInDown');
}

export function chiediBetoniere() {
    mostraColoreAutoma();
    document.getElementById('quanteBetoniere').className = ('richiesta animated slideInDown');
}

export function chiediContratti() {
    mostraColoreEValoreContratti();
    document.getElementById('valoreContratti').className = ('richiesta animated slideInDown');
}

export function chiudiEscavatori() {
    document.getElementById('quantiEscavatori').className = ('richiesta animated slideOutUp');
}

export function chiudiBetoniere() {
    document.getElementById('quanteBetoniere').className = ('richiesta animated slideOutUp');
}

export function chiudiContratti() {
    document.getElementById('valoreContratti').className = ('richiesta animated slideOutUp');
}
