// ---------- Állapot ----------
let alpha = math.complex(1, 0);   // |0⟩ együtthatója
let beta  = math.complex(0, 0);   // |1⟩ együtthatója
let circuit = [];                 // az alkalmazott kapuk nevei
let savedStateCount = 0;

const BASE_TRACES = 6;            // gömb, 3 tengely, vektor, feliratok
const VECTOR_TRACE = 4;           // az |ψ⟩ vektor indexe

const gd = document.getElementById('gomb-tarolo');
const thetaSlider = document.getElementById('theta-slider');
const phiSlider = document.getElementById('phi-slider');
const thetaVal = document.getElementById('theta-val');
const phiVal = document.getElementById('phi-val');
const historyDiv = document.getElementById('history');
const mentettLista = document.getElementById('mentett-lista');

// ---------- Gömb és ábra ----------
function generateSphere() {
    const N = 30;
    const x = [], y = [], z = [];
    for (let i = 0; i <= N; i++) {
        const th = (i * Math.PI) / N;
        const xRow = [], yRow = [], zRow = [];
        for (let j = 0; j <= N; j++) {
            const ph = (j * 2 * Math.PI) / N;
            xRow.push(Math.sin(th) * Math.cos(ph));
            yRow.push(Math.sin(th) * Math.sin(ph));
            zRow.push(Math.cos(th));
        }
        x.push(xRow); y.push(yRow); z.push(zRow);
    }
    return { x, y, z };
}

const sphereData = generateSphere();

const createAxis = (x, y, z) => ({
    type: 'scatter3d',
    mode: 'lines',
    x, y, z,
    line: { color: 'rgba(255, 255, 255, 0.3)', width: 2 },
    hoverinfo: 'none'
});

const traces = [
    { // 0: gömb
        type: 'surface',
        x: sphereData.x, y: sphereData.y, z: sphereData.z,
        opacity: 0.15,
        colorscale: [[0, '#00d2ff'], [1, '#00d2ff']],
        showscale: false,
        hoverinfo: 'none'
    },
    createAxis([-1, 1], [0, 0], [0, 0]),   // 1: x tengely
    createAxis([0, 0], [-1, 1], [0, 0]),   // 2: y tengely
    createAxis([0, 0], [0, 0], [-1, 1]),   // 3: z tengely
    { // 4: |ψ⟩ vektor
        type: 'scatter3d',
        mode: 'lines+markers',
        x: [0, 0], y: [0, 0], z: [0, 1],
        line: { color: '#ff007f', width: 10 },
        name: '|ψ⟩'
    },
    { // 5: feliratok
        type: 'scatter3d',
        mode: 'text',
        x: [1.2, 0, 0, 0],
        y: [0, 1.2, 0, 0],
        z: [0, 0, 1.1, -1.1],
        text: ['x', 'y', '|0⟩', '|1⟩'],
        textposition: 'middle center',
        textfont: { color: 'white', size: 18 },
        hoverinfo: 'none'
    }
];

const layout = {
    paper_bgcolor: '#000000',
    margin: { l: 0, r: 0, b: 0, t: 0 },
    scene: {
        xaxis: { visible: false, range: [-1.2, 1.2] },
        yaxis: { visible: false, range: [-1.2, 1.2] },
        zaxis: { visible: false, range: [-1.2, 1.2] },
        camera: { eye: { x: 1.2, y: 1.2, z: 0.8 } }
    },
    showlegend: false
};

Plotly.newPlot(gd, traces, layout, { responsive: true });

// ---------- Kvantumkapuk ----------
const gates = {
    'X': math.matrix([[0, 1], [1, 0]]),
    'Y': math.matrix([[0, math.complex(0, -1)], [math.complex(0, 1), 0]]),
    'Z': math.matrix([[1, 0], [0, -1]]),
    'H': math.matrix([[1 / Math.SQRT2, 1 / Math.SQRT2], [1 / Math.SQRT2, -1 / Math.SQRT2]]),
    'S': math.matrix([[1, 0], [0, math.complex(0, 1)]]),
    'T': math.matrix([[1, 0], [0, math.complex(1 / Math.SQRT2, 1 / Math.SQRT2)]])
};

