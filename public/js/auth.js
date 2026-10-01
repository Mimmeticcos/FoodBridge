const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

if (registerForm) {
  registerForm.addEventListener("submit", async event => {
    event.preventDefault();

    const body = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      role: document.getElementById("role").value
    };

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    message.textContent = data.error || data.message;

    if (response.ok) {
      message.style.color = "#23734d";
      setTimeout(() => {
        location.href = "login.html";
      }, 800);
    } else {
      message.style.color = "#b33a3a";
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async event => {
    event.preventDefault();

    const body = {
      email: document.getElementById("email").value,
      password: document.getElementById("password").value
    };

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    message.textContent = data.error || data.message;

    if (response.ok) {
      localStorage.setItem("foodbridgeUser", JSON.stringify(data.user));
      location.href = "dashboard.html";
    } else {
      message.style.color = "#b33a3a";
    }
  });
}
