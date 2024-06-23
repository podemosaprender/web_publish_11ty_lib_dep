// //  Window scroll sticky class add
function windowScroll() {
    const navbar = document.getElementById("navbar");
    if (
        document.body.scrollTop >= 50 ||
        document.documentElement.scrollTop >= 50
    ) { navbar.classList.add("nav-sticky"); 
		} else { navbar.classList.remove("nav-sticky"); }
}
window.addEventListener('scroll', (ev) => { ev.preventDefault(); windowScroll(); });
var scroll = new SmoothScroll('#navbar-navlist a', { speed: 500, offset: 70 });

var spy = new Gumshoe('#navbar-navlist a', { navClass: 'active', contentClass: 'active', offset: 80 });

window.onload = function preloader() {
	setTimeout(() => {
		const el= document.getElementById('preloader');
		if (el) { el.style.visibility = 'hidden';
			document.getElementById('preloader').style.opacity = '0';
			window.Unicons.refresh();
		}
	}, 1000);
};

try { feather.replace(); } // Icons
catch (ex) { console.error("Check for unknown feather icons",ex) }
document.querySelectorAll('.datef').forEach( e => (e.innerHTML=e.innerHTML ? new Date(e.innerHTML).toLocaleString() : ''))

/********************* light-dark js ************************/
var bodyElem = document.documentElement;
if (bodyElem.hasAttribute("data-bs-theme") && bodyElem.getAttribute("data-bs-theme") == "light") {
    sessionStorage.setItem("data-layout-mode", "light");
} else if (bodyElem.getAttribute("data-bs-theme") == "dark") {
    sessionStorage.setItem("data-layout-mode", "dark");
}
if (sessionStorage.getItem("data-layout-mode") == null) {
    bodyElem.setAttribute("data-bs-theme", "light");
} else if (sessionStorage.getItem("data-layout-mode")) {
    bodyElem.setAttribute("data-bs-theme", sessionStorage.getItem("data-layout-mode"));
}
var lightDarkBtn = document.getElementById('light-dark-mode');
if (lightDarkBtn) {
    lightDarkBtn.addEventListener('click', function (event) {
        if (bodyElem.hasAttribute("data-bs-theme") && bodyElem.getAttribute("data-bs-theme") == "dark") {
            bodyElem.setAttribute('data-bs-theme', 'light');
            sessionStorage.setItem("data-layout-mode", "light");
        } else {
            bodyElem.setAttribute('data-bs-theme', 'dark');
            sessionStorage.setItem("data-layout-mode", "dark");
        }
    });
} 

// Contact Form
function validateForm() {
    var name = document.forms["myForm"]["name"].value;
    var email = document.forms["myForm"]["email"].value;
    var comments = document.forms["myForm"]["comments"].value;
    document.getElementById("error-msg").style.opacity = 0;
    document.getElementById('error-msg').innerHTML = "";
    if (name == "" || name == null) {
        document.getElementById('error-msg').innerHTML = "<div class='alert alert-warning'>*Please enter a Name*</div>";
        fadeIn();
        return false;
    }
    if (email == "" || email == null) {
        document.getElementById('error-msg').innerHTML = "<div class='alert alert-warning'>*Please enter a Email*</div>";
        fadeIn();
        return false;
    }
    if (comments == "" || comments == null) {
        document.getElementById('error-msg').innerHTML = "<div class='alert alert-warning'>*Please enter a Comments*</div>";
        fadeIn();
        return false;
    }

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("simple-msg").innerHTML = this.responseText;
            document.forms["myForm"]["name"].value = "";
            document.forms["myForm"]["email"].value = "";
            document.forms["myForm"]["comments"].value = "";
        }
    };
    xhttp.open("POST", "php/contact.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("name=" + name + "&email=" + email + "&comments=" + comments);
    return false;
}

function fadeIn() {
    var fade = document.getElementById("error-msg");
    var opacity = 0;
    var intervalID = setInterval(function () {
        if (opacity < 1) {
            opacity = opacity + 0.5;
            fade.style.opacity = opacity;
        } else {
            clearInterval(intervalID);
        }
    }, 200);
}

