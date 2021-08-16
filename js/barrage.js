// @ts-check
import { carteCriteri, curCartaCriteri, resetMazzo } from './deck.js';
import {
    centraliCondotte,
    centraliFree,
    centraliPay,
    condotte,
    condotteCentrali,
    condotteDighe,
    condotteVal,
    digheCondotte,
    digheFree,
    dighePay,
    percorsi,
    percorsiDi,
} from './mappa.js';
import {
    getCapienzaDiga,
    getCentraliDiProprieta,
    getCondotteCheScaricanoInArea,
    getDigheDiProprieta,
    getDigheElevabili,
    getGocceInSorgente,
    getLivelloDiga,
    getNumeroCentrale,
    getNumeroDiga,
    getProprietarioCentrale,
    getProprietarioCondotta,
    getProprietarioDiga,
    getValoreCondottePerEscavatori,
    getZonaCentrale,
    getZonaCondotta,
    getZonaDiga,
    getZoneBasePerEscavatori,
    getZoneElevazioniPerBetoniere,
    intersecArray,
} from './provider.js';
import { chiediBetoniere, chiediEscavatori, mostraPlayerSelected, mostraRisultati, resetRisultati } from './view.js';


/////////////// INPUT
/**
 * @type {{ centrale: string, chi: string}[]}
 */
export let centraliCostruite = [];
/**
 * @type {{ condotta: string, chi: string}[]}
 */
export let condotteCostruite = [];
/**
 * @type {{ diga: string, chi: string, livello: number}[]}
 */
export let dighePresenti = [];
/**
 * @type {{ diga: string, gocce: number}[]}
 */
export let digheGocce = [];
/**
 * @type {{ sorgente: string, gocce: number}[]}
 */
export let sorgentiGocce = [];

export let playerMap = [];
export let playerColor = [];

export let actualResult = [];
export let playerSelected = undefined;
export let actualNumEscavatori = 0;
export let actualNumBetoniere = 0;
export let actualAzione = undefined;

export function resetInputs() {
	centraliCostruite = [];
	condotteCostruite = [];
	dighePresenti = [];
	digheGocce = [];
	sorgentiGocce = [];
	resetMazzo();
}

export function setNumEscavatori(num) {
	actualNumEscavatori = num;
}

export function setNumBetoniere(num) {
	actualNumBetoniere = num;
}

/////////////// BL CRITERI

/**
 * Esegue i primi check settando i primi filtri (cioè tutte le strutture disponibili) su actualResult.
 * Se non ce ne sono mostra un alert di avvertimento, altrimenti chiama il popup per richiedere le risorse.
 * Nel caso di una centrale invece chiama direttamente il metodo continuaCostruisci
 * @param {*} azione l'azione da svolgere
 */
export function azioneCostruisci(azione) {
	let automa;
	let automaCount = 0;
	actualResult = [];
	for (const player in playerMap) {
		if (player.startsWith('A')) {
			automaCount++;
		}
	}
	if (automaCount > 1) {
		if (!playerSelected || !playerSelected.startsWith('A')) {
			alert('Bisogna selezionare l\'automa che vuole costruire');
			return;
		} else {
			automa = playerSelected;
		}
	} else {
		automa = 'A';
	}
	if (!curCartaCriteri) {
		alert('Bisogna pescare una carta criteri affinché l\'automa possa costruire')
		return;
	}
	resetRisultati();
	actualAzione = azione;
	// faccio i check:
	// - se Diga controllo zona e chiedo escavatori
	// - se elevazione controllo zona e vedo se ci sono basi, se ci sono chiedo betoniere
	// - se condotta controllo min e max e chiedo escavatori
	// - se centrale non ci sono controlli a questo livello
	const cosa = azione.substr(1, azione.length - 1);
	let zona;
	let minCondotta;
	if (cosa.startsWith('D')) {
		// BASE
		if (cosa.length == 2) {
			zona = cosa.substr(1, 1);
		}
		// Controllo che in zona ci siano dighe costruibili. Se si o se !zona, chiedo escavatori
		actualResult = digheFree.concat(dighePay).filter(diga => !getProprietarioDiga(diga));
		if (zona) {
			let digheValide = getB_Zona(zona);
			if (digheValide.length == 0) {
				const zonaTesto = zona == 'M' ? 'montagna' : zona == 'C' ? 'collina' : 'pianura';
				alert('Non è possibile costruire una diga in ' + zonaTesto);
				return;
			} else {
				actualResult = intersecArray(actualResult, digheValide);
			}
		}
		chiediEscavatori();
		return;
	} else if (cosa.startsWith('E')) {
		// ELEVAZIONE
		// Controllo che ci siano dighe proprietarie. Se non ci sono alert, altrimenti chiedo betoniere
		const digheValide = getDigheElevabili(automa);
		if (digheValide.length == 0) {
			alert('Non ci sono dighe su cui costruire un\'elevazione');
			return;
		} else {
			actualResult = digheValide;
			chiediBetoniere();
			return;
		}
	} else if (cosa.startsWith('CO')) {
		// CONDOTTA
		if (cosa.length == 3) {
			minCondotta = cosa.substr(2, 1);
		}
		let condotteValide = condotte.filter(c => !getProprietarioCondotta(c));
		let testoDaAggiungere = '';
		if (minCondotta) {
			condotteValide = condotteValide.filter(c => condotteVal[c] >= +minCondotta);
			testoDaAggiungere = 'di questo tipo ';
		}
		if (condotteValide.length == 0) {
			alert('Non ci sono condotte ' + testoDaAggiungere + 'costruibili');
			return;
		} else {
			actualResult = condotteValide;
			chiediEscavatori();
			return;
		}
	} else if (cosa.startsWith('CE')) {
		actualResult = centraliFree.concat(centraliPay).filter(c => !getProprietarioCentrale(c));
		piazzamentoStruttura();
	} else if (cosa.startsWith('A')) {
		alert('Non ancora implementata la gestione delle abitazioni');
		return;
	} else {
		alert('Azione non valida: ' + azione);
		return;
	}
}

/**
 * Estrae i parametri per piazzamentoStruttura
 * @returns i parametri
 */
function estraiParametriCostruisci() {
	let automa;
	let automaCount = 0;
	for (const player in playerMap) {
		if (player.startsWith('A')) {
			automaCount++;
		}
	}
	automa = automaCount > 1 ? playerSelected : 'A';
	const azione = actualAzione;

	const cosa = azione.substr(1, azione.length - 1);
	let tipo;
	let zona;
	let minCondotta;
	let maxCondotta;
	if (cosa.startsWith('D')) {
		tipo = 'B';
		if (cosa.length == 2) {
			zona = cosa.substr(1, 1);
		}
	} else if (cosa.startsWith('E')) {
		tipo = 'E';
	} else if (cosa.startsWith('CO')) {
		tipo = 'CO';
		if (cosa.length == 3) {
			minCondotta = cosa.substr(2, 1);
		}
	} else if (cosa.startsWith('CE')) {
		tipo = 'CE';
	} else if (cosa.startsWith('A')) {
		tipo = 'A';
	} else {
		alert('Azione non valida: ' + azione);
		return undefined;
	}
	return { tipo: tipo, zona: zona, minCondotta: minCondotta, maxCondotta: maxCondotta, automa: automa };
}


/**
 * Effettua effettivamente l'azione di piazzamento struttura da costruire
 */
