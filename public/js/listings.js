let allDonations = [];

const user = JSON.parse(localStorage.getItem("foodbridgeUser"));

async function loadDonations() {
  const response = await fetch("/api/donations");
  allDonations = await response.json();
  render();
}

function render() {
  const searchText =
    document.getElementById("search").value.toLowerCase();

  const category =
    document.getElementById("filter").value;

  const filtered = allDonations.filter(donation => {
    const matchesSearch =
      donation.food_name.toLowerCase().includes(searchText) ||
      donation.location.toLowerCase().includes(searchText);

    const matchesCategory =
      category === "All" || donation.category === category;

    return matchesSearch && matchesCategory;
  });

  const container = document.getElementById("listings");

  if (!filtered.length) {
    container.innerHTML = `
      <div class="card">
        <h3>No donations found</h3>
        <p>Try another search or check back later.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(donation => `
    <div class="card listing-card">
      <span class="status">${escapeHtml(donation.status)}</span>

      <h3>${escapeHtml(donation.food_name)}</h3>

      <div class="meta">
        🍽️ ${escapeHtml(donation.category)}<br>
        📦 ${escapeHtml(donation.quantity)}<br>
        📍 ${escapeHtml(donation.location)}<br>
        ⏰ ${escapeHtml(donation.expiry)}
      </div>

      <p>${escapeHtml(donation.description || "No description provided.")}</p>

      ${
        donation.status === "Available" && user
        ? `<button class="btn claim-btn"
             onclick="claimDonation(${donation.id})">
             Claim Food
           </button>`
        : ""
      }
    </div>
  `).join("");
}

async function claimDonation(id) {
  const response = await fetch("/api/donations/" + id + "/claim", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user_id: user.id
    })
  });

  const data = await response.json();

  alert(data.error || data.message);

  if (response.ok) {
    user.points = (user.points || 0) + 10;
    localStorage.setItem("foodbridgeUser", JSON.stringify(user));
    loadDonations();
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[character]));
}

document.getElementById("search").addEventListener("input", render);
document.getElementById("filter").addEventListener("change", render);

loadDonations();
