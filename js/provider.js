// @ts-check
/////////////// BL UTILS
import { centraliCostruite, digheLivello, dighePresenti } from './barrage.js';


/**
 * Ritorna M(ontagna), C(ollina), P(ianura) in base alla condotta
 * @param {string} condotta
 */
export function getZonaCondotta(condotta) {
    let prefix = condotta.substring(0, 4);
    if (prefix == 'C_10') {
        return 'P';
    } else {
        prefix = prefix.substring(0, 3);
        if (prefix == 'C_9' || prefix == 'C_8') {
            return 'P';
        } else if (prefix == 'C_7' || prefix == 'C_6' || prefix == 'C_5') {
            return 'C';
        } else {
            return 'M';
        }
    }
}

/**
 * Ritorna di chi è la diga
 * @param {string} diga
 */
export function getProprietarioDiga(diga) {
    if (dighePresenti.length == 0) {
        return undefined;
    }
    for (let i = 0; i < dighePresenti.length; i++) {
        if (dighePresenti[i].diga == diga) {
            return dighePresenti[i].chi;
        }
    }
    return undefined;
}

/**
 * Ritorna le dighe di quello passato
 * @param {string} chi
 */
export function getDigheDiProprieta(chi) {
    let dighe = [];
    if (dighePresenti.length > 0) {
        for (let i = 0; i < dighePresenti.length; i++) {
            if (dighePresenti[i].chi == chi) {
                dighe.push(dighePresenti[i].diga);
            }
        }
    }
    return dighe;
}

/**
 * Ritorna il livello della diga
 * @param {string} diga
 */
export function getLivelloDiga(diga) {
    if (digheLivello.length == 0) {
        return undefined;
    }
    for (let i = 0; i < digheLivello.length; i++) {
        if (digheLivello[i].diga == diga) {
            return digheLivello[i].livello;
        }
    }
    return undefined;
}

/**
 * ritorna le centrali del proprietario
 * @param {string} chi
 */
export function getCentraliDiProprieta(chi) {
    let centrali = [];
    if (centraliCostruite.length > 0) {
        for (let i = 0; i < centraliCostruite.length; i++) {
            if (centraliCostruite[i].chi == chi) {
                centrali.push(centraliCostruite[i].centrale);
            }
        }
    }
    return centrali;
}

/**
 * Ritorna il numero della centrale
 * @param {string} centrale
 */
export function getNumeroCentrale(centrale) {
    let num = centrale.substring(3, centrale.length);
    if (num.endsWith('A') || num.endsWith('B') || num.endsWith('C')) {
        return num.substring(0, num.length - 1);
    } else {
        return num;
    }
}

export function printArray(array) {
    let text = '[';
    for (let i = 0; i < array.length; i++) {
        text += array[i] + ', ';
    }
    text += ']';
    return text;
}