export function piazzamentoStruttura() {
	const parametri = estraiParametriCostruisci();
	if (!parametri) {
		return;
	}
	const tipo = parametri.tipo;
	const zona = parametri.zona;
	const minCondotta = parametri.minCondotta;
	const maxCondotta = parametri.maxCondotta;
	const automa = parametri.automa;
	if (tipo == 'A') {
		alert('Non ancora implementata la gestione delle abitazioni');
		return;
	}
	if (tipo == 'B') {
		const zoneDisponibili = getZoneBasePerEscavatori(actualNumEscavatori);
		if (zoneDisponibili.length == 0) {
			alert('Non è possibile costruire una base con quei pochi escavatori');
			return;
		}
		if (zona) {
			if (!zoneDisponibili.includes(zona)) {
				alert('Non è possibile costruire una base in quella zona con quei pochi escavatori');
				return;
			}
		}
		//Prima di chiamare getB_0_SistemaCompleto devo filtrare actualResult in base alle zoneDisponibili
		actualResult = actualResult.filter(diga => zoneDisponibili.includes(getZonaDiga(diga)));
		actualResult = getB_0_SistemaCompleto(automa);
	} else if (tipo == 'E') {
		const zoneDisponibili = getZoneElevazioniPerBetoniere(actualNumBetoniere);
		// devo filtrare actualResult in base alle zoneDisponibili
		actualResult = actualResult.filter(diga => zoneDisponibili.includes(getZonaDiga(diga)));
	} else if (tipo == 'CO') {
		// devo filtrare actualResult in base ai valori disponibili
		const valoreDisponibile = getValoreCondottePerEscavatori(actualNumEscavatori);
		actualResult = actualResult.filter(condotta => condotteVal[condotta] <= valoreDisponibile);
		actualResult = getCO_0_SistemaCompleto(automa);
	} else if (tipo == 'CE') {
		// ho già filtrato in base alle disponibili
		actualResult = getCE_0_SistemaCompleto(automa);
	}
	if (actualResult.length == 0) {
		// Nessun risultato. Poco probabile, ma possibile. Mostro l'alert e mi fermo
		alert('Non è possibile costruire questa struttura');
		return;
	} else if (actualResult.length > 0) {
		// Ci sono dei risultati, se 1, lo mostro e mi fermo qua
		if (actualResult.length == 1) {
			mostraRisultati();
			return;
		}
		else {
			// ho più di 2 risultati. Continuo filtraggio
			eseguiCriteri(tipo, minCondotta, maxCondotta, automa);
		}
	}
}

export function eseguiCriteri(tipo, minCondotta, maxCondotta, automa) {
	let criterioPasso = 0;
	const criteri = carteCriteri[curCartaCriteri].split("_");
	const ordine = criteri[criteri.length - 1];
	const prefix = tipo == 'B' || tipo == 'E' ? 'BE' : tipo;
	while (criterioPasso < 4) {
		criterioPasso++;
		let position = criterioPasso - 1;
		if (tipo == 'CO') {
			position += 4;
		} else if (tipo == 'CE') {
			position += 8;
		}
		const lettera = criteri[position];
		if (criterioPasso == 4) {
			actualResult = window['get' + prefix + '_Numero'](tipo, lettera, automa);
		} else {
			if (prefix == 'BE') {
				actualResult = window['getBE_' + lettera](tipo, automa, ordine);
			} else if (prefix == 'CO') {
				actualResult = window['getCO_' + lettera](minCondotta, maxCondotta, automa);
			} else {
				if (lettera.length == 1) {
					actualResult = window['getCE_' + lettera](automa);
				} else {
					if (lettera == 'OP') {
						actualResult = getCE_OP();
					} else {
						let numero = lettera.substr(1, 1);
						actualResult = getCE_P(numero);
					}
				}
			}
		}
		if (!actualResult || actualResult.length == 0) {
			// Nessun risultato. Poco probabile, ma possibile. Mostro l'alert e mi fermo
			alert('Non è possibile costruire questa struttura');
			return;
		} else if (actualResult.length > 0) {
			if (actualResult.length == 1) {
				mostraRisultati();
				return;
			} else {
				// Ci sono dei risultati multipli. Continuo a filtrare
				continue;
			}
		}
	}
	// Se finiti i criteri non ho risultati (poco probabile), mostro alert
	if (!actualResult || actualResult.length == 0) {
		alert('Non è possibile costruire la struttura selezionata')
	}
	// Finiti i criteri, resetto
	actualResult = [];
	mostraRisultati();
}

/**
 * BASE, zona.
 * Da applicare prima del primo criterio, quindi non c'è un prevFilter.
 * Se l'output è vuoto, ci si ferma qui. Se invece l'output è solo uno, si costruisce lì, altrimenti è un prevFilter
 * @param {string} zona la zona M, C, P
**/
export function getB_Zona(zona) {
	let dighe = [];
	if (zona == 'M') {
		dighe = ['DP_1', 'DF_1', 'DP_2', 'DF_2', 'DP_3', 'DF_3', 'DP_4', 'DF_4'];
	} else if (zona == 'C') {
		dighe = ['DP_5', 'DF_5', 'DP_6', 'DF_6', 'DP_7', 'DF_7'];
	}
	let digheValide = [];
	for (let i = 0; i < dighe.length; i++) {
		if (!getProprietarioDiga(dighe[i])) {
			digheValide.push(dighe[i]);
		}
	}
	return digheValide;
}

/**
 * BASE O ELEVAZIONE, completamento sistema, solo per BASE.
 * Da applicare come primo criterio, a parte quello della zona se c'è
 * @param {string} automa
**/
export function getB_0_SistemaCompleto(automa) {
	let centraliProprie = getCentraliDiProprieta(automa);
	if (centraliProprie.length == 0) {
		return actualResult ? actualResult : [];
	}
	let condotte = [];
	for (let i = 0; i < centraliProprie.length; i++) {
		let currCondotte = centraliCondotte[centraliProprie[i]];
		for (let j = 0; j < currCondotte.length; j++) {
			if (getProprietarioCondotta(currCondotte[j])) {
				condotte.push(currCondotte[j]);
			}
		}
	}
	let digheValide = [];
	for (let i = 0; i < condotte.length; i++) {
		let currDighe = condotteDighe[condotte[i]];
		for (let j = 0; j < currDighe.length; j++) {
			if (!getProprietarioDiga(currDighe[j])) {
				digheValide.push(currDighe[j]);
			}
		}
	}
	if (digheValide.length == 0) {
		return actualResult ? actualResult : [];
	} if (!actualResult || actualResult.length == 0) {
		return digheValide;
	} else {
		// intersezione
		return intersecArray(actualResult, digheValide);
	}
}

/**
 * BASE O ELEVAZIONE, diga collegabile a condotta più potente
 * tipo: 'B' o 'E' per Base o Elevazione
 * prevFilter: filtro precedente (se presente)
 * automa: l'automa da usare
 * @param {string} tipo
 * @param {string} automa
 */
export function getBE_A(tipo, automa, _ordine) {
	if (condotteCostruite.length == 0) {
		return actualResult ? actualResult : [];
	}
	condotteCostruite.sort(function (a, b) {
		if (condotteVal[a.condotta] != condotteVal[b.condotta]) {
			return condotteVal[b.condotta] - condotteVal[a.condotta];
		} else {
			let chiA = a.chi;
			let chiB = b.chi;
			if (chiA == automa) {
				return -1;
			} else {
				if (chiB == automa) {
					return 1;
				} else {
					return 0;
				}
			}
		}
	});
	let maxValue = []
	maxValue['M'] = -1;
	maxValue['C'] = -1;
	maxValue['P'] = -1;
	let actualChi = [];
	actualChi['M'] = '';
	actualChi['C'] = '';
	actualChi['P'] = '';
	let condotteFiltered = [];
	for (let i = 0; i < condotteCostruite.length; i++) {
		let condCos = condotteCostruite[i];
		let actualValue = condotteVal[condCos.condotta];
		let zona = getZonaCondotta(condCos.condotta);
		let first = false;
		if (maxValue[zona] < 0) {
			maxValue[zona] = actualValue;
			first = true;
		}
		if (actualChi[zona] == '') {
			actualChi[zona] = condCos.chi;
			first = true;
		}
		if (first) {
			condotteFiltered.push(condCos.condotta);
			continue;
		}
		// logica
		if (actualValue < maxValue[zona]) {
			// finito perchè non è la massima della zona, passo al successivo
			continue;
		} else {
			if (actualChi[zona] == automa && condCos.chi == automa) {
				condotteFiltered.push(condCos.condotta);
				continue;
			} else if (actualChi[zona] == automa && condCos.chi != automa) {
				// finito perchè precedenza all'automa
				continue;
			} else {
				// l'actualChi massimo è un utente o un altro automa, questo di sicuro va bene
				condotteFiltered.push(condCos.condotta);
				continue;
			}
		}
	}
	// Ora condotteFiltered contiene le condotte valide filtrate. In base al tipo (se B o E) troviamo le zone valide
	let digheValide = [];
	for (let i = 0; i < condotteFiltered.length; i++) {
		let collegate = condotteDighe[condotteFiltered[i]];
		if (tipo == 'B') {
			let d1 = collegate[0];
			if (!getProprietarioDiga(d1)) {
				digheValide.push(d1);
			}
			let d2 = collegate[1];
			if (!getProprietarioDiga(d2)) {
				digheValide.push(d2);
			}
		} else {
			let d1 = collegate[0];
			if (getProprietarioDiga(d1) && getProprietarioDiga(d1) == automa && getLivelloDiga(d1) < 3) {
				digheValide.push(d1);
			}
			let d2 = collegate[1];
			if (getProprietarioDiga(d2) && getProprietarioDiga(d2) == automa && getLivelloDiga(d2) < 3) {
				digheValide.push(d2);
			}
		}
	}
	if (digheValide.length == 0) {
		return actualResult ? actualResult : [];
	} if (!actualResult || actualResult.length == 0) {
		return digheValide;
	} else {
		// intersezione
		return intersecArray(actualResult, digheValide);
	}
}

