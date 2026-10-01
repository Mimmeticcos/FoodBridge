async function loadStats() {
  try {
    const response = await fetch("/api/stats");
    const stats = await response.json();

    const ids = ["total", "available", "claimed", "rescued"];

    ids.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.textContent = stats[id] ?? 0;
    });
  } catch (error) {
    console.error(error);
  }
}

loadStats();
