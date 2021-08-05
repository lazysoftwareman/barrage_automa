import { carteCriteri, curCartaAzioni, curCartaCriteri } from './deck.js';

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