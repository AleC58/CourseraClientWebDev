"use strict";

var snpIndex = "snippets/snpIndex.html";

document.addEventListener("DOMContentLoaded", function (event) {
	//alert(event);
	showLoadingImg("#main-content");
	$.ajax({
		url: snpIndex,
		type: "GET",
		dataType: "text",
		//crossDomain: true,
		//headers: {"X-My-Custom-Header": "some value"}
	})
	.done(function (risposta) { // successo
		$("#main-content").html(risposta);
	})
	.fail(function (xhr, status, errorThrown) {
		alert("Sorry, there was a problem!");
	});
});

// Show loading icon inside element identified by 'selector'
var showLoadingImg = function (selector) {
	let html = "<div class='text-center'>";
	html += "<img src='images/ajax-loader.gif'></div>";
	document.querySelector(selector).innerHTML = html;
};






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
