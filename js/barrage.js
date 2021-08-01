// @ts-check
import { centraliCondotte, condotteDighe, condotteVal, dighePay } from './mappa.js';
import { resetOlds } from './old.js';
import {
    getCentraliDiProprieta,
    getLivelloDiga,
    getNumeroCentrale,
    getProprietarioDiga,
    getZonaCondotta,
} from './provider.js';


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
 * @type {{ diga: string, chi: string}[]}
 */
export let dighePresenti = [];
/**
 * @type {{ diga: string, livello: number}[]}
 */
export let digheLivello = [];

export function resetInputs() {
	centraliCostruite = [];
	condotteCostruite = [];
	dighePresenti = [];
	digheLivello = [];

	resetOlds();
}


/////////////// BL CRITERI

/**
 * BASE O ELEVAZIONE, diga collegabile a condotta più potente
 * tipo: 'B' o 'E' per Base o Elevazione
 * prevFilter: filtro precedente (se presente)
 * automa: l'automa da usare
 * @param {string} tipo
 * @param {string[]} prevFilter
 * @param {string} automa
 */
export function getBE_Condotta(tipo, prevFilter, automa) {
	if (condotteCostruite.length == 0) {
		return prevFilter ? prevFilter : [];
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
		return prevFilter ? prevFilter : [];
	} if (!prevFilter || prevFilter.length == 0) {
		return digheValide;
	} else {
		// intersezione
		let filtered = digheValide.filter(function (n) {
			return prevFilter.indexOf(n) != -1;
		});
		return filtered;
	}
}

/**
 * BASE O ELEVAZIONE, diga collegabile a propria centrale
 * tipo: 'B' o 'E' per Base o Elevazione
 * prevFilter: filtro precedente (se presente)
 * automa: l'automa da usare
 * @param {string} tipo
 * @param {string[]} prevFilter
 * @param {string} automa
**/
export function getBE_CentralePropria(tipo, prevFilter, automa) {
	if (centraliCostruite.length == 0) {
		return prevFilter ? prevFilter : [];
	}
	let centraliProprie = getCentraliDiProprieta(automa);
	if (centraliProprie.length == 0) {
		return prevFilter ? prevFilter : [];
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
		return prevFilter ? prevFilter : [];
	} if (!prevFilter || prevFilter.length == 0) {
		return digheValide;
	} else {
		// intersezione
		let filtered = digheValide.filter(function (n) {
			return prevFilter.indexOf(n) != -1;
		});
		return filtered;
	}
}

/**
 * BASE O ELEVAZIONE, costo addizionale
 * tipo: 'B' o 'E' per Base o Elevazione
 * prevFilter: filtro precedente (se presente)
 * automa: l'automa da usare
 * @param {string} tipo
 * @param {string[]} prevFilter
 * @param {string} automa
**/
export function getBE_CostoAddizionale(tipo, prevFilter, automa) {
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
		return prevFilter ? prevFilter : [];
	} if (!prevFilter || prevFilter.length == 0) {
		return digheValide;
	} else {
		// intersezione
		let filtered = digheValide.filter(function (n) {
			return prevFilter.indexOf(n) != -1;
		});
		return filtered;
	}
}

/**
 * BASE O ELEVAZIONE, diga collegabile naturalmente a centrale
 * tipo: 'B' o 'E' per Base o Elevazione
 * prevFilter: filtro precedente (se presente)
 * automa: l'automa da usare
 * @param {string} tipo
 * @param {string[]} prevFilter
 * @param {string} automa
**/
export function getBE_CentraleNaturale(tipo, prevFilter, automa) {
	if (centraliCostruite.length == 0) {
		return prevFilter ? prevFilter : [];
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
		return prevFilter ? prevFilter : [];
	} if (!prevFilter || prevFilter.length == 0) {
		return digheValide;
	} else {
		// intersezione
		let filtered = digheValide.filter(function (n) {
			return prevFilter.indexOf(n) != -1;
		});
		return filtered;
	}
}

