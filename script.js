document.addEventListener('DOMContentLoaded', () => {
    
    // --- Phase 1: Entrance Doors ---
    const roseButton = document.getElementById('rose-button');
    const doorOverlay = document.getElementById('door-overlay');
    const body = document.body;

    roseButton.addEventListener('click', () => {
        const sun = document.getElementById('sun-brightness');
        
        // Hide the lock button immediately
        roseButton.style.opacity = '0';
        roseButton.style.pointerEvents = 'none';
        
        // 1. Expand the sun brightness effect
        if (sun) sun.classList.add('active');
        
        // 2. Open the doors slightly after the sun starts expanding (hidden behind brightness)
        setTimeout(() => {
            doorOverlay.classList.add('open');
        }, 600); 

        // 3. Fade out the brightness to reveal the main content
        setTimeout(() => {
            if (sun) sun.classList.add('fade-out');
        }, 1400);

        // 4. Wait for full sequence to finish before allowing scroll
        setTimeout(() => {
            body.classList.remove('locked-scroll');
            if (sun) sun.style.display = 'none';
        }, 2800); 
    });

    // --- Phase 2: Scratch Off Date ---
    const canvas = document.getElementById('scratch-canvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('scratch-container');
    
    // Set canvas resolution
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    // Fill with rose-gold metallic look matching blossom theme
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#dca7b5');
    gradient.addColorStop(0.5, '#f5e4e8');
    gradient.addColorStop(1, '#c58c9c');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some noise/texture to look like scratch off material
    for(let i = 0; i < 5000; i++) {
        ctx.fillStyle = `rgba(0,0,0, ${Math.random() * 0.05})`;
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }
    
    ctx.font = "italic 16px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.textAlign = "center";
    ctx.fillText("Scratch Here", canvas.width/2, canvas.height/2);

    let isDrawing = false;

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: (evt.clientX || evt.touches[0].clientX) - rect.left,
            y: (evt.clientY || evt.touches[0].clientY) - rect.top
        };
    }

    function scratch(x, y) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.fill();
    }

    let hasPopped = false;
    
    // Create a local canvas for confetti so it respects the body container width
    const confettiCanvas = document.createElement('canvas');
    confettiCanvas.style.position = 'fixed';
    confettiCanvas.style.top = '0';
    confettiCanvas.style.left = '0';
    confettiCanvas.style.width = '100%';
    confettiCanvas.style.height = '100%';
    confettiCanvas.style.pointerEvents = 'none';
    confettiCanvas.style.zIndex = '3000';
    
    // Initialize custom confetti instance
    let customConfetti;

    function playPopSound() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.15);
            gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.15);
        } catch(e) {}
    }

    function triggerConfetti() {
        hasPopped = true;
        playPopSound();
        
        document.body.appendChild(confettiCanvas);
        customConfetti = confetti.create(confettiCanvas, {
            resize: true,
            useWorker: true
        });
        
        // Massive Left Burst
        customConfetti({
            particleCount: 250,
            spread: 120,
            startVelocity: 70,
            origin: { x: 0, y: 0.8 },
            angle: 50,
            colors: ['#C5A059', '#8A6B9E', '#ffffff', '#FFD700']
        });
        
        // Massive Right Burst
        customConfetti({
            particleCount: 250,
            spread: 120,
            startVelocity: 70,
            origin: { x: 1, y: 0.8 },
            angle: 130,
            colors: ['#C5A059', '#8A6B9E', '#ffffff', '#FFD700']
        });
    }

    function checkScratchPercent() {
        if (hasPopped) return;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparentPixels = 0;
        for (let i = 3; i < pixels.length; i += 4) { // check alpha channel
            if (pixels[i] < 128) {
                transparentPixels++;
            }
        }
        const percent = (transparentPixels / (pixels.length / 4)) * 100;
        if (percent > 35) { // Trigger when ~35% or more is scratched off
            triggerConfetti();
            
            // Optionally fade out the remaining canvas to fully reveal
            canvas.style.transition = 'opacity 1s ease';
            canvas.style.opacity = '0';
            setTimeout(() => canvas.style.display = 'none', 1000);
        }
    }

    // Mouse Events
    canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(getMousePos(canvas, e).x, getMousePos(canvas, e).y); });
    canvas.addEventListener('mousemove', (e) => { if(isDrawing) scratch(getMousePos(canvas, e).x, getMousePos(canvas, e).y); });
    canvas.addEventListener('mouseup', () => { isDrawing = false; checkScratchPercent(); });
    canvas.addEventListener('mouseleave', () => { isDrawing = false; });

    // Touch Events
    canvas.addEventListener('touchstart', (e) => { isDrawing = true; e.preventDefault(); scratch(getMousePos(canvas, e).x, getMousePos(canvas, e).y); }, {passive: false});
    canvas.addEventListener('touchmove', (e) => { if(isDrawing) { e.preventDefault(); scratch(getMousePos(canvas, e).x, getMousePos(canvas, e).y); } }, {passive: false});
    canvas.addEventListener('touchend', () => { isDrawing = false; checkScratchPercent(); });

    
    // --- Phase 3: Countdown Timer ---
    const targetDate = new Date("May 17, 2026 12:00:00").getTime();
    
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-mins');
    const secsEl = document.getElementById('cd-secs');

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            clearInterval(timerInterval);
            daysEl.innerText = "00";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysEl.innerText = days.toString().padStart(2, '0');
        hoursEl.innerText = hours.toString().padStart(2, '0');
        minsEl.innerText = minutes.toString().padStart(2, '0');
        secsEl.innerText = seconds.toString().padStart(2, '0');
    }
    
    updateCountdown();
    const timerInterval = setInterval(updateCountdown, 1000);

});
