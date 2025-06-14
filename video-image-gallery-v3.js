/* ================================================================== */
/* SCRIPT FOR WIDGET 1: IMAGE GALLERY (PREFIX: qqq-) - FINAL & SIMPLIFIED DOWNLOAD */
/* ================================================================== */
(function() {
    function initQqqGallery() {
        // 1. सभी ज़रूरी HTML एलिमेंट्स को चुनना
        const mainImage = document.getElementById('qqq-main-gallery-image-animated');
        const loaderOverlay = document.getElementById('qqq-loader-overlay');
        const imageTitle = document.getElementById('qqq-image-title-animated');
        const imageDescription = document.getElementById('qqq-image-description-animated');
        const imageCounter = document.getElementById('qqq-image-counter-animated');
        const prevButton = document.querySelector('.qqq-main-arrow-animated.qqq-prev');
        const nextButton = document.querySelector('.qqq-main-arrow-animated.qqq-next');
        const hqButton = document.getElementById('qqq-hq-btn-animated');
        const downloadButton = document.querySelector('.qqq-download-btn-animated');
        const shareButton = document.querySelector('.qqq-share-btn-animated');
        const postUrlConfig = document.getElementById('qqq-gallery-config');
        const toast = document.getElementById('qqq-download-toast-animated');
        const galleryItemsContainer = document.getElementById('qqq-gallery-items-data');
        const thumbnailGridContainer = document.getElementById('qqq-thumbnail-grid-container');

        // 2. सुरक्षा जांच
        if (!mainImage || !loaderOverlay || !galleryItemsContainer || !thumbnailGridContainer) { return; }

        // 3. गैलरी का स्टेट
        const totalImages = galleryItemsContainer.children.length;
        if (totalImages === 0) return;
        
        let currentIndex = 0;
        let currentHighQualitySrc = '';
        let isNavigating = false;

        // 4. मुख्य फंक्शन: तस्वीर को दिखाना
        function displayImage(index) {
            if (isNavigating) return;
            isNavigating = true;

            loaderOverlay.classList.add('visible');
            mainImage.style.opacity = '0';
            loaderOverlay.querySelector('p').innerHTML = "नेटवर्क धीमा है, कृपया प्रतीक्षा करें...<br>इमेज लोड हो रही है।";

            const item = galleryItemsContainer.children[index];
            const srcLow = item.getAttribute('data-src-low');
            currentHighQualitySrc = item.getAttribute('data-src-high');
            
            mainImage.onload = () => {
                currentIndex = index;
                imageTitle.textContent = item.getAttribute('data-title');
                imageDescription.textContent = item.getAttribute('data-description');
                imageCounter.textContent = `${index + 1} / ${totalImages}`;
                hqButton.classList.remove('active', 'loading');
                hqButton.disabled = false;
                loaderOverlay.classList.remove('visible');
                mainImage.style.opacity = '1';
                prevButton.disabled = (index === 0);
                nextButton.disabled = (index === totalImages - 1);
                isNavigating = false;
                updateActiveThumbnail(index);
                mainImage.onload = null; mainImage.onerror = null;
            };
            mainImage.onerror = () => handleLoadingError("इमेज लोड करने में त्रुटि हुई।");
            mainImage.src = srcLow;
        }

        function handleLoadingError(message) {
            loaderOverlay.querySelector('p').textContent = message;
            setTimeout(() => {
                loaderOverlay.classList.remove('visible');
                isNavigating = false;
                prevButton.disabled = (currentIndex === 0);
                nextButton.disabled = (currentIndex === totalImages - 1);
            }, 2500);
        }
        
        // 5. थंबनेल ग्रिड बनाने और अपडेट करने के लिए फंक्शन
        function buildThumbnailGrid() {
            Array.from(galleryItemsContainer.children).forEach((item, index) => {
                const thumb = document.createElement('img');
                const lowSrc = item.getAttribute('data-src-low');
                const thumbSrc = lowSrc.replace(/\/s\d+(-[a-z])?(-[a-z])?\//, '/s50-c/');
                thumb.src = thumbSrc;
                thumb.className = 'qqq-thumbnail-item';
                thumb.dataset.index = index;
                thumb.alt = item.getAttribute('data-title');
                thumbnailGridContainer.appendChild(thumb);
            });
        }

        function updateActiveThumbnail(newIndex) {
            const currentActive = thumbnailGridContainer.querySelector('.active');
            if (currentActive) currentActive.classList.remove('active');
            const nextActive = thumbnailGridContainer.querySelector(`[data-index="${newIndex}"]`);
            if (nextActive) nextActive.classList.add('active');
        }

        // 6. सभी इवेंट लिस्नर
        function navigate(direction) {
            const newIndex = currentIndex + direction;
            if (newIndex >= 0 && newIndex < totalImages) {
                displayImage(newIndex);
            }
        }
        
        prevButton.addEventListener('click', () => navigate(-1));
        nextButton.addEventListener('click', () => navigate(1));

        thumbnailGridContainer.addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('qqq-thumbnail-item')) {
                const newIndex = parseInt(e.target.dataset.index, 10);
                if (newIndex !== currentIndex) {
                    displayImage(newIndex);
                }
            }
        });
        
        hqButton.addEventListener('click', () => {
            if (isNavigating || hqButton.classList.contains('active')) return;
            hqButton.classList.add('loading');
            hqButton.disabled = true;
            const tempImg = new Image();
            tempImg.src = currentHighQualitySrc;
            tempImg.onload = () => {
                mainImage.src = currentHighQualitySrc;
                hqButton.classList.remove('loading');
                hqButton.classList.add('active');
            };
            tempImg.onerror = () => {
                alert('उच्च गुणवत्ता वाली छवि लोड करने में विफल।');
                hqButton.classList.remove('loading');
                hqButton.disabled = false;
            };
        });

        // *** डाउनलोड बटन का सरल और प्रभावी लॉजिक ***
        downloadButton.addEventListener('click', () => {
            if (toast) {
                // निर्देश वाला संदेश सेट करें
                toast.innerHTML = "<i class='fa-solid fa-hand-pointer'></i> इमेज को दबाकर रखें (Long Press) और 'Download Image' चुनें।";
                
                toast.classList.add('show');
                
                // 5 सेकंड बाद संदेश छिपाएं
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 5000);
            }
        });

        shareButton.addEventListener('click', async () => {
            const postUrl = postUrlConfig ? postUrlConfig.getAttribute('data-post-url') : window.location.href;
            if (navigator.share) {
                try { await navigator.share({ title: imageTitle.textContent, text: `${imageTitle.textContent} - ${imageDescription.textContent}`, url: postUrl }); } catch (err) {}
            }
        });

        // 7. गैलरी को शुरू करना
        buildThumbnailGrid();
        displayImage(0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initQqqGallery);
    } else {
        initQqqGallery();
    }
})();

