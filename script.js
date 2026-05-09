const changelog = [
    {
        version: "0.0.1",
        date: "28.04.2026",
        isNew: true,
        changes: {
            added: ["Dodano opcje ręcznego oraz urposzczonego podpisu", "Dodano dziennik zmian", "Dodano przycisk od wczytania ostatniego swojego podpisu",],
            fixed: ["Brak"],
            changed: ["Poprawiono lekko style przycisków"]
        }
    }
];

const reportTemplates = {

    support: {
        title: "🔨 RAPORT SUPPORT",

        sections: [
            {
                title: "SUPPORT",
                x: 20,
                y: 110,
                w: 860,

                fields: [
                    ["Nick", "nick"],
                    ["Data", "data-sluzby"],
                    ["Godzina wyjścia", "godzina-wyjscia"],
                    ["Godzina wejścia", "godzina-wejscia"],
                    ["Co robiłeś", "co-robiono"],
                    ["Zgłoszeni gracze", "ilosc-zgloszonych"],
                    ["Ticket/VC pomoc", "ilosc-tickety-vc"],
                    ["Przerwy", "ilosc-przerw"],
                    ["Numerek", "numerek"],
                    ["Dowód", "dowod"]
                ]
            }
        ]
    },

    moderator: {
        title: "🛡️ RAPORT ADMINISTRACJI Z PERMISJAMI",

        sections: [
            {
                title: "ADMINISTRACJA Z PERMISJAMI",
                x: 20,
                y: 110,
                w: 860,

                fields: [
                    ["Nick", "nick2"],
                    ["Godzina wejścia", "wejscie"],
                    ["Godzina wyjścia", "wyjscie"],

                    ["Data", "data-sluzby"],
                    ["Numerek", "numerek"],

                    ["Przerwy", "ilosc-przerw"],

                    ["Co robiłeś", "co-robiono"],
                    ["Ticket/VC pomoc", "ilosc-tickety-vc"],

                    ["Zgłoszeni gracze", "ilosc-zgloszonych"],
                    ["Bany", "bany"],

                    ["Kicki", "kicki"],
                    ["Dowód", "dowod"]
                ]
            }
        ]
    }
};

let selectedMode = null;

const start = new Date("2026-04-26T00:00:00");
const end = new Date("2026-04-27T20:00:00");

const maintenanceDiv = document.getElementById("maintenance");
const timer = document.getElementById("timer");

let startTime = null;
let elapsed = 0;
let interval = null;
let running = false;
const display = document.getElementById("timeDisplay");

function updateMaintenance() {
    const now = new Date();

    if (now >= start && now <= end) {
        maintenanceDiv.style.display = "flex";

        const diff = end - now;

        const h = Math.floor(diff / 1000 / 60 / 60);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);

        timer.innerText = `${h}h ${m}m ${s}s`;

    } else {
        maintenanceDiv.style.display = "none";
        //alert("Informuję że w dniu 16.04.2026r. strona będzie niedostępna od 00:00 do 20:00 spowodowane jest to pracami nad ulepszeniem strony, prosmy ręcznie wypisywać raporty! Przepraszam za problem ale będzie mocna przebudowa :)");
    }
}

setInterval(updateMaintenance, 1000);
updateMaintenance();

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) updateMaintenance();
});

function wrap(text, width) {
    let result = [];
    text = text || "";

    while (text.length > width) {
        result.push(text.substring(0, width));
        text = text.substring(width);
    }
    result.push(text);
    return result;
}

document.addEventListener("DOMContentLoaded", () => {

    const select = document.getElementById("trybSelect");
    const selected = select.querySelector(".select-selected");
    const options = select.querySelector(".select-options");
    const optionItems = select.querySelectorAll(".select-option");

    selected.addEventListener("click", () => {
        options.style.display = options.style.display === "block" ? "none" : "block";
        selected.classList.toggle("active"); // 👈 TO
    });

    optionItems.forEach(option => {

        option.addEventListener("click", () => {

            const canvas = document.getElementById("canvas");
            const ctx = canvas.getContext("2d");

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.display = "none";

            selectedMode = option.dataset.value;

            const btn = document.querySelector(".generate");
            btn.style.display = "block";

            selected.textContent = option.textContent;
            options.style.display = "none";
            selected.classList.remove("active");

            document.querySelectorAll(".fields").forEach(f => {
                f.style.display = "none";
            });

            if (selectedMode === "support") {
                document.getElementById("fields-support").style.display = "grid";
            }

            if (selectedMode === "moderator") {
                document.getElementById("fields-moderator").style.display = "grid";
            }

        });

    });

    document.addEventListener("click", (e) => {
        if (!select.contains(e.target)) {
            options.style.display = "none";
            selected.classList.remove("active"); // 👈 reset
        }
    });

});

