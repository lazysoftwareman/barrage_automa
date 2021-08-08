// @ts-check
import { carteCriteri, curCartaCriteri, resetMazzo } from './deck.js';
import { resetAzioni, setAzioneContinua } from './init.js';
import { centraliCondotte, condotteDighe, condotteVal, dighePay, percorsi, percorsiDi } from './mappa.js';
import {
    getCapienzaDiga,
    getCentraliDiProprieta,
    getCondotteCheScaricanoInArea,
    getGocceInSorgente,
    getLivelloDiga,
    getNumeroCentrale,
    getNumeroDiga,
    getProprietarioCondotta,
    getProprietarioDiga,
    getZonaCondotta,
    getZonaDiga,
    intersecArray,
} from './provider.js';
import { mostraRisultati, resetRisultati } from './view.js';


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
playerMap['U'] = 'P1';
playerMap['A'] = 'P2';
playerMap['N'] = 'P0';
export let playerColor = [];
playerColor['U'] = 'G';
playerColor['A'] = 'R';
playerColor['N'] = 'N';

export let criterioPasso = 0;
export let actualResult = [];
export let playerSelected = undefined;

export function resetInputs() {
	centraliCostruite = [];
	condotteCostruite = [];
	dighePresenti = [];
	digheGocce = [];
	sorgentiGocce = [];
	resetMazzo();
}

/////////////// BL CRITERI

export function azioneCostruisci(azione) {
	// questo solo quando ci sarà il multiautoma
	// if (!playerSelected.startsWith('A')) {
	// 	return;
	// }
	resetRisultati();
	resetAzioni();
	setAzioneContinua(azione)
	const automa = 'A';
	if (!curCartaCriteri) {
		alert('Bisogna pescare una carta criteri affinché l\'automa possa costruire')
		return;
	}
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
		return;
	}
	return costruisci(tipo, zona, minCondotta, maxCondotta, automa);
}

export function azioneCostruisciContinua(azione) {
	// questo solo quando ci sarà il multiautoma
	// if (!playerSelected.startsWith('A')) {
	// 	return;
	// }
	resetRisultati();
	const automa = 'A';
	if (!curCartaCriteri) {
		alert('Bisogna pescare una carta criteri affinché l\'automa possa costruire')
		return;
	}
	const cosa = azione.substr(1, azione.length - 1);
	let tipo;
	let minCondotta;
	let maxCondotta;
	if (cosa.startsWith('D')) {
		tipo = 'B';
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
		return;
	}
	return eseguiCriterioPasso(tipo, minCondotta, maxCondotta, automa);
}

/**
 * @param {string} tipo B(ase), E(levazione), CO(ndotta), CE(ntrale)
 * @param {string} zona
 * @param {string} automa
 */
export function costruisci(tipo, zona, minCondotta, maxCondotta, automa) {
	criterioPasso = 0;
	actualResult = [];
	if (tipo == 'A') {
		alert('Non ancora implementata la gestione delle abitazioni');
		return;
	}
	if (tipo == 'B' && zona) {
		actualResult = getB_Zona(zona);
		if (actualResult.length == 0) {
			// ci fermiamo qua alert o qualcosa del genere
			alert('Non si può costruire una base in quella zona');
			return;
		} else if (actualResult.length == 1) {
			actualResult = actualResult;
			mostraRisultati();
			return;
		}
	}
	// Sistema completo
	if (tipo == 'B') {
		actualResult = getBE_0_SistemaCompleto(tipo, automa);
	} else if (tipo == 'CO') {
		actualResult = getCO_0_SistemaCompleto(automa);
	} else if (tipo == 'CE') {
		actualResult = getCE_0_SistemaCompleto(automa);
	}
	if (!actualResult || actualResult.length == 0) {
		// Nessun sistema completo, continuiamo
		eseguiCriterioPasso(tipo, minCondotta, maxCondotta, automa);
	} else if (actualResult.length > 0) {
		// Ci sono dei risultati, se di sicuro devo filtrare ancora, filtro, altrimenti mostro
		if (devoSicuramenteFiltrare(tipo)) {
			return eseguiCriterioPasso(tipo, minCondotta, maxCondotta, automa);
		} else {
			mostraRisultati();
			return;
		}
	}
}

export function eseguiCriterioPasso(tipo, minCondotta, maxCondotta, automa) {
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
		let lettera = criteri[position];
		if (criterioPasso == 4) {
			actualResult = window['get' + prefix + '_Numero'](lettera);
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
						actualResult = getCE_OP(automa);
					} else {
						let numero = lettera.substr(1, 1);
						actualResult = getCE_P(numero, automa);
					}
				}
			}
		}
		if (!actualResult || actualResult.length == 0) {
			// Nessun sistema completo, continuiamo
		} else if (actualResult.length > 0) {
			// Ci sono dei risultati, se di sicuro devo filtrare ancora, filtro, altrimenti mostro
			if (devoSicuramenteFiltrare(tipo)) {
				// Devo sicuramente ancora filtrare, continuiamo
			} else {
				mostraRisultati();
				return;
			}
		}
	}
	// Finiti i criteri, resetto
	criterioPasso = 0;
	actualResult = [];
	resetAzioni();
	mostraRisultati();
}

