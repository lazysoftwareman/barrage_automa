import { actualResult } from './barrage.js';
import { azioni, carteAzioni, carteCriteri, curCartaAzioni, curCartaCriteri } from './deck.js';
import { centraliFree, centraliPay, condotte, digheFree, dighePay } from './mappa.js';

// @ts-check
export function initDiminesions() {
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

export function showMappa() {
    document.getElementById('deckContainer').style.display = 'none';
    document.getElementById('mappaContainer').style.display = 'block';
}

export function hideMappa() {
    document.getElementById('mappaContainer').style.display = 'none';
    document.getElementById('deckContainer').style.display = 'block';
}

export function mostraCarte() {
    if (curCartaAzioni) {
        document.getElementById('cartaF').src = 'img/deck/f_' + curCartaAzioni + '.jpg';
    }
    if (curCartaCriteri) {
        document.getElementById('cartaB').src = 'img/deck/b_' + curCartaCriteri + '.jpg';
        document.getElementById('criteriText').innerHTML = carteCriteri[curCartaCriteri];
    } else {
        document.getElementById('criteriText').innerHTML = '';
    }
}

export function mostraAzioni() {
    let currentAzioni = carteAzioni[curCartaAzioni];
    let azioniInCarta = currentAzioni.split('_').filter((az) => az.startsWith('C'));
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