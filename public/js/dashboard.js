const user = JSON.parse(localStorage.getItem("foodbridgeUser"));

if (!user) {
  location.href = "login.html";
} else {
  document.getElementById("welcome").textContent =
    "Welcome, " + user.name + "!";

  document.getElementById("points").textContent = user.points || 0;

  fetch("/api/stats")
    .then(response => response.json())
    .then(stats => {
      document.getElementById("total").textContent = stats.total || 0;
      document.getElementById("available").textContent = stats.available || 0;
      document.getElementById("claimed").textContent = stats.claimed || 0;
    });
}

function logout() {
  localStorage.removeItem("foodbridgeUser");
  location.href = "index.html";
}
