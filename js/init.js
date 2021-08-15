// @ts-check
import {
    addCentrale,
    addCondotta,
    addDiga,
    addGocciaDiga,
    addGocciaSorgente,
    azioneCostruisci,
    azioneCostruisciContinua,
    getBE_0_SistemaCompleto,
    getBE_A,
    getBE_B,
    getBE_C,
    getBE_D,
    getBE_E,
    getBE_F,
    getBE_Numero,
    getCE_0_SistemaCompleto,
    getCE_M,
    getCE_N,
    getCE_Numero,
    getCE_OP,
    getCE_P,
    getCE_Q,
    getCE_R,
    getCO_G,
    getCO_H,
    getCO_I,
    getCO_J,
    getCO_K,
    getCO_L,
    getCO_Numero,
    playerColor,
    playerMap,
    resetInputs,
    setNumBetoniere,
    setNumEscavatori,
} from './barrage.js';
import { azioni, initMazzo, pesca } from './deck.js';
import { centraliFree, centraliPay, condotte, digheFree, dighePay, sorgenti } from './mappa.js';
import { colors } from './playersPage.js';
import {
    changePlayerSelected,
    chiudiBetoniere,
    chiudiEscavatori,
    chiudiInfo,
    hideMappa,
    initDiminesions,
    mostraInfo,
    mostraPlayers,
    mostraTutto,
    showMappa,
} from './view.js';

// @ts-ignore
window.initPage = initPage;
// @ts-ignore
window.initPageTest = initPageTest;

export const azioniPrincipali = [];
export const azioniContinua = [];

export function initPage() {
	resetInputs();
	initMazzo();
	initPlayers()
	addHandlers();
	addGlobalVariables();
	initDiminesions();
	chiudiInfo();
	chiudiBetoniere();
	chiudiEscavatori();
	hideMappa();
	preloadImages();
	mostraTutto();
}

function addGlobalVariables() {
	// @ts-ignore
	window.getBE_0_SistemaCompleto = getBE_0_SistemaCompleto;
	// @ts-ignore
	window.getBE_Numero = getBE_Numero;
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
	window.getCO_0_SistemaCompleto = getBE_F;
	// @ts-ignore
	window.getCO_Numero = getCO_Numero;
	// @ts-ignore
	window.getCO_G = getCO_G;
	// @ts-ignore
	window.getCO_H = getCO_H;
	// @ts-ignore
	window.getCO_I = getCO_I;
	// @ts-ignore
	window.getCO_J = getCO_J;
	// @ts-ignore
	window.getCO_K = getCO_K;
	// @ts-ignore
	window.getCO_L = getCO_L;
	// @ts-ignore
	window.getCE_0_SistemaCompleto = getCE_0_SistemaCompleto;
	// @ts-ignore
	window.getCE_Numero = getCE_Numero;
	// @ts-ignore
	window.getCE_M = getCE_M;
	// @ts-ignore
	window.getCE_N = getCE_N;
	// @ts-ignore
	window.getCE_OP = getCE_OP;
	// @ts-ignore
	window.getCE_P = getCE_P;
	// @ts-ignore
	window.getCE_Q = getCE_Q;
	// @ts-ignore
	window.getCE_R = getCE_R;
}

