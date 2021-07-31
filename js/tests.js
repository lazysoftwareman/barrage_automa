// @ts-check
import {
    centraliCostruite,
    condotteCostruite,
    digheLivello,
    dighePresenti,
    getBE_CentraleNaturale,
    getBE_CentralePropria,
    getBE_Condotta,
    getDado3,
    printArray,
} from './barrage.js';
import { initPage } from './init.js';


/////////////////// TEST

function testDado() {
    let result = [];
    for (let i = 0; i < 12; i++) {
        result[i + 1] = 0;
    }
    for (let i = 0; i < 1000000; i++) {
        let dado = getDado3();
        result[dado]++;
    }
    let testo = '';
    for (let i = 0; i < 12; i++) {
        testo = testo + (i + 1) + ': ' + result[i + 1] + '\n';
    }
    alert(testo);
}

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
    dighePresenti.push({ diga: 'DF_1', chi: 'N' });
    digheLivello.push({ diga: 'DF_1', livello: 1 });
    dighePresenti.push({ diga: 'DF_6', chi: 'U' });
    digheLivello.push({ diga: 'DF_6', livello: 2 });
    dighePresenti.push({ diga: 'DF_8', chi: 'N' });
    digheLivello.push({ diga: 'DF_8', livello: 2 });
    dighePresenti.push({ diga: 'DP_8', chi: 'A' });
    digheLivello.push({ diga: 'DP_8', livello: 3 });
    dighePresenti.push({ diga: 'DF_9', chi: 'N' });
    digheLivello.push({ diga: 'DF_9', livello: 3 });
    let valid = getBE_Condotta('B', [], 'A');
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
    dighePresenti.push({ diga: 'DF_1', chi: 'N' });
    digheLivello.push({ diga: 'DF_1', livello: 1 });
    dighePresenti.push({ diga: 'DF_6', chi: 'U' });
    digheLivello.push({ diga: 'DF_6', livello: 2 });
    dighePresenti.push({ diga: 'DF_8', chi: 'N' });
    digheLivello.push({ diga: 'DF_8', livello: 2 });
    dighePresenti.push({ diga: 'DP_8', chi: 'A' });
    digheLivello.push({ diga: 'DP_8', livello: 3 });
    dighePresenti.push({ diga: 'DF_9', chi: 'N' });
    digheLivello.push({ diga: 'DF_9', livello: 3 });
    let valid = getBE_Condotta('E', [], 'A');
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
    dighePresenti.push({ diga: 'DF_9', chi: 'N' });
    digheLivello.push({ diga: 'DF_9', livello: 3 });
    dighePresenti.push({ diga: 'DF_10', chi: 'U' });
    digheLivello.push({ diga: 'DF_10', livello: 2 });
    dighePresenti.push({ diga: 'DP_10', chi: 'A' });
    digheLivello.push({ diga: 'DP_10', livello: 2 });
    let valid = getBE_CentralePropria('B', [], 'A');
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
    dighePresenti.push({ diga: 'DF_9', chi: 'N' });
    digheLivello.push({ diga: 'DF_9', livello: 3 });
    dighePresenti.push({ diga: 'DF_10', chi: 'U' });
    digheLivello.push({ diga: 'DF_10', livello: 2 });
    dighePresenti.push({ diga: 'DP_10', chi: 'A' });
    digheLivello.push({ diga: 'DP_10', livello: 2 });
    let valid = getBE_CentralePropria('E', [], 'A');
    let passed = valid.length == 1;
    passed = passed && valid[0] == 'DP_10';
    let esito = passed ? 'PASSATO' : 'FALLITO';
    alert('Dighe basi valide: \n' + printArray(valid) + '\n' + esito);
    initPage();
}

export function testBE_CentraleNaturale1() {
    centraliCostruite.push({ centrale: 'CF_5', chi: 'A' });
    centraliCostruite.push({ centrale: 'CP_9', chi: 'U' });
    dighePresenti.push({ diga: 'DF_9', chi: 'N' });
    digheLivello.push({ diga: 'DF_9', livello: 3 });
    dighePresenti.push({ diga: 'DF_10', chi: 'U' });
    digheLivello.push({ diga: 'DF_10', livello: 2 });
    dighePresenti.push({ diga: 'DP_10', chi: 'A' });
    digheLivello.push({ diga: 'DP_10', livello: 2 });
    let valid = getBE_CentraleNaturale('B', [], 'A');
    let passed = valid.length == 3;
    passed = passed && valid[0] == 'DP_5' && valid[1] == 'DF_5' && valid[2] == 'DP_9';
    let esito = passed ? 'PASSATO' : 'FALLITO';
    alert('Dighe basi valide: \n' + printArray(valid) + '\n' + esito);
    initPage();
}

export function testBE_CentraleNaturale2() {
    centraliCostruite.push({ centrale: 'CF_5', chi: 'A' });
    centraliCostruite.push({ centrale: 'CP_9', chi: 'U' });
    dighePresenti.push({ diga: 'DF_9', chi: 'A' });
    digheLivello.push({ diga: 'DF_9', livello: 2 });
    dighePresenti.push({ diga: 'DF_10', chi: 'U' });
    digheLivello.push({ diga: 'DF_10', livello: 2 });
    dighePresenti.push({ diga: 'DP_10', chi: 'N' });
    digheLivello.push({ diga: 'DP_10', livello: 2 });
    let valid = getBE_CentraleNaturale('E', [], 'A');
    let passed = valid.length == 1;
    passed = passed && valid[0] == 'DF_9';
    let esito = passed ? 'PASSATO' : 'FALLITO';
    alert('Dighe basi valide: \n' + printArray(valid) + '\n' + esito);
    initPage();
}