// @ts-check
import {
    addGocciaDiga,
    addGocciaSorgente,
    getBE_0_SistemaCompleto,
    getBE_A,
    getBE_B,
    getBE_C,
    getBE_D,
    getBE_E,
    getBE_F,
    getBE_Numero,
    resetInputs,
} from './barrage.js';
import { deckSize, mazzo, mescola } from './old.js';
import {
    testBE_CentraleMia1,
    testBE_CentraleMia2,
    testBE_CentraleNaturale1,
    testBE_CentraleNaturale2,
    testBE_Condotta1,
    testBE_Condotta2,
    testCostruisciInizio,
} from './tests.js';




export function initPage() {
	resetInputs();
	initMazzo();
	addHandlers();
	// initDorsoMazzo();
}

export function initMazzo() {
	resetInputs();
	for (var i = 0; i < deckSize; i++) {
		mazzo.push(i + 1);
	}
	mescola(mazzo);
}

// @ts-ignore
window.initPage = initPage;
// @ts-ignore
window.getBE_0_SistemaCompleto = getBE_0_SistemaCompleto;
// @ts-ignore
window.getBE_A = getBE_A;
// @ts-ignore
window.getBE_B = getBE_B;
// @ts-ignore
window.getBE_C = getBE_C;
// @ts-ignore
window.getBE_D = getBE_D;
// @ts-ignore
window.getBE_E = getBE_E;
// @ts-ignore
window.getBE_F = getBE_F;
// @ts-ignore
window.getBE_Numero = getBE_Numero;

export function addHandlers() {
	document.getElementById('areaSA').addEventListener('click', function () { addGocciaSorgente('A'); }, false);
	document.getElementById('areaSB').addEventListener('click', function () { addGocciaSorgente('B'); }, false);
	document.getElementById('areaSC').addEventListener('click', function () { addGocciaSorgente('C'); }, false);
	document.getElementById('areaSD').addEventListener('click', function () { addGocciaSorgente('D'); }, false);
	document.getElementById('areaDP_1G').addEventListener('click', function () { addGocciaDiga('DP_1'); }, false);
	document.getElementById('areaDP_2G').addEventListener('click', function () { addGocciaDiga('DP_2'); }, false);
	document.getElementById('areaDP_3G').addEventListener('click', function () { addGocciaDiga('DP_3'); }, false);
	document.getElementById('areaDP_4G').addEventListener('click', function () { addGocciaDiga('DP_4'); }, false);
	document.getElementById('areaDF_1G').addEventListener('click', function () { addGocciaDiga('DF_1'); }, false);
	document.getElementById('areaDF_2G').addEventListener('click', function () { addGocciaDiga('DF_2'); }, false);
	document.getElementById('areaDF_3G').addEventListener('click', function () { addGocciaDiga('DF_3'); }, false);
	document.getElementById('areaDF_4G').addEventListener('click', function () { addGocciaDiga('DF_4'); }, false);


	// TESTS

	document.getElementById('testBE_Condotta1').addEventListener('click', testBE_Condotta1);
	document.getElementById('testBE_Condotta2').addEventListener('click', testBE_Condotta2);
	document.getElementById('testBE_CentraleMia1').addEventListener('click', testBE_CentraleMia1);
	document.getElementById('testBE_CentraleMia2').addEventListener('click', testBE_CentraleMia2);
	document.getElementById('testBE_CentraleNaturale1').addEventListener('click', testBE_CentraleNaturale1);
	document.getElementById('testBE_CentraleNaturale2').addEventListener('click', testBE_CentraleNaturale2);
	document.getElementById('testCostruisciInizio').addEventListener('click', testCostruisciInizio);
}