// @ts-check
import { deckSize, indice, pesca } from './deck';

export function getNumCarteRimanenti() {
    return deckSize - (indice + 1);
}

export function getImmagine(folderName, fileName) {
    let immagine = document.createElement("img");
    immagine.src = "img/" + folderName + "/" + fileName;
    if (folderName == 'deck') {
        immagine.id = "c_pescata";
        immagine.className = "mazzo front animated flipInY";
        immagine.onclick = pescaEMostra;
    } else {
        immagine.className = "cartaround";
    }
    return immagine;
}

export function getDado3() {
    let rand = Math.random();
    return Math.ceil(rand * 3);
}

//////////////////// VIEW

export function pescaEMostra() {
    let carta = 'a_' + pesca() + '.jpg';
    mostra(carta);
    document.getElementById('numPescate').innerHTML = ('' + indice);
}

export function mostra(carta) {
    let cartaPescata = document.getElementById('c_pescata');
    if (cartaPescata) {
        document.getElementById('risultato').removeChild(cartaPescata);
    }
    document.getElementById('risultato').appendChild(getImmagine('deck', carta));
}
