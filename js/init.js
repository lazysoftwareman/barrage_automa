// @ts-check
import {
    addCentrale,
    addCondotta,
    addDiga,
    addGocciaDiga,
    addGocciaSorgente,
    azioneCostruisci,
    azioneCostruisciContinua,
    changePlayerSelected,
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
    resetInputs,
} from './barrage.js';
import { azioni, initMazzo, pesca } from './deck.js';
import { centraliFree, centraliPay, condotte, digheFree, dighePay, sorgenti } from './mappa.js';
import { hideMappa, initDiminesions, showMappa } from './view.js';

// @ts-ignore
window.initPage = initPage;

export const azioniPrincipali = [];
export const azioniContinua = [];

export function initPage() {
	resetInputs();
	initMazzo();
	addHandlers();
	addGlobalVariables();
	initDiminesions();
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
	document.getElementById('mappaSwitch').addEventListener('click', showMappa);
	document.getElementById('deckSwitch').addEventListener('click', hideMappa);
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