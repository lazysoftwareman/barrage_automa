// @ts-check
/////////////// BL UTILS
import { centraliCostruite, condotteCostruite, digheGocce, dighePresenti, sorgentiGocce } from './barrage.js';
import { condotteCentrali, digheFree, dighePay } from './mappa.js';


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
 * Ritorna M(ontagna), C(ollina), P(ianura) in base alla diga
 * @param {string} diga
 */
export function getZonaDiga(diga) {
    let numero = diga.substring(3, diga.length);
    if (numero == '10' || numero == '9' || numero == '8') {
        return 'P';
    } else if (numero == '7' || numero == '6' || numero == '5') {
        return 'C';
    } else {
        return 'M';
    }
}

/**
 * Ritorna C(ollina), P(ianura) in base alla centr4ale
 * @param {string} centrale
 */
export function getZonaCentrale(centrale) {
    let numero = centrale.substring(3, centrale.length);
    if (numero.startsWith('12') || numero.startsWith('11') || numero.startsWith('10') || numero.startsWith('9') || numero.startsWith('8')) {
        return 'P';
    } else {
        return 'C';
    }
}

/**
 * Ritorna di chi è la condotta
 * @param {string} condotta
 */
export function getProprietarioCondotta(condotta) {
    if (condotteCostruite.length == 0) {
        return undefined;
    }
    for (let i = 0; i < condotteCostruite.length; i++) {
        if (condotteCostruite[i].condotta == condotta) {
            return condotteCostruite[i].chi;
        }
    }
    return undefined;
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
 * Ritorna di chi è la centrale
 * @param {string} centrale
 */
export function getProprietarioCentrale(centrale) {
    if (centraliCostruite.length == 0) {
        return undefined;
    }
    for (let i = 0; i < centraliCostruite.length; i++) {
        if (centraliCostruite[i].centrale == centrale) {
            return centraliCostruite[i].chi;
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
    if (dighePresenti.length == 0) {
        return undefined;
    }
    for (let i = 0; i < dighePresenti.length; i++) {
        if (dighePresenti[i].diga == diga) {
            return dighePresenti[i].livello;
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
 * @returns {string} num
 */
export function getNumeroCentrale(centrale) {
    let num = centrale.substring(3, centrale.length);
    if (num.endsWith('A') || num.endsWith('B') || num.endsWith('C')) {
        return num.substring(0, num.length - 1);
    } else {
        return num;
    }
}

/**
 * Ritorna il numero della diga
 * @param {string} diga
 */
export function getNumeroDiga(diga) {
    let num = diga.substring(3, diga.length);
    return num;
}

export function getDigheElevabili(automa) {
    const digheValide = [];
    for (const diga of digheFree.concat(dighePay)) {
        if (getProprietarioDiga(diga) && getProprietarioDiga(diga) == automa && getLivelloDiga(diga) < 3) {
            digheValide.push(diga);
        }
    }
    return digheValide;
}

/**
 * @param {string} areaNum
 */
export function getCondotteCheScaricanoInArea(areaNum) {
    let condotte = [];
    for (let cond in condotteCentrali) {
        let centr = condotteCentrali[cond][0];
        if (areaNum == getNumeroCentrale(centr)) {
            condotte.push(cond);
        }
    }
    return condotte;
}

/**
 * Ritorna il numero di gocce in una sorgente
 * @param {string} sorgente
 */
export function getGocceInSorgente(sorgente) {
    if (sorgentiGocce.length == 0) {
        return 0;
    }
    for (let i = 0; i < sorgentiGocce.length; i++) {
        if (sorgentiGocce[i].sorgente == sorgente) {
            return sorgentiGocce[i].gocce;
        }
    }
    return 0;
}

/**
 * Ritorna il numero di gocce in una diga
 * @param {string} diga
 */
export function getGocceInDiga(diga) {
    if (digheGocce.length == 0) {
        return 0;
    }
    for (let i = 0; i < digheGocce.length; i++) {
        if (digheGocce[i].diga == diga) {
            return digheGocce[i].gocce;
        }
    }
    return 0;
}

/**
 * Ritorna la capienza in una diga
 * @param {string} diga
 */
export function getCapienzaDiga(diga) {
    let liv = getLivelloDiga(diga);
    if (!liv) {
        liv = 0;
    }
    let goc = getGocceInDiga(diga);
    if (!goc) {
        goc = 0;
    }
    return liv - goc;
}

export function getZoneBasePerEscavatori(numEscavatori) {
    const zoneDisponibili = [];
    if (numEscavatori < 3) {
        return zoneDisponibili;
    }
    if (numEscavatori >= 3) {
        zoneDisponibili.push('P');
    }
    if (numEscavatori >= 4) {
        zoneDisponibili.push('C');
    }
    if (numEscavatori >= 5) {
        zoneDisponibili.push('M');
    }
    return zoneDisponibili;
}

export function getZoneElevazioniPerBetoniere(numBetoniere) {
    const zoneDisponibili = [];
    if (numBetoniere < 2) {
        return zoneDisponibili;
    }
    if (numBetoniere >= 2) {
        zoneDisponibili.push('P');
    }
    if (numBetoniere >= 3) {
        zoneDisponibili.push('C');
    }
    if (numBetoniere >= 4) {
        zoneDisponibili.push('M');
    }
    return zoneDisponibili;
}

export function getValoreCondottePerEscavatori(numBetoniere) {
    if (numBetoniere < 2) {
        return 0;
    }
    let result = Math.floor(numBetoniere / 2);
    return result > 10 ? 10 : result;
}

/**
 * @param {string[]} arrayPrincipale
 * @param {string[]} arrayNuoviValori
 */
export function intersecArray(arrayPrincipale, arrayNuoviValori) {
    // intersezione
    let filtered = arrayPrincipale.filter(n => arrayNuoviValori.includes(n));
    if (filtered.length == 0 && arrayPrincipale.length != 0) {
        // Il secondo array ha risultati che non c'entrano una cippa. Ritorno il primo
        return arrayPrincipale;
    }
    return filtered;
}

export function areEquals(array1, array2) {
    if (!array1) {
        return !array2;
    } else if (!array2) {
        return false;
    }
    if (array1.length != array2.length) {
        return false;
    }
    array1.sort();
    array2.sort();
    for (let i = 0; i < array1.length; i++) {
        if (array1[i] != array2[i]) {
            return false;
        }
    }
    return true;
}

export function printArray(array) {
    let text = '[';
    for (let i = 0; i < array.length; i++) {
        text += array[i] + ', ';
    }
    text += ']';
    return text;
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}