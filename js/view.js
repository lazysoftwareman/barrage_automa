import { actualResult, playerColor, playerMap } from './barrage.js';
import { azioni, carteAzioni, carteCriteri, curCartaAzioni, curCartaCriteri, deckSize, indice } from './deck.js';
import { centraliFree, centraliPay, condotte, digheFree, dighePay } from './mappa.js';

// @ts-check
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
    if (element.className.includes(' animated slideInRight')) {
        element.className.replace(' animated slideInRight', '');
    }
    element.className = element.className + ' animated slideInRight';
    // const mappa = document.getElementById('mappaContainer');
    // if (mappa) {
    //     const height = mappa.clientHeight * 0.01;
    //     const width = mappa.clientWidth * 0.01;
    //     document.documentElement.style.setProperty('--mh', `${(height)}px`);
    //     document.documentElement.style.setProperty('--mw', `${width}px`);
    // }
}

export function hideMappa() {
    document.getElementById('mappaContainer').style.display = 'none';
    const element = document.getElementById('deckContainer');
    element.style.display = 'block';
    if (element.className.includes(' animated slideInLeft')) {
        element.className.replace(' animated slideInLeft', '');
    }
    element.className = element.className + ' animated slideInLeft';
}

export function mostraCarte() {
    if (curCartaAzioni) {
        document.getElementById('cartaF').src = 'img/deck/f_' + curCartaAzioni + '.jpg';
    } else {
        document.getElementById('cartaF').src = '';
    }
    if (curCartaCriteri) {
        document.getElementById('cartaB').src = 'img/deck/b_' + curCartaCriteri + '.jpg';
        document.getElementById('criteriText').innerHTML = carteCriteri[curCartaCriteri];
    } else {
        document.getElementById('cartaB').src = '';
        document.getElementById('criteriText').innerHTML = '';
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
                document.getElementById(pNum + '_Selector').style.color = 'var(--borderColor)';
            }
        }

    }
}

export function mostraAzioni() {
    let currentAzioni = carteAzioni[curCartaAzioni];
    let azioniInCarta = currentAzioni ? currentAzioni.split('_').filter((az) => az.startsWith('C')) : [];
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
 * @param {string[]} output 
 */
export function mostraRisultati() {
    for (const output of actualResult) {
        const element = document.getElementById('area' + output);
        if (element) {
            element.style.borderColor = 'var(--selectionColor)';
            element.style.borderWidth = '3px';
            element.style.backgroundColor = 'rgba(227, 175, 84, 0.5)';
            if (element.className.includes(' animated flash')) {
                element.className.replace(' animated flash', '');
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
            element.style.borderColor = 'var(--borderColor)';
            element.style.borderWidth = '2px';
            element.style.backgroundColor = 'transparent';
        }
    }
}