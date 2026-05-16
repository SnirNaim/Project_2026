document.addEventListener('DOMContentLoaded', () => {
    // 1. Neural Core Processing Widget
    const coreVal = document.getElementById('core-compute-val');
    const threadCount = document.getElementById('thread-count');
    const latencyVal = document.getElementById('latency-val');

    setInterval(() => {
        let currentCore = parseInt(coreVal.innerText);
        let delta = Math.floor(Math.random() * 7) - 3;
        let newVal = Math.max(60, Math.min(99, currentCore + delta));
        coreVal.innerText = newVal + '%';
        
        let baseLatency = 8;
        latencyVal.innerText = (baseLatency + Math.floor(Math.random() * 12)) + 'ms';
        
        let baseThreads = 1024;
        threadCount.innerText = (baseThreads + Math.floor(Math.random() * 128) - 64).toLocaleString();
    }, 1200);

    // 2. Token Flow Velocity Chart
    const canvas = document.getElementById('token-chart');
    const ctx = canvas.getContext('2d');
    const tokensSec = document.getElementById('tokens-sec');

    function resizeCanvas() {
        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight - 40; // leave room for stats
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let flowData = Array(50).fill(100);
    let flowOffset = 0;

    function animateFlow() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let lastVal = flowData[flowData.length - 1];
        let newVal = lastVal + (Math.random() * 60 - 30);
        newVal = Math.max(20, Math.min(canvas.height - 20, newVal));
        
        flowData.push(newVal);
        flowData.shift();

        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        
        const step = canvas.width / (flowData.length - 1);
        
        // Curved line via bezier curves
        ctx.lineTo(0, canvas.height - flowData[0]);
        for(let i=1; i<flowData.length - 2; i++) {
            let xc = (i * step + (i + 1) * step) / 2;
            let yc = (canvas.height - flowData[i] + canvas.height - flowData[i + 1]) / 2;
            ctx.quadraticCurveTo(i * step, canvas.height - flowData[i], xc, yc);
        }
        ctx.quadraticCurveTo(
            (flowData.length - 2) * step, canvas.height - flowData[flowData.length - 2],
            (flowData.length - 1) * step, canvas.height - flowData[flowData.length - 1]
        );
        
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();

        let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(0, 255, 157, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 255, 157, 0.0)');
        
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, canvas.height - flowData[0]);
        for(let i=1; i<flowData.length - 2; i++) {
            let xc = (i * step + (i + 1) * step) / 2;
            let yc = (canvas.height - flowData[i] + canvas.height - flowData[i + 1]) / 2;
            ctx.quadraticCurveTo(i * step, canvas.height - flowData[i], xc, yc);
        }
        ctx.quadraticCurveTo(
            (flowData.length - 2) * step, canvas.height - flowData[flowData.length - 2],
            (flowData.length - 1) * step, canvas.height - flowData[flowData.length - 1]
        );
        ctx.strokeStyle = '#00ff9d';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ff9d';
        ctx.stroke();
        ctx.shadowBlur = 0;

        flowOffset++;
        if(flowOffset % 5 === 0) {
            tokensSec.innerText = Math.floor(4000 + flowData[flowData.length-1] * 25).toLocaleString();
        }

        requestAnimationFrame(animateFlow);
    }
    animateFlow();

    // 3. Node Matrix Widget
    const matrixContainer = document.getElementById('node-matrix-container');
    let nodes = [];
    const nodeCount = 20;

    for(let i=0; i<nodeCount; i++) {
        let node = document.createElement('div');
        node.className = 'node';
        let x = Math.random() * 100;
        let y = Math.random() * 100;
        node.style.left = x + '%';
        node.style.top = y + '%';
        
        matrixContainer.appendChild(node);
        nodes.push({el: node, x: x, y: y, vx: (Math.random()-0.5)*0.8, vy: (Math.random()-0.5)*0.8});
    }

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    matrixContainer.appendChild(svg);

    function animateNodes() {
        nodes.forEach(n => {
            n.x += n.vx;
            n.y += n.vy;

            if(n.x < 0 || n.x > 100) n.vx *= -1;
            if(n.y < 0 || n.y > 100) n.vy *= -1;

            n.el.style.left = n.x + '%';
            n.el.style.top = n.y + '%';
        });

        svg.innerHTML = '';
        for(let i=0; i<nodes.length; i++) {
            for(let j=i+1; j<nodes.length; j++) {
                // approximate distance via percentages (not strictly accurate aspect ratio, but good enough for visual)
                let dx = nodes[i].x - nodes[j].x;
                let dy = nodes[i].y - nodes[j].y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                
                if(dist < 25) { 
                    let line = document.createElementNS(svgNS, "line");
                    line.setAttribute('x1', nodes[i].x + '%');
                    line.setAttribute('y1', nodes[i].y + '%');
                    line.setAttribute('x2', nodes[j].x + '%');
                    line.setAttribute('y2', nodes[j].y + '%');
                    line.setAttribute('stroke', `rgba(0, 243, 255, ${1 - dist/25})`);
                    line.setAttribute('stroke-width', '1.5');
                    svg.appendChild(line);
                }
            }
        }

        requestAnimationFrame(animateNodes);
    }
    animateNodes();

    // 4. Anomaly Scanner Widget
    const radarBlips = document.getElementById('radar-blips');
    const scanLog = document.getElementById('scan-log');
    
    const logMessages = [
        "Analyzing packet headers...",
        "Validating structural integrity...",
        "Optimizing sub-routines...",
        "No threat signatures found.",
        "Re-indexing neural database...",
        "Syncing with remote shards..."
    ];

    function createBlip() {
        const blip = document.createElement('div');
        blip.className = 'blip';
        
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 85; 
        
        const x = 100 + Math.cos(angle) * radius - 4; // center is 100,100, offset by half width
        const y = 100 + Math.sin(angle) * radius - 4;
        
        blip.style.left = x + 'px';
        blip.style.top = y + 'px';
        
        let deg = (Math.atan2(Math.sin(angle), Math.cos(angle)) * 180 / Math.PI + 90);
        if(deg < 0) deg += 360;
        
        blip.style.animationDelay = (deg / 360 * 3) + 's'; // 3s spin time
        
        radarBlips.appendChild(blip);
        
        setTimeout(() => {
            if(radarBlips.contains(blip)) radarBlips.removeChild(blip);
        }, 9000);
        
        if(Math.random() > 0.85) {
            addScanLog("ANOMALY: VECTOR " + Math.floor(Math.random()*999), true);
        }
    }

    setInterval(createBlip, 1800);

    function addScanLog(msg, isAlert = false) {
        const entry = document.createElement('div');
        entry.className = 'log-entry' + (isAlert ? ' alert' : '');
        
        const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" });
        entry.innerText = `[${time}] ${msg}`;
        
        scanLog.appendChild(entry);
        
        while(scanLog.children.length > 4) {
            scanLog.removeChild(scanLog.firstChild);
        }
    }

    setInterval(() => {
        if(Math.random() > 0.3) {
            let msg = logMessages[Math.floor(Math.random() * logMessages.length)];
            addScanLog(msg);
        }
    }, 2500);
    
    addScanLog("System initialized.");
    addScanLog("Scanning protocols active.");

    // 5. Cyber Stream Log
    const streamContainer = document.getElementById('cyber-stream');
    const actions = ["EXECUTE", "COMPILED", "FETCH", "DEPLOY", "MERGE", "ALLOCATE"];
    const targets = ["core_module", "auth_token", "neural_net_v3", "data_shard_8", "ui_render_pipe"];

    function addStreamRow() {
        const row = document.createElement('div');
        row.className = 'stream-row';

        const hash = Math.random().toString(16).substring(2, 10).toUpperCase();
        const action = actions[Math.floor(Math.random() * actions.length)];
        const target = targets[Math.floor(Math.random() * targets.length)];
        
        let status = 'OK';
        let statusClass = 'status-ok';
        let r = Math.random();
        if (r > 0.95) { status = 'ERR'; statusClass = 'status-err'; }
        else if (r > 0.8) { status = 'WARN'; statusClass = 'status-warn'; }

        row.innerHTML = `
            <span class="stream-hash">${hash}</span>
            <span class="stream-msg">${action} ${target}</span>
            <span class="stream-status ${statusClass}">[${status}]</span>
        `;

        streamContainer.appendChild(row);

        while(streamContainer.children.length > 12) {
            streamContainer.removeChild(streamContainer.firstChild);
        }
    }

    setInterval(addStreamRow, 600);
    for(let i=0; i<10; i++) addStreamRow();
});
