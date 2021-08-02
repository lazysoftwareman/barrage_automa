// @ts-check
import { addGocciaSorgente, resetInputs } from './barrage.js';
import { deckSize, mazzo, mescola } from './old.js';
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

export function addHandlers() {
	document.getElementById('testBE_Condotta1').addEventListener('click', testBE_Condotta1);
	document.getElementById('testBE_Condotta2').addEventListener('click', testBE_Condotta2);
	document.getElementById('testBE_CentraleMia1').addEventListener('click', testBE_CentraleMia1);
	document.getElementById('testBE_CentraleMia2').addEventListener('click', testBE_CentraleMia2);
	document.getElementById('testBE_CentraleNaturale1').addEventListener('click', testBE_CentraleNaturale1);
	document.getElementById('testBE_CentraleNaturale2').addEventListener('click', testBE_CentraleNaturale2);
	document.getElementById('areaSA').addEventListener('click', function () { addGocciaSorgente('A'); }, false);
	document.getElementById('areaSB').addEventListener('click', function () { addGocciaSorgente('B'); }, false);
	document.getElementById('areaSC').addEventListener('click', function () { addGocciaSorgente('C'); }, false);
	document.getElementById('areaSD').addEventListener('click', function () { addGocciaSorgente('D'); }, false);
}