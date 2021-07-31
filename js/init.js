var deckSize = 18;
var mazzo = [];
var indice = 0;

var round = [];

function initPage() {
	centraliCostruite = [];
	condotteCostruite = [];
	dighePresenti = [];
	digheLivello = [];

	round['12'] = getDado3();
	round['34'] = getDado3();
	round['56'] = getDado3();
	deckSize = deckSize;
	initMazzo();
	document.getElementById('numPescate').innerHTML = (indice);
	document.getElementById('numTot').innerHTML = deckSize;
	// initDorsoMazzo();
}

function initMazzo() {
	mazzo = [];
	for (var i = 0; i < deckSize; i++) {
		mazzo.push(i + 1);
	}
	mescola(mazzo);
	indice = 0;
}

// function initDorsoMazzo() {
	// var dorso = document.createElement("img");
	// dorso.src = "img/deck/a_0.jpg";
	// dorso.className = "mazzo dorso";
	// dorso.onclick = pescaEMostra;

	// document.getElementById('risultato').innerHTML = '';
	// document.getElementById('risultato').appendChild(dorso);
// }
