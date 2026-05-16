document.addEventListener('DOMContentLoaded', () => {

    // ── Utilities ──
    function lerp(a, b, t) { return a + (b - a) * t; }
    function rand(min, max) { return Math.random() * (max - min) + min; }
    function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
    function formatTime(date) {
        return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    // ── Global State ──
    let systemState = 'nominal';
    let eventCounter = 0;
    const opCountEl = document.getElementById('op-count');

    // ── System Clock ──
    const clockEl = document.getElementById('system-clock');
    function updateClock() { clockEl.textContent = formatTime(new Date()) + ' UTC'; }
    setInterval(updateClock, 1000);
    updateClock();

    // ── System State Manager ──
    const statusEl = document.getElementById('system-status');
    const statusText = document.getElementById('status-text');
    const stateMessages = { nominal: 'ALL SYSTEMS NOMINAL', warning: 'PERFORMANCE DEGRADATION', critical: 'SYSTEM ALERT ACTIVE' };
    function setSystemState(state) { systemState = state; statusEl.dataset.state = state; statusText.textContent = stateMessages[state]; }
    setInterval(() => {
        const r = Math.random();
        if (systemState === 'nominal') { if (r > 0.92) setSystemState('warning'); else if (r > 0.98) setSystemState('critical'); }
        else if (systemState === 'warning') { if (r > 0.6) setSystemState('nominal'); else if (r > 0.9) setSystemState('critical'); }
        else { if (r > 0.5) setSystemState('warning'); if (r > 0.7) setSystemState('nominal'); }
    }, 8000);

    // ── Background Particles ──
    const particleCanvas = document.getElementById('particle-canvas');
    const pCtx = particleCanvas.getContext('2d');
    let particles = [];
    function resizeParticleCanvas() { particleCanvas.width = window.innerWidth; particleCanvas.height = window.innerHeight; }
    window.addEventListener('resize', resizeParticleCanvas);
    resizeParticleCanvas();
    for (let i = 0; i < 40; i++) {
        particles.push({ x: Math.random() * particleCanvas.width, y: Math.random() * particleCanvas.height, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.15 - 0.1, size: Math.random() * 1.5 + 0.5, opacity: Math.random() * 0.3 + 0.05 });
    }
    function drawParticles() {
        pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = particleCanvas.width; if (p.x > particleCanvas.width) p.x = 0;
            if (p.y < 0) p.y = particleCanvas.height; if (p.y > particleCanvas.height) p.y = 0;
            pCtx.beginPath(); pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            pCtx.fillStyle = `rgba(0, 180, 204, ${p.opacity})`; pCtx.fill();
        });
        requestAnimationFrame(drawParticles);
    }
    drawParticles();

    // ── W1: Neural Core Processing ──
    const coreVal = document.getElementById('core-compute-val');
    const threadCount = document.getElementById('thread-count');
    const latencyVal = document.getElementById('latency-val');
    const uptimeVal = document.getElementById('uptime-val');
    const ringOuter = document.getElementById('ring-outer');
    const ringMid = document.getElementById('ring-mid');
    const ringInner = document.getElementById('ring-inner');
    let coreTarget = 87, coreCurrent = 87;

    setInterval(() => {
        if (systemState === 'critical') coreTarget = randInt(92, 99);
        else if (systemState === 'warning') coreTarget = randInt(75, 92);
        else coreTarget = randInt(55, 85);
    }, 3000);

    function updateCore() {
        coreCurrent = lerp(coreCurrent, coreTarget, 0.08);
        const display = Math.round(coreCurrent);
        coreVal.textContent = display;
        const outerCirc = 2 * Math.PI * 90, midCirc = 2 * Math.PI * 72, innerCirc = 2 * Math.PI * 54;
        ringOuter.style.strokeDashoffset = outerCirc * (1 - display / 100);
        ringMid.style.strokeDashoffset = midCirc * (1 - display / 120);
        ringInner.style.strokeDashoffset = innerCirc * (1 - display / 110);
        latencyVal.textContent = clamp(Math.round(4 + (display / 100) * 18 + rand(-2, 2)), 3, 28) + 'ms';
        threadCount.textContent = (1024 + randInt(-32, 32)).toLocaleString();
        uptimeVal.textContent = (systemState === 'critical' ? (99.9 + rand(0, 0.05)) : (99.95 + rand(0, 0.04))).toFixed(2) + '%';
        requestAnimationFrame(updateCore);
    }
    updateCore();

    // ── W2: Token Stream Velocity ──
    const tokenCanvas = document.getElementById('token-chart');
    const tCtx = tokenCanvas.getContext('2d');
    const tokensSec = document.getElementById('tokens-sec');
    const tokensPeak = document.getElementById('tokens-peak');
    const chartYAxis = document.getElementById('chart-y-axis');
    const chartXAxis = document.getElementById('chart-x-axis');

    function resizeTokenCanvas() { const p = tokenCanvas.parentElement; tokenCanvas.width = p.clientWidth; tokenCanvas.height = p.clientHeight; }
    window.addEventListener('resize', resizeTokenCanvas);
    resizeTokenCanvas();

    chartYAxis.innerHTML = ['8k', '6k', '4k', '2k', '0'].map(l => `<span>${l}</span>`).join('');
    chartXAxis.innerHTML = ['-60s', '-45s', '-30s', '-15s', 'now'].map(l => `<span>${l}</span>`).join('');

    let tokenData = [], currentTokenRate = 4500, peakTokenRate = 0;
    const maxPoints = 60;
    for (let i = 0; i < maxPoints; i++) tokenData.push(4000 + Math.random() * 2000);

    function drawTokenChart() {
        const w = tokenCanvas.width, h = tokenCanvas.height;
        const pad = { left: 32, right: 8, top: 8, bottom: 20 };
        const chartW = w - pad.left - pad.right, chartH = h - pad.top - pad.bottom, maxVal = 8000;
        tCtx.clearRect(0, 0, w, h);

        tCtx.strokeStyle = 'rgba(255,255,255,0.03)'; tCtx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) { const y = pad.top + (chartH / 4) * i; tCtx.beginPath(); tCtx.moveTo(pad.left, y); tCtx.lineTo(w - pad.right, y); tCtx.stroke(); }

        const delta = (Math.random() - 0.48) * 400;
        currentTokenRate = clamp(currentTokenRate + delta + (systemState === 'critical' ? -200 : 0), 1200, 7800);
        tokenData.push(currentTokenRate);
        if (tokenData.length > maxPoints) tokenData.shift();
        peakTokenRate = Math.max(peakTokenRate, currentTokenRate);

        const step = chartW / (tokenData.length - 1);

        // Area fill
        tCtx.beginPath(); tCtx.moveTo(pad.left, pad.top + chartH);
        for (let i = 0; i < tokenData.length; i++) {
            const x = pad.left + i * step, y = pad.top + chartH - (tokenData[i] / maxVal) * chartH;
            if (i === 0) tCtx.lineTo(x, y);
            else { const px = pad.left + (i - 1) * step, py = pad.top + chartH - (tokenData[i - 1] / maxVal) * chartH; tCtx.bezierCurveTo((px + x) / 2, py, (px + x) / 2, y, x, y); }
        }
        tCtx.lineTo(pad.left + (tokenData.length - 1) * step, pad.top + chartH); tCtx.closePath();
        const grad = tCtx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
        grad.addColorStop(0, 'rgba(34, 197, 94, 0.15)'); grad.addColorStop(1, 'rgba(34, 197, 94, 0.0)');
        tCtx.fillStyle = grad; tCtx.fill();

        // Line
        tCtx.beginPath();
        for (let i = 0; i < tokenData.length; i++) {
            const x = pad.left + i * step, y = pad.top + chartH - (tokenData[i] / maxVal) * chartH;
            if (i === 0) tCtx.moveTo(x, y);
            else { const px = pad.left + (i - 1) * step, py = pad.top + chartH - (tokenData[i - 1] / maxVal) * chartH; tCtx.bezierCurveTo((px + x) / 2, py, (px + x) / 2, y, x, y); }
        }
        tCtx.strokeStyle = '#22c55e'; tCtx.lineWidth = 2; tCtx.shadowBlur = 6; tCtx.shadowColor = 'rgba(34,197,94,0.3)'; tCtx.stroke(); tCtx.shadowBlur = 0;

        // Endpoint dot
        const lastX = pad.left + (tokenData.length - 1) * step, lastY = pad.top + chartH - (tokenData[tokenData.length - 1] / maxVal) * chartH;
        tCtx.beginPath(); tCtx.arc(lastX, lastY, 3, 0, Math.PI * 2); tCtx.fillStyle = '#22c55e'; tCtx.fill();

        tokensSec.textContent = Math.round(currentTokenRate).toLocaleString();
        tokensPeak.textContent = Math.round(peakTokenRate).toLocaleString();
        requestAnimationFrame(drawTokenChart);
    }
    drawTokenChart();

    // ── W3: Network Topology ──
    const topoCanvas = document.getElementById('topology-canvas');
    const nCtx = topoCanvas.getContext('2d');
    function resizeTopoCanvas() { topoCanvas.width = topoCanvas.parentElement.clientWidth; topoCanvas.height = topoCanvas.parentElement.clientHeight; }
    window.addEventListener('resize', resizeTopoCanvas);
    resizeTopoCanvas();

    const clusters = [
        { cx: 0.15, cy: 0.3, label: 'AUTH' }, { cx: 0.35, cy: 0.6, label: 'COMPUTE' },
        { cx: 0.55, cy: 0.25, label: 'INFERENCE' }, { cx: 0.75, cy: 0.55, label: 'STORAGE' },
        { cx: 0.9, cy: 0.3, label: 'API-GW' },
    ];
    let topoNodes = [];
    clusters.forEach((cluster, ci) => {
        const nodeCount = randInt(3, 6);
        for (let i = 0; i < nodeCount; i++) {
            topoNodes.push({ x: cluster.cx + (Math.random() - 0.5) * 0.12, y: cluster.cy + (Math.random() - 0.5) * 0.2, vx: (Math.random() - 0.5) * 0.0003, vy: (Math.random() - 0.5) * 0.0003, cluster: ci, health: Math.random() > 0.1 ? 'healthy' : (Math.random() > 0.5 ? 'stressed' : 'critical'), size: rand(3, 5), label: cluster.label });
        }
    });

    let packets = [];
    function spawnPacket() {
        if (topoNodes.length < 2) return;
        const from = topoNodes[randInt(0, topoNodes.length - 1)];
        let to; do { to = topoNodes[randInt(0, topoNodes.length - 1)]; } while (to === from);
        packets.push({ fromX: from.x, fromY: from.y, toX: to.x, toY: to.y, progress: 0, speed: rand(0.005, 0.02), color: from.cluster !== to.cluster ? 'rgba(168, 85, 247, 0.8)' : 'rgba(0, 180, 204, 0.6)' });
    }
    setInterval(spawnPacket, 400);

    function drawTopology() {
        const w = topoCanvas.width, h = topoCanvas.height;
        nCtx.clearRect(0, 0, w, h);

        // Connections
        for (let i = 0; i < topoNodes.length; i++) {
            for (let j = i + 1; j < topoNodes.length; j++) {
                const a = topoNodes[i], b = topoNodes[j];
                const dx = (a.x - b.x) * w, dy = (a.y - b.y) * h, dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = a.cluster === b.cluster ? 120 : 200;
                if (dist < maxDist) {
                    nCtx.beginPath(); nCtx.moveTo(a.x * w, a.y * h); nCtx.lineTo(b.x * w, b.y * h);
                    nCtx.strokeStyle = `rgba(0, 180, 204, ${(1 - dist / maxDist) * (a.cluster === b.cluster ? 0.15 : 0.06)})`;
                    nCtx.lineWidth = 1; nCtx.stroke();
                }
            }
        }

        // Packets
        packets = packets.filter(p => p.progress <= 1);
        packets.forEach(p => {
            p.progress += p.speed;
            const x = lerp(p.fromX, p.toX, p.progress) * w, y = lerp(p.fromY, p.toY, p.progress) * h;
            nCtx.beginPath(); nCtx.arc(x, y, 2, 0, Math.PI * 2); nCtx.fillStyle = p.color; nCtx.fill();
        });

        // Nodes
        topoNodes.forEach(node => {
            node.x += node.vx; node.y += node.vy;
            if (node.x < 0.05 || node.x > 0.95) node.vx *= -1;
            if (node.y < 0.08 || node.y > 0.88) node.vy *= -1;
            const x = node.x * w, y = node.y * h;
            let color = node.health === 'healthy' ? 'rgba(0, 180, 204, 0.7)' : node.health === 'stressed' ? 'rgba(245, 158, 11, 0.8)' : 'rgba(239, 68, 68, 0.9)';
            nCtx.beginPath(); nCtx.arc(x, y, node.size + 4, 0, Math.PI * 2);
            nCtx.fillStyle = color.replace(/[\d.]+\)$/, '0.1)'); nCtx.fill();
            nCtx.beginPath(); nCtx.arc(x, y, node.size, 0, Math.PI * 2);
            nCtx.fillStyle = color; nCtx.fill();
        });

        // Cluster labels
        clusters.forEach(c => { nCtx.font = '9px Inter, sans-serif'; nCtx.fillStyle = 'rgba(136, 146, 168, 0.5)'; nCtx.textAlign = 'center'; nCtx.fillText(c.label, c.cx * w, c.cy * h - 30); });

        // Health fluctuation
        if (Math.random() > 0.99) {
            const node = topoNodes[randInt(0, topoNodes.length - 1)];
            node.health = systemState === 'critical' ? (Math.random() > 0.4 ? 'stressed' : 'critical') : (Math.random() > 0.15 ? 'healthy' : 'stressed');
        }
        requestAnimationFrame(drawTopology);
    }
    drawTopology();

    // ── W4: Anomaly Scanner ──
    const radarBlips = document.getElementById('radar-blips');
    const scanLog = document.getElementById('scan-log');
    const threatCountEl = document.getElementById('threat-count');
    let activeThreats = 0;

    const scanMessages = {
        info: ['Packet integrity verified', 'TLS handshake complete on node-7', 'Certificate rotation scheduled', 'Heartbeat received from shard-12', 'DNS resolution within threshold', 'Load balancer health check passed', 'Connection pool recycled', 'Inference pipeline latency nominal'],
        warn: ['Elevated packet loss on subnet-3', 'Unauthorized node handshake detected', 'Memory pressure on inference-gpu-4', 'API rate limit approaching threshold', 'Shard desynchronization detected', 'Connection timeout to storage-node-8'],
        crit: ['GPU memory overflow on compute-2', 'Authentication failure from unknown IP', 'Inference instability: model divergence', 'Critical: shard-7 unreachable', 'DDoS pattern detected on API gateway', 'Data integrity check failed on backup-3']
    };

    function createBlip() {
        const blip = document.createElement('div');
        const severity = Math.random() > 0.7 ? 'high' : 'low';
        blip.className = `blip blip--${severity}`;
        const angle = Math.random() * Math.PI * 2, radius = rand(15, 80), cx = 90;
        blip.style.left = (cx + Math.cos(angle) * radius - 3) + 'px';
        blip.style.top = (cx + Math.sin(angle) * radius - 3) + 'px';
        radarBlips.appendChild(blip);
        if (severity === 'high') { activeThreats++; updateThreatCount(); }
        setTimeout(() => {
            if (radarBlips.contains(blip)) radarBlips.removeChild(blip);
            if (severity === 'high') { activeThreats = Math.max(0, activeThreats - 1); updateThreatCount(); }
        }, 4000);
        if (severity === 'high') {
            const pool = Math.random() > 0.5 ? scanMessages.crit : scanMessages.warn;
            addScanLog(pool[randInt(0, pool.length - 1)], Math.random() > 0.5 ? 'crit' : 'warn');
        }
    }

    function updateThreatCount() {
        threatCountEl.textContent = activeThreats > 0 ? `${activeThreats} ACTIVE` : 'CLEAR';
        threatCountEl.className = 'widget__badge ' + (activeThreats > 0 ? 'widget__badge--alert' : 'widget__badge--muted');
    }

    function addScanLog(msg, level = 'info') {
        const entry = document.createElement('div'); entry.className = 'log-entry';
        entry.innerHTML = `<span class="log-time">${formatTime(new Date())}</span> <span class="log-tag log-tag--${level}">[${level.toUpperCase()}]</span> ${msg}`;
        scanLog.appendChild(entry);
        while (scanLog.children.length > 5) scanLog.removeChild(scanLog.firstChild);
    }

    setInterval(createBlip, 2500);
    setInterval(() => { addScanLog(scanMessages.info[randInt(0, scanMessages.info.length - 1)], 'info'); }, 4000);
    addScanLog('Scanner initialized', 'info');
    addScanLog('Monitoring 24 active nodes', 'info');

    // ── W5: Operation Log ──
    const streamContainer = document.getElementById('cyber-stream');
    const operations = [
        { action: 'EXECUTE', targets: ['inference_pipeline_v3', 'auth_token_refresh', 'model_checkpoint_save', 'gradient_sync'], class: 'execute' },
        { action: 'DEPLOY', targets: ['neural_net_v4.2.1', 'api_gateway_patch', 'monitoring_agent', 'load_balancer_config'], class: 'deploy' },
        { action: 'COMPILE', targets: ['shader_compute_kernel', 'data_transform_layer', 'cache_invalidator'], class: 'compile' },
        { action: 'FETCH', targets: ['training_dataset_shard_8', 'config_manifest', 'ssl_certificate_bundle'], class: 'fetch' },
        { action: 'ALERT', targets: ['memory_threshold_exceeded', 'connection_pool_saturated', 'disk_iops_warning'], class: 'alert' },
    ];

    function addStreamRow() {
        const row = document.createElement('div'); row.className = 'stream-row';
        const time = formatTime(new Date());
        const op = operations[randInt(0, operations.length - 1)];
        const target = op.targets[randInt(0, op.targets.length - 1)];
        let status, statusClass;
        if (op.action === 'ALERT') { status = 'ERR'; statusClass = 'stream-status--err'; }
        else { const r = Math.random(); if (r > 0.95) { status = 'ERR'; statusClass = 'stream-status--err'; } else if (r > 0.85) { status = 'WARN'; statusClass = 'stream-status--warn'; } else { status = 'OK'; statusClass = 'stream-status--ok'; } }
        row.innerHTML = `<span class="stream-time">${time}</span><span class="stream-action stream-action--${op.class}">${op.action}</span><span class="stream-target">${target}</span><span class="stream-status ${statusClass}">[${status}]</span>`;
        streamContainer.appendChild(row);
        eventCounter++; opCountEl.textContent = `${eventCounter} events`;
        while (streamContainer.children.length > 14) streamContainer.removeChild(streamContainer.firstChild);
    }

    for (let i = 0; i < 8; i++) addStreamRow();
    setInterval(addStreamRow, 1200);
});