/**
 * BASE O ELEVAZIONE, diga collegabile a propria centrale
 * tipo: 'B' o 'E' per Base o Elevazione
 * prevFilter: filtro precedente (se presente)
 * automa: l'automa da usare
 * @param {string} tipo
 * @param {string} automa
**/
export function getBE_B(tipo, automa, _ordine) {
	if (centraliCostruite.length == 0) {
		return actualResult ? actualResult : [];
	}
	let centraliProprie = getCentraliDiProprieta(automa);
	if (centraliProprie.length == 0) {
		return actualResult ? actualResult : [];
	}
	let condotte = [];
	for (let i = 0; i < centraliProprie.length; i++) {
		let currCondotte = centraliCondotte[centraliProprie[i]];
		for (let j = 0; j < currCondotte.length; j++) {
			condotte.push(currCondotte[j]);
		}
	}
	let dighe = [];
	for (let i = 0; i < condotte.length; i++) {
		let currDighe = condotteDighe[condotte[i]];
		for (let j = 0; j < currDighe.length; j++) {
			dighe.push(currDighe[j]);
		}
	}
	let digheValide = [];
	for (let i = 0; i < dighe.length; i++) {
		let diga = dighe[i];
		if (tipo == 'B') {
			if (!getProprietarioDiga(diga)) {
				digheValide.push(diga);
			}
		} else {
			if (getProprietarioDiga(diga) && getProprietarioDiga(diga) == automa && getLivelloDiga(diga) < 3) {
				digheValide.push(diga);
			}
		}
	}
	if (digheValide.length == 0) {
		return actualResult ? actualResult : [];
	} if (!actualResult || actualResult.length == 0) {
		return digheValide;
	} else {
		// intersezione
		return intersecArray(actualResult, digheValide);
	}
}

/**
 * BASE O ELEVAZIONE, costo addizionale
 * tipo: 'B' o 'E' per Base o Elevazione
 * prevFilter: filtro precedente (se presente)
 * automa: l'automa da usare
 * @param {string} tipo
 * @param {string} automa
**/
export function getBE_D(tipo, automa, _ordine) {
	let dighe = dighePay;
	let digheValide = [];
	for (let i = 0; i < dighe.length; i++) {
		let diga = dighe[i];
		if (tipo == 'B') {
			if (!getProprietarioDiga(diga)) {
				digheValide.push(diga);
			}
		} else {
			if (getProprietarioDiga(diga) && getProprietarioDiga(diga) == automa && getLivelloDiga(diga) < 3) {
				digheValide.push(diga);
			}
		}
	}
	if (digheValide.length == 0) {
		return actualResult ? actualResult : [];
	} if (!actualResult || actualResult.length == 0) {
		return digheValide;
	} else {
		// intersezione
		return intersecArray(actualResult, digheValide);
	}
}

/**
 * BASE O ELEVAZIONE, diga collegabile naturalmente a centrale
 * tipo: 'B' o 'E' per Base o Elevazione
 * prevFilter: filtro precedente (se presente)
 * automa: l'automa da usare
 * @param {string} tipo
 * @param {string} automa
**/
export function getBE_E(tipo, automa, _ordine) {
	if (centraliCostruite.length == 0) {
		return actualResult ? actualResult : [];
	}
	let digheValide = [];
	// le dighe sotto alle centrali esistenti
	for (let i = 0; i < centraliCostruite.length; i++) {
		let centrale = centraliCostruite[i].centrale;
		if (centrale.endsWith('11A') || centrale.endsWith('11B') ||
			centrale.endsWith('12') || centrale.endsWith('12A') ||
			centrale.endsWith('12B') || centrale.endsWith('12C')) {
			continue;
		}
		let secondoNumero = [];
		secondoNumero['5'] = '9';
		secondoNumero['6'] = '10';
		secondoNumero['7'] = '10';
		let numero = getNumeroCentrale(centrale);
		let digaF = 'DF_' + numero;
		let digaP = 'DP_' + numero;
		if (tipo == 'B') {
			if (!getProprietarioDiga(digaP)) {
				if (!digheValide.includes(digaP)) {
					digheValide.push(digaP);
				}
			} else {
				continue;
			}
			if (!getProprietarioDiga(digaF)) {
				if (!digheValide.includes(digaF)) {
					digheValide.push(digaF);
				}
			} else {
				continue;
			}
			if (secondoNumero[numero]) {
				numero = secondoNumero[numero];
				digaF = 'DF_' + numero;
				digaP = 'DP_' + numero;
				if (!getProprietarioDiga(digaP)) {
					if (!digheValide.includes(digaP)) {
						digheValide.push(digaP);
					}
				} else {
					continue;
				}
				if (!getProprietarioDiga(digaF)) {
					if (!digheValide.includes(digaF)) {
						digheValide.push(digaF);
					}
				} else {
					continue;
				}
			}
		} else {
			if (getProprietarioDiga(digaP)) {
				if (getProprietarioDiga(digaP) == automa && getLivelloDiga(digaP) < 3) {
					if (!digheValide.includes(digaP)) {
						digheValide.push(digaP);
					}
				} else {
					continue;
				}
			}
			if (getProprietarioDiga(digaF)) {
				if (getProprietarioDiga(digaF) == automa && getLivelloDiga(digaF) < 3) {
					if (!digheValide.includes(digaF)) {
						digheValide.push(digaF);
					}
				} else {
					continue;
				}
			}
			if (secondoNumero[numero]) {
				numero = secondoNumero[numero];
				digaF = 'DF_' + numero;
				digaP = 'DP_' + numero;
				if (getProprietarioDiga(digaP)) {
					if (getProprietarioDiga(digaP) == automa && getLivelloDiga(digaP) < 3) {
						if (!digheValide.includes(digaP)) {
							digheValide.push(digaP);
						}
					} else {
						continue;
					}
				}
				if (getProprietarioDiga(digaF)) {
					if (getProprietarioDiga(digaF) == automa && getLivelloDiga(digaF) < 3) {
						if (!digheValide.includes(digaF)) {
							digheValide.push(digaF);
						}
					} else {
						continue;
					}
				}
			}
		}
	}
	if (digheValide.length == 0) {
		return actualResult ? actualResult : [];
	} if (!actualResult || actualResult.length == 0) {
		return digheValide;
	} else {
		// intersezione
		return intersecArray(actualResult, digheValide);
	}
}

/**
 * BASE O ELEVAZIONE, diga collegabile tramite condotta a propria diga o non collegabile a diga avversaria
 * tipo: 'B' o 'E' per Base o Elevazione
 * prevFilter: filtro precedente (se presente)
 * automa: l'automa da usare
 * @param {string} tipo
 * @param {string} automa
**/
export function getBE_F(tipo, automa, _ordine) {
	// i numeri destinazione sono dal 5 al 12
	// cerco le condotte che portano lì e vedo quali di queste zone hanno dighe dell'automa o naturali o non ci sono dighe
	// (guardando prima la P, se vuota, guardo la F)
	// se soddisfano tutto, queste condotte sono valide. Guardo allora le dighe collegate in base al tipo, come al solito
	let condotteValide = [];
	for (let i = 5; i < 13; i++) {
		let areaNum = '' + i;
		let digaP = 'DP_' + areaNum;
		let digaF = 'DF_' + areaNum;
		if (!getProprietarioDiga(digaP)) {
			if (!getProprietarioDiga(digaF) || getProprietarioDiga(digaF) == automa || getProprietarioDiga(digaF) == 'N') {
				// condotte valide
				let condotte = getCondotteCheScaricanoInArea(areaNum);
				for (let cond of condotte) {
					condotteValide.push(cond);
				}
			}
		} else if (getProprietarioDiga(digaP) == automa || getProprietarioDiga(digaP) == 'N') {
			// condotte valide
			let condotte = getCondotteCheScaricanoInArea(areaNum);
			for (let cond of condotte) {
				condotteValide.push(cond);
			}
		}
	}

	// ora ho le condotte valide
	let dighe = [];
	for (let i = 0; i < condotteValide.length; i++) {
		let currDighe = condotteDighe[condotteValide[i]];
		for (let j = 0; j < currDighe.length; j++) {
			if (!dighe.includes(currDighe[j])) {
				dighe.push(currDighe[j]);
			}
		}
	}
	let digheValide = [];
	for (let i = 0; i < dighe.length; i++) {
		let diga = dighe[i];
		if (tipo == 'B') {
			if (!getProprietarioDiga(diga)) {
				digheValide.push(diga);
			}
		} else {
			if (getProprietarioDiga(diga) && getProprietarioDiga(diga) == automa && getLivelloDiga(diga) < 3) {
				digheValide.push(diga);
			}
		}
	}
	if (digheValide.length == 0) {
		return actualResult ? actualResult : [];
	} if (!actualResult || actualResult.length == 0) {
		return digheValide;
	} else {
		// intersezione
		return intersecArray(actualResult, digheValide);
	}
}

