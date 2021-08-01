// @ts-check
import { centraliCondotte, condotteDighe, condotteVal, dighePay, percorsi, percorsiDi } from './mappa.js';
import { resetOlds } from './old.js';
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
    intersecArray,
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
/**
 * @type {{ diga: string, gocce: number}[]}
 */
export let digheGocce = [];
/**
 * @type {{ sorgente: string, gocce: number}[]}
 */
export let sorgentiGocce = [];

export function resetInputs() {
	centraliCostruite = [];
	condotteCostruite = [];
	dighePresenti = [];
	digheLivello = [];

	resetOlds();
}


/////////////// BL CRITERI

/*
ESEMPIO CARTA CRITERI: E_A_C_1_H_J_I_10B_L_P_K_12_DAB
*/


/**
 * BASE O ELEVAZIONE, completamento sistema, solo per BASE.
 * Da applicare come primo criterio, quindi non c'è un prevFilter
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
	return digheValide;
}

/**
 * BASE O ELEVAZIONE, diga collegabile a condotta più potente
 * tipo: 'B' o 'E' per Base o Elevazione
 * prevFilter: filtro precedente (se presente)
 * automa: l'automa da usare
 * @param {string} tipo
 * @param {string[]} prevFilter
 * @param {string} automa
 */
export function getBE_A_Condotta(tipo, prevFilter, automa) {
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
		return intersecArray(prevFilter, digheValide);
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
export function getBE_B_CentralePropria(tipo, prevFilter, automa) {
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
		return intersecArray(prevFilter, digheValide);
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
export function getBE_D_CostoAddizionale(tipo, prevFilter, automa) {
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
		return intersecArray(prevFilter, digheValide);
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
export function getBE_E_CentraleNaturale(tipo, prevFilter, automa) {
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
		return intersecArray(prevFilter, digheValide);
	}
}

/**
 * BASE O ELEVAZIONE, diga collegabile tramite condotta a propria diga o non collegabile a diga avversaria
 * tipo: 'B' o 'E' per Base o Elevazione
 * prevFilter: filtro precedente (se presente)
 * automa: l'automa da usare
 * @param {string} tipo
 * @param {string[]} prevFilter
 * @param {string} automa
**/
export function getBE_F_DigaCondotta(tipo, prevFilter, automa) {
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
		return prevFilter ? prevFilter : [];
	} if (!prevFilter || prevFilter.length == 0) {
		return digheValide;
	} else {
		// intersezione
		return intersecArray(prevFilter, digheValide);
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
 * @param {string} ordine del tipo ACD o BAC
 */
export function getBE_C_Gocce(tipo, prevFilter, automa, ordine) {
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
		return prevFilter ? prevFilter : [];
	} if (!prevFilter || prevFilter.length == 0) {
		return digheValide;
	} else {
		// intersezione
		return intersecArray(prevFilter, digheValide);
	}
}

/**
 * BASE O ELEVAZIONE, numero
 * tipo: 'B' o 'E' per Base o Elevazione
 * prevFilter: filtro precedente (se presente)
 * automa: l'automa da usare
 * @param {string[]} prevFilter
 * @param {string} numero primo numero da cui partire
 */
export function getBE_Numero(prevFilter, numero) {
	let counter = 0;
	let actual = +numero;
	while (counter < 10) {
		actual = actual + counter;
		if (actual > 10) {
			actual = 1;
		}
		let digaF = 'DF_' + numero;
		if (prevFilter.includes(digaF)) {
			return [digaF];
		}
		let digaP = 'DP_' + numero;
		if (prevFilter.includes(digaP)) {
			return [digaP];
		}
	}
	return [];
}