function linia(label, value, width = 42) {
    let lines = wrap(value, width);
    let out = [];

    lines.forEach((line, i) => {
        if (i === 0) {
            let txt = (label + line).padEnd(width);
            out.push(`│ ${txt} │`);
        } else {
            let txt = line.padEnd(width);
            out.push(`│ ${txt} │`);
        }
    });

    return out.join("\n");
}

async function kopiuj() {
    try {
        const canvas = document.getElementById("canvas");

        canvas.toBlob(async (blob) => {
            if (!blob) {
                alert("Błąd generowania obrazu");
                return;
            }

            await navigator.clipboard.write([
                new ClipboardItem({
                    "image/png": blob
                })
            ]);

            alert("Skopiowano raport do schowka");
        });

    } catch (err) {
        console.error(err);
        alert("Twoja przeglądarka nie obsługuje kopiowania obrazów");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("year").textContent = new Date().getFullYear();
});

async function startRaport() {
    openSignature();
}

let canvasReady = false;


async function generujCanvas() {

    return new Promise((resolve) => {

        const template = reportTemplates[selectedMode];

        if (!template) {
            alert("Nie wybrano trybu raportu");
            return;
        }

        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");

        canvas.style.display = "";

        const width = 900;
        const height = 450;

        canvas.width = width;
        canvas.height = height;

        ctx.fillStyle = "#0b1220";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#111827";
        roundRect(ctx, 20, 20, width - 40, 70, 12, true);

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 26px Segoe UI";
        ctx.fillText(template.title, 40, 65);

        ctx.fillStyle = "#9ca3af";
        ctx.font = "14px Segoe UI";
        const data = document.getElementById("data-sluzby")?.value?.trim();

        ctx.fillText(
            data || new Date().toLocaleDateString("pl-PL"),
            width - 150,
            65
        );

        template.sections.forEach(section => {

            drawSection(
                section.title,
                section.x,
                section.y,
                section.w,
                section.fields
            );

        });

        function drawSection(title, x, y, w, fields) {

            const rowH = 25;
            const headerH = 70;
            const footerH = signatureData ? 90 : 40;

            const rows = Math.ceil(fields.length / 2);

            const sectionHeight = headerH + (rows * rowH) + footerH;

            ctx.fillStyle = "#111827";
            roundRect(ctx, x, y, w, sectionHeight, 10, true);

            ctx.fillStyle = "#38bdf8";
            ctx.font = "bold 14px Segoe UI";
            ctx.fillText(title, x + 15, y + 25);

            ctx.fillStyle = "#1f2937";
            ctx.fillRect(x + 15, y + 35, w - 30, 1);

            fields.forEach((f, index) => {

                const col = index % 2;
                const row = Math.floor(index / 2);

                const offsetY = y + 60 + (row * 25);

                const baseX = col === 0
                    ? x + 15
                    : x + (w / 2) + 10;

                const el = document.getElementById(f[1]);

                let value = "-";

                if (el && el.value.trim() !== "") {
                    value = el.value.trim();
                }

                ctx.fillStyle = "#9ca3af";
                ctx.font = "12px Segoe UI";
                ctx.fillText(f[0], baseX, offsetY);

                ctx.fillStyle = "#e5e7eb";
                ctx.font = "12px Consolas";
                ctx.fillText(value, baseX + 150, offsetY);

            });

        }

        if (signatureData) {

            const img = new Image();

            img.onload = () => {

                const boxWidth = 200;
                const boxHeight = 60;

                const x = width - boxWidth - 40;
                const y = height - boxHeight - 40;

                ctx.fillStyle = "#9ca3af";
                ctx.font = "12px Segoe UI";

                const text = "Podpisano:";
                const textWidth = ctx.measureText(text).width;

                ctx.fillText(
                    text,
                    x + (boxWidth - textWidth) / 2,
                    y
                );

                ctx.strokeStyle = "#9ca3af";

                ctx.beginPath();
                ctx.moveTo(x, y + 8);
                ctx.lineTo(x + boxWidth, y + 8);
                ctx.stroke();

                ctx.drawImage(
                    img,
                    x,
                    y + 12,
                    boxWidth,
                    boxHeight
                );

                canvasReady = true;
                resolve();

            };

            img.src = signatureData;

        } else {

            canvasReady = true;
            resolve();

        }

    });

}

