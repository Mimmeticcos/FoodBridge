const user = JSON.parse(localStorage.getItem("foodbridgeUser"));

if (!user) {
  location.href = "login.html";
}

document.getElementById("donateForm").addEventListener("submit", async event => {
  event.preventDefault();

  const body = {
    food_name: document.getElementById("food_name").value,
    category: document.getElementById("category").value,
    quantity: document.getElementById("quantity").value,
    location: document.getElementById("location").value,
    expiry: document.getElementById("expiry").value,
    description: document.getElementById("description").value,
    donor_id: user.id
  };

  const response = await fetch("/api/donations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  const message = document.getElementById("message");
  message.textContent = data.error || data.message;

  if (response.ok) {
    message.style.color = "#23734d";
    setTimeout(() => {
      location.href = "listings.html";
    }, 900);
  } else {
    message.style.color = "#b33a3a";
  }
});
