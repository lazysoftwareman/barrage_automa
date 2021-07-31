/////////////////// TEST

function testDado() {
    var result = [];
    for (var i = 0; i < 12; i++) {
        result[i + 1] = 0;
    }
    for (var i = 0; i < 1000000; i++) {
        var dado = getDado();
        result[dado]++;
    }
    var testo = '';
    for (var i = 0; i < 12; i++) {
        testo = testo + (i + 1) + ': ' + result[i + 1] + '\n';
    }
    alert(testo);
}

function testBE_Condotta1() {
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
    var valid = getBE_Condotta('B', [], 'A');
    var passed = valid.length == 4;
    passed = passed && valid[0] == 'DF_4' && valid[1] == 'DP_4' && valid[2] == 'DP_6' && valid[3] == 'DP_9';
    var esito = passed ? 'PASSATO' : 'FALLITO';
    alert('Dighe basi valide: \n' + printArray(valid) + '\n' + esito);
    initPage();
}

function testBE_Condotta2() {
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
    var valid = getBE_Condotta('E', [], 'A');
    var passed = valid.length == 0;
    var esito = passed ? 'PASSATO' : 'FALLITO';
    alert('Dighe elevazioni valide: \n' + printArray(valid) + '\n' + esito);
    initPage();
}

function testBE_CentraleMia1() {
    // centrale in 12, diga in 10 Automa
    // centrale in 11, diga in 9,10 Utente
    centraliCostruite.push({ centrale: 'CF_12', chi: 'A' });
    centraliCostruite.push({ condotta: 'CF_11A', chi: 'U' });
    dighePresenti.push({ diga: 'DF_9', chi: 'N' });
    digheLivello.push({ diga: 'DF_9', livello: 3 });
    dighePresenti.push({ diga: 'DF_10', chi: 'U' });
    digheLivello.push({ diga: 'DF_10', livello: 2 });
    dighePresenti.push({ diga: 'DP_10', chi: 'A' });
    digheLivello.push({ diga: 'DP_10', livello: 2 });
    var valid = getBE_CentralePropria('B', [], 'A');
    var passed = valid.length == 5;
    passed = passed && valid[0] == 'DF_4' && valid[1] == 'DP_4' && valid[2] == 'DF_7' && valid[3] == 'DP_7' && valid[4] == 'DP_9';
    var esito = passed ? 'PASSATO' : 'FALLITO';
    alert('Dighe basi valide: \n' + printArray(valid) + '\n' + esito);
    initPage();
}

function testBE_CentraleMia2() {
    // centrale in 12, diga in 10 Automa
    // centrale in 11, diga in 9,10 Utente
    centraliCostruite.push({ centrale: 'CF_12', chi: 'A' });
    centraliCostruite.push({ condotta: 'CF_11A', chi: 'U' });
    dighePresenti.push({ diga: 'DF_9', chi: 'N' });
    digheLivello.push({ diga: 'DF_9', livello: 3 });
    dighePresenti.push({ diga: 'DF_10', chi: 'U' });
    digheLivello.push({ diga: 'DF_10', livello: 2 });
    dighePresenti.push({ diga: 'DP_10', chi: 'A' });
    digheLivello.push({ diga: 'DP_10', livello: 2 });
    var valid = getBE_CentralePropria('E', [], 'A');
    var passed = valid.length == 1;
    passed = passed && valid[0] == 'DP_10';
    var esito = passed ? 'PASSATO' : 'FALLITO';
    alert('Dighe basi valide: \n' + printArray(valid) + '\n' + esito);
    initPage();
}