function roundRect(ctx, x, y, w, h, r, fill) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) ctx.fill();
}

let signatureData = null;
let drawing = false;

const sigCanvas = document.getElementById("signatureCanvas");
const sigCtx = sigCanvas.getContext("2d");

sigCtx.lineWidth = 2;
sigCtx.lineCap = "round";
sigCtx.lineJoin = "round";
sigCtx.strokeStyle = "white";

let lastX = 0;
let lastY = 0;

sigCanvas.addEventListener("mousedown", (e) => {
    if (signatureMode !== "draw") return;

    drawing = true;

    const rect = sigCanvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;

    sigCtx.beginPath();
    sigCtx.moveTo(lastX, lastY);
});

sigCanvas.addEventListener("mousemove", (e) => {
    if (signatureMode !== "draw") return;
    if (!drawing) return;

    const rect = sigCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    sigCtx.lineTo(x, y);
    sigCtx.stroke();
});

sigCanvas.addEventListener("mouseup", () => {
    drawing = false;
    sigCtx.beginPath();
});

sigCanvas.addEventListener("mouseleave", () => {
    drawing = false;
    sigCtx.beginPath();
});

sigCanvas.addEventListener("touchstart", (e) => {
    if (signatureMode !== "draw") return;

    drawing = true;

    const rect = sigCanvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    sigCtx.beginPath();
    sigCtx.moveTo(x, y);
});

sigCanvas.addEventListener("touchmove", (e) => {
    if (signatureMode !== "draw") return;
    if (!drawing) return;

    e.preventDefault();

    const rect = sigCanvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    sigCtx.lineTo(x, y);
    sigCtx.stroke();
});

sigCanvas.addEventListener("touchend", () => {
    drawing = false;
    sigCtx.beginPath();
});

function clearSignature() {
    sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
}

function openSignature() {
    document.getElementById("signatureModal").style.display = "flex";
    updateLoadButton();
    if (signatureMode === "text") {
        generateTextSignature();
    }
    sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
}

function openChangelog() {
    document.getElementById("changelogModal").classList.add("show");
}

function closeChangelog() {
    document.getElementById("changelogModal").classList.remove("show");
}

function showLoading() {
    document.getElementById("loadingModal").style.display = "flex";
}

function loadVersion(v) {
    document.getElementById("versionTitle").innerText = "Wersja " + v;

    const content = document.getElementById("versionContent");

    content.classList.remove("show");

    setTimeout(() => {
        content.innerText = changelog[v] || "Brak danych";
        content.classList.add("show");
    }, 100);

    document.querySelectorAll(".versionItem").forEach(el => {
        el.classList.remove("active");
        if (el.innerText.includes(v)) {
            el.classList.add("active");
        }
    });
}