export function addHandlers() {
	//deck:
	document.getElementById('cartaAzioni').addEventListener('click', pesca);
	document.getElementById('flipCard').addEventListener('click', pesca);
	document.getElementById('mappaSwitch').addEventListener('click', showMappa);
	document.getElementById('deckSwitch').addEventListener('click', hideMappa);
	//info:
	document.getElementById('infoSwitch').addEventListener('click', mostraInfo);
	document.getElementById('info').addEventListener('click', chiudiInfo);
	//Azioni:
	for (const azione of azioni) {
		azioniPrincipali[azione] = function () {
			azioneCostruisci(azione);
		};
		azioniContinua[azione] = function () {
			azioneCostruisciContinua(azione);
		};
		document.getElementById('azione_' + azione).addEventListener('click', azioniPrincipali[azione], false);
	}
	//sorgenti:
	for (let sorgente of sorgenti) {
		let area = document.getElementById('area' + sorgente);
		if (area) {
			area.addEventListener('click', function () { addGocciaSorgente(sorgente.substr(1, 1)); }, false);
		}
	}
	//bacini e dighe:
	for (let diga of dighePay.concat(digheFree)) {
		let area = document.getElementById('area' + diga);
		if (area) {
			area.addEventListener('click', function () { addDiga(diga); }, false);
		}
		area = document.getElementById('area' + diga + 'G');
		if (area) {
			area.addEventListener('click', function () { addGocciaDiga(diga); }, false);
		}
	}
	//condotte
	for (let condotta of condotte) {
		let area = document.getElementById('area' + condotta);
		if (area) {
			area.addEventListener('click', function () { addCondotta(condotta); }, false);
		}
	}
	//centrali
	for (let centrale of centraliPay.concat(centraliFree)) {
		let area = document.getElementById('area' + centrale);
		if (area) {
			area.addEventListener('click', function () { addCentrale(centrale); }, false);
		}
	}

	document.getElementById('P1_Selector').addEventListener('click', function () {
		let player = document.getElementById('P1_Selector').innerHTML;
		changePlayerSelected(player);
	}, false);
	document.getElementById('P2_Selector').addEventListener('click', function () {
		let player = document.getElementById('P2_Selector').innerHTML;
		changePlayerSelected(player);
	}, false);
	document.getElementById('P0_Selector').addEventListener('click', function () { changePlayerSelected('N'); }, false);
	// Richieste
	document.getElementById('confermaEscavatori').addEventListener('click', function () {
		const numEscavatori = +(document.getElementById('numEscavatori').value);
		setNumEscavatori(numEscavatori);
		chiudiEscavatori();
	}, false);
	document.getElementById('confermaBetoniere').addEventListener('click', function () {
		const numBetoniere = +(document.getElementById('numBetoniere').value);
		setNumBetoniere(numBetoniere);
		chiudiBetoniere();
	}, false);
	// TESTS

	// document.getElementById('testBE_Condotta1').addEventListener('click', testBE_Condotta1);
	// document.getElementById('testBE_Condotta2').addEventListener('click', testBE_Condotta2);
	// document.getElementById('testBE_CentraleMia1').addEventListener('click', testBE_CentraleMia1);
	// document.getElementById('testBE_CentraleMia2').addEventListener('click', testBE_CentraleMia2);
	// document.getElementById('testBE_CentraleNaturale1').addEventListener('click', testBE_CentraleNaturale1);
	// document.getElementById('testBE_CentraleNaturale2').addEventListener('click', testBE_CentraleNaturale2);
	// document.getElementById('testCostruisciInizio').addEventListener('click', testCostruisciInizio);
}

export function resetAzioni() {
	for (const azione of azioni) {
		document.getElementById('azione_' + azione).removeEventListener('click', azioniContinua[azione], false);
		document.getElementById('azione_' + azione).removeEventListener('click', azioniPrincipali[azione], false);
		document.getElementById('azione_' + azione).addEventListener('click', azioniPrincipali[azione], false);
	}
}

export function setAzioneContinua(azione) {
	document.getElementById('azione_' + azione).removeEventListener('click', azioniContinua[azione], false);
	document.getElementById('azione_' + azione).removeEventListener('click', azioniPrincipali[azione], false);
	document.getElementById('azione_' + azione).addEventListener('click', azioniContinua[azione], false);
}

export function initPlayers() {
	const params = window.location.search;
	if (params) {
		const entries = params.substring(1).split('&');
		const players = [];
		const colors = [];
		for (const entry of entries) {
			const playerColor = entry.split('=');
			players.push(playerColor[0]);
			colors.push(playerColor[1]);
		}
		let userCount = 0;
		let automaCount = 0;
		for (const player of players) {
			if (player.startsWith('U')) {
				userCount++;
			} else {
				automaCount++;
			}
		}
		let playerCount = 1;
		for (let i = 0; i < automaCount; i++) {
			const idx = players.indexOf('A' + (i + 1));
			const automa = automaCount == 1 ? 'A' : 'A' + (i + 1);
			playerMap[automa] = 'P' + playerCount++;
			playerColor[automa] = colors[idx];
		}
		for (let i = 0; i < userCount; i++) {
			const idx = players.indexOf('U' + (i + 1));
			const user = userCount == 1 ? 'U' : 'U' + (i + 1);
			playerMap[user] = 'P' + playerCount++;
			playerColor[user] = colors[idx];
		}
		playerMap['N'] = 'P0';
		playerColor['N'] = 'N';
	} else {
		playerMap['U'] = 'P1';
		playerMap['A'] = 'P2';
		playerMap['N'] = 'P0';
		playerColor['U'] = 'G';
		playerColor['A'] = 'R';
		playerColor['N'] = 'N';
	}
	mostraPlayers();
}

function preloadImages() {
	//deck
	for (let i = 1; i < 21; i++) {
		var img = new Image();
		img.src = 'img/deck/f_' + i + '.jpg';
		img = new Image();
		img.src = 'img/deck/b_' + i + '.jpg';
	}
	for (let color of colors) {
		var img = new Image();
		img.src = 'img/B_' + color + '.png';
		img = new Image();
		img.src = 'img/CE_' + color + '.png';
		img = new Image();
		img.src = 'img/CO_' + color + '.png';
	}
	var img = new Image();
	img.src = 'img/B_N.png';
}

export function initPageTest() {
	document.getElementById('deckContainer').addEventListener('click', showMappa);
	document.getElementById('mappaContainer').addEventListener('click', hideMappa);
	//initDiminesions();
	hideMappa();
	//preloadImages();
}