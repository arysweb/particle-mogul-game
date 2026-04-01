Object.assign(UI.prototype, {
    createToastElement() {
        const toastElement = document.createElement('div');
        toastElement.className = 'autosave-toast';
        document.body.appendChild(toastElement);
        return toastElement;
    },

    spawnFallingPopup(text, className, startX, startY) {
        if (!text) {
            return;
        }

        const popupElement = document.createElement('div');
        popupElement.className = className;
        popupElement.textContent = text;
        document.body.appendChild(popupElement);

        const durationMs = 1400;
        const gravity = 520;
        const driftX = (Math.random() - 0.5) * 60;
        const startTime = performance.now();

        const animatePopup = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            const x = startX + (driftX * progress);
            const y = startY + (gravity * progress * progress);
            const opacity = 1 - progress;
            const scale = 1 - (progress * 0.12);

            popupElement.style.left = `${x}px`;
            popupElement.style.top = `${y}px`;
            popupElement.style.opacity = `${opacity}`;
            popupElement.style.transform = `translate(-50%, -50%) scale(${scale})`;

            if (progress < 1) {
                requestAnimationFrame(animatePopup);
                return;
            }

            popupElement.remove();
        };

        requestAnimationFrame(animatePopup);
    },

    showTraderSellPopup(amount) {
        if (!amount || amount <= 0) {
            return;
        }

        this.spawnFallingPopup(`+${amount}`, 'trader-sell-popup', window.innerWidth / 2, window.innerHeight * 0.18);
    },

    showParticleDropPopup(particleType) {
        if (!particleType || particleType === 'sand') {
            return;
        }

        const label = particleType.charAt(0).toUpperCase() + particleType.slice(1);
        this.spawnFallingPopup(`+1 ${label}`, 'particle-drop-popup', window.innerWidth / 2, window.innerHeight * 0.14);
    },

    showToast(message) {
        if (!this.toastElement) {
            return;
        }

        this.toastElement.textContent = message;
        this.toastElement.classList.add('is-visible');

        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }

        this.toastTimeout = setTimeout(() => {
            this.toastElement.classList.remove('is-visible');
        }, 1800);
    }
});
