// @ts-check
import { resetInputs } from './barrage.js';
import { deckSize, getDado3, indice, mazzo, mescola, round } from './old.js';
import {
    testBE_CentraleMia1,
    testBE_CentraleMia2,
    testBE_CentraleNaturale1,
    testBE_CentraleNaturale2,
    testBE_Condotta1,
    testBE_Condotta2,
} from './tests.js';




export function initPage() {
	resetInputs();

	round['12'] = getDado3();
	round['34'] = getDado3();
	round['56'] = getDado3();
	initMazzo();
	document.getElementById('numPescate').innerHTML = ('' + indice);
	document.getElementById('numTot').innerHTML = '' + deckSize;
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
document.getElementById('testBE_Condotta1').addEventListener('click', testBE_Condotta1);
document.getElementById('testBE_Condotta2').addEventListener('click', testBE_Condotta2);
document.getElementById('testBE_CentraleMia1').addEventListener('click', testBE_CentraleMia1);
document.getElementById('testBE_CentraleMia2').addEventListener('click', testBE_CentraleMia2);
document.getElementById('testBE_CentraleNaturale1').addEventListener('click', testBE_CentraleNaturale1);
document.getElementById('testBE_CentraleNaturale2').addEventListener('click', testBE_CentraleNaturale2);
