(function () {
  const BASE = "https://nepafreq-org.github.io/NepaFREQdb";

  function inject(src, cb) {
    const s = document.createElement("script");
    s.src = src;
    s.onload = cb || null;
    s.onerror = () => console.error("[main] failed to load", src);
    document.head.appendChild(s);
  }

  // Load host.js first (domain guard)
  inject(`${BASE}/modules/host.js`, function () {
    if (typeof window.__HOST_OK__ === "undefined" || !window.__HOST_OK__) {
      console.error("[main] blocked by host check");
      return;
    }

    // Then mend.js
    inject(`${BASE}/modules/mend.js`, function () {
      // Then load.js
      inject(`${BASE}/modules/load.js`, function () {
        // Small delay so load.js can finish fetching
        setTimeout(function () {
          // Finally pure.js
          inject(`${BASE}/modules/pure.js`, function () {
            console.log("[main] database ready", window.DB);
            window.dispatchEvent(new Event("db-ready"));
          });
        }, 300);
      });
    });
  }); 
})();   
