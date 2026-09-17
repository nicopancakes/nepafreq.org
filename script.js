(function () {
  "use strict";

  let frequencies = [];
  let currentCountyFilter = "all";

  const tbody = document.querySelector("#freqTable tbody");
  const searchInput = document.getElementById("searchInput");

  const DB_BASE = "https://nepafreq-org.github.io/NepaFREQdb";

  function showError() {
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center;padding:2.5rem;color:#c00;">
            Error loading frequency database.
          </td>
        </tr>`;
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

  function useDatabase() {
    if (window.DB && Array.isArray(window.DB.frequencies)) {
      frequencies = window.DB.frequencies;
      console.log("[site] using database –", frequencies.length, "frequencies");
      renderTable(frequencies);
      return true;
    }
    return false;
  }

  function loadDatabase() {
    // Already available?
    if (useDatabase()) return;

    // Load main.js from GitHub Pages
    const s = document.createElement("script");
    s.src = `${DB_BASE}/main.js`;
    s.async = true;

    s.onload = () => console.log("[site] main.js loaded");
    s.onerror = () => {
      console.error("[site] failed to load main.js");
      showError();
    };

    document.head.appendChild(s);

    // Fallback polling in case the event is missed
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      if (useDatabase() || attempts > 40) {
        clearInterval(poll);
        if (attempts > 40 && !window.DB) {
          console.error("[site] timed out waiting for database");
          showError();
        }
      }
    }, 250);
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

  // Start
  document.addEventListener("DOMContentLoaded", () => {
    setupEvents();
    loadDatabase();
  });

  // Also listen for the official event
  window.addEventListener("db-ready", () => {
    console.log("[site] db-ready event received");
    useDatabase();
  });
})();
