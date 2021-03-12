"use strict";

var urlsnpIndex = "snippets/snpIndex.html";
var urlsnpMenuCategories = "snippets/snpMenuCategories.html";
var urlallCategories = "https://davids-restaurant.herokuapp.com/categories.json";
var urlitemsDellaCategoria = "https://davids-restaurant.herokuapp.com/menu_items.json?category=";


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
	//chiede i dati (name e short_name) al servizio web su heroku
	$.ajax({
		url: urlallCategories,
		type: "GET",
		dataType: "json",
	})
	.done(function (allCategoriesData) { // successo
		//in risposta ho un json array con 1 elemento per categoria
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

/********** Costruzione "singleCategory.html" **********/
//eseguita da click su tile in "menuCategories.html"
//carica i vari piatti (items) relativi alla categoria selezionata
function loadMenuItems(categoryShortName) {
	showLoadingImg("#main-content");
	var ajaxConfig = {
		url: urlallCategories,
		type: "GET",
		dataType: "json",
	};
	$.ajax(ajaxConfig)
	.done(function (allCategoriesData) { // successo
		//in risposta ho un json array con 1 elemento per categoria
		var categoria = ($.grep(allCategoriesData, function(elem, ix) {
			return (elem.short_name == categoryShortName);
		}))[0]; // [0] perché grep restituisce un array, in questo caso di 1 el.
		getItemsDellaCategoriaEcc(categoria);
	})
	.fail(function (xhr, status, errorThrown) {
		$("#main-content").html(msgErr("AJAX error! Tipo richiesta: " + ajaxConfig.type + " -  URL:" + ajaxConfig.url));
	});
}

function getItemsDellaCategoriaEcc(categoria) {
	// Ecc = Eccetera ... chiamate ajax concatenate
	var ajaxConfig = {
		url: urlitemsDellaCategoria + categoria.short_name,
		type: "GET",
		dataType: "json",
	};
	$.ajax(ajaxConfig)
	.done(function (categoryItemsData) { // successo: ho i piatti della categoria
		//in risposta ho un json array con 1 elemento per ogni piatto (item)
		creaMainContentConItemsDellaCategoria(categoria, categoryItemsData);
	})
	.fail(function (xhr, status, errorThrown) {
		$("#main-content").html(msgErr("AJAX error! Tipo richiesta: " + ajaxConfig.type + " -  URL:" + ajaxConfig.url));
	});
}

function creaMainContentConItemsDellaCategoria(categoria, categoryItemsData) {
	alert(categoryItemsData.length)
	var objMainContent = $("#main-content");
	var newDOM = null;
	var startHTML = 
		'<h2 id="menu-categories-title" class="text-center">{{name}} Menu</h2>' +
		'<div class="text-center">{{special_instructions}}</div>' +
		'<section class="row">';
	var endHTML = '</section>';
	var midHTML = 
		'<div class="menu-item-tile col-lg-6">' +
		'	<div class="row">' +
		'		<div class="col-sm-5">' +
		'			<div class="menu-item-photo">' +
		'				<div>{{short_name}}</div>' +
		'				<img class="img-fluid" width="250" height="150" src="images/menu/{{catShortName}}/{{short_name}}.jpg" alt="{{name}}">' +
		'			</div>' +
		'			<div class="menu-item-price">{{price_small}}<span> {{small_portion_name}}</span> {{price_large}} <span>{{large_portion_name}}</span></div>' +
		'		</div>' +
		'		<div class="menu-item-description col-sm-7">' +
		'			<h3 class="menu-item-title">{{name}}</h3>' +
		'			<p class="menu-item-details">{{description}}</p>' +
		'		</div>' +
		'	</div>' +
		'	<hr class="d-block d-sm-none">' +
		'</div>';
	startHTML = insertProperty(startHTML, "name", categoria.name);
	startHTML = insertProperty(startHTML, "special_instructions", categoria.special_instructions);
	newDOM = $.parseHTML(startHTML);
	objMainContent.html(newDOM);
	//per ogni piatto ...
	for (var j = 0; j < categoryItemsData.length; j++) {
		// ... ne inserisce i valori nella copia del template
		var html = midHTML;
		html = insertProperty(html, "short_name", categoryItemsData[i].short_name);
		html = insertProperty(html, "catShortName", catShortName);
		html = insertItemPrice(html, "price_small", categoryItemsData[i].price_small);
		html = insertItemPortionName(html, "small_portion_name", categoryItemsData[i].small_portion_name);
		html = insertItemPrice(html, "price_large", categoryItemsData[i].price_large);
		html = insertItemPortionName(html, "large_portion_name", categoryItemsData[i].large_portion_name);
		html = insertProperty(html, "name", categoryItemsData[i].name);
		html = insertProperty(html, "description", categoryItemsData[i].description);
	}
	objMainContent.append(html);
	objMainContent.append(endHTML);
}






/*******************************************************/
/*********************** Utility ***********************/

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
