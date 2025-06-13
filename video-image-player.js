/* ================================================================== */
/* SCRIPT FOR WIDGET 1: IMAGE GALLERY (PREFIX: qqq-)                */
/* This script is wrapped in an IIFE to prevent global scope pollution. */
/* ================================================================== */

(function() {
    // ==========================================================
    // === यह सेक्शन HTML से डेटा पढ़ता है। qqq- प्रीफिक्स जोड़ा गया है। ===
    // ==========================================================
    let postURLForShare = "";
    let galleryData = [];
    let currentSlideIndex = 0;

    function parseDataFromHTML() {
        const configDiv = document.getElementById('qqq-gallery-config');
        if (configDiv) {
            postURLForShare = configDiv.dataset.postUrl || "";
        }
        
        const itemsContainer = document.getElementById('qqq-gallery-items-data');
        if (itemsContainer) {
            const itemDivs = itemsContainer.querySelectorAll('.qqq-item');
            itemDivs.forEach(div => {
                galleryData.push({
                    mainSrc: div.dataset.src || "",
                    title: div.dataset.title || "",
                    description: div.dataset.description || ""
                });
            });
        }
    }

    // === नीचे का कोड पहले जैसा ही है, केवल आईडी और क्लास को अपडेट किया गया है ===
    function initializeAnimatedGallery() {
        if (galleryData.length > 0) {
            displaySlide(0);
        }
        // NOTE: If your buttons like arrows call navigate() from HTML (e.g., onclick="navigate(1)"),
        // you would need to expose the function like this: window.qqq_navigate = navigate;
        // But if event listeners are added via JS, this is not needed.
    }

    function displaySlide(index) {
        if (index < 0 || index >= galleryData.length) return;
        const item = galleryData[index];
        const mainImage = document.getElementById("qqq-main-gallery-image-animated");
        mainImage.classList.add('qqq-fade-out');
        setTimeout(() => {
            mainImage.src = item.mainSrc;
            mainImage.alt = item.title;
            mainImage.classList.remove('qqq-fade-out');
            mainImage.style.animation = 'none';
            mainImage.offsetHeight;
            mainImage.style.animation = null;
            const counterElement = document.getElementById("qqq-image-counter-animated");
            if(counterElement) {
                counterElement.innerText = `${currentSlideIndex + 1} / ${galleryData.length}`;
            }
        }, 300);
        document.getElementById("qqq-image-title-animated").innerText = item.title || "";
        document.getElementById("qqq-image-description-animated").innerText = item.description || "";
    }

    // These functions are now private to this IIFE.
    // If they are called from HTML onclick attributes, they must be attached to the 'window' object.
    // Example: window.qqq_navigate = function(n) { ... };
    function navigate(n) {
        currentSlideIndex += n;
        if (currentSlideIndex >= galleryData.length) { currentSlideIndex = 0; }
        if (currentSlideIndex < 0) { currentSlideIndex = galleryData.length - 1; }
        displaySlide(currentSlideIndex);
    }

    async function shareCurrentImage() {
        const currentItem = galleryData[currentSlideIndex];
        if (!currentItem || !postURLForShare) return;
        const shareData = { title: document.title, text: `मेरे ब्लॉग से यह तस्वीर देखें: ${currentItem.title}`, url: postURLForShare };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch (err) {}
        } else { window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.text)} - ${encodeURIComponent(shareData.url)}`, "_blank"); }
    }

    function showDownloadMessage() {
        const toast = document.getElementById("qqq-download-toast-animated");
        if (!toast) return;
        toast.className = "qqq-toast-animated show";
        setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 4000);
    }

    // पेज लोड होते ही डेटा पार्स करें और फिर गैलरी शुरू करें
    document.addEventListener('DOMContentLoaded', () => {
        parseDataFromHTML();
        initializeAnimatedGallery();
        
        // Example of how to add event listeners dynamically from within the script
        const prevArrow = document.querySelector('.qqq-main-arrow-animated.qqq-prev');
        const nextArrow = document.querySelector('.qqq-main-arrow-animated.qqq-next');
        const shareBtn = document.querySelector('.qqq-share-btn-animated');
        const downloadBtn = document.querySelector('.qqq-download-btn-animated');

        if(prevArrow) prevArrow.addEventListener('click', () => navigate(-1));
        if(nextArrow) nextArrow.addEventListener('click', () => navigate(1));
        if(shareBtn) shareBtn.addEventListener('click', shareCurrentImage);
        if(downloadBtn) downloadBtn.addEventListener('click', showDownloadMessage);
    });
})();



/* ================================================================== */
/* SCRIPT FOR WIDGET 2: VIDEO PLAYER (PREFIX: ati_)                   */
/* This script was already in an IIFE, ensuring its scope is isolated.  */
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
    const ati_COUNTDOWN_SECONDS = 5;
    
    function ati_getMessage(key) { return ati_messages[key] || `[${key}]`; }
    
    function ati_parseData() {
        const dataContainer = document.getElementById('ati_data');
        if (!dataContainer) return;
        const msgContainer = dataContainer.querySelector('#ati_messages');
        if (msgContainer) {
            msgContainer.querySelectorAll('span').forEach(span => {
                ati_messages[span.dataset.msg] = span.textContent;
            });
        }
        dataContainer.querySelectorAll('div[data-platform]').forEach(platformDiv => {
            const platform = platformDiv.dataset.platform;
            const embedUrl = platformDiv.dataset.embedUrl;
            platformDiv.querySelectorAll('i').forEach(videoEl => {
                ati_playerVideos.push({
                    platform: platform,
                    id: videoEl.dataset.id,
                    title: videoEl.dataset.title || 'Untitled Video',
                    embedUrl: embedUrl
                });
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
            Array.from(ati_videoDropdownMenuEl.children).forEach((item, idx) => {
                item.classList.toggle('ati_active_video_item', idx === index);
            });
        }
        const existingVideo = ati_videoPlayerMainAreaEl.querySelector('iframe, video, .ati_player_message');
        if (existingVideo) existingVideo.remove();
        let newElement;
        const allowPolicy = "autoplay; fullscreen; picture-in-picture; encrypted-media";
        const autoplayParam = autoplay ? 1 : 0;
        switch (video.platform) {
            case 'youtube':
                newElement = document.createElement('iframe');
                newElement.src = `${video.embedUrl}${video.id}?autoplay=${autoplayParam}&mute=0&rel=0&modestbranding=1&iv_load_policy=3`;
                newElement.setAttribute('allow', allowPolicy);
                break;
            case 'archive':
                newElement = document.createElement('iframe');
                newElement.src = `${video.embedUrl}${video.id}&autoplay=${autoplayParam}`;
                newElement.setAttribute('allow', allowPolicy);
                break;
            case 'dailymotion':
                newElement = document.createElement('iframe');
                newElement.src = `${video.embedUrl}${video.id}?autoplay=${autoplayParam}&mute=0`;
                newElement.setAttribute('allow', allowPolicy);
                break;
            default:
                newElement = document.createElement('div');
                newElement.className = 'ati_player_message';
                newElement.style.cssText = 'color: #ff8a80; display: flex; align-items: center; justify-content: center; height: 100%;';
                newElement.textContent = ati_getMessage('unsupported_video');
                break;
        }
        if (newElement.tagName === 'IFRAME') {
            newElement.setAttribute('frameborder', '0');
            newElement.setAttribute('allowfullscreen', '');
        }
        ati_videoPlayerMainAreaEl.prepend(newElement);
    }

    // Functions attached to the 'window' object are accessible globally (e.g., from HTML onclick attributes).
    window.ati_slideVideoInModal = (direction) => {
        if(ati_playerVideos.length === 0) return;
        const newIndex = (ati_currentVideoIndex + direction + ati_playerVideos.length) % ati_playerVideos.length;
        ati_loadVideoInModal(newIndex, true);
    }

    window.ati_toggleVideoDropdown = () => {
        if (ati_videoDropdownMenuEl) {
            ati_videoDropdownMenuEl.classList.toggle('open');
        }
    }

    window.ati_openVideoPlayerModal = (startIndex = 0) => {
        if (!ati_videoPlayerModalEl) return;
        if (ati_playerVideos.length === 0) {
            clearTimeout(ati_autoOpenTimer);
            ati_hideTimerOverlay();
            alert(ati_getMessage('no_videos'));
            return;
        }
        ati_videoPlayerModalEl.style.display = "block";
        document.body.style.overflow = 'hidden';
        ati_renderVideoDropdownMenu();
        ati_loadVideoInModal(startIndex, true);
    }

    window.ati_closeVideoPlayerModal = () => {
        if(ati_videoPlayerModalEl) ati_videoPlayerModalEl.style.display = "none";
        const existingVideo = ati_videoPlayerMainAreaEl.querySelector('iframe, video, .ati_player_message');
        if (existingVideo) existingVideo.remove();
        document.body.style.overflow = 'auto';
        if (ati_videoDropdownMenuEl) ati_videoDropdownMenuEl.classList.remove('open');
    }

    document.addEventListener("keydown", function(e){
        if (ati_videoPlayerModalEl && ati_videoPlayerModalEl.style.display === "block") {
            if(e.key === "Escape") window.ati_closeVideoPlayerModal();
            if(e.key === "ArrowRight") { e.preventDefault(); window.ati_slideVideoInModal(1); }
            if(e.key === "ArrowLeft") { e.preventDefault(); window.ati_slideVideoInModal(-1); }
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
    
    function ati_hideTimerOverlay() {
        if (ati_timerOverlayEl) {
            ati_timerOverlayEl.style.display = 'none';
        }
    }
    
    function ati_cancelAutoOpen() {
        ati_isAutoOpenCancelled = true;
        clearTimeout(ati_autoOpenTimer);
        ati_hideTimerOverlay();
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
        autoOpenBtn.addEventListener('click', function() {
            if (ati_isAutoOpenCancelled) {
                window.ati_openVideoPlayerModal();
            } else {
                ati_cancelAutoOpen();
                window.ati_openVideoPlayerModal();
            }
        });
        autoOpenBtn.addEventListener('dblclick', function(e) {
            e.preventDefault();
            if (!ati_isAutoOpenCancelled) {
                ati_cancelAutoOpen();
            }
        });
        ati_startAutoOpenCountdown();
    }

    document.addEventListener('DOMContentLoaded', ati_initialize);
})();