// Az (α, β) állapotból a Bloch-vektor (x, y, z)
function blochVector() {
    const ab = math.multiply(math.conj(alpha), beta);   // α*·β
    return {
        x: 2 * ab.re,
        y: 2 * ab.im,
        z: Math.pow(math.abs(alpha), 2) - Math.pow(math.abs(beta), 2)
    };
}

// A lebegőpontos hibák felhalmozódása ellen: |α|²+|β|² = 1
function normalize() {
    const n = Math.sqrt(Math.pow(math.abs(alpha), 2) + Math.pow(math.abs(beta), 2));
    if (n > 0) {
        alpha = math.divide(alpha, n);
        beta = math.divide(beta, n);
    }
}

function renderHistory() {
    historyDiv.innerText = ['|ψ⟩', ...circuit].join(' ➔ ');
}

function frissitGomb() {
    const v = blochVector();
    Plotly.restyle(gd, { x: [[0, v.x]], y: [[0, v.y]], z: [[0, v.z]] }, [VECTOR_TRACE]);
}

function applyGate(gateName) {
    const stateVector = math.matrix([[alpha], [beta]]);
    const newState = math.multiply(gates[gateName], stateVector);
    alpha = newState.get([0, 0]);
    beta = newState.get([1, 0]);
    normalize();

    circuit.push(gateName);
    renderHistory();
    frissitGomb();
}

// ---------- Kezdőállapot ----------
function setInitialState() {
    const theta = (thetaSlider.value * Math.PI) / 180;
    const phi = (phiSlider.value * Math.PI) / 180;

    thetaVal.innerText = thetaSlider.value;
    phiVal.innerText = phiSlider.value;

    // |ψ⟩ = cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩
    alpha = math.complex(Math.cos(theta / 2), 0);
    beta = math.multiply(math.complex(Math.cos(phi), Math.sin(phi)), Math.sin(theta / 2));

    circuit = [];
    renderHistory();
    frissitGomb();
}

thetaSlider.addEventListener('input', setInitialState);
phiSlider.addEventListener('input', setInitialState);
document.getElementById('btn-set').addEventListener('click', setInitialState);

// ---------- Gombok ----------
['x', 'y', 'z', 'h', 's', 't'].forEach(k => {
    document.getElementById('btn-' + k)
        .addEventListener('click', () => applyGate(k.toUpperCase()));
});

document.getElementById('btn-save').addEventListener('click', () => {
    savedStateCount++;
    const v = blochVector();

    Plotly.addTraces(gd, {
        type: 'scatter3d',
        mode: 'lines+markers+text',
        x: [0, v.x], y: [0, v.y], z: [0, v.z],
        line: { color: '#2ed573', width: 5 },
        marker: { size: [0, 5], color: '#2ed573' },
        text: ['', String(savedStateCount)],
        textposition: 'top center',
        textfont: { color: '#2ed573', size: 16 },
        hoverinfo: 'none'
    });

    const li = document.createElement('li');
    const label = document.createElement('strong');
    label.style.color = '#2ed573';
    label.textContent = savedStateCount + '. állapot:';
    const circ = document.createElement('b');
    circ.textContent = ['|ψ⟩', ...circuit].join(' ➔ ');
    li.append(label, ' Létrejött a(z) ', circ, ' műveletekkel.');
    mentettLista.appendChild(li);
});

document.getElementById('btn-clear').addEventListener('click', () => {
    const n = gd.data.length;
    if (n > BASE_TRACES) {
        Plotly.deleteTraces(gd, Array.from({ length: n - BASE_TRACES }, (_, i) => i + BASE_TRACES));
    }
    savedStateCount = 0;
    mentettLista.innerHTML = '';
});

// Oldalbetöltéskor a felirat és a vektor is a csúszkákhoz igazodjon
setInitialState();
