/* ═══════════════════════════════════════
   shared.js — runs on every page
═══════════════════════════════════════ */

/* ── Page transition ── */
document.addEventListener("DOMContentLoaded", () => {
    const pt = document.getElementById("page-transition");
    if (pt) pt.classList.add("done");
});

document.querySelectorAll("a[href]").forEach(a => {
    const href = a.getAttribute("href");
    if (
        href &&
        !href.startsWith("#") &&
        !href.startsWith("mailto") &&
        !href.startsWith("tel") &&
        !href.startsWith("javascript") &&
        !a.hasAttribute("target")
    ) {
        a.addEventListener("click", function (e) {
            if (e.ctrlKey || e.metaKey || e.shiftKey) return;
            e.preventDefault();
            const pt = document.getElementById("page-transition");
            if (pt) pt.classList.remove("done");
            setTimeout(() => (window.location.href = href), 280);
        });
    }
});

/* ── Scroll progress bar + header + back-to-top ── */
window.addEventListener("scroll", () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled   = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;

    const bar = document.getElementById("scroll-progress");
    if (bar) bar.style.width = scrolled + "%";

    const header = document.getElementById("top-header");
    if (header) header.classList.toggle("scrolled", window.scrollY > 50);

    const btt = document.getElementById("back-to-top");
    if (btt) btt.classList.toggle("visible", window.scrollY > 400);
});

/* ── Back to top ── */
const bttBtn = document.getElementById("back-to-top");
if (bttBtn) bttBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ── Dark / Light mode ── */
const html  = document.documentElement;
const saved = localStorage.getItem("theme") || "dark";
html.setAttribute("data-theme", saved);
const themeIcon = document.getElementById("theme-icon");
if (themeIcon) themeIcon.className = saved === "dark" ? "fas fa-sun" : "fas fa-moon";

const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const current = html.getAttribute("data-theme");
        const next    = current === "dark" ? "light" : "dark";
        html.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
        const icon = document.getElementById("theme-icon");
        if (icon) icon.className = next === "dark" ? "fas fa-sun" : "fas fa-moon";
        // sync HCI high-contrast off when switching theme
        if (html.classList.contains("hci-contrast")) {
            html.classList.remove("hci-contrast");
            localStorage.removeItem("hci-contrast");
            const btn = document.getElementById("hci-contrast-btn");
            if (btn) btn.classList.remove("hci-active");
        }
    });
}

/* ── Mobile menu toggle ── */
const menuToggle = document.querySelector(".menu-toggle");
const links      = document.querySelector(".links");
if (menuToggle && links) {
    menuToggle.addEventListener("click", () => links.classList.toggle("open"));
    links.querySelectorAll("a").forEach(a => {
        a.addEventListener("click", () => links.classList.remove("open"));
    });
}

/* ── Fade-in sections on scroll ── */
const fadeObserver = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
    { threshold: 0.08 }
);
document.querySelectorAll(".section, .exp-section, .faq-section, .tools-strip").forEach(s => {
    s.classList.add("fade-section");
    fadeObserver.observe(s);
});

/* ── Skill bar animation on scroll ── */
const skillObserver = new IntersectionObserver(
    entries => entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.querySelectorAll(".skill-fill").forEach(bar => {
                bar.style.width = bar.dataset.width + "%";
            });
        }
    }),
    { threshold: 0.25 }
);
document.querySelectorAll(".skills-cards").forEach(el => skillObserver.observe(el));

