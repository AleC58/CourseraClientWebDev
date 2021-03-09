"use strict";

var urlsnpIndex = "snippets/snpIndex.html";
var urlsnpMenuCategories = "snippets/snpMenuCategories.html";
var urlallCategories = "https://davids-restaurant.herokuapp.com/categories.json";


// onLoad
document.addEventListener("DOMContentLoaded", function (event) {
	// non si può fare caricaMainContentDaFile(snippet)
	// perché ogni snippet deve essere personalizzato dopo il caricamento

	// la prima volta carica "index"
	caricaMainContentDaSnpIndex();
	$("#lnkNavMenuCategories").click(caricaMainContentDaSnpMenuCategories);
	$("#lnkNavAbout").click(function() {alert("... caricare snpAbout in #main-content")});
	$("#lnkNavAwards").click(function() {alert("... caricare snpAwards in #main-content")});
});


/********** Costruzione index.html **********/
function caricaMainContentDaSnpIndex() {
	showLoadingImg("#main-content");
	$.ajax({
		url: urlsnpIndex,
		type: "GET",
		dataType: "text",
	})
	.done(function (risposta) { // successo
		$("#main-content").html(risposta);
		//personalizzazioni
		$("#lnkTileMenuCategories").click(caricaMainContentDaSnpMenuCategories);
		$("#lnkTileSingleCategory").click(function() {alert("... caricare snpXXXspecials in #main-content")});
	})
	.fail(function (xhr, status, errorThrown) {
		$("#main-content").html(msgErr("AJAX error! Tipo richiesta: GET -  URL:" + urlsnpIndex));
	});
};

/********** Costruzione "menuCategories.html" **********/
//eseguita da click su menu (nav o tile)
function caricaMainContentDaSnpMenuCategories() {
	showLoadingImg("#main-content");
	//chiede il template da personalizzare con i dati di ogni categoria
	$.ajax({
		url: urlsnpMenuCategories,
		type: "GET",
		dataType: "text",
	})
	.done(function (snpMenuCategories) { // successo
		//in snpMenuCategories ho il codice HTML per 1 categoria
		//lo devo aggiustare con i dati presi dal servizio web su Heroku,
		//che mi fornisce un json array con 1 elemento per categoria
		creaHTMLConCategorie(snpMenuCategories);
	})
	.fail(function (xhr, status, errorThrown) {
		$("#main-content").html(msgErr("AJAX error! Tipo richiesta: GET -  URL:" + urlsnpMenuCategories));
	});
};

function creaHTMLConCategorie(snpMenuCategories) {
	//chiede i dati al servizio web su heroku
	$.ajax({
		url: urlallCategories,
		type: "GET",
		dataType: "json",
	})
	.done(function (allCategoriesData) { // successo
		//in risposta ho un json array con 1 elemento per categoria
		/*let midHTML = creaHTMLConCategorie(snpMenuCategories);
		totHTML = startHTML + midHTML + endHTML;*/
		creaMainContentConCategorie(snpMenuCategories, allCategoriesData);
	})
	.fail(function (xhr, status, errorThrown) {
		$("#main-content").html(msgErr("AJAX error! Tipo richiesta: GET -  URL:" + urlallCategories));
	});
}

function creaMainContentConCategorie(snpMenuCategories, allCategoriesData) {
	var startHTML = '<h2 id="menu-categories-title" class="text-center">Menu Categories</h2>' +
	'<div class="text-center">' +
	'<p>Substituting white rice with brown rice or fried rice after 3:00pm will be $1.50 for a pint and $2.50 for a quart.</p>' +
	'</div>' +
	'<section class="row">';
	var endHTML = '</section>';
	var totHTML = startHTML;
	for (var j = 0; j < allCategoriesData.length; j++) {
		var html = snpMenuCategories;
		var name = "" + allCategoriesData[j].name;
		var shortName = allCategoriesData[j].short_name;
		html = insertProperty(html, "name", name);
		html = insertProperty(html, "short_name", shortName);
		totHTML += html;
	}
	totHTML += endHTML;
	$("#main-content").html(totHTML);
}

/********** Costruzione menuCategories.html **********/
//eseguita da click su tile in "menuCategories.html"

/***********************************/
/************* Utility *************/

function msgErr(testoErrore) {
	let msg = '<p style="color: red; background-color: yellow; text-align: center; font-size: 1.2em; font-weight: bold; padding-top: 10px; padding-bottom: 10px;">';
	msg += testoErrore;
	msg += '</p>';
	return (msg);
};

function caricaMainContentDaFile(pathFile) { //pathFile è relativo alla root del sito
	showLoadingImg("#main-content");
	$.ajax({
		url: pathFile,
		type: "GET",
		dataType: "text",
	})
	.done(function (risposta) { // successo
		$("#main-content").html(risposta);
	})
	.fail(function (xhr, status, errorThrown) {
		$("#main-content").html(msgErr("AJAX error: file " + pathFile + " non caricato."));
	});
};

// Show loading icon inside element identified by 'selector'
var showLoadingImg = function (selector) {
	let html = "<div class='text-center'>";
	html += "<img src='images/ajax-loader.gif'></div>";
	document.querySelector(selector).innerHTML = html;
};

// Return substitute of '{{propName}}'
// with propValue in given 'string'
var insertProperty = function (string, propName, propValue) {
var propToReplace = "{{" + propName + "}}";
string = string
.replace(new RegExp(propToReplace, "g"), propValue);
return string;
}





// window.onload
//document.addEventListener("DOMContentLoaded", function (event) {

		/*var btn = document.getElementById("navbarToggler");
		//alert(btn);
		btn.onblur = function () {
			var screenWidth = window.innerWidth;
				console.log (this);
			if (screenWidth < 768) {
				console.log (screenWidth)
			}
		};*/
		/*document.getElementById("navbarToggler").addEventListener("blur", function (event) {
			var screenWidth = window.innerWidth;
				console.log (this);
			if (screenWidth < 768) {
				document.getElementById("collapsable-nav").style.display = "none";
			}
		});
		
		document.getElementById("navbarToggler").addEventListener("focus", function (event) {
			var screenWidth = window.innerWidth;
				console.log (this);
			if (screenWidth < 768) {
				document.getElementById("collapsable-nav").style.display = "block";
			}
		});*/
		
		/*document.querySelector("body").addEventListener("mousemove",
			function (event) {
				if (event.shiftKey) {
					var mX = event.clientX;
					var mY = event.clientY;
					document.getElementById("x").value = mX;
					document.querySelector("#y").value = mY; // alternativa a getElementById
					console.log("x: " + mX + ";   y: " + mY);
				}
			}
			);*/
//});