/* ================================================================== */
/* SCRIPT FOR WIDGET 2: VIDEO PLAYER (PREFIX: ati_) - NO CHANGES MADE */
/* ================================================================== */
(function() {
    // ... आपका ati_ विजेट का पूरा जावास्क्रिप्ट कोड यहाँ जैसा था वैसा ही रहेगा ...
})();


/* ===== START: Screen Focus Cosmos Widget JS (v1.4 - Prefix: sfcw-) ===== */
/* निर्देश: इस JS कोड को ब्लॉगर थीम के मुख्य JS स्थान (आमतौर पर </body> से पहले) में डालें। */
/* <script> टैग्स का उपयोग न करें। */

(function() {
    const sfcwCanvas = document.getElementById('sfcw-particle-canvas');
    if (!sfcwCanvas) return; // अगर विजेट मौजूद नहीं है, तो आगे न बढ़ें

    // --- कॉपीराइट वर्ष अपडेट करें ---
    const sfcwYearSpan = document.getElementById('sfcw-current-year');
    if (sfcwYearSpan) {
        sfcwYearSpan.textContent = " " + new Date().getFullYear();
    }

    const sfcwCtx = sfcwCanvas.getContext('2d');
    let sfcwParticles = [];
    let sfcwAnimationFrameId = null;

    function sfcwResizeCanvas() {
        sfcwCanvas.width = sfcwCanvas.offsetWidth;
        sfcwCanvas.height = sfcwCanvas.offsetHeight;
    }

    class SFCW_Particle {
        constructor(x, y) {
            this.x = x || Math.random() * sfcwCanvas.width;
            this.y = y || Math.random() * sfcwCanvas.height;
            this.size = Math.random() * 2.5 + 1;
            this.speedX = (Math.random() * 1 - 0.5) * 0.5;
            this.speedY = (Math.random() * 1 - 0.5) * 0.5;
            const rootStyle = getComputedStyle(document.documentElement);
            const starColor = rootStyle.getPropertyValue('--sfcw-star-color').trim() || 'rgba(240, 248, 255, 0.85)';
            const particleColor = rootStyle.getPropertyValue('--sfcw-particle-color').trim() || 'rgba(0, 160, 160, 0.5)';
            this.color = Math.random() > 0.1 ? starColor : particleColor;
            this.opacity = Math.random() * 0.6 + 0.2;
            this.initialOpacity = this.opacity;
            this.life = Math.random() * 2 + 1;
            this.initialLife = this.life;
        }
        update(deltaTime) {
            this.x += this.speedX * deltaTime * 30;
            this.y += this.speedY * deltaTime * 30;
            this.life -= deltaTime;
            if (this.life <= 0) {
                this.opacity = 0;
                if (this.life <= -0.5) { this.reset(); }
            } else {
                this.opacity = this.initialOpacity * (0.6 + Math.abs(Math.sin((this.initialLife - this.life) * Math.PI / this.initialLife) * 0.4));
            }
            if (this.x <= 0 || this.x >= sfcwCanvas.width) {
                this.speedX *= -1;
                this.x = Math.max(1, Math.min(this.x, sfcwCanvas.width - 1));
            }
            if (this.y <= 0 || this.y >= sfcwCanvas.height) {
                this.speedY *= -1;
                this.y = Math.max(1, Math.min(this.y, sfcwCanvas.height - 1));
            }
        }
        reset() {
            this.x = Math.random() * sfcwCanvas.width;
            this.y = Math.random() * sfcwCanvas.height;
            this.opacity = this.initialOpacity;
            this.life = this.initialLife;
            this.speedX = (Math.random() * 1 - 0.5) * 0.5;
            this.speedY = (Math.random() * 1 - 0.5) * 0.5;
        }
        draw() {
            if (this.opacity <= 0) return;
            sfcwCtx.globalAlpha = this.opacity;
            sfcwCtx.fillStyle = this.color;
            sfcwCtx.beginPath();
            sfcwCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            sfcwCtx.fill();
        }
    }

    function sfcwInitParticles() {
        sfcwParticles = [];
        let numberOfParticles = Math.floor(sfcwCanvas.width * sfcwCanvas.height / 15000);
        numberOfParticles = Math.max(50, Math.min(numberOfParticles, 150));
        for (let i = 0; i < numberOfParticles; i++) {
            sfcwParticles.push(new SFCW_Particle());
        }
    }

    let sfcwLastTime = 0;
    function sfcwAnimateParticles(timestamp) {
        if (document.hidden) {
            sfcwLastTime = timestamp;
            sfcwAnimationFrameId = requestAnimationFrame(sfcwAnimateParticles);
            return;
        }
        const deltaTime = (timestamp - sfcwLastTime) / 1000;
        sfcwLastTime = timestamp;
        sfcwCtx.clearRect(0, 0, sfcwCanvas.width, sfcwCanvas.height);
        sfcwParticles.forEach(p => {
            if (deltaTime > 0 && deltaTime < 0.1) {
                p.update(deltaTime);
            } else if (deltaTime >= 0.1) {
                p.reset();
            }
            p.draw();
        });
        sfcwCtx.globalAlpha = 1.0;
        sfcwAnimationFrameId = requestAnimationFrame(sfcwAnimateParticles);
    }

    function sfcwStartAnimation() {
        sfcwResizeCanvas();
        sfcwInitParticles();
        if (sfcwAnimationFrameId) {
            cancelAnimationFrame(sfcwAnimationFrameId);
        }
        sfcwLastTime = performance.now();
        sfcwAnimationFrameId = requestAnimationFrame(sfcwAnimateParticles);
    }

    const sfcwStartDelay = setTimeout(sfcwStartAnimation, 100);
    let sfcwResizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(sfcwResizeTimeout);
        sfcwResizeTimeout = setTimeout(() => {
            if (sfcwAnimationFrameId) {
                cancelAnimationFrame(sfcwAnimationFrameId);
            }
            sfcwStartAnimation();
        }, 500);
    });
    window.addEventListener('beforeunload', () => {
        if (sfcwAnimationFrameId) {
            cancelAnimationFrame(sfcwAnimationFrameId);
        }
        clearTimeout(sfcwStartDelay);
        clearTimeout(sfcwResizeTimeout);
    });
})();
/* ===== END: Screen Focus Cosmos Widget JS ===== */