export function devoSicuramenteFiltrare(tipo) {
	if (tipo == 'B' || tipo == 'E') {
		// se ci sono più di 1 risultato in pianura (se c'è), o se non c'è in collina
		// o se non c'è in montagna, significa che devo necessariamente filtrare ancora
		let resultP = 0;
		let resultC = 0;
		let resultM = 0;
		for (const res of actualResult) {
			const zona = getZonaDiga(res);
			if (zona == 'M') {
				resultM++;
			} else if (zona == 'C') {
				resultC++;
			} else {
				resultP++;
			}
		}
		if (resultP > 1) {
			return true;
		} else if (resultP == 0) {
			if (resultC > 1) {
				return true;
			} else if (resultC == 0) {
				if (resultM > 1) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		} else {
			return false;
		}
	} else if (tipo == 'CO') {
		let result = [];
		for (let i = 0; i < 5; i++) {
			result['' + (i + 1)] = 0;
		}
		for (const res of actualResult) {
			const valore = condotteVal[res];
			result['' + valore]++;
		}
		for (let i = 0; i < 5; i++) {
			let res = result['' + (i + 1)];
			if (res == 0) {
				continue;
			}
			if (res > 1) {
				// quelle di valore più basso sono più di una, devo sicuramente filtrare ancora
				return true;
			} else {
				return false;
			}
		}
		return false;
	} else if (tipo == 'CE') {
		// per le centrali le mostro sempre
		return false;
	} else {
		// per le abitazioni per ora non le gestisco
		alert('Non ancora implementata la gestione delle abitazioni');
		return false;
	}
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
 * @param {string} tipo se 'E' ritorna array vuoto
 * @param {string} automa
**/
export function getBE_0_SistemaCompleto(tipo, automa) {
	if (tipo != 'B') {
		return [];
	}
	let centraliProprie = getCentraliDiProprieta(automa);
	if (centraliProprie.length == 0) {
		return [];
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
export function getBE_A(tipo, automa, ordine) {
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
export function getBE_B(tipo, automa, ordine) {
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
export function getBE_D(tipo, automa, ordine) {
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
export function getBE_E(tipo, automa, ordine) {
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
export function getBE_F(tipo, automa, ordine) {
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
export function getBE_Numero(numero) {
	let counter = 0;
	let actual = +numero;
	while (counter < 10) {
		actual = actual + counter;
		if (actual > 10) {
			actual = 1;
		}
		let digaF = 'DF_' + actual;
		if (!actualResult) {
			actualResult = [];
		}
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
		return [];
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
export function getCO_Numero(numeroLettera) {
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

export function getCO_G(min, max, automa) {
	// TODO
	alert('Non ancora implementato getCO_G');
	return [];
}

export function getCO_H(min, max, automa) {
	// TODO
	alert('Non ancora implementato getCO_H');
	return [];
}

export function getCO_I(min, max, automa) {
	// TODO
	alert('Non ancora implementato getCO_I');
	return [];
}

export function getCO_J(min, max, automa) {
	// TODO
	alert('Non ancora implementato getCO_J');
	return [];
}

export function getCO_K(min, max, automa) {
	// TODO
	alert('Non ancora implementato getCO_K');
	return [];
}

export function getCO_L(min, max, automa) {
	// TODO
	alert('Non ancora implementato getCO_L');
	return [];
}

export function getCE_0_SistemaCompleto(automa) {
	// TODO
	alert('Non ancora implementato getCE_0_SistemaCompleto');
	return [];
}

export function getCE_Numero(automa) {
	// TODO
	alert('Non ancora implementato getCE_Numero');
	return [];
}

export function getCE_M(automa) {
	// TODO
	alert('Non ancora implementato getCE_M');
	return [];
}

export function getCE_N(automa) {
	// TODO
	alert('Non ancora implementato getCE_N');
	return [];
}

export function getCE_OP(automa) {
	// TODO
	alert('Non ancora implementato getCE_OP');
	return [];
}

export function getCE_P(numero, automa) {
	// TODO
	alert('Non ancora implementato getCE_P');
	return [];
}

export function getCE_Q(automa) {
	// TODO
	alert('Non ancora implementato getCE_Q');
	return [];
}

export function getCE_R(automa) {
	// TODO
	alert('Non ancora implementato getCE_R');
	return [];
}

/////////////// METODI CHIAMATI DA PULSANTI
/**
 * Aggiunge goccia a sorgente
 * @param {string} sorgente
 */
export function addGocciaSorgente(sorgente) {
	resetRisultati();
	resetAzioni();
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
	resetAzioni();
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
	resetAzioni();
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
	resetAzioni();
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
	resetAzioni();
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
	for (let player in playerMap) {
		let p = playerMap[player];
		document.getElementById(p + '_Selector').style.borderColor = 'var(--borderColor)';
		document.getElementById(p + '_Selector').style.borderWidth = '2px';
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