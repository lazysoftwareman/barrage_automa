// @ts-check
import {
    actualColoreContratti,
    actualResult,
    centraliCostruite,
    condotteCostruite,
    digheGocce,
    dighePresenti,
    playerColor,
    playerMap,
    playerSelected,
    sorgentiGocce,
} from './barrage.js';
import { azioni, carteAzioni, curCartaAzioni, curCartaCriteri, deckSize, indice } from './deck.js';
import { centraliFree, centraliPay, condotte, digheFree, dighePay } from './mappa.js';
import { colorsCss } from './playersPage.js';
import { localize, sleep } from './provider.js';

const coloriText = [];

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
    chiudiRichieste();
}

export async function mostraCarte(oldCartaAzioni) {
    let CartaDaFlippare = oldCartaAzioni ? oldCartaAzioni : curCartaAzioni;
    if (curCartaAzioni) {
        // @ts-ignore
        document.getElementById('cartaF').src = 'img/deck/f_' + curCartaAzioni + '.jpg';
    } else {
        // @ts-ignore
        document.getElementById('cartaF').src = '';
    }
    if (curCartaCriteri) {
        const flipCard = document.getElementById('flipCardInner');
        flipCard.className = flipCard.className + ' flip';
        // @ts-ignore
        document.getElementById('flipCardFrontImg').src = 'img/deck/f_' + CartaDaFlippare + '.jpg';
        // @ts-ignore
        document.getElementById('flipCardBackImg').src = 'img/deck/b_' + CartaDaFlippare + '.jpg';
        flipCard.style.visibility = 'visible';
        await sleep(1000);
        if (flipCard.className.includes(' flip')) {
            flipCard.className = flipCard.className.replace(' flip', '');
        }
        // @ts-ignore
        document.getElementById('cartaB').src = 'img/deck/b_' + curCartaCriteri + '.jpg';
        flipCard.style.visibility = 'hidden';
    } else {
        if (curCartaAzioni) {
            // @ts-ignore
            document.getElementById('cartaF').src = 'img/deck/f_' + curCartaAzioni + '.jpg';
        } else {
            // @ts-ignore
            document.getElementById('cartaF').src = '';
        }
        // @ts-ignore
        document.getElementById('cartaB').src = '';
    }
    document.getElementById('cartePescate').innerHTML = '' + indice + ' / ' + deckSize;
}

export function mostraPlayers() {
    let playersCount = 0;
    // @ts-ignore
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
            const colorCss = colorsCss[color];
            const lettera = player.substr(0, 1);
            const numero = player.length == 2 ? player.substr(1, 1) : '';
            let letteraLoc = lettera;
            if (lettera == 'U') {
                letteraLoc = localize('U');
            }
            document.getElementById(pNum + '_Selector').innerHTML = letteraLoc + numero;
            document.getElementById(pNum + '_Selector').style.backgroundColor = colorCss;
            if (color == 'W') {
                document.getElementById(pNum + '_Selector').style.color = 'var(--blackPlayer)';
            } else {
                document.getElementById(pNum + '_Selector').style.color = 'var(--whiteBorder)';
            }
        }

    }
}

