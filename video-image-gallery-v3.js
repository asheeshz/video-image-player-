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
    let ati_playerVideos = [];
    let ati_currentVideoIndex = 0;
    let ati_messages = {};
    const ati_videoPlayerModalEl = document.getElementById("ati_videoPlayerModal");
    const ati_videoPlayerMainAreaEl = document.getElementById("ati_videoPlayerMainArea");
    const ati_videoModalTitleEl = document.getElementById("ati_videoModalTitle");
    const ati_videoDropdownMenuEl = document.getElementById("ati_videoDropdownMenu");
    let ati_autoOpenTimer = null;
    let ati_isAutoOpenCancelled = false;
    let ati_click_timeout = null;
    const ati_COUNTDOWN_SECONDS = 5;

    function ati_getMessage(key) { return ati_messages[key] || `[${key}]`; }
    
    function ati_parseData() {
        const dataContainer = document.getElementById('ati_data');
        if (!dataContainer) return;
        const msgContainer = dataContainer.querySelector('#ati_messages');
        if (msgContainer) {
            msgContainer.querySelectorAll('span').forEach(span => { ati_messages[span.dataset.msg] = span.textContent; });
        }
        dataContainer.querySelectorAll('div[data-platform]').forEach(platformDiv => {
            const platform = platformDiv.dataset.platform;
            const embedUrl = platformDiv.dataset.embedUrl;
            platformDiv.querySelectorAll('i').forEach(videoEl => {
                ati_playerVideos.push({ platform: platform, id: videoEl.dataset.id, title: videoEl.dataset.title || 'Untitled Video', embedUrl: embedUrl });
            });
        });
    }

    function ati_renderVideoDropdownMenu() {
        if (!ati_videoDropdownMenuEl) return;
        ati_videoDropdownMenuEl.innerHTML = '';
        if (ati_playerVideos.length === 0) return;
        ati_playerVideos.forEach((video, index) => {
            const listItem = document.createElement('div');
            listItem.className = 'ati_video_dropdown_item';
            listItem.textContent = video.title;
            listItem.title = video.title;
            listItem.onclick = () => {
                ati_loadVideoInModal(index, true);
                ati_videoDropdownMenuEl.classList.remove('open');
            };
            ati_videoDropdownMenuEl.appendChild(listItem);
        });
    }

    function ati_loadVideoInModal(index, autoplay = true) {
        ati_currentVideoIndex = index;
        const video = ati_playerVideos[index];
        if (!video || !ati_videoPlayerMainAreaEl) return;
        if (ati_videoModalTitleEl) ati_videoModalTitleEl.textContent = video.title;
        if (ati_videoDropdownMenuEl) {
            Array.from(ati_videoDropdownMenuEl.children).forEach((item, idx) => { item.classList.toggle('ati_active_video_item', idx === index); });
        }
        const existingVideo = ati_videoPlayerMainAreaEl.querySelector('iframe, video, .ati_player_message');
        if (existingVideo) existingVideo.remove();
        let newElement;
        const allowPolicy = "autoplay; fullscreen; picture-in-picture; encrypted-media";
        const autoplayParam = autoplay ? 1 : 0;
        switch (video.platform) {
            case 'youtube': newElement = document.createElement('iframe'); newElement.src = `${video.embedUrl}${video.id}?autoplay=${autoplayParam}&mute=0&rel=0&modestbranding=1&iv_load_policy=3`; newElement.setAttribute('allow', allowPolicy); break;
            case 'archive': newElement = document.createElement('iframe'); newElement.src = `${video.embedUrl}${video.id}&autoplay=${autoplayParam}`; newElement.setAttribute('allow', allowPolicy); break;
            case 'dailymotion': newElement = document.createElement('iframe'); newElement.src = `${video.embedUrl}${video.id}?autoplay=${autoplayParam}&mute=0`; newElement.setAttribute('allow', allowPolicy); break;
            default: newElement = document.createElement('div'); newElement.className = 'ati_player_message'; newElement.style.cssText = 'color: #ff8a80; display: flex; align-items: center; justify-content: center; height: 100%;'; newElement.textContent = ati_getMessage('unsupported_video'); break;
        }
        if (newElement.tagName === 'IFRAME') { newElement.setAttribute('frameborder', '0'); newElement.setAttribute('allowfullscreen', ''); }
        ati_videoPlayerMainAreaEl.prepend(newElement);
    }

    window.ati_slideVideoInModal = (direction) => {
        if (ati_playerVideos.length === 0) return;
        const newIndex = (ati_currentVideoIndex + direction + ati_playerVideos.length) % ati_playerVideos.length;
        ati_loadVideoInModal(newIndex, true);
    }

    window.ati_toggleVideoDropdown = () => {
        if (ati_videoDropdownMenuEl) { ati_videoDropdownMenuEl.classList.toggle('open'); }
    }

    window.ati_openVideoPlayerModal = (startIndex = 0) => {
        ati_cancelAutoOpen();
        if (!ati_videoPlayerModalEl) return;
        if (ati_playerVideos.length === 0) { alert(ati_getMessage('no_videos')); return; }
        ati_videoPlayerModalEl.style.display = "block";
        document.body.style.overflow = 'hidden';
        ati_renderVideoDropdownMenu();
        ati_loadVideoInModal(startIndex, true);
    }

    window.ati_closeVideoPlayerModal = () => {
        if (ati_videoPlayerModalEl) ati_videoPlayerModalEl.style.display = "none";
        const existingVideo = ati_videoPlayerMainAreaEl.querySelector('iframe, video, .ati_player_message');
        if (existingVideo) existingVideo.remove();
        document.body.style.overflow = 'auto';
        if (ati_videoDropdownMenuEl) ati_videoDropdownMenuEl.classList.remove('open');
    }

    document.addEventListener("keydown", function(e) {
        if (ati_videoPlayerModalEl && ati_videoPlayerModalEl.style.display === "block") {
            if (e.key === "Escape") window.ati_closeVideoPlayerModal();
            if (e.key === "ArrowRight") { e.preventDefault(); window.ati_slideVideoInModal(1); }
            if (e.key === "ArrowLeft") { e.preventDefault(); window.ati_slideVideoInModal(-1); }
        }
    });

    document.addEventListener('click', function(event) {
        const menuBtn = document.querySelector('.ati_video_player_menu_btn');
        if (ati_videoDropdownMenuEl && ati_videoDropdownMenuEl.classList.contains('open')) {
            if (!ati_videoDropdownMenuEl.contains(event.target) && !menuBtn.contains(event.target)) {
                ati_videoDropdownMenuEl.classList.remove('open');
            }
        }
    });

    const ati_timerOverlayEl = document.getElementById('ati_timer_overlay_id');
    
    function ati_hideTimerOverlay() { if (ati_timerOverlayEl) { ati_timerOverlayEl.style.display = 'none'; } }

    function ati_cancelAutoOpen() {
        if (!ati_isAutoOpenCancelled) {
            ati_isAutoOpenCancelled = true;
            clearTimeout(ati_autoOpenTimer);
            ati_hideTimerOverlay();
        }
    }

    function ati_startAutoOpenCountdown() {
        if (ati_isAutoOpenCancelled || ati_playerVideos.length === 0) return;
        if (ati_timerOverlayEl) ati_timerOverlayEl.style.display = 'flex';
        ati_autoOpenTimer = setTimeout(() => {
            if (!ati_isAutoOpenCancelled) {
                ati_hideTimerOverlay();
                window.ati_openVideoPlayerModal();
            }
        }, ati_COUNTDOWN_SECONDS * 1000);
    }

    function ati_initialize() {
        ati_parseData();
        const autoOpenBtn = document.getElementById('ati_auto_open_btn');
        if (!autoOpenBtn) return;
        
        const timerOverlay = document.getElementById('ati_timer_overlay_id');
        if (timerOverlay) {
            timerOverlay.addEventListener('dblclick', function(e) {
                e.preventDefault();
                e.stopPropagation();
                ati_cancelAutoOpen();
            });
        }
        
        autoOpenBtn.addEventListener('click', function() {
            clearTimeout(ati_click_timeout);
            ati_click_timeout = setTimeout(function() {
                window.ati_openVideoPlayerModal();
            }, 250);
        });

        autoOpenBtn.addEventListener('dblclick', function(e) {
            e.preventDefault();
            clearTimeout(ati_click_timeout);
            ati_cancelAutoOpen();
        });
        
        ati_startAutoOpenCountdown();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ati_initialize);
    } else {
        ati_initialize();
    }
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