function renderChangelog() {
    const list = document.getElementById("versionList");
    const content = document.getElementById("versionContent");

    list.innerHTML = "";

    const sorted = [...changelog].sort((a, b) =>
        b.version.localeCompare(a.version, undefined, { numeric: true })
    );

    sorted.forEach((v, i) => {
        const item = document.createElement("div");
        item.classList.add("versionItem");

        item.innerHTML = `
            <div class="versionTop">
                <div>
                    <div class="version">v${v.version}</div>
                    <div class="versionDate">${v.date}</div>
                </div>
                ${v.isNew ? `<span class="badgeNew">NOWE</span>` : ``}
            </div>
        `;

        item.onclick = () => {
            localStorage.setItem("seenVersion", sorted[0].version);
            updateChangelogDot();

            document.querySelectorAll(".versionItem").forEach(el => {
                el.classList.remove("active");
            });

            item.classList.add("active");

            content.innerHTML = `
                <div class="changelogContent">
                    <div class="changelogHeader">
                        <div class="ver">v${v.version}</div>
                        <div class="date">${v.date}</div>
                    </div>

                   ${renderGroup("Dodano", v.changes.added, "added")}
${renderGroup("Zmieniono", v.changes.changed, "changed")}
${renderGroup("Naprawiono", v.changes.fixed, "fixed")}
                </div>
            `;
        };

        list.appendChild(item);

        if (i === 0) item.click();
    });
}

