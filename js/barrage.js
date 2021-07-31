/////////////// INPUT
var centraliCostruite = []; // {centrale: string, chi: string}
var condotteCostruite = []; // {condotta: string, chi: string}
var dighePresenti = []; // {diga: string, chi: string}
var digheLivello = []; // {diga: string, livello: number}

/////////////// BL UTILS
function getZonaCondotta(condotta) {
	var prefix = condotta.substring(0, 4);
	if (prefix == 'C_10') {
		return 'P';
	} else {
		prefix = prefix.substring(0, 3);
		if (prefix == 'C_9' || prefix == 'C_8') {
			return 'P';
		} else if (prefix == 'C_7' || prefix == 'C_6' || prefix == 'C_5') {
			return 'C';
		} else {
			return 'M';
		}
	}
}

function getProprietarioDiga(diga) {
	if (dighePresenti.length == 0) {
		return undefined;
	}
	for (var i = 0; i < dighePresenti.length; i++) {
		if (dighePresenti[i].diga == diga) {
			return dighePresenti[i].chi;
		}
	}
	return undefined;
}

function getDigheDiProprieta(chi) {
	var dighe = [];
	if (dighePresenti.length > 0) {
		for (var i = 0; i < dighePresenti.length; i++) {
			if (dighePresenti[i].chi == chi) {
				dighe.push(dighePresenti[i].diga);
			}
		}
	}
	return dighe;
}

function getLivelloDiga(diga) {
	if (digheLivello.length == 0) {
		return undefined;
	}
	for (var i = 0; i < digheLivello.length; i++) {
		if (digheLivello[i].diga == diga) {
			return digheLivello[i].livello;
		}
	}
	return undefined;
}

function getCentraliDiProprieta(chi) {
	var centrali = [];
	if (centraliCostruite.length > 0) {
		for (var i = 0; i < centraliCostruite.length; i++) {
			if (centraliCostruite[i].chi == chi) {
				centrali.push(centraliCostruite[i].centrale);
			}
		}
	}
	return centrali;
}

function printArray(array) {
	var text = '[';
	for (var i = 0; i < array.length; i++) {
		text += array[i] + ', ';
	}
	text += ']';
	return text;
}

/////////////// BL CRITERI

/**
 * BASE O ELEVAZIONE, diga collegabile a condotta più potente
 * tipo: 'B' o 'E' per Base o Elevazione
 * prevFilter: filtro precedente (se presente)
 * automa: l'automa da usare
**/
function getBE_Condotta(tipo, prevFilter, automa) {
	if (condotteCostruite.length == 0) {
		return prevFilter ? prevFilter : [];
	}
	condotteCostruite.sort(function (a, b) {
		if (condotteVal[a.condotta] != condotteVal[b.condotta]) {
			return condotteVal[b.condotta] - condotteVal[a.condotta];
		} else {
			var chiA = a.chi;
			var chiB = b.chi;
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
	var maxValue = []
	maxValue['M'] = -1;
	maxValue['C'] = -1;
	maxValue['P'] = -1;
	var actualChi = [];
	actualChi['M'] = '';
	actualChi['C'] = '';
	actualChi['P'] = '';
	var condotteFiltered = [];
	for (var i = 0; i < condotteCostruite.length; i++) {
		var condCos = condotteCostruite[i];
		var actualValue = condotteVal[condCos.condotta];
		var zona = getZonaCondotta(condCos.condotta);
		var first = false;
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
	var digheValide = [];
	for (var i = 0; i < condotteFiltered.length; i++) {
		var collegate = condotteDighe[condotteFiltered[i]];
		if (tipo == 'B') {
			var d1 = collegate[0];
			if (!getProprietarioDiga(d1)) {
				digheValide.push(d1);
			}
			var d2 = collegate[1];
			if (!getProprietarioDiga(d2)) {
				digheValide.push(d2);
			}
		} else {
			var d1 = collegate[0];
			if (getProprietarioDiga(d1) && getProprietarioDiga(d1) == automa && getLivelloDiga(d1) < 3) {
				digheValide.push(d1);
			}
			var d2 = collegate[1];
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
		var filtered = digheValide.filter(function (n) {
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
**/
function getBE_CentralePropria(tipo, prevFilter, automa) {
	if (centraliCostruite.length == 0) {
		return prevFilter ? prevFilter : [];
	}
	var centraliProprie = getCentraliDiProprieta(automa);
	if (centraliProprie.length == 0) {
		return prevFilter ? prevFilter : [];
	}
	var condotte = [];
	for (var i = 0; i < centraliProprie.length; i++) {
		var currCondotte = centraliCondotte[centraliProprie[i]];
		for (var j = 0; j < currCondotte.length; j++) {
			condotte.push(currCondotte[j]);
		}
	}
	var dighe = [];
	for (var i = 0; i < condotte.length; i++) {
		var currDighe = condotteDighe[condotte[i]];
		for (var j = 0; j < currDighe.length; j++) {
			dighe.push(currDighe[j]);
		}
	}
	var digheValide = [];
	for (var i = 0; i < dighe.length; i++) {
		var diga = dighe[i];
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
		var filtered = digheValide.filter(function (n) {
			return prevFilter.indexOf(n) != -1;
		});
		return filtered;
	}
}


/////////////// BUSINESS LOGIC

function getNumCarteRimanenti() {
	return deckSize - (indice + 1);
}

function pesca() {
	if (indice >= deckSize) {
		initMazzo();
	}
	return mazzo[indice++];
}

function mescola(mazzo) {
	var currentIndex = mazzo.length, randomIndex;
	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		// And swap it with the current element.
		[mazzo[currentIndex], mazzo[randomIndex]] = [
			mazzo[randomIndex], mazzo[currentIndex]];
	}
	return mazzo;
}

function getImmagine(folderName, fileName) {
	var immagine = document.createElement("img");
	immagine.src = "img/" + folderName + "/" + fileName;
	if (folderName == 'deck') {
		immagine.id = "c_pescata";
		immagine.className = "mazzo front animated flipInY";
		immagine.onclick = pescaEMostra;
	} else {
		immagine.className = "cartaround";
	}
	return immagine;
}

function getDado3() {
	var rand = Math.random();
	return Math.ceil(rand * 3);
}



//////////////////// VIEW

function pescaEMostra() {
	var carta = 'a_' + pesca() + '.jpg';
	mostra(carta);
	document.getElementById('numPescate').innerHTML = (indice);
}

function mostra(carta) {
	var cartaPescata = document.getElementById('c_pescata');
	if (cartaPescata) {
		document.getElementById('risultato').removeChild(cartaPescata);
	}
	document.getElementById('risultato').appendChild(getImmagine('deck', carta));
}

function apriRound(num) {
	document.getElementById("legendaC").style.display = "none";
	document.getElementById('legendaVera').innerHTML = "";
	document.getElementById('legendaVera').appendChild(getImmagine('round', 'r' + num + '_' + round[num] + '.jpg'));
	document.getElementById("legendaO").style.display = "block";
}

function chiudiRound() {
	document.getElementById("legendaO").style.display = "none";
	document.getElementById("legendaC").style.display = "block";
}