/* ════════════════════════════════════════════════════
   HCI ACCESSIBILITY WIDGET
   ● Font size: Small / Default / Large / X-Large
   ● Reading width: Normal / Comfortable (narrower)
   ● High contrast mode
   ● All preferences saved in localStorage
════════════════════════════════════════════════════ */
(function buildHCI() {

    /* ── Restore saved HCI prefs before painting ── */
    const savedSize     = localStorage.getItem("hci-size")    || "default";
    const savedWidth    = localStorage.getItem("hci-width")   || "normal";
    const savedContrast = localStorage.getItem("hci-contrast") === "1";

    applyFontSize(savedSize, false);
    applyWidth(savedWidth, false);
    if (savedContrast) html.classList.add("hci-contrast");

    /* ── Build widget HTML ── */
    const widget = document.createElement("div");
    widget.className = "hci-widget";
    widget.setAttribute("role", "region");
    widget.setAttribute("aria-label", "Accessibility controls");
    widget.innerHTML = `
        <button class="hci-toggle-btn" id="hci-toggle-btn" aria-label="Open accessibility panel" title="Accessibility">
            <i class="fas fa-universal-access"></i>
        </button>
        <div class="hci-panel" id="hci-panel" aria-hidden="true">
            <div class="hci-panel-header">
                <i class="fas fa-universal-access"></i>
                <span>Accessibility</span>
                <button class="hci-close" id="hci-close" aria-label="Close panel"><i class="fas fa-times"></i></button>
            </div>

            <div class="hci-group">
                <p class="hci-label"><i class="fas fa-text-height"></i> Text Size</p>
                <div class="hci-row">
                    <button class="hci-btn hci-size-btn ${savedSize==='small'?'hci-active':''}"   data-size="small"   aria-label="Small text">A<sup>-</sup></button>
                    <button class="hci-btn hci-size-btn ${savedSize==='default'?'hci-active':''}" data-size="default" aria-label="Default text">A</button>
                    <button class="hci-btn hci-size-btn ${savedSize==='large'?'hci-active':''}"   data-size="large"   aria-label="Large text">A<sup>+</sup></button>
                    <button class="hci-btn hci-size-btn ${savedSize==='xlarge'?'hci-active':''}"  data-size="xlarge"  aria-label="Extra large text">A<sup>++</sup></button>
                </div>
            </div>

            <div class="hci-group">
                <p class="hci-label"><i class="fas fa-text-width"></i> Reading Width</p>
                <div class="hci-row">
                    <button class="hci-btn hci-width-btn ${savedWidth==='normal'?'hci-active':''}"      data-width="normal"      aria-label="Normal width">Full</button>
                    <button class="hci-btn hci-width-btn ${savedWidth==='comfortable'?'hci-active':''}" data-width="comfortable" aria-label="Comfortable reading width">Compact</button>
                    <button class="hci-btn hci-width-btn ${savedWidth==='narrow'?'hci-active':''}"      data-width="narrow"      aria-label="Narrow width">Narrow</button>
                </div>
            </div>

            <div class="hci-group">
                <p class="hci-label"><i class="fas fa-adjust"></i> Display</p>
                <div class="hci-row">
                    <button class="hci-btn ${savedContrast?'hci-active':''}" id="hci-contrast-btn" aria-label="Toggle high contrast">
                        <i class="fas fa-circle-half-stroke"></i> Contrast
                    </button>
                    <button class="hci-btn" id="hci-reset-btn" aria-label="Reset all settings">
                        <i class="fas fa-rotate-left"></i> Reset
                    </button>
                </div>
            </div>

            <p class="hci-footer-note">Settings are saved automatically.</p>
        </div>
    `;
    document.body.appendChild(widget);

    /* ── Toggle panel open/close ── */
    const toggleBtn = document.getElementById("hci-toggle-btn");
    const panel     = document.getElementById("hci-panel");
    const closeBtn  = document.getElementById("hci-close");

    function openPanel() {
        panel.classList.add("open");
        panel.setAttribute("aria-hidden", "false");
        toggleBtn.setAttribute("aria-expanded", "true");
    }
    function closePanel() {
        panel.classList.remove("open");
        panel.setAttribute("aria-hidden", "true");
        toggleBtn.setAttribute("aria-expanded", "false");
    }

    toggleBtn.addEventListener("click", () => panel.classList.contains("open") ? closePanel() : openPanel());
    closeBtn.addEventListener("click", closePanel);

    // Close on outside click
    document.addEventListener("click", e => {
        if (!widget.contains(e.target)) closePanel();
    });

    // Close on Escape key
    document.addEventListener("keydown", e => { if (e.key === "Escape") closePanel(); });

    /* ── Font Size ── */
    document.querySelectorAll(".hci-size-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const size = btn.dataset.size;
            applyFontSize(size, true);
            document.querySelectorAll(".hci-size-btn").forEach(b => b.classList.remove("hci-active"));
            btn.classList.add("hci-active");
        });
    });

    /* ── Reading Width ── */
    document.querySelectorAll(".hci-width-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const w = btn.dataset.width;
            applyWidth(w, true);
            document.querySelectorAll(".hci-width-btn").forEach(b => b.classList.remove("hci-active"));
            btn.classList.add("hci-active");
        });
    });

    /* ── High Contrast ── */
    document.getElementById("hci-contrast-btn").addEventListener("click", function () {
        const on = html.classList.toggle("hci-contrast");
        this.classList.toggle("hci-active", on);
        localStorage.setItem("hci-contrast", on ? "1" : "");
    });

    /* ── Reset all ── */
    document.getElementById("hci-reset-btn").addEventListener("click", () => {
        applyFontSize("default", true);
        applyWidth("normal", true);
        html.classList.remove("hci-contrast");
        localStorage.removeItem("hci-contrast");
        localStorage.removeItem("hci-size");
        localStorage.removeItem("hci-width");

        document.querySelectorAll(".hci-size-btn").forEach(b =>
            b.classList.toggle("hci-active", b.dataset.size === "default"));
        document.querySelectorAll(".hci-width-btn").forEach(b =>
            b.classList.toggle("hci-active", b.dataset.width === "normal"));
        document.getElementById("hci-contrast-btn").classList.remove("hci-active");
    });

})(); // end buildHCI

/* ── Font size applier ── */
function applyFontSize(size, save) {
    const sizeMap = { small: "13px", default: "16px", large: "19px", xlarge: "22px" };
    document.documentElement.style.fontSize = sizeMap[size] || "16px";
    if (save) localStorage.setItem("hci-size", size);
}

/* ── Reading width applier ── */
function applyWidth(w, save) {
    const widthMap = { normal: "1080px", comfortable: "780px", narrow: "620px" };
    document.documentElement.style.setProperty("--max-width", widthMap[w] || "1080px");
    if (save) localStorage.setItem("hci-width", w);
}