/**
 * BASE O ELEVAZIONE, diga collegabile naturalmente a centrale
 * tipo: 'B' o 'E' per Base o Elevazione
 * prevFilter: filtro precedente (se presente)
 * automa: l'automa da usare
 * @param {string} tipo
 * @param {string} automa
 * @param {string} ordine del tipo ACD o BAC
 */
export function getBE_C(tipo, automa, ordine) {
	let sorgentiPiene = [];
	for (let i = 0; i < sorgentiGocce.length; i++) {
		let sorg = sorgentiGocce[i];
		if (sorg.gocce > 0) {
			sorgentiPiene.push(sorg.sorgente);
		}
	}
	let dighe = [];
	if (sorgentiPiene.length == 0) {
		// tutto vuoto, devo andare per ordine
		let sorgenteValida = ordine.substr(0, 1);
		let percorso = percorsi[sorgenteValida];
		for (let i = 1; i < percorso.length - 1; i++) {
			let areaNumero = percorso[i];
			dighe.push('DP_' + areaNumero);
			dighe.push('DF_' + areaNumero);
		}
	} else {
		let digheGoccePot = [];
		for (let i = 0; i < sorgentiPiene.length; i++) {
			let sorgente = sorgentiPiene[i];
			let gocce = getGocceInSorgente(sorgente);
			let percorso = percorsi[sorgente];
			for (let j = 1; j < percorso.length - 1; j++) {
				let areaNumero = percorso[j];
				let digaP = 'DP_' + areaNumero;
				let digaF = 'DF_' + areaNumero;
				digheGoccePot.push({ diga: digaP, gocce: gocce });
				if (gocce == 0) {
					digheGoccePot.push({ diga: digaF, gocce: gocce });
				} else {
					let capienzaP = getCapienzaDiga(digaP);
					gocce = (gocce - capienzaP) > 0 ? (gocce - capienzaP) : 0;
					digheGoccePot.push({ diga: digaF, gocce: gocce });
					if (gocce > 0) {
						let capienzaF = getCapienzaDiga(digaF);
						gocce = gocce - capienzaF > 0 ? gocce - capienzaF : 0;
					}
				}

			}
		}
		let digheMaxGocce = [];
		digheGoccePot.sort(function (a, b) {
			return b.gocce - a.gocce;
		});
		let maxGocce = -1;
		for (let i = 0; i < digheGoccePot.length; i++) {
			let digaGoc = digheGoccePot[i];
			if (digaGoc.gocce < maxGocce) {
				break;
			} else {
				digheMaxGocce.push(digaGoc.diga);
				maxGocce = digaGoc.gocce;
			}
		}
		if (digheMaxGocce.length > 0) {
			if (digheMaxGocce.length == 1) {
				dighe.push(digheMaxGocce[0]);
			} else {
				for (let j = 0; j < ordine.length; j++) {
					let sorgente = ordine.substr(j, 1);
					for (let i = 0; i < digheMaxGocce.length; i++) {
						let diga = digheMaxGocce[i];
						let numero = getNumeroDiga(diga);
						let percorso = percorsiDi[numero][0];
						if (percorso == sorgente) {
							dighe.push(diga);
						}
					}
					if (dighe.length > 0) {
						break;
					}
				}
			}
		}
	}
	let digheValide = [];
	for (let i = 0; i < dighe.length; i++) {
		let diga = dighe[i];
		if (tipo == 'B') {
			if (!getProprietarioDiga(diga)) {
				digheValide.push(diga);
			}
		} else {
			if (getProprietarioDiga(diga) && getProprietarioDiga(diga) == automa && getLivelloDiga(diga) < 3) {
				digheValide.push(diga);
			}
		}
	}
	if (digheValide.length == 0) {
		return actualResult ? actualResult : [];
	} if (!actualResult || actualResult.length == 0) {
		return digheValide;
	} else {
		// intersezione
		return intersecArray(actualResult, digheValide);
	}
}

/**
 * BASE O ELEVAZIONE, numero
 * tipo: 'B' o 'E' per Base o Elevazione
 * prevFilter: filtro precedente (se presente)
 * automa: l'automa da usare
 * @param {string} numero primo numero da cui partire
 */
export function getBE_Numero(tipo, numero, automa) {
	if (!actualResult || actualResult.length == 0) {
		// Non ho trovato niente di valido finora. Considero tutte come valide
		actualResult = [];
		for (const diga of digheFree.concat(dighePay)) {
			if (tipo == 'B') {
				if (!getProprietarioDiga(diga)) {
					actualResult.push(diga);
				}
			} else {
				if (getProprietarioDiga(diga) && getProprietarioDiga(diga) == automa && getLivelloDiga(diga) < 3) {
					actualResult.push(diga);
				}
			}
		}
	}
	let counter = 0;
	let actual = +numero;
	while (counter < 10) {
		actual = actual + counter;
		if (actual > 10) {
			actual = 1;
		}
		let digaF = 'DF_' + actual;
		if (actualResult.includes(digaF)) {
			return [digaF];
		}
		let digaP = 'DP_' + actual;
		if (actualResult.includes(digaP)) {
			return [digaP];
		}
		counter++;
	}
	return [];
}

/**
 * CONDOTTA, completamento sistema
 * Da applicare come primo criterio
 * @param {string} automa
**/
export function getCO_0_SistemaCompleto(automa) {
	let centraliProprie = getCentraliDiProprieta(automa);
	if (centraliProprie.length == 0) {
		return actualResult ? actualResult : [];
	}
	let condotte = [];
	for (let i = 0; i < centraliProprie.length; i++) {
		let currCondotte = centraliCondotte[centraliProprie[i]];
		for (let j = 0; j < currCondotte.length; j++) {
			if (!getProprietarioCondotta(currCondotte[j])) {
				condotte.push(currCondotte[j]);
			}
		}
	}
	let condotteValide = [];
	for (const condotta of condotte) {
		let currDighe = condotteDighe[condotta];
		for (const diga of currDighe) {
			if (getProprietarioDiga(diga) &&
				(getProprietarioDiga(diga) == automa || getProprietarioDiga(diga) == 'N')) {
				condotteValide.push(condotta);
				break;
			}
		}
	}
	if (condotteValide.length == 0) {
		return actualResult ? actualResult : [];
	} if (!actualResult || actualResult.length == 0) {
		return condotteValide;
	} else {
		// intersezione
		return intersecArray(actualResult, condotteValide);
	}
}

/**
 * CONDOTTA, numero
 * @param {string} numeroLettera primo numero da cui partire (tipo 7B)
 */
export function getCO_Numero(_tipo, numeroLettera, _automa) {
	if (!actualResult || actualResult.length == 0) {
		// Non ho trovato niente di valido finora. Considero tutte come valide
		actualResult = [];
		for (const condotta of condotte) {
			if (!getProprietarioCondotta(condotta)) {
				actualResult.push(condotta);
			}
		}
	}
	let counter = 0;
	let numero = numeroLettera.substring(0, numeroLettera.length - 1);
	let lettera = numeroLettera.substr(numeroLettera.length - 1, 1);
	let actual = +numero;
	while (counter < 10) {
		actual = actual + counter;
		if (actual > 10) {
			actual = 1;
		}
		if (lettera == 'A') {
			let condottaA = 'C_' + actual + 'A';
			if (!actualResult) {
				actualResult = [];
			}
			if (actualResult.includes(condottaA)) {
				return [condottaA];
			}
		}
		let condottaB = 'C_' + actual + 'B';
		if (!actualResult) {
			actualResult = [];
		}
		if (actualResult.includes(condottaB)) {
			return [condottaB];
		}
		lettera = 'A';
		counter++;
	}
	return [];
}