// @ts-ignore
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
        const element = document.getElementById('azione_' + az);
        if (element) {
            document.getElementById('azione_' + az).style.borderColor = 'var(--selectionColor)';
        }
    }
    //Riordino
    const divs = [];
    for (const azione of azioni) {
        divs[azione] = document.getElementById('azione_' + azione);
    }
    document.getElementById('mappaToolbar').innerHTML = '';
    for (const az of azioniInCarta) {
        if (divs[az]) {
            document.getElementById('mappaToolbar').appendChild(divs[az]);
        }
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
export function mostraSistema(elementi) {
    for (const elemento of elementi) {
        illuminaElemento(elemento);
    }
}

/**
 * Mostra i risultati del filtraggio
 */
export function mostraRisultati() {
    for (const output of actualResult) {
        illuminaElemento(output);
    }
}

function illuminaElemento(elemento) {
    const element = document.getElementById('area' + elemento);
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

export function resetRisultati() {
    const bacini = [];
    for (const diga of digheFree.concat(dighePay)) {
        bacini.push(diga + 'G');
    }
    const elems = [...dighePay, ...digheFree, ...condotte, ...centraliPay, ...centraliFree, ...bacini];
    for (const elem of elems) {
        const element = document.getElementById('area' + elem);
        if (element) {
            element.style.borderColor = 'var(--whiteBorder)';
            element.style.borderWidth = elem.endsWith('G') ? '1px' : '0px';
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
    if (!coloriText[0]) {
        coloriText['R'] = localize('label_rosso');
        coloriText['W'] = localize('label_bianco');
        coloriText['B'] = localize('label_nero');
        coloriText['G'] = localize('label_verde');
    }
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
    const colorText = actualColoreContratti == 'R' ? localize('label_rossi') : actualColoreContratti == 'G' ? localize('label_gialli') : localize('label_verdi');
    span.innerHTML = colorText;
    const select = document.getElementById('valContratti');
    select.innerHTML = '';
    const numDaAggiungere = actualColoreContratti == 'R' ? 6 : actualColoreContratti == 'G' ? 3 : 0;
    for (let i = -1; i < 5; i++) {
        const option = document.createElement('option');
        option.value = '' + (i + numDaAggiungere);
        option.text = '' + (i + numDaAggiungere)
        select.appendChild(option);
    }
}

export function mostraTuttaMappa() {
    // Sorgenti:
    for (const sorgenteGocce of sorgentiGocce) {
        document.getElementById('areaS' + sorgenteGocce.sorgente + 'Text').innerHTML = '' + sorgenteGocce.gocce;
        if (!sorgenteGocce.gocce) {
            document.getElementById('areaS' + sorgenteGocce.sorgente + 'Content').style.display = 'none';
        } else {
            document.getElementById('areaS' + sorgenteGocce.sorgente + 'Content').style.display = 'block';
        }
    }
    // Bacini:
    for (const digaGocce of digheGocce) {
        document.getElementById('area' + digaGocce.diga + 'GText').innerHTML = '' + digaGocce.gocce;
        if (!digaGocce.gocce) {
            document.getElementById('area' + digaGocce.diga + 'GContent').style.display = 'none';
        } else {
            document.getElementById('area' + digaGocce.diga + 'GContent').style.display = 'block';
        }
    }
    // Dighe:
    for (const digaCostruita of dighePresenti) {
        document.getElementById('area' + digaCostruita.diga + 'Text').innerHTML = '' + digaCostruita.livello;
        // @ts-ignore
        document.getElementById('area' + digaCostruita.diga + 'Img').src = 'img/B_' + playerColor[digaCostruita.chi] + '.png';
        document.getElementById('area' + digaCostruita.diga + 'Content').style.display = 'block';
    }
    // Condotte:
    for (const condottaCostruita of condotteCostruite) {
        // @ts-ignore
        document.getElementById('area' + condottaCostruita.condotta + 'Img').src = 'img/CO_' + playerColor[condottaCostruita.chi] + '.png';
        document.getElementById('area' + condottaCostruita.condotta + 'Content').style.display = 'block';
    }
    // Centrali:
    for (const centraleCostruita of centraliCostruite) {
        // @ts-ignore
        document.getElementById('area' + centraleCostruita.centrale + 'Img').src = 'img/CE_' + playerColor[centraleCostruita.chi] + '.png';
        document.getElementById('area' + centraleCostruita.centrale + 'Content').style.display = 'block';
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

export function chiudiRichieste() {
    if (document.getElementById('quantiEscavatori').className.includes('slideInDown')) {
        chiudiEscavatori();
    }
    if (document.getElementById('quanteBetoniere').className.includes('slideInDown')) {
        chiudiBetoniere();
    }
    if (document.getElementById('valoreContratti').className.includes('slideInDown')) {
        chiudiContratti();
    }
}
