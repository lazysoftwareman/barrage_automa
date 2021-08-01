import { initMazzo } from './init.js';

// @ts-check
export let deckSize = 18;
export let mazzo = [];
export let indice = 0;

export let round = [];

export function resetOlds() {
    mazzo = [];
    indice = 0;
}

/////////////// BUSINESS LOGIC

export function getNumCarteRimanenti() {
    return deckSize - (indice + 1);
}

export function pesca() {
    if (indice >= deckSize) {
        initMazzo();
    }
    return mazzo[indice++];
}

export function mescola(mazzo) {
    let currentIndex = mazzo.length, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [mazzo[currentIndex], mazzo[randomIndex]] = [
            mazzo[randomIndex], mazzo[currentIndex]];
    }
    return mazzo;
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

export function apriRound(num) {
    document.getElementById("legendaC").style.display = "none";
    document.getElementById('legendaVera').innerHTML = "";
    document.getElementById('legendaVera').appendChild(getImmagine('round', 'r' + num + '_' + round[num] + '.jpg'));
    document.getElementById("legendaO").style.display = "block";
}

export function chiudiRound() {
    document.getElementById("legendaO").style.display = "none";
    document.getElementById("legendaC").style.display = "block";
}