function isCondottaCostruibile(condotta, min, max) {
	if (!getProprietarioCondotta(condotta)) {
		if (min) {
			if (condotteVal[condotta] < +min) {
				// Non valida
				return false;
			}
		}
		if (max) {
			if (condotteVal[condotta] > +max) {
				// Non valida
				return false;
			}
		}
		return true;;
	}
	return false;
}

/**
 * CONDOTTA: massimo valore disponibile
 * @param {string} min valore minimo condotta
 * @param {string} max valore massimo condotta
 * @param {string} automa automa
 * @returns 
 */
export function getCO_G(min, max, automa) {
	const condotteDisp = [];
	for (const condotta of condotte) {
		if (isCondottaCostruibile(condotta, min, max)) {
			condotteDisp.push(condotta);
		} else {
			continue;
		}
	}
	if (condotteDisp.length == 0) {
		return actualResult ? actualResult : [];
	}
	condotteDisp.sort((a, b) => {
		return condotteVal[b] - condotteVal[a]
	});
	const condotteValide = [];
	let maxVal = -1;
	for (const condotta of condotteDisp) {
		if (maxVal == -1 || maxVal == condotteVal[condotta]) {
			maxVal = condotteVal[condotta];
			condotteValide.push(condotta);
		} else if (condotteVal[condotta] < maxVal) {
			break;
		}
	}
	if (condotteValide.length == 0) {
		return actualResult ? actualResult : [];
	} if (!actualResult || actualResult.length == 0) {
		return condotteValide;
	} else {
		// intersezione
		return intersecArray(actualResult, condotteValide);
	}
}

/**
 * CONDOTTA: quasi massimo valore disponibile. Se non presente, massimo
 * @param {string} min valore minimo condotta
 * @param {string} max valore massimo condotta
 * @param {string} automa automa
 * @returns 
 */
export function getCO_H(min, max, automa) {
	const condotteDisp = [];
	for (const condotta of condotte) {
		if (isCondottaCostruibile(condotta, min, max)) {
			condotteDisp.push(condotta);
		} else {
			continue;
		}
	}
	if (condotteDisp.length == 0) {
		return actualResult ? actualResult : [];
	}
	condotteDisp.sort((a, b) => {
		return condotteVal[b] - condotteVal[a]
	});
	const condotteMax = [];
	const condottePenMax = [];
	let maxVal = -1;
	let penMaxVal = -1
	for (const condotta of condotteDisp) {
		if (maxVal == -1 || maxVal == condotteVal[condotta]) {
			maxVal = condotteVal[condotta];
			condotteMax.push(condotta);
		} else if (penMaxVal == -1 || penMaxVal == condotteVal[condotta]) {
			penMaxVal = condotteVal[condotta];
			condottePenMax.push(condotta);
		} else {
			break;
		}
	}
	const condotteValide = condottePenMax.length > 0 ? condottePenMax : condotteMax;
	if (condotteValide.length == 0) {
		return actualResult ? actualResult : [];
	} if (!actualResult || actualResult.length == 0) {
		return condotteValide;
	} else {
		// intersezione
		return intersecArray(actualResult, condotteValide);
	}
}

/**
 * CONDOTTA - collegata a una diga già costruita propria / neutrale / avversaria
 * @param {string} min 
 * @param {string} max 
 * @param {string} automa 
 * @returns risultati
 */
export function getCO_I(min, max, automa) {
	const digheProprie = [];
	const digheNaturali = [];
	const digheAvversarie = [];
	for (const diga of digheFree.concat(dighePay)) {
		if (getProprietarioDiga(diga)) {
			if (getProprietarioDiga(diga) == automa) {
				digheProprie.push(diga);
			} else if (getProprietarioDiga(diga) == 'N') {
				digheNaturali.push(diga);
			} else {
				digheAvversarie.push(diga);
			}
		}
	}
	const condotteProprie = [];
	const condotteNaturali = [];
	const condotteAvversarie = [];
	for (const diga of digheProprie) {
		const condotte = digheCondotte[diga];
		for (const condotta of condotte) {
			if (isCondottaCostruibile(condotta, min, max)) {
				condotteProprie.push(condotta);
			} else {
				continue;
			}
		}
	}
	for (const diga of digheNaturali) {
		const condotte = digheCondotte[diga];
		for (const condotta of condotte) {
			if (isCondottaCostruibile(condotta, min, max)) {
				condotteNaturali.push(condotta);
			} else {
				continue;
			}
		}
	}
	for (const diga of digheAvversarie) {
		const condotte = digheCondotte[diga];
		for (const condotta of condotte) {
			if (isCondottaCostruibile(condotta, min, max)) {
				condotteAvversarie.push(condotta);
			} else {
				continue;
			}
		}
	}
	// Per ogni valore devo prendere quelle di priorità maggiore
	// (tipo se per il valore 3 ci sono 0 cond proprie, 2 naturali e 1 avversaria, ritorno le 2 naturali e basta)
	const condPerNumero = [];
	let valoriOccupati = [];
	for (const cond of condotteProprie) {
		const val = condotteVal[cond];
		if (!condPerNumero['' + val]) {
			condPerNumero['' + val] = [];
			valoriOccupati.push('' + val);
		}
		condPerNumero['' + val].push(cond);
	}
	let altriValori = [];
	for (const cond of condotteNaturali) {
		const val = condotteVal[cond];
		if (!valoriOccupati.includes('' + val)) {
			if (!condPerNumero['' + val]) {
				condPerNumero['' + val] = [];
				altriValori.push(cond);
			}
			condPerNumero['' + val].push(cond);
		}
	}
	valoriOccupati = valoriOccupati.concat(altriValori);
	for (const cond of condotteAvversarie) {
		const val = condotteVal[cond];
		if (!valoriOccupati.includes('' + val)) {
			if (!condPerNumero['' + val]) {
				condPerNumero['' + val] = [];
			}
			condPerNumero['' + val].push(cond);
		}
	}
	const condotteValide = [];
	for (const val in condPerNumero) {
		for (const condotta of condPerNumero[val]) {
			condotteValide.push(condotta);
		}
	}
	if (condotteValide.length == 0) {
		return actualResult ? actualResult : [];
	} if (!actualResult || actualResult.length == 0) {
		return condotteValide;
	} else {
		// intersezione
		return intersecArray(actualResult, condotteValide);
	}
}

/**
 * CONDOTTA - collegata a una centrale già costruita propria / avversaria
 * @param {string} min 
 * @param {string} max 
 * @param {string} automa 
 * @returns risultati
 */
export function getCO_J(min, max, automa) {
	const centraliProprie = [];
	const centraliAvversarie = [];
	for (const centrale of centraliFree.concat(centraliPay)) {
		if (getProprietarioCentrale(centrale)) {
			if (getProprietarioCentrale(centrale) == automa) {
				centraliProprie.push(centrale);
			} else {
				centraliAvversarie.push(centrale);
			}
		}
	}
	const condotteProprie = [];
	const condotteAvversarie = [];
	for (const centrale of centraliProprie) {
		const condotte = centraliCondotte[centrale];
		for (const condotta of condotte) {
			if (isCondottaCostruibile(condotta, min, max)) {
				condotteProprie.push(condotta);
			} else {
				continue;
			}
		}
	}
	for (const centrale of centraliAvversarie) {
		const condotte = centraliCondotte[centrale];
		for (const condotta of condotte) {
			if (isCondottaCostruibile(condotta, min, max)) {
				condotteAvversarie.push(condotta);
			} else {
				continue;
			}
		}
	}
	// Per ogni valore devo prendere quelle di priorità maggiore
	// (tipo se per il valore 3 ci sono 2 cond proprie e 1 avversaria, ritorno le 2 proprie e basta)
	const condPerNumero = [];
	let valoriOccupati = [];
	for (const cond of condotteProprie) {
		const val = condotteVal[cond];
		if (!condPerNumero['' + val]) {
			condPerNumero['' + val] = [];
			valoriOccupati.push('' + val);
		}
		condPerNumero['' + val].push(cond);
	}
	for (const cond of condotteAvversarie) {
		const val = condotteVal[cond];
		if (!valoriOccupati.includes('' + val)) {
			if (!condPerNumero['' + val]) {
				condPerNumero['' + val] = [];
			}
			condPerNumero['' + val].push(cond);
		}
	}
	const condotteValide = [];
	for (const val in condPerNumero) {
		for (const condotta of condPerNumero[val]) {
			condotteValide.push(condotta);
		}
	}
	if (condotteValide.length == 0) {
		return actualResult ? actualResult : [];
	} if (!actualResult || actualResult.length == 0) {
		return condotteValide;
	} else {
		// intersezione
		return intersecArray(actualResult, condotteValide);
	}
}

/**
 * CONDOTTA - collegata a una diga già costruita avversaria / neutrale / propria
 * @param {string} min 
 * @param {string} max 
 * @param {string} automa 
 * @returns risultati
 */
export function getCO_K(min, max, automa) {
	const digheProprie = [];
	const digheNaturali = [];
	const digheAvversarie = [];
	for (const diga of digheFree.concat(dighePay)) {
		if (getProprietarioDiga(diga)) {
			if (getProprietarioDiga(diga) == automa) {
				digheProprie.push(diga);
			} else if (getProprietarioDiga(diga) == 'N') {
				digheNaturali.push(diga);
			} else {
				digheAvversarie.push(diga);
			}
		}
	}
	const condotteProprie = [];
	const condotteNaturali = [];
	const condotteAvversarie = [];
	for (const diga of digheProprie) {
		const condotte = digheCondotte[diga];
		for (const condotta of condotte) {
			if (isCondottaCostruibile(condotta, min, max)) {
				condotteProprie.push(condotta);
			} else {
				continue;
			}
		}
	}
	for (const diga of digheNaturali) {
		const condotte = digheCondotte[diga];
		for (const condotta of condotte) {
			if (isCondottaCostruibile(condotta, min, max)) {
				condotteNaturali.push(condotta);
			} else {
				continue;
			}
		}
	}
	for (const diga of digheAvversarie) {
		const condotte = digheCondotte[diga];
		for (const condotta of condotte) {
			if (isCondottaCostruibile(condotta, min, max)) {
				condotteAvversarie.push(condotta);
			} else {
				continue;
			}
		}
	}
	// Per ogni valore devo prendere quelle di priorità maggiore
	// (tipo se per il valore 3 ci sono 0 cond proprie, 2 naturali e 1 avversaria, ritorno l'avvesaria e basta)
	const condPerNumero = [];
	let valoriOccupati = [];
	for (const cond of condotteAvversarie) {
		const val = condotteVal[cond];
		if (!condPerNumero['' + val]) {
			condPerNumero['' + val] = [];
			valoriOccupati.push('' + val);
		}
		condPerNumero['' + val].push(cond);
	}
	let altriValori = [];
	for (const cond of condotteNaturali) {
		const val = condotteVal[cond];
		if (!valoriOccupati.includes('' + val)) {
			if (!condPerNumero['' + val]) {
				condPerNumero['' + val] = [];
				altriValori.push(cond);
			}
			condPerNumero['' + val].push(cond);
		}
	}
	valoriOccupati = valoriOccupati.concat(altriValori);
	for (const cond of condotteProprie) {
		const val = condotteVal[cond];
		if (!valoriOccupati.includes('' + val)) {
			if (!condPerNumero['' + val]) {
				condPerNumero['' + val] = [];
			}
			condPerNumero['' + val].push(cond);
		}
	}
	const condotteValide = [];
	for (const val in condPerNumero) {
		for (const condotta of condPerNumero[val]) {
			condotteValide.push(condotta);
		}
	}
	if (condotteValide.length == 0) {
		return actualResult ? actualResult : [];
	} if (!actualResult || actualResult.length == 0) {
		return condotteValide;
	} else {
		// intersezione
		return intersecArray(actualResult, condotteValide);
	}
}

/**
 * CONDOTTA - collegata a una centrale già costruita avversaria / propria
 * @param {string} min 
 * @param {string} max 
 * @param {string} automa 
 * @returns risultati
 */
export function getCO_L(min, max, automa) {
	const centraliProprie = [];
	const centraliAvversarie = [];
	for (const centrale of centraliFree.concat(centraliPay)) {
		if (getProprietarioCentrale(centrale)) {
			if (getProprietarioCentrale(centrale) == automa) {
				centraliProprie.push(centrale);
			} else {
				centraliAvversarie.push(centrale);
			}
		}
	}
	const condotteProprie = [];
	const condotteAvversarie = [];
	for (const centrale of centraliProprie) {
		const condotte = centraliCondotte[centrale];
		for (const condotta of condotte) {
			if (isCondottaCostruibile(condotta, min, max)) {
				condotteProprie.push(condotta);
			} else {
				continue;
			}
		}
	}
	for (const centrale of centraliAvversarie) {
		const condotte = centraliCondotte[centrale];
		for (const condotta of condotte) {
			if (isCondottaCostruibile(condotta, min, max)) {
				condotteAvversarie.push(condotta);
			} else {
				continue;
			}
		}
	}
	// Per ogni valore devo prendere quelle di priorità maggiore
	// (tipo se per il valore 3 ci sono 2 cond proprie e 1 avversaria, ritorno quella avversaria e basta)
	const condPerNumero = [];
	let valoriOccupati = [];
	for (const cond of condotteAvversarie) {
		const val = condotteVal[cond];
		if (!condPerNumero['' + val]) {
			condPerNumero['' + val] = [];
			valoriOccupati.push('' + val);
		}
		condPerNumero['' + val].push(cond);
	}
	for (const cond of condotteProprie) {
		const val = condotteVal[cond];
		if (!valoriOccupati.includes('' + val)) {
			if (!condPerNumero['' + val]) {
				condPerNumero['' + val] = [];
			}
			condPerNumero['' + val].push(cond);
		}
	}
	const condotteValide = [];
	for (const val in condPerNumero) {
		for (const condotta of condPerNumero[val]) {
			condotteValide.push(condotta);
		}
	}
	if (condotteValide.length == 0) {
		return actualResult ? actualResult : [];
	} if (!actualResult || actualResult.length == 0) {
		return condotteValide;
	} else {
		// intersezione
		return intersecArray(actualResult, condotteValide);
	}
}


export function getCE_0_SistemaCompleto(automa) {
	// FIXME occhio che qua fixato 
	const dighe = [];
	for (const diga of digheFree.concat(dighePay)) {
		if (getProprietarioDiga(diga)) {
			if (getProprietarioDiga(diga) == automa || getProprietarioDiga(diga) == 'N') {
				dighe.push(diga);
			}
		}
	}
	const condotte = [];
	for (const diga of dighe) {
		const conds = digheCondotte[diga];
		for (const condotta of conds) {
			if (getProprietarioCondotta(condotta)) {
				condotte.push(condotta);
			}
		}
	}
	const centraliProprieNumero = getCentraliDiProprieta(automa).map(centrale => getNumeroCentrale(centrale));
	const centraliValide = [];
	for (const condotta of condotte) {
		const centrali = condotteCentrali[condotta];
		for (const centrale of centrali) {
			// Se l'automa ha già una centrale in un gruppo, non si conta
			if (!getProprietarioCentrale(centrale) && !centraliProprieNumero.includes(getNumeroCentrale(centrale))) {
				centraliValide.push(centrale);
			}
		}
	}
	if (centraliValide.length == 0) {
		return actualResult ? actualResult : [];
	} if (!actualResult || actualResult.length == 0) {
		return centraliValide;
	} else {
		// intersezione
		return intersecArray(actualResult, centraliValide);
	}
}

export function getCE_Numero(_tipo, numero, _automa) {
	if (!actualResult || actualResult.length == 0) {
		// Non ho trovato niente di valido finora. Considero tutte come valide
		actualResult = [];
		for (const centrale of centraliFree.concat(centraliPay)) {
			if (!getProprietarioCentrale(centrale)) {
				actualResult.push(centrale);
			}
		}
	}
	let counter = 0;
	let actual = +numero;
	while (counter < 12) {
		actual = actual + counter;
		if (actual > 12) {
			actual = 5;
		}
		if (centraliFree.includes('CF_' + actual)) {
			let centrale = 'CF_' + actual;
			if (actualResult.includes(centrale)) {
				return [centrale];
			}
		} else if (centraliFree.includes('CF_' + actual + 'A')) {
			let centrale = 'CF_' + actual + 'A';
			if (actualResult.includes(centrale)) {
				return [centrale];
			}
		} else if (centraliFree.includes('CF_' + actual + 'B')) {
			let centrale = 'CF_' + actual + 'B';
			if (actualResult.includes(centrale)) {
				return [centrale];
			}
		} else if (centraliPay.includes('CP_' + actual)) {
			let centrale = 'CP_' + actual;
			if (actualResult.includes(centrale)) {
				return [centrale];
			}
		} else if (centraliPay.includes('CP_' + actual + 'A')) {
			let centrale = 'CP_' + actual + 'A';
			if (actualResult.includes(centrale)) {
				return [centrale];
			}
		} else if (centraliPay.includes('CP_' + actual + 'B')) {
			let centrale = 'CP_' + actual + 'B';
			if (actualResult.includes(centrale)) {
				return [centrale];
			}
		} else if (centraliPay.includes('CP_' + actual + 'C')) {
			let centrale = 'CP_' + actual + 'C';
			if (actualResult.includes(centrale)) {
				return [centrale];
			}
		}
		counter++;
	}
	return [];
}

/**
 * CENTRALI: collegate alla condotta più potente già costruita
 * @param {string} automa 
 */
export function getCE_M(automa) {
	const conds = [];
	for (const condotta of condotte) {
		if (getProprietarioCondotta(condotta)) {
			const centrs = condotteCentrali[condotta];
			for (const centrale of centrs) {
				if (!getProprietarioCentrale(centrale)) {
					conds.push(condotta);
					break;
				}
			}
		}
	}
	conds.sort((a, b) => {
		return condotteVal[b] - condotteVal[a]
	});
	const condotteMax = [];
	let maxVal = -1;
	for (const condotta of conds) {
		if (maxVal == -1 || maxVal == condotteVal[condotta]) {
			maxVal = condotteVal[condotta];
			condotteMax.push(condotta);
		} else {
			break;
		}
	}
	const centraliValide = [];
	for (const condotta of condotteMax) {
		if (getProprietarioCondotta(condotta) == automa) {
			const centrs = condotteCentrali[condotta];
			for (const centrale of centrs) {
				if (!getProprietarioCentrale(centrale)) {
					centraliValide.push(condotta);
				}
			}
		}
	}
	if (centraliValide.length == 0) {
		for (const condotta of condotteMax) {
			const centrs = condotteCentrali[condotta];
			for (const centrale of centrs) {
				if (!getProprietarioCentrale(centrale)) {
					centraliValide.push(condotta);
				}

			}
		}
	}
	if (centraliValide.length == 0) {
		return actualResult ? actualResult : [];
	} if (!actualResult || actualResult.length == 0) {
		return centraliValide;
	} else {
		// intersezione
		return intersecArray(actualResult, centraliValide);
	}
}

/**
 * CENTRALI: collegate a una DIGA PROPRIA
 * @param {string} automa 
 * @returns rislutati
 */
export function getCE_N(automa) {
	const dighe = getDigheDiProprieta(automa);
	const conds = [];
	for (const diga of dighe) {
		const condottes = digheCondotte[diga];
		for (const condotta of condottes) {
			conds.push(condotta);
		}
	}
	const centraliValide = [];
	for (const condotta of conds) {
		const centrali = condotteCentrali[condotta];
		for (const centrale of centrali) {
			if (!getProprietarioCentrale(centrale)) {
				centraliValide.push(centrale);
			}
		}
	}
	if (centraliValide.length == 0) {
		return actualResult ? actualResult : [];
	} if (!actualResult || actualResult.length == 0) {
		return centraliValide;
	} else {
		// intersezione
		return intersecArray(actualResult, centraliValide);
	}
}

/**
 * CENTRALI: una centrale in pianura
 * @returns risultati
 */
export function getCE_OP() {
	const centraliValide = centraliFree.concat(centraliPay).filter(c => getZonaCentrale(c) == 'P' && !getProprietarioCentrale(c));
	if (centraliValide.length == 0) {
		return actualResult ? actualResult : [];
	} if (!actualResult || actualResult.length == 0) {
		return centraliValide;
	} else {
		// intersezione
		return intersecArray(actualResult, centraliValide);
	}
}

/**
 * CENTRALI: una centrale in pianura
 * @param {string} numero
 * @returns risultati
 */
export function getCE_P(numero) {
	const centraliValide = centraliFree.concat(centraliPay).filter(c => c.substr(3, 1) == numero && !getProprietarioCentrale(c));
	if (centraliValide.length == 0) {
		return actualResult ? actualResult : [];
	} if (!actualResult || actualResult.length == 0) {
		return centraliValide;
	} else {
		// intersezione
		return intersecArray(actualResult, centraliValide);
	}
}

/**
 * CENTRALI: una centrale che scarica acqua in una propria diga O non scarica in una diga avversaria
 * @param {string} automa 
 * @returns risultati
 */
export function getCE_Q(automa) {
	let centrali = centraliFree.concat(centraliPay).filter(c => {
		let numero = c.substr(3, 1);
		if (+numero >= 5 && +numero < 10) {
			return true;
		}
		numero = c.substr(3, 2);
		return numero == '10' || numero == '11' || numero == '12';
	});
	centrali = centrali.filter(c => !getProprietarioCentrale(c));
	const secondoNumero = [];
	secondoNumero['5'] = '9';
	secondoNumero['6'] = '10';
	secondoNumero['7'] = '10';
	const centraliValide = [];
	// centrale che scarica in una propria diga:
	// deve essere dal 5 al 10
	for (const centrale of centrali) {
		const numero = getNumeroCentrale(centrale);
		if (numero == '11' || numero == '12') {
			continue;
		}
		let proprietario = getProprietarioDiga('DP_' + numero);
		if (proprietario && proprietario == automa) {
			centraliValide.push(centrale);
			continue;
		}
		if (!proprietario) {
			proprietario = getProprietarioDiga('DF_' + numero);
			if (proprietario && proprietario == automa) {
				centraliValide.push(centrale);
				continue;
			}
		}
		if (!proprietario) {
			const secondoN = secondoNumero[numero];
			if (secondoN) {
				proprietario = getProprietarioDiga('DP_' + secondoN);
				if (proprietario && proprietario == automa) {
					centraliValide.push(centrale);
					continue;
				}
				if (!proprietario) {
					proprietario = getProprietarioDiga('DF_' + secondoN);
					if (proprietario && proprietario == automa) {
						centraliValide.push(centrale);
					}
				}
			}
		}
	}
	if (centraliValide.length == 0) {
		// centrale che non scarica in una diga avversaria:
		// rifaccio tutto dal 5 al 12. Proprietario deve essere N o vuoto
		for (const centrale of centrali) {
			const numero = getNumeroCentrale(centrale);
			if (numero == '11' || numero == '12') {
				centraliValide.push(centrale);
				continue;
			}
			let proprietario = getProprietarioDiga('DP_' + numero);
			if (proprietario && proprietario == 'N') {
				centraliValide.push(centrale);
				continue;
			}
			if (!proprietario) {
				proprietario = getProprietarioDiga('DF_' + numero);
				if (proprietario && proprietario == 'N') {
					centraliValide.push(centrale);
					continue;
				}
			}
			if (!proprietario) {
				const secondoN = secondoNumero[numero];
				if (secondoN) {
					proprietario = getProprietarioDiga('DP_' + secondoN);
					if (proprietario && proprietario == 'N') {
						centraliValide.push(centrale);
						continue;
					}
					if (!proprietario) {
						proprietario = getProprietarioDiga('DF_' + secondoN);
						if (proprietario && proprietario == 'N') {
							centraliValide.push(centrale);
							continue;
						}
					}
					if (!proprietario) {
						centraliValide.push(centrale);
					}
				}
			}
		}
	}
	if (centraliValide.length == 0) {
		return actualResult ? actualResult : [];
	} if (!actualResult || actualResult.length == 0) {
		return centraliValide;
	} else {
		// intersezione
		return intersecArray(actualResult, centraliValide);
	}
}

/**
 * CENTRALI: una centrale che non scarica acqua in una diga avversaria O scarica acqua in una propria diga
 * @param {string} automa 
 * @returns risultati
 */
export function getCE_R(automa) {
	let centrali = centraliFree.concat(centraliPay).filter(c => {
		let numero = c.substr(3, 1);
		if (+numero >= 5 && +numero < 10) {
			return true;
		}
		numero = c.substr(3, 2);
		return numero == '10' || numero == '11' || numero == '12';
	});
	centrali = centrali.filter(c => !getProprietarioCentrale(c));
	const secondoNumero = [];
	secondoNumero['5'] = '9';
	secondoNumero['6'] = '10';
	secondoNumero['7'] = '10';
	const centraliValide = [];
	// centrale che non scarica in una diga avversaria:
	// numeri validi dal 5 al 12. Se 11 o 12 va già bene. Proprietario deve essere N o vuoto
	for (const centrale of centrali) {
		const numero = getNumeroCentrale(centrale);
		if (numero == '11' || numero == '12') {
			centraliValide.push(centrale);
			continue;
		}
		let proprietario = getProprietarioDiga('DP_' + numero);
		if (proprietario && proprietario == 'N') {
			centraliValide.push(centrale);
			continue;
		}
		if (!proprietario) {
			proprietario = getProprietarioDiga('DF_' + numero);
			if (proprietario && proprietario == 'N') {
				centraliValide.push(centrale);
				continue;
			}
		}
		if (!proprietario) {
			const secondoN = secondoNumero[numero];
			if (secondoN) {
				proprietario = getProprietarioDiga('DP_' + secondoN);
				if (proprietario && proprietario == 'N') {
					centraliValide.push(centrale);
					continue;
				}
				if (!proprietario) {
					proprietario = getProprietarioDiga('DF_' + secondoN);
					if (proprietario && proprietario == 'N') {
						centraliValide.push(centrale);
						continue;
					}
				}
				if (!proprietario) {
					centraliValide.push(centrale);
				}
			}
		}
	}
	if (centraliValide.length == 0) {
		// centrale che scarica in una propria diga:
		// deve essere dal 5 al 10
		for (const centrale of centrali) {
			const numero = getNumeroCentrale(centrale);
			if (numero == '11' || numero == '12') {
				continue;
			}
			let proprietario = getProprietarioDiga('DP_' + numero);
			if (proprietario && proprietario == automa) {
				centraliValide.push(centrale);
				continue;
			}
			if (!proprietario) {
				proprietario = getProprietarioDiga('DF_' + numero);
				if (proprietario && proprietario == automa) {
					centraliValide.push(centrale);
					continue;
				}
			}
			if (!proprietario) {
				const secondoN = secondoNumero[numero];
				if (secondoN) {
					proprietario = getProprietarioDiga('DP_' + secondoN);
					if (proprietario && proprietario == automa) {
						centraliValide.push(centrale);
						continue;
					}
					if (!proprietario) {
						proprietario = getProprietarioDiga('DF_' + secondoN);
						if (proprietario && proprietario == automa) {
							centraliValide.push(centrale);
						}
					}
				}
			}
		}
	}
	if (centraliValide.length == 0) {
		return actualResult ? actualResult : [];
	} if (!actualResult || actualResult.length == 0) {
		return centraliValide;
	} else {
		// intersezione
		return intersecArray(actualResult, centraliValide);
	}
}

/////////////// METODI CHIAMATI DA PULSANTI
/**
 * Aggiunge goccia a sorgente
 * @param {string} sorgente
 */
export function addGocciaSorgente(sorgente) {
	resetRisultati();
	let gocceSorg = undefined;
	for (let i = 0; i < sorgentiGocce.length; i++) {
		if (sorgentiGocce[i].sorgente == sorgente) {
			gocceSorg = sorgentiGocce[i];
			break;
		}
	}
	if (gocceSorg) {
		let quante = gocceSorg.gocce;
		if (quante < 10) {
			quante++;
		} else {
			quante = 0;
		}
		gocceSorg.gocce = quante;
	} else {
		gocceSorg = { sorgente: sorgente, gocce: 1 };
		sorgentiGocce.push(gocceSorg);
	}
	document.getElementById('areaS' + sorgente + 'Text').innerHTML = '' + gocceSorg.gocce;
	if (!gocceSorg.gocce) {
		document.getElementById('areaS' + sorgente + 'Content').style.display = 'none';
	} else {
		document.getElementById('areaS' + sorgente + 'Content').style.display = 'block';
	}
}

/**
 * Aggiunge goccia a una diga
 * @param {string} diga
 */
export function addGocciaDiga(diga) {
	resetRisultati();
	let gocceDig = undefined;
	for (let i = 0; i < digheGocce.length; i++) {
		if (digheGocce[i].diga == diga) {
			gocceDig = digheGocce[i];
			break;
		}
	}
	if (gocceDig) {
		let quante = gocceDig.gocce;
		if (quante < 3) {
			quante++;
		} else {
			quante = 0;
		}
		gocceDig.gocce = quante;
	} else {
		gocceDig = { diga: diga, gocce: 1 };
		digheGocce.push(gocceDig);
	}
	document.getElementById('area' + diga + 'GText').innerHTML = '' + gocceDig.gocce;
	if (!gocceDig.gocce) {
		document.getElementById('area' + diga + 'GContent').style.display = 'none';
	} else {
		document.getElementById('area' + diga + 'GContent').style.display = 'block';
	}
}

/**
 * Aggiunge una diga o la aumenta
 * @param {string} diga
 */
export function addDiga(diga) {
	resetRisultati();
	let chi = playerSelected;
	if (chi == undefined) {
		return;
	}
	let digaCostruita = undefined;
	let index = undefined;
	for (let i = 0; i < dighePresenti.length; i++) {
		if (dighePresenti[i].diga == diga) {
			digaCostruita = dighePresenti[i];
			index = i;
			break;
		}
	}
	if (digaCostruita) {
		if (chi != digaCostruita.chi) {
			return;
		}
		if (digaCostruita.livello < 3) {
			digaCostruita.livello += 1;
		} else {
			digaCostruita.livello = 0;
		}
		if (!digaCostruita.livello) {
			dighePresenti.splice(index, 1);
			document.getElementById('area' + diga + 'Content').style.display = 'none';
		} else {
			document.getElementById('area' + diga + 'Content').style.display = 'block';
			document.getElementById('area' + diga + 'Text').innerHTML = '' + digaCostruita.livello;
		}
	} else {
		digaCostruita = { diga: diga, chi: chi, livello: 1 };
		dighePresenti.push(digaCostruita);
		document.getElementById('area' + diga + 'Text').innerHTML = '' + digaCostruita.livello;
		// @ts-ignore
		document.getElementById('area' + diga + 'Img').src = 'img/B_' + playerColor[chi] + '.png';
		document.getElementById('area' + diga + 'Content').style.display = 'block';
	}
}

/**
 * Aggiunge una condotta
 * @param {string} condotta
 */
export function addCondotta(condotta) {
	resetRisultati();
	let chi = playerSelected;
	if (chi == undefined || chi == 'N') {
		return;
	}
	let condottaCostruita = undefined;
	let index = undefined;
	for (let i = 0; i < condotteCostruite.length; i++) {
		if (condotteCostruite[i].condotta == condotta) {
			condottaCostruita = condotteCostruite[i];
			index = i;
			break;
		}
	}
	if (condottaCostruita) {
		if (chi != condottaCostruita.chi) {
			return;
		} else {
			condotteCostruite.splice(index, 1);
			document.getElementById('area' + condotta + 'Content').style.display = 'none';
		}
	} else {
		condottaCostruita = { condotta: condotta, chi: chi };
		condotteCostruite.push(condottaCostruita);
		// @ts-ignore
		document.getElementById('area' + condotta + 'Img').src = 'img/CO_' + playerColor[chi] + '.png';
		document.getElementById('area' + condotta + 'Content').style.display = 'block';
	}
}

/**
 * Aggiunge una centrale
 * @param {string} centrale
 */
export function addCentrale(centrale) {
	resetRisultati();
	let chi = playerSelected;
	if (chi == undefined || chi == 'N') {
		return;
	}
	let centraleCostruita = undefined;
	let index = undefined;
	for (let i = 0; i < centraliCostruite.length; i++) {
		if (centraliCostruite[i].centrale == centrale) {
			centraleCostruita = centraliCostruite[i];
			index = i;
			break;
		}
	}
	if (centraleCostruita) {
		if (chi != centraleCostruita.chi) {
			return;
		} else {
			centraliCostruite.splice(index, 1);
			document.getElementById('area' + centrale + 'Content').style.display = 'none';
		}
	} else {
		centraleCostruita = { centrale: centrale, chi: chi };
		centraliCostruite.push(centraleCostruita);
		// @ts-ignore
		document.getElementById('area' + centrale + 'Img').src = 'img/CE_' + playerColor[chi] + '.png';
		document.getElementById('area' + centrale + 'Content').style.display = 'block';
	}
}

export function changePlayerSelected(player) {
	playerSelected = playerSelected == player ? undefined : player;
	mostraPlayerSelected();
}