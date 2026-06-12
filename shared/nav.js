// Fügt auf jeder Seite die gemeinsame Kopfzeile ein: Link zur Startseite plus
// ein Link pro Tool aus window.TOOLS (tools.js muss vorher eingebunden sein).
//
// Die Repo-Wurzel wird aus der eigenen Script-URL abgeleitet (…/shared/nav.js
// → …/). Dadurch stimmen die Links von jeder Verschachtelungstiefe aus —
// lokal wie auf GitHub Pages, ohne absolute Pfade.
(function () {
  const script = document.currentScript;
  const root = script
    ? script.src.replace(/shared\/nav\.js(\?.*)?$/, "")
    : "./";

  function build() {
    const header = document.createElement("header");
    header.className = "site-header";

    const brand = document.createElement("a");
    brand.className = "site-header__brand";
    brand.href = root + "index.html";
    brand.textContent = "🧰 ttools";
    header.appendChild(brand);

    const nav = document.createElement("nav");
    nav.className = "site-header__nav";

    const tools = Array.isArray(window.TOOLS) ? window.TOOLS : [];
    tools.forEach(function (tool) {
      const link = document.createElement("a");
      link.className = "site-header__link";
      link.href = root + tool.href;
      link.textContent = (tool.icon ? tool.icon + " " : "") + tool.title;
      if (link.href === location.href.split(/[?#]/)[0]) {
        link.classList.add("site-header__link--active");
      }
      nav.appendChild(link);
    });

    header.appendChild(nav);
    document.body.insertBefore(header, document.body.firstChild);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
