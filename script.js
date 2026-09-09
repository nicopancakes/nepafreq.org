(function () {
  "use strict";

  let frequencies = [];
  let currentCountyFilter = "all";

  const tbody = document.querySelector("#freqTable tbody");
  const searchInput = document.getElementById("searchInput");
  async function loadDatabase() {
    if (window.DB && Array.isArray(window.DB.frequencies)) {
      frequencies = window.DB.frequencies;
      console.log("[site] using window.DB –", frequencies.length, "frequencies");
      renderTable(frequencies);
      return;
    }
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/NEPAFreq-org/NepaFREQdb/main/modules/data.json"
      );
      if (!response.ok) throw new Error("HTTP " + response.status);

      const data = await response.json();
      frequencies = data.frequencies || [];
      window.DB = data;

      console.log("[site] loaded directly ", frequencies.length, "frequencies");
      renderTable(frequencies);
    } catch (err) {
      console.error("[site] failed to load database", err);
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align:center;padding:2.5rem;color:#c00;">
              Error loading frequency database.
            </td>
          </tr>`;
      }
    }
  }
  function renderTable(data) {
    if (!tbody) return;

    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center;padding:2.5rem;color:#888;">
            No frequencies found.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = data
      .map(
        (item) => `
      <tr>
        <td><span class="freq">${escapeHtml(item.freq || "")}</span></td>
        <td>${escapeHtml(item.service || "")}</td>
        <td>${escapeHtml(item.county || "")}</td>
        <td>${escapeHtml(item.desc || "")}</td>
      </tr>`
      )
      .join("");
  }
  function filterFrequencies() {
    const term = (searchInput?.value || "").toLowerCase().trim();
    let filtered = frequencies;

    if (currentCountyFilter !== "all") {
      filtered = filtered.filter((f) => f.county === currentCountyFilter);
    }

    if (term) {
      filtered = filtered.filter(
        (f) =>
          (f.freq && f.freq.toLowerCase().includes(term)) ||
          (f.service && f.service.toLowerCase().includes(term)) ||
          (f.county && f.county.toLowerCase().includes(term)) ||
          (f.desc && f.desc.toLowerCase().includes(term))
      );
    }

    renderTable(filtered);
  }
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  function setupEvents() {
    if (searchInput) {
      searchInput.addEventListener("input", filterFrequencies);
    }

    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".filter-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentCountyFilter = btn.dataset.county || "all";
        filterFrequencies();
      });
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    setupEvents();
    loadDatabase();
  });
  window.addEventListener("db-ready", () => {
    if (window.DB && window.DB.frequencies) {
      frequencies = window.DB.frequencies;
      renderTable(frequencies);
    }
  });
})();
