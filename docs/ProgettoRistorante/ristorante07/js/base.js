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
	$("#lnkNavAbout").click(creaMainContentAbout);
	$("#lnkNavAwards").click(creaMainContentAwards);
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
		//la function anonima mi permette di passare il parametro
		$("#lnkTileSpecials").click(function() {loadMenuItems("SP")});
	})
	.fail(function (xhr, status, errorThrown) {
		$("#main-content").html(msgErr("AJAX error! Tipo richiesta: GET -  URL:" + urlsnpIndex));
	});
};

/********** Costruzione "menuCategories.html" **********/
//eseguita da click su menu (nav o tile)
function caricaMainContentDaSnpMenuCategories() {
	showLoadingImg("#main-content");
	$("nav#header-nav a").removeClass("active");
	$("#lnkNavMenuCategories").addClass("active");
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
	$("nav#header-nav a").removeClass("active");
	var ajaxConfig = {
		url: urlitemsDellaCategoria + categoryShortName,
		type: "GET",
		dataType: "json",
	};
	$.ajax(ajaxConfig)
	.done(function (categoryAndItemsData) { // successo
		//in risposta ho un json array con 1 elemento per ogni piatto (item)
		creaMainContentConItemsDellaCategoria(categoryAndItemsData);
	})
	.fail(function (xhr, status, errorThrown) {
		$("#main-content").html(msgErr("AJAX error! Tipo richiesta: " + ajaxConfig.type + " -  URL:" + ajaxConfig.url));
	});
}

function creaMainContentConItemsDellaCategoria(categoryAndItemsData) {
	var objMainContent = $("#main-content");
	var totHTML = "";
	var startHTML = 
		'<h2 id="single-category-title" class="text-center">{{name}} Menu</h2>' +
		'<div class="text-center">{{special_instructions}}</div>' +
		'<section class="row">';
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
	var endHTML = '</section>';
	startHTML = insertProperty(startHTML, "name", categoryAndItemsData.category.name);
	startHTML = insertProperty(startHTML, "special_instructions", categoryAndItemsData.category.special_instructions);
	totHTML = startHTML;
	//per ogni piatto ...
	for (var j = 0; j < categoryAndItemsData.menu_items.length; j++) {
		// ... ne inserisce i valori nella copia del template
		var html = midHTML;
		html = insertProperty(html, "short_name", categoryAndItemsData.menu_items[j].short_name);
		html = insertProperty(html, "catShortName", categoryAndItemsData.category.short_name);
		html = insertItemPrice(html, "price_small", categoryAndItemsData.menu_items[j].price_small);
		html = insertItemPortionName(html, "small_portion_name", categoryAndItemsData.menu_items[j].small_portion_name);
		html = insertItemPrice(html, "price_large", categoryAndItemsData.menu_items[j].price_large);
		html = insertItemPortionName(html, "large_portion_name", categoryAndItemsData.menu_items[j].large_portion_name);
		html = insertProperty(html, "name", categoryAndItemsData.menu_items[j].name);
		html = insertProperty(html, "description", categoryAndItemsData.menu_items[j].description);
		totHTML += html;
	}
	totHTML += endHTML;
	objMainContent.html(totHTML);
}

/********** Costruzione "about.html" **********/
//eseguita da click su menu (nav)
function creaMainContentAbout() {
	$("nav#header-nav a").removeClass("active");
	$("#lnkNavAbout").addClass("active");
	var objMainContent = $("#main-content");
	var totHTML = 
		'<h2 id="about-title" class="text-center">About</h2>' +
		'<p>This is the final version of the Restaurant Project of the <a href="https://www.coursera.org/learn/html-css-javascript-for-web-developers" target="_blank">"HTML, CSS, and Javascript for Web Developers" course</a> delivered by the Johns Hopkins University through the "Coursera" web platform.</p>' +
		'<p>The course is really interesting and worth following: I strongly recommend it.</p>' +
		'<p>This site implementation is quite different from the one proposed in the course, as I chose to use Bootstrap version 5, while the course refers (March 2021) to version 4. This forced me to study Bootstrap more thoroughly, and therefore to learn it better. Also I have used jQuery extensively (which is not covered in the course) for both AJAX calls and DOM manipulation.</p>' +
		'<p class="firma">Alessandro Cazziolato</p>';
	objMainContent.html(totHTML);
}

/********** Costruzione "awards.html" **********/
//eseguita da click su menu (nav)
function creaMainContentAwards() {
	$("nav#header-nav a").removeClass("active");
	$("#lnkNavAwards").addClass("active");
	var objMainContent = $("#main-content");
	var totHTML = 
		'<h2 id="about-title" class="text-center">Awards</h2>' +
		'<p class="text-center">David Chu&rsquo;s China Bistro is a recepient of multiple awards for its great food and service.</p>' +
		'<p class="text-center">Details are coming soon.</p>';
	objMainContent.html(totHTML);
}

/********** Costruzione "creaMainContentSpecials.html" **********/
//eseguita da click su menu (tile)
function creaMainContentSpecials() {
	//$("nav#header-nav a").removeClass("active");
	//$("#lnkNavAwards").addClass("active");
	var objMainContent = $("#main-content");
	var totHTML = 
		'<h2 id="about-title" class="text-center">Specials</h2>' +
		'<p></p>';
	objMainContent.html(totHTML);
}



/*... come selezionare per "chiave" un elemento di un vettore json
		//in risposta ho un json array con 1 elemento per categoria
		var categoria = ($.grep(allCategoriesData, function(elem, ix) {
			return (elem.short_name == categoryShortName);
		}))[0]; // [0] perché grep restituisce un array, in questo caso di 1 el.
*/

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

function insertItemPrice(html, pricePropName, priceValue) {
	// If not specified, replace with empty string
	if (!priceValue) {
		return insertProperty(html, pricePropName, "");;
	}
	priceValue = "$" + priceValue.toFixed(2);
	return insertProperty(html, pricePropName, priceValue);;
}

function insertItemPortionName(html, portionPropName, portionValue) {
	// If not specified, return original string
	if (!portionValue) {
		return insertProperty(html, portionPropName, "");
	}
	portionValue = "(" + portionValue + ")";
	return insertProperty(html, portionPropName, portionValue);;
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