function renderGroup(title, arr, type) {
    if (!arr || arr.length === 0) return "";

    const icons = {
        added: "+",
        changed: "↻",
        fixed: "✓"
    };

    return `
    <div class="group ${type}">
        <div class="groupTitle">
            <span class="icon">${icons[type]}</span> ${title}
        </div>
        ${arr.map(c => `<div class="change">${c}</div>`).join("")}
    </div>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    renderChangelog();
    updateChangelogDot();
});

const latestVersion = changelog[0].version;
const seenVersion = localStorage.getItem("seenVersion");

const dot = document.getElementById("newDot");

function updateChangelogDot() {
    const latestVersion = changelog[0].version;
    const seenVersion = localStorage.getItem("seenVersion");

    const dot = document.getElementById("newDot");
    if (!dot) return;

    dot.style.display = (seenVersion !== latestVersion) ? "block" : "none";
}

updateChangelogDot();

function hideLoading() {
    document.getElementById("loadingModal").style.display = "none";
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setLoadingState(type, text) {
    const icon = document.getElementById("loadingIcon");
    const txt = document.querySelector(".loadingText");

    txt.innerText = text;

    if (type === "loading") {
        icon.className = "spinner";
        icon.innerHTML = "";
    }

    if (type === "success") {
        icon.className = "successIcon";
        icon.innerHTML = "✔";
    }

    if (type === "error") {
        icon.className = "successIcon";
        icon.style.color = "#ef4444";
        icon.innerHTML = "✖";
    }
}

function updateLoadButton() {
    const saved = localStorage.getItem("savedSignature");
    const btn = document.getElementById("loadSignatureBtn");

    if (saved && signatureMode === "draw") {
        btn.style.display = "inline-block";
    } else {
        btn.style.display = "none";
    }
}

function loadSavedSignature() {
    const saved = localStorage.getItem("savedSignature");

    if (!saved) {
        alert("Brak zapisanego podpisu");
        return;
    }

    const img = new Image();

    img.onload = () => {
        sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
        sigCtx.drawImage(img, 0, 0, sigCanvas.width, sigCanvas.height);
    };

    img.src = saved;
}

let signatureMode = "draw";

function syncSignatureUI() {
    const saved = localStorage.getItem("savedSignature");

    const clearBtn = document.querySelector('button[onclick="clearSignature()"]');
    const loadBtn = document.getElementById("loadSignatureBtn");

    const isDraw = signatureMode === "draw";

    if (clearBtn) clearBtn.style.display = isDraw ? "inline-block" : "none";
    if (loadBtn) loadBtn.style.display = (saved && isDraw) ? "inline-block" : "none";
}

function getNick() {
    if (selectedMode === "moderator") {
        return document.getElementById("nick2");
    }
    return document.getElementById("nick");
}

function setSignatureMode(mode, el) {

    const nick = getNick();

    if (mode === "text" && !nick.value.trim()) {
        alert("Najpierw proszę wpisać swój nick.");
        return;
    }

    signatureMode = mode;

    document.querySelectorAll(".sigTab").forEach(t => t.classList.remove("active"));
    el.classList.add("active");

    sigCanvas.style.opacity = "0";

    setTimeout(() => {
        if (mode === "draw") {
            clearSignature();
        } else {
            generateTextSignature();
        }

        sigCanvas.style.opacity = "1";
    }, 150);

    document.getElementById("signatureTitle").innerText =
        mode === "draw"
            ? "Proszę się podpisać (Parafka lub Imię i Nazwisko)"
            : "Podpis zostanie wygenerowany z Twojego nicku";

    syncSignatureUI();
}

document.fonts.load("42px Pacifico");

async function generateTextSignature() {
    const nick = getNick();
    const text = nick?.value || "Podpis";

    await document.fonts.load("42px Pacifico");

    sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);

    sigCtx.fillStyle = "white";
    sigCtx.font = "42px 'Pacifico', cursive";
    sigCtx.textAlign = "center";
    sigCtx.textBaseline = "middle";

    sigCtx.fillText(text, sigCanvas.width / 2, sigCanvas.height / 2);
}

document.getElementById("nick").addEventListener("input", () => {
    if (signatureMode === "text") {
        generateTextSignature();
    }
});

document.getElementById("nick2").addEventListener("input", () => {
    if (signatureMode === "text") {
        generateTextSignature();
    }
});

async function saveSignature() {
    signatureData = sigCanvas.toDataURL("image/png");
    localStorage.setItem("savedSignature", signatureData);
    updateLoadButton();
    document.getElementById("signatureModal").style.display = "none";

    showLoading();
    setLoadingState("loading", "Trwa generowanie raportu...");

    const startTime = Date.now();

    await generujCanvas();

    const elapsed = Date.now() - startTime;
    const minTime = 1500;

    if (elapsed < minTime) {
        await delay(minTime - elapsed);
    }

    const canvas = document.getElementById("canvas");

    canvas.toBlob(async (blob) => {

        if (!blob) {
            setLoadingState("error", "Błąd generowania");
            setTimeout(hideLoading, 1500);
            return;
        }

        try {
            await navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob })
            ]);

            setLoadingState("success", "Skopiowano do schowka!");

        } catch {
            setLoadingState("error", "Clipboard nie działa");
        }

        setTimeout(hideLoading, 1500);
    });
}

function startScene() {

    document.body.innerHTML = "";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    document.body.style.background = "#050814";
    document.body.style.fontFamily = "system-ui";

    // ===== ROOT =====
    const scene = document.createElement("div");
    scene.style = `
        position:fixed;
        inset:0;
        display:flex;
        justify-content:space-around;
        align-items:center;
        padding:0 120px;
        background:radial-gradient(circle,#0b1225,#05060a);
    `;
    document.body.appendChild(scene);

    // ===== TOP TEXT =====
    const top = document.createElement("div");
    top.style = `
        position:fixed;
        top:20px;
        left:50%;
        transform:translateX(-50%);
        color:#00ffb3;
        font-size:22px;
        opacity:0;
        transition:0.4s;
    `;
    document.body.appendChild(top);

    function say(t, time = 3500) {
        top.innerText = t;
        top.style.opacity = "1";
        clearTimeout(top._t);
        top._t = setTimeout(() => top.style.opacity = "0", time);
    }

    // ===== DIALOG QUEUE (NAPRAWIA BUG ZNIKANIEM) =====
    const dialog = document.createElement("div");
    dialog.style = `
        position:fixed;
        bottom:60px;
        left:50%;
        transform:translateX(-50%);
        color:white;
        font-size:24px;
        background:rgba(0,0,0,0.7);
        padding:10px 18px;
        border-radius:10px;
        opacity:0;
        transition:0.2s;
        text-align:center;
        max-width:70%;
    `;
    document.body.appendChild(dialog);

    const queue = [];
    let talking = false;

    function talk(t) {
        queue.push(t);
        if (!talking) nextTalk();
    }

    function nextTalk() {
        if (queue.length === 0) {
            talking = false;
            dialog.style.opacity = "0";
            return;
        }

        talking = true;
        const t = queue.shift();

        dialog.innerText = t;
        dialog.style.opacity = "1";

        setTimeout(() => {
            dialog.style.opacity = "0";
            setTimeout(nextTalk, 300);
        }, 2200);
    }

    // ===== HP =====
    function hp(name, side, color) {
        const w = document.createElement("div");
        w.style = `
            position:fixed;
            top:20px;
            ${side}:20px;
            width:240px;
            color:white;
            font-size:12px;
        `;

        w.innerHTML = `
            <div>${name}</div>
            <div style="width:100%;height:10px;background:#222;border:1px solid white;">
                <div class="bar" style="width:100%;height:100%;background:${color};transition:0.2s;"></div>
            </div>
        `;

        document.body.appendChild(w);
        return w.querySelector(".bar");
    }

    const hp1 = hp("MARHUB", "left", "#7ec8ff");
    const hp2 = hp("MATIX", "right", "#ff6b6b");

    let h1 = 100, h2 = 100;

    // ===== HIT EFFECT (EMOJI + SHAKE) =====
    function hitFX(x, y) {
        const e = document.createElement("div");
        e.innerText = ["💥", "👊", "⚡"][Math.floor(Math.random() * 3)];
        e.style = `
            position:fixed;
            left:${x}px;
            top:${y}px;
            font-size:28px;
            animation:pop 0.6s forwards;
        `;

        document.body.appendChild(e);
        setTimeout(() => e.remove(), 600);

        document.body.style.transform = "translate(5px,0)";
        setTimeout(() => document.body.style.transform = "translate(0,0)", 80);
    }

    // ===== STYLE ANIMATION =====
    const style = document.createElement("style");
    style.innerHTML = `
    @keyframes pop{
        0%{transform:scale(0.5);opacity:1}
        100%{transform:scale(1.5);opacity:0}
    }`;
    document.head.appendChild(style);

    // ===== CHARACTER =====
    function create(name, color, x, img) {

        const el = document.createElement("div");
        el.style = `
            display:flex;
            flex-direction:column;
            align-items:center;
            transition:0.2s;
        `;

        el.innerHTML = `
            <img src="${img}" style="
                width:70px;height:70px;
                border-radius:50%;
                border:3px solid ${color};
            "/>

            <div style="color:white;font-weight:bold">${name}</div>

            <svg width="110" height="160">
                <circle cx="55" cy="25" r="13" stroke="${color}" fill="none" stroke-width="3"/>
                <line x1="55" y1="40" x2="55" y2="110" stroke="${color}" stroke-width="4"/>
                <line x1="55" y1="60" x2="30" y2="85" stroke="${color}" stroke-width="4"/>
                <line x1="55" y1="60" x2="80" y2="85" stroke="${color}" stroke-width="4"/>
                <line x1="55" y1="110" x2="35" y2="155" stroke="${color}" stroke-width="4"/>
                <line x1="55" y1="110" x2="75" y2="155" stroke="${color}" stroke-width="4"/>
            </svg>
        `;

        scene.appendChild(el);
        return el;
    }

    const marhub = create("MARHUB", "#7ec8ff", "https://i.pravatar.cc/100?img=12");
    const matix = create("MATIX", "#ff6b6b", "https://i.pravatar.cc/100?img=32");

    // ===== STORY =====
    setTimeout(() => say("DWÓCH PARTNERÓW"), 1000);
    setTimeout(() => say("JEDNA ZDRADA"), 3500);

    setTimeout(() => talk("To nie musiało tak się skończyć."));
    setTimeout(() => talk("Ale się skończyło."));

    // ===== POSITION FIX (BLISKO SIEBIE) =====
    setTimeout(() => {
        marhub.style.transform = "translateX(-120px)";
        matix.style.transform = "translateX(120px)";
    }, 8000);

    // ===== FIGHT =====
    setTimeout(() => {

        say("WALKA");

        const fight = setInterval(() => {

            const hit = Math.random() > 0.5 ? 1 : 2;
            const dmg = Math.floor(Math.random() * 10) + 6;

            if (hit === 1) {

                // step-in attack
                marhub.style.transform = "translateX(-40px) scale(1.05)";
                setTimeout(() => marhub.style.transform = "translateX(-120px)", 120);

                h2 -= dmg;
                hp2.style.width = h2 + "%";

                hitFX(window.innerWidth / 2, window.innerHeight / 2);
                talk("MARHUB atakuje 👊");

            } else {

                matix.style.transform = "translateX(40px) scale(1.05)";
                setTimeout(() => matix.style.transform = "translateX(120px)", 120);

                h1 -= dmg;
                hp1.style.width = h1 + "%";

                hitFX(window.innerWidth / 2, window.innerHeight / 2);
                talk("MATIX kontruje ⚡");
            }

            if (h1 <= 0 || h2 <= 0) {
                clearInterval(fight);
                finish();
            }

        }, 900);

    }, 10000);

    function finish() {

        if (h1 <= 0) say("MATIX WYGRYWA");
        else say("MARHUB WYGRYWA");

        talk("…cisza po walce.");
    }
}


let corners = [];
const target = ["TL", "BR", "BL", "TR"];
const margin = 50;

document.addEventListener("click", (e) => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    let clicked = null;

    if (e.clientX < margin && e.clientY < margin) clicked = "TL";
    else if (e.clientX > w - margin && e.clientY < margin) clicked = "TR";
    else if (e.clientX < margin && e.clientY > h - margin) clicked = "BL";
    else if (e.clientX > w - margin && e.clientY > h - margin) clicked = "BR";

    if (!clicked) return;

    corners.push(clicked);

    for (let i = 0; i < corners.length; i++) {
        if (corners[i] !== target[i]) {
            corners = [];
            return;
        }
    }

    if (corners.length === target.length) {
        alert("Brawo odkryłeś easter egg!");
        document.body.style.transform = "rotate(2deg)";
        corners = [];
    }
});

function format(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function save() {
    const data = {
        startTime: startTime,
        running: running
    };

    console.log("💾 SAVE TIMER:", data);

    localStorage.setItem("timerData", JSON.stringify(data));
}

function load() {
    const raw = localStorage.getItem("timerData");

    console.log("📦 RAW FROM STORAGE:", raw);

    if (!raw) {
        console.log("❌ brak danych w localStorage");
        return;
    }

    const data = JSON.parse(raw);

    console.log("📥 PARSED DATA:", data);

    startTime = data.startTime ? Number(data.startTime) : null;
    running = data.running || false;

    console.log("▶️ AFTER ASSIGN:", { startTime, running });

    if (running && startTime) {
        console.log("🚀 START TIMER AFTER REFRESH");
        startInterval();
    } else {
        console.log("⛔ timer nie rusza (running/startTime fail)");
    }

    update();
}

function startInterval() {
    clearInterval(interval);

    console.log("⏱️ INTERVAL STARTED");

    interval = setInterval(() => {
        elapsed = Date.now() - startTime;

        console.log("⏳ TICK:", elapsed);

        save();
        update();
    }, 1000);
}

function update() {
    if (startTime) {
        elapsed = Date.now() - startTime;
    }
    display.innerText = format(elapsed);
}

function startTimer() {
    if (running) return;

    startTime = Date.now() - elapsed;
    running = true;

    console.log("🟢 START TIMER:", { startTime });

    clearInterval(interval);
    startInterval();

    save();
}

function pauseTimer() {
    if (!running) return;

    clearInterval(interval);
    elapsed = Date.now() - startTime;
    running = false;

    save();
}

function stopTimer() {
    clearInterval(interval);
    startTime = null;
    elapsed = 0;
    running = false;

    update();
    save();
}

/*document.getElementById("timePanelBtn").onclick = () => {
    const panel = document.getElementById("timePanel");
    panel.style.display = panel.style.display === "none" ? "block" : "none";
};*/

load();

function toggleTimerPanel() {
    alert("Funkcja tymczasowo wyłączona!");
    //document.getElementById("timerPanel").classList.toggle("show");
}

document.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", e => {
        const ripple = document.createElement("span");
        ripple.style.position = "absolute";
        ripple.style.borderRadius = "50%";
        ripple.style.transform = "scale(0)";
        ripple.style.background = "rgba(255,255,255,0.4)";
        ripple.style.width = ripple.style.height = "100px";
        ripple.style.left = e.offsetX - 50 + "px";
        ripple.style.top = e.offsetY - 50 + "px";
        ripple.style.animation = "ripple 0.6s linear";
        ripple.style.pointerEvents = "none";

        btn.style.position = "relative";
        btn.style.overflow = "hidden";
        btn.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});