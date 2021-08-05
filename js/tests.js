// @ts-check
import { centraliCostruite, condotteCostruite, costruisci, dighePresenti, getBE_A, getBE_B, getBE_E } from './barrage.js';
import { initMazzo, pesca } from './deck.js';
import { initPage } from './init.js';
import { printArray } from './provider.js';


/////////////////// TEST

export function testBE_Condotta1() {
    // diga naturale 1, con condotta B dell'automa
    // nessuna diga ma condotta 4 B dell'automa
    // diga utente 6, con condotta A e B dell'utente
    // dighe naturali e automa in 8 con condotta B utente
    // diga naturale 9 con condotta A automa e B utente
    condotteCostruite.push({ condotta: 'C_1B', chi: 'A' });
    condotteCostruite.push({ condotta: 'C_4B', chi: 'A' });
    condotteCostruite.push({ condotta: 'C_6A', chi: 'U' });
    condotteCostruite.push({ condotta: 'C_6B', chi: 'A' });
    condotteCostruite.push({ condotta: 'C_8B', chi: 'U' });
    condotteCostruite.push({ condotta: 'C_9A', chi: 'A' });
    condotteCostruite.push({ condotta: 'C_9B', chi: 'U' });
    dighePresenti.push({ diga: 'DF_1', chi: 'N', livello: 1 });
    dighePresenti.push({ diga: 'DF_6', chi: 'U', livello: 2 });
    dighePresenti.push({ diga: 'DF_8', chi: 'N', livello: 2 });
    dighePresenti.push({ diga: 'DP_8', chi: 'A', livello: 3 });
    dighePresenti.push({ diga: 'DF_9', chi: 'N', livello: 3 });
    let valid = getBE_A('B', [], 'A');
    let passed = valid.length == 4;
    passed = passed && valid[0] == 'DF_4' && valid[1] == 'DP_4' && valid[2] == 'DP_6' && valid[3] == 'DP_9';
    let esito = passed ? 'PASSATO' : 'FALLITO';
    alert('Dighe basi valide: \n' + printArray(valid) + '\n' + esito);
    initPage();
}

export function testBE_Condotta2() {
    // diga naturale 1, con condotta B dell'automa
    // diga utente 6, con condotta A e B dell'utente
    // diga naturale 9 con condotta A automa e B utente
    condotteCostruite.push({ condotta: 'C_1B', chi: 'A' });
    condotteCostruite.push({ condotta: 'C_4B', chi: 'A' });
    condotteCostruite.push({ condotta: 'C_6A', chi: 'U' });
    condotteCostruite.push({ condotta: 'C_6B', chi: 'A' });
    condotteCostruite.push({ condotta: 'C_8B', chi: 'U' });
    condotteCostruite.push({ condotta: 'C_9A', chi: 'A' });
    condotteCostruite.push({ condotta: 'C_9B', chi: 'U' });
    dighePresenti.push({ diga: 'DF_1', chi: 'N', livello: 1 });
    dighePresenti.push({ diga: 'DF_6', chi: 'U', livello: 2 });
    dighePresenti.push({ diga: 'DF_8', chi: 'N', livello: 2 });
    dighePresenti.push({ diga: 'DP_8', chi: 'A', livello: 3 });
    dighePresenti.push({ diga: 'DF_9', chi: 'N', livello: 3 });
    let valid = getBE_A('E', [], 'A');
    let passed = valid.length == 0;
    let esito = passed ? 'PASSATO' : 'FALLITO';
    alert('Dighe elevazioni valide: \n' + printArray(valid) + '\n' + esito);
    initPage();
}

export function testBE_CentraleMia1() {
    // centrale in 12, diga in 10 Automa
    // centrale in 11, diga in 9,10 Utente
    centraliCostruite.push({ centrale: 'CF_12', chi: 'A' });
    centraliCostruite.push({ centrale: 'CF_11A', chi: 'U' });
    dighePresenti.push({ diga: 'DF_9', chi: 'N', livello: 3 });
    dighePresenti.push({ diga: 'DF_10', chi: 'U', livello: 2 });
    dighePresenti.push({ diga: 'DP_10', chi: 'A', livello: 2 });
    let valid = getBE_B('B', [], 'A');
    let passed = valid.length == 5;
    passed = passed && valid[0] == 'DF_4' && valid[1] == 'DP_4' && valid[2] == 'DF_7' && valid[3] == 'DP_7' && valid[4] == 'DP_9';
    let esito = passed ? 'PASSATO' : 'FALLITO';
    alert('Dighe basi valide: \n' + printArray(valid) + '\n' + esito);
    initPage();
}

export function testBE_CentraleMia2() {
    // centrale in 12, diga in 10 Automa
    // centrale in 11, diga in 9,10 Utente
    centraliCostruite.push({ centrale: 'CF_12', chi: 'A' });
    centraliCostruite.push({ centrale: 'CF_11A', chi: 'U' });
    dighePresenti.push({ diga: 'DF_9', chi: 'N', livello: 3 });
    dighePresenti.push({ diga: 'DF_10', chi: 'U', livello: 2 });
    dighePresenti.push({ diga: 'DP_10', chi: 'A', livello: 2 });
    let valid = getBE_B('E', [], 'A');
    let passed = valid.length == 1;
    passed = passed && valid[0] == 'DP_10';
    let esito = passed ? 'PASSATO' : 'FALLITO';
    alert('Dighe basi valide: \n' + printArray(valid) + '\n' + esito);
    initPage();
}

export function testBE_CentraleNaturale1() {
    centraliCostruite.push({ centrale: 'CF_5', chi: 'A' });
    centraliCostruite.push({ centrale: 'CP_9', chi: 'U' });
    dighePresenti.push({ diga: 'DF_9', chi: 'N', livello: 3 });
    dighePresenti.push({ diga: 'DF_10', chi: 'U', livello: 2 });
    dighePresenti.push({ diga: 'DP_10', chi: 'A', livello: 2 });
    let valid = getBE_E('B', [], 'A');
    let passed = valid.length == 3;
    passed = passed && valid[0] == 'DP_5' && valid[1] == 'DF_5' && valid[2] == 'DP_9';
    let esito = passed ? 'PASSATO' : 'FALLITO';
    alert('Dighe basi valide: \n' + printArray(valid) + '\n' + esito);
    initPage();
}

export function testBE_CentraleNaturale2() {
    centraliCostruite.push({ centrale: 'CF_5', chi: 'A' });
    centraliCostruite.push({ centrale: 'CP_9', chi: 'U' });
    dighePresenti.push({ diga: 'DF_9', chi: 'A', livello: 2 });
    dighePresenti.push({ diga: 'DF_10', chi: 'U', livello: 2 });
    dighePresenti.push({ diga: 'DP_10', chi: 'N', livello: 2 });
    let valid = getBE_E('E', [], 'A');
    let passed = valid.length == 1;
    passed = passed && valid[0] == 'DF_9';
    let esito = passed ? 'PASSATO' : 'FALLITO';
    alert('Dighe basi valide: \n' + printArray(valid) + '\n' + esito);
    initPage();
}

export function testCostruisciInizio() {
    dighePresenti.push({ diga: 'DF_3', chi: 'N', livello: 1 });
    dighePresenti.push({ diga: 'DF_7', chi: 'N', livello: 2 });
    dighePresenti.push({ diga: 'DF_8', chi: 'N', livello: 3 });
    initMazzo();
    pesca();
    let output = costruisci('B', undefined, 'A');
}