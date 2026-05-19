let frequencies = [];
let currentCountyFilter = "all";

async function loadFrequencies() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/nicopancakes/nepafreq.org/refs/heads/main/data/db.json');
        const data = await response.json();
        frequencies = data.frequencies || [];
        renderTable(frequencies);
    } catch (error) {
        console.error("(!) Failed to load frequencies.json", error);
        document.querySelector("#freqTable tbody").innerHTML = 
            `<tr><td colspan="4" style="text-align:center;padding:3rem;">Error loading frequencies.json.</td></tr>`;
    }
}
function renderTable(data) {
    const tbody = document.querySelector("#freqTable tbody");
    tbody.innerHTML = data.map(item => `
        <tr>
            <td><span class="freq">${item.freq}</span></td>
            <td>${item.service}</td>
            <td>${item.county}</td>
            <td>${item.desc}</td>
        </tr>
    `).join("");
}

function filterFrequencies() {
    const term = document.getElementById("searchInput").value.toLowerCase();
    let filtered = frequencies;

    if (currentCountyFilter !== "all") {
        filtered = filtered.filter(f => f.county === currentCountyFilter);
    }
    if (term) {
        filtered = filtered.filter(f => 
            (f.freq && f.freq.toLowerCase().includes(term)) || 
            (f.service && f.service.toLowerCase().includes(term)) || 
            (f.county && f.county.toLowerCase().includes(term)) || 
            (f.desc && f.desc.toLowerCase().includes(term))
        );
    }
    renderTable(filtered);
}
document.addEventListener("DOMContentLoaded", () => {
    loadFrequencies();
    
    document.getElementById("searchInput").addEventListener("input", filterFrequencies);
    
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentCountyFilter = btn.dataset.county;
            filterFrequencies();
        });
    });
});
