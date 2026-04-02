const correctPassword = "גלי123";

const loginScreen = document.getElementById("login-screen");
const siteContent = document.getElementById("site-content");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const errorMsg = document.getElementById("errorMsg");

function showSite() {
  loginScreen.classList.add("hidden");
  siteContent.classList.remove("hidden");
}

function showLogin() {
  loginScreen.classList.remove("hidden");
  siteContent.classList.add("hidden");
}

function login() {
  const enteredPassword = passwordInput.value;

  if (enteredPassword === correctPassword) {
    sessionStorage.setItem("siteAccess", "granted");
    errorMsg.textContent = "";
    showSite();
  } else {
    errorMsg.textContent = "הסיסמה שגויה, נסי שוב";
  }
}

loginBtn.addEventListener("click", login);

passwordInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    login();
  }
});

logoutBtn.addEventListener("click", function () {
  sessionStorage.removeItem("siteAccess");
  passwordInput.value = "";
  showLogin();
});

if (sessionStorage.getItem("siteAccess") === "granted") {
  showSite();
} else {
  showLogin();
}