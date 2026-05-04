const start = new Date("2026-05-05T00:00:00");
const end = new Date("2026-05-10T18:00:00");

const maintenanceDiv = document.getElementById("maintenance");
const timer = document.getElementById("timer");

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

        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");
        canvas.style.display = "";

        const width = 900;
        const height = 560;

        canvas.width = width;
        canvas.height = height;

        ctx.fillStyle = "#0b1220";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#111827";
        roundRect(ctx, 20, 20, width - 40, 70, 12, true);

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 26px Segoe UI";
        ctx.fillText("🚔 RAPORT SŁUŻBY", 40, 65);

        ctx.fillStyle = "#9ca3af";
        ctx.font = "14px Segoe UI";
        ctx.fillText(new Date().toLocaleDateString("pl-PL"), width - 150, 65);

        drawSection("FUNKCJONARIUSZ", 20, 110, 420, [
            ["Nick", nick.value],
            ["Stopień", stopien.value],
            ["Nr odznaki", odznaka.value],
            ["Partner", partner.value]
        ]);

        drawSection("UŻYCIE", 460, 110, 420, [
            ["Radio", radio.value],
            ["Taser", taser.value],
            ["Broń palna", bron.value],
            ["Kajdanki", kajdanki.value]
        ]);

        drawSection("SZCZEGÓŁY", 20, 280, 860, [
            ["Powód tasera", powodTaser.value],
            ["Powód broni", powodBron.value],
            ["Powód kajdanek", powodKajdanki.value]
        ]);

        drawSection("PODSUMOWANIE", 20, 400, 860, [
            ["Godziny", godziny.value],
            ["Zatrzymani", zatrzymani.value],
            ["Dowód (w postaci ss)", dowod.value],
            ["Uwagi", uwagi.value]
        ]);

        function drawSection(title, x, y, w, fields) {
            ctx.fillStyle = "#111827";
            roundRect(ctx, x, y, w, 140, 10, true);

            ctx.fillStyle = "#38bdf8";
            ctx.font = "bold 14px Segoe UI";
            ctx.fillText(title, x + 15, y + 25);

            ctx.fillStyle = "#1f2937";
            ctx.fillRect(x + 15, y + 35, w - 30, 1);

            let offsetY = y + 60;

            fields.forEach(f => {
                ctx.fillStyle = "#9ca3af";
                ctx.font = "12px Segoe UI";
                ctx.fillText(f[0], x + 15, offsetY);

                ctx.fillStyle = "#e5e7eb";
                ctx.font = "12px Consolas";
                ctx.fillText(f[1] || "-", x + 150, offsetY);

                offsetY += 25;
            });
        }

        if (signatureData) {
            const img = new Image();

            img.onload = () => {
                const boxWidth = 200;
                const boxHeight = 60;

                const x = width - boxWidth - 40;
                const y = height - boxHeight - 25;

                ctx.fillStyle = "#9ca3af";
                ctx.font = "12px Segoe UI";

                const text = "Podpisano:";
                const textWidth = ctx.measureText(text).width;

                ctx.fillText(text, x + (boxWidth - textWidth) / 2, y);

                ctx.strokeStyle = "#9ca3af";
                ctx.beginPath();
                ctx.moveTo(x, y + 8);
                ctx.lineTo(x + boxWidth, y + 8);
                ctx.stroke();

                ctx.drawImage(img, x, y + 12, boxWidth, boxHeight);

                ctx.save();

                const offsetX = (Math.random() * 20) - 10;
                const offsetY = (Math.random() * 20) - 10;
                const randomRot = (-0.25 + Math.random() * 0.5);

                const centerX = x - 5 + offsetX;
                const centerY = y + 15 + offsetY;

                const radius = 45;

                ctx.translate(centerX, centerY);
                ctx.rotate(randomRot);

                ctx.strokeStyle = "rgba(180,0,0,0.85)";
                ctx.fillStyle = "rgba(180,0,0,0.85)";
                ctx.lineWidth = 1.5;

                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(0, 0, radius - 6, 0, Math.PI * 2);
                ctx.stroke();

                function textOnArc(text, r, startAngle, spacing = 0.06) {
                    ctx.save();
                    ctx.rotate(startAngle - (text.length * spacing) / 2);

                    for (let i = 0; i < text.length; i++) {
                        ctx.save();
                        ctx.rotate(i * spacing);
                        ctx.translate(0, -r);
                        ctx.fillText(text[i], 0, 0);
                        ctx.restore();
                    }

                    ctx.restore();
                }

                ctx.font = "bold 8px Arial";
                textOnArc("KOMENDA POWIATOWA POLICJI W ŁODZI", radius - 8, -Math.PI / 2);

                textOnArc("POLICJA", radius - 8, Math.PI / 2);

                ctx.textAlign = "center";

                ctx.font = "bold 11px Arial";
                ctx.fillText(stopien.value || "STOPIEŃ", 0, -3);

                ctx.font = "10px Arial";
                ctx.fillText(nick.value || "NICK", 0, 10);

                ctx.font = "9px Arial";
                ctx.fillText("NR " + (odznaka.value || "00000"), 0, 22);

                ctx.restore();

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

    if (saved) {
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

function setSignatureMode(mode, el) {

    if (mode === "text" && !nick.value.trim()) {
        alert("Najpierw proszę o wpisanie swojego nicku.");
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

    const title = document.getElementById("signatureTitle");

    if (mode === "draw") {
        title.innerText = "Proszę się podpisać (Parafka lub Imię i Nazwisko)";
    } else {
        title.innerText = "Podpis zostanie wygenerowany z Twojego nicku";
    }

    syncSignatureUI();
}

document.fonts.load("42px Pacifico");

async function generateTextSignature() {
    const text = document.getElementById("nick").value || "Podpis";

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
    const top=document.createElement("div");
    top.style=`
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

    function say(t,time=3500){
        top.innerText=t;
        top.style.opacity="1";
        clearTimeout(top._t);
        top._t=setTimeout(()=>top.style.opacity="0",time);
    }

    // ===== DIALOG QUEUE (NAPRAWIA BUG ZNIKANIEM) =====
    const dialog=document.createElement("div");
    dialog.style=`
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

    const queue=[];
    let talking=false;

    function talk(t){
        queue.push(t);
        if(!talking) nextTalk();
    }

    function nextTalk(){
        if(queue.length===0){
            talking=false;
            dialog.style.opacity="0";
            return;
        }

        talking=true;
        const t=queue.shift();

        dialog.innerText=t;
        dialog.style.opacity="1";

        setTimeout(()=>{
            dialog.style.opacity="0";
            setTimeout(nextTalk,300);
        },2200);
    }

    // ===== HP =====
    function hp(name,side,color){
        const w=document.createElement("div");
        w.style=`
            position:fixed;
            top:20px;
            ${side}:20px;
            width:240px;
            color:white;
            font-size:12px;
        `;

        w.innerHTML=`
            <div>${name}</div>
            <div style="width:100%;height:10px;background:#222;border:1px solid white;">
                <div class="bar" style="width:100%;height:100%;background:${color};transition:0.2s;"></div>
            </div>
        `;

        document.body.appendChild(w);
        return w.querySelector(".bar");
    }

    const hp1=hp("MARHUB","left","#7ec8ff");
    const hp2=hp("MATIX","right","#ff6b6b");

    let h1=100,h2=100;

    // ===== HIT EFFECT (EMOJI + SHAKE) =====
    function hitFX(x,y){
        const e=document.createElement("div");
        e.innerText=["💥","👊","⚡"][Math.floor(Math.random()*3)];
        e.style=`
            position:fixed;
            left:${x}px;
            top:${y}px;
            font-size:28px;
            animation:pop 0.6s forwards;
        `;

        document.body.appendChild(e);
        setTimeout(()=>e.remove(),600);

        document.body.style.transform="translate(5px,0)";
        setTimeout(()=>document.body.style.transform="translate(0,0)",80);
    }

    // ===== STYLE ANIMATION =====
    const style=document.createElement("style");
    style.innerHTML=`
    @keyframes pop{
        0%{transform:scale(0.5);opacity:1}
        100%{transform:scale(1.5);opacity:0}
    }`;
    document.head.appendChild(style);

    // ===== CHARACTER =====
    function create(name,color,x,img){

        const el=document.createElement("div");
        el.style=`
            display:flex;
            flex-direction:column;
            align-items:center;
            transition:0.2s;
        `;

        el.innerHTML=`
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

    const marhub=create("MARHUB","#7ec8ff","https://i.pravatar.cc/100?img=12");
    const matix=create("MATIX","#ff6b6b","https://i.pravatar.cc/100?img=32");

    // ===== STORY =====
    setTimeout(()=>say("DWÓCH PARTNERÓW"),1000);
    setTimeout(()=>say("JEDNA ZDRADA"),3500);

    setTimeout(()=>talk("To nie musiało tak się skończyć."));
    setTimeout(()=>talk("Ale się skończyło."));

    // ===== POSITION FIX (BLISKO SIEBIE) =====
    setTimeout(()=>{
        marhub.style.transform="translateX(-120px)";
        matix.style.transform="translateX(120px)";
    },8000);

    // ===== FIGHT =====
    setTimeout(()=>{

        say("WALKA");

        const fight=setInterval(()=>{

            const hit=Math.random()>0.5?1:2;
            const dmg=Math.floor(Math.random()*10)+6;

            if(hit===1){

                // step-in attack
                marhub.style.transform="translateX(-40px) scale(1.05)";
                setTimeout(()=>marhub.style.transform="translateX(-120px)",120);

                h2-=dmg;
                hp2.style.width=h2+"%";

                hitFX(window.innerWidth/2,window.innerHeight/2);
                talk("MARHUB atakuje 👊");

            }else{

                matix.style.transform="translateX(40px) scale(1.05)";
                setTimeout(()=>matix.style.transform="translateX(120px)",120);

                h1-=dmg;
                hp1.style.width=h1+"%";

                hitFX(window.innerWidth/2,window.innerHeight/2);
                talk("MATIX kontruje ⚡");
            }

            if(h1<=0||h2<=0){
                clearInterval(fight);
                finish();
            }

        },900);

    },10000);

    function finish(){

        if(h1<=0) say("MATIX WYGRYWA");
        else say("MARHUB WYGRYWA");

        talk("…cisza po walce.");
    }
}

const easterEggs = [
    {
        trigger: "par",
        action: () => {
            startScene();
        }
    },
    {
        trigger: "matrix",
        action: () => {
            document.body.style.filter = "hue-rotate(90deg)";
        }
    },

    {
        trigger: "flip",
        action: () => {
            document.body.style.transform = "rotate(180deg)";
        }
    },

    {
        trigger: "rainbow",
        action: () => {
            let i = 0;
            setInterval(() => {
                document.body.style.filter = `hue-rotate(${i++}deg)`;
            }, 50);
        }
    },

    {
        trigger: "lag",
        action: () => {
            setInterval(() => {
                document.body.style.transform = `translate(${Math.random() * 10}px, ${Math.random() * 10}px)`;
            }, 100);
        }
    },

    {
        trigger: "clean",
        action: () => {
            location.reload();
        }
    },

    {
        trigger: "druk",
        action: () => {
            document.body.style.filter = "grayscale(1)";
        }
    },

    {
        trigger: "retro",
        action: () => {
            document.body.style.fontFamily = "monospace";
        }
    },

    {
        trigger: "boom",
        action: () => {
            document.querySelectorAll("*").forEach(el => {
                el.style.transform = `rotate(${Math.random() * 360}deg)`;
            });
        }
    },

    {
        trigger: "cam",
        action: () => {
            const cam = document.createElement("div");

            cam.style.position = "fixed";
            cam.style.top = "10px";
            cam.style.right = "10px";
            cam.style.color = "lime";
            cam.style.fontFamily = "monospace";

            setInterval(() => {
                cam.innerText = "REC " + new Date().toLocaleTimeString();
            }, 1000);

            document.body.appendChild(cam);
        }
    },

    {
        trigger: "ai",
        action: () => {
            document.body.innerHTML = "<h1 style='color:red;text-align:center;'>SYSTEM PRZEJĘTY</h1>";
        }
    },

    {
        trigger: "break",
        action: () => {
            document.querySelectorAll("*").forEach(el => {
                el.style.transform = `translate(${Math.random() * 50}px, ${Math.random() * 50}px) rotate(${Math.random() * 20}deg)`;
            });
        }
    },

    {
        trigger: "scan",
        action: () => {
            let percent = 0;

            const scan = document.createElement("div");
            scan.style = "position:fixed;bottom:10px;left:10px;color:white;background:#111;padding:10px";

            document.body.appendChild(scan);

            const interval = setInterval(() => {
                percent += 10;
                scan.innerText = "Skanowanie danych... " + percent + "%";

                if (percent >= 100) {
                    clearInterval(interval);
                    scan.innerText = "Zakończono ✔";
                }
            }, 200);
        }
    }
];

let lastTrigger = "";

nick.addEventListener("input", () => {
    const value = nick.value.toLowerCase();

    if (value === lastTrigger) return;

    easterEggs.forEach(egg => {
        if (value === egg.trigger) {
            egg.action();
            lastTrigger = value;
        }
    });
});

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
