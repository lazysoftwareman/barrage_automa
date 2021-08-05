// @ts-check
import { deckSize, indice } from './deck.js';

export function getNumCarteRimanenti() {
    return deckSize - (indice + 1);
}

export function getImmagine(folderName, fileName) {
    let immagine = document.createElement("img");
    immagine.src = "img/" + folderName + "/" + fileName;
    if (folderName == 'deck') {
        immagine.id = "c_pescata";
        immagine.className = "mazzo front animated flipInY";
        //immagine.onclick = pescaEMostra;
    } else {
        immagine.className = "cartaround";
    }
    return immagine;
}

export function getDado3() {
    let rand = Math.random();
    return Math.ceil(rand * 3);
}
