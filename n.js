const /* ================================================================== */
/* SCRIPT FOR WIDGET 1: IMAGE GALLERY (PREFIX: qqq-) - FINAL WITH CUSTOM LOADER */
/* ================================================================== */
(function() {
    // यह मुख्य फ़ंक्शन है जो गैलरी को शुरू करेगा।
    function initQqqGallery() {
        // 1. सभी ज़रूरी HTML एलिमेंट्स को चुनना
        const mainImage = document.getElementById('qqq-main-gallery-image-animated');
        const loaderOverlay = document.getElementById('qqq-loader-overlay'); // नया लोडर
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

        // 2. सुरक्षा जांच: अगर कोई एलिमेंट नहीं मिलता है, तो स्क्रिप्ट को रोक दें।
        if (!mainImage || !loaderOverlay || !galleryItemsContainer || !prevButton || !nextButton || !hqButton) {
            console.error("QQQ Gallery Error: One or more essential HTML elements are missing. The script will not run.");
            return;
        }

        // 3. गैलरी का स्टेट
        const totalImages = galleryItemsContainer.children.length;
        if (totalImages === 0) {
             const galleryContainer = document.querySelector('.qqq-gallery-container-animated');
             if(galleryContainer) galleryContainer.style.display = 'none';
             return; // अगर कोई इमेज नहीं है तो आगे कुछ न करें।
        }
        
        let currentIndex = 0;
        let currentHighQualitySrc = '';
        let isNavigating = false; // नेविगेशन के दौरान दोबारा क्लिक को रोकने के लिए

        // 4. मुख्य फंक्शन: तस्वीर को प्रीलोड करना और फिर दिखाना
        function displayImage(index) {
            if (isNavigating) return; // अगर पहले से ही कोई ट्रांज़िशन चल रहा है, तो कुछ न करें
            isNavigating = true;

            // तुरंत इमेज छिपाएं और लोडर दिखाएं
            mainImage.classList.add('qqq-is-loading');
            loaderOverlay.classList.add('visible');

            const item = galleryItemsContainer.children[index];
            if (!item) {
                isNavigating = false;
                loaderOverlay.classList.remove('visible');
                return;
            }

            const srcLow = item.getAttribute('data-src-low');
            const srcHigh = item.getAttribute('data-src-high');
            const title = item.getAttribute('data-title');
            const description = item.getAttribute('data-description');

            // बैकग्राउंड में इमेज प्रीलोड करें
            const preloader = new Image();
            preloader.src = srcLow;

            preloader.onload = () => {
                currentHighQualitySrc = srcHigh;
                currentIndex = index;

                // छिपी हुई इमेज का src बदलें
                mainImage.src = srcLow;
                mainImage.alt = title;

                // बाकी जानकारी अपडेट करें
                imageTitle.textContent = title;
                imageDescription.textContent = description;
                imageCounter.textContent = `${currentIndex + 1} / ${totalImages}`;
                hqButton.classList.remove('active', 'loading');
                hqButton.disabled = false;
                
                // लोडर छिपाएं और नई इमेज दिखाएं
                loaderOverlay.classList.remove('visible');
                mainImage.classList.remove('qqq-is-loading');

                // नेविगेशन बटनों को अपडेट करें
                prevButton.disabled = (currentIndex === 0);
                nextButton.disabled = (currentIndex === totalImages - 1);
                isNavigating = false;
            };

            preloader.onerror = () => {
                console.error("Failed to preload image: " + srcLow);
                loaderOverlay.querySelector('p').textContent = 'इमेज लोड करने में त्रुटि हुई।';
                // 2 सेकंड बाद उपयोगकर्ता को फिर से प्रयास करने दें
                setTimeout(() => {
                    loaderOverlay.classList.remove('visible');
                    mainImage.classList.remove('qqq-is-loading'); // पुरानी इमेज वापस दिखाएं
                    isNavigating = false;
                    prevButton.disabled = (currentIndex === 0);
                    nextButton.disabled = (currentIndex === totalImages - 1);
                }, 2000);
            };
        }

        // 5. बटनों के लिए इवेंट लिस्नर
        function navigate(direction) {
            const newIndex = currentIndex + direction;
            if (newIndex >= 0 && newIndex < totalImages) {
                displayImage(newIndex);
            }
        }
        
        prevButton.addEventListener('click', () => navigate(-1));
        nextButton.addEventListener('click', () => navigate(1));

        hqButton.addEventListener('click', () => {
            if (!hqButton.classList.contains('active') && currentHighQualitySrc) {
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
            }
        });

        downloadButton.addEventListener('click', () => {
            if (!currentHighQualitySrc) return;
            const link = document.createElement('a');
            link.href = currentHighQualitySrc;
            link.download = imageTitle.textContent.replace(/ /g, '_') + '.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            if(toast) {
                toast.classList.add('show');
                setTimeout(() => { toast.classList.remove('show'); }, 4000);
            }
        });

        shareButton.addEventListener('click', async () => {
            const postUrl = postUrlConfig ? postUrlConfig.getAttribute('data-post-url') : window.location.href;
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: imageTitle.textContent,
                        text: `${imageTitle.textContent} - ${imageDescription.textContent}`,
                        url: postUrl
                    });
                } catch (err) {}
            }
        });
        
        // 6. गैलरी को शुरू करना
        displayImage(0);
    }

    // 7. स्क्रिप्ट को चलाने के लिए सबसे विश्वसनीय तरीका
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
