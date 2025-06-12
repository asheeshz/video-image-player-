// ==========================================================
// === विजेट 1: एनिमेटेड इमेज गैलरी
// === इस कोड को एक IIFE (Immediately Invoked Function Expression) में लपेटा गया है
// === ताकि इसके वेरिएबल्स और फंक्शन्स दूसरे स्क्रिप्ट से न टकराएं।
// ==========================================================
(function() {
    // === यह सेक्शन HTML से डेटा पढ़ता है। qqq- प्रीफिक्स जोड़ा गया है। ===
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
    }

    function displaySlide(index) {
        if (index < 0 || index >= galleryData.length) return;
        currentSlideIndex = index; // currentSlideIndex को यहाँ अपडेट करना महत्वपूर्ण है
        const item = galleryData[index];
        const mainImage = document.getElementById("qqq-main-gallery-image-animated");
        if (!mainImage) return;

        mainImage.classList.add('qqq-fade-out');

        setTimeout(() => {
            mainImage.src = item.mainSrc;
            mainImage.alt = item.title;
            mainImage.classList.remove('qqq-fade-out');
            mainImage.style.animation = 'none';
            void mainImage.offsetHeight; // रिफ्लो ट्रिगर करें
            mainImage.style.animation = null;

            const counterElement = document.getElementById("qqq-image-counter-animated");
            if (counterElement) {
                counterElement.innerText = `${currentSlideIndex + 1} / ${galleryData.length}`;
            }
        }, 300);

        const titleEl = document.getElementById("qqq-image-title-animated");
        if(titleEl) titleEl.innerText = item.title || "";
        
        const descriptionEl = document.getElementById("qqq-image-description-animated");
        if(descriptionEl) descriptionEl.innerText = item.description || "";
    }

    function navigate(n) {
        let newIndex = currentSlideIndex + n;
        if (newIndex >= galleryData.length) {
            newIndex = 0;
        }
        if (newIndex < 0) {
            newIndex = galleryData.length - 1;
        }
        displaySlide(newIndex);
    }

    async function shareCurrentImage() {
        const currentItem = galleryData[currentSlideIndex];
        if (!currentItem || !postURLForShare) return;
        const shareData = {
            title: document.title,
            text: `मेरे ब्लॉग से यह तस्वीर देखें: ${currentItem.title}`,
            url: postURLForShare
        };
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("शेयर नहीं किया जा सका:", err);
            }
        } else {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.text)} - ${encodeURIComponent(shareData.url)}`, "_blank");
        }
    }

    function showDownloadMessage() {
        const toast = document.getElementById("qqq-download-toast-animated");
        if (!toast) return;
        toast.className = "qqq-toast-animated show";
        setTimeout(() => {
            toast.className = toast.className.replace("show", "");
        }, 4000);
    }

    // पेज लोड होते ही डेटा पार्स करें और फिर गैलरी शुरू करें
    document.addEventListener('DOMContentLoaded', () => {
        parseDataFromHTML();
        initializeAnimatedGallery();
        
        // नेविगेशन और अन्य बटनों के लिए इवेंट लिस्टनर यहाँ जोड़ें
        // यह सुनिश्चित करेगा कि वे केवल इस विजेट के लिए काम करें
        const prevButton = document.querySelector('.qqq-prev-animated');
        if(prevButton) prevButton.addEventListener('click', () => navigate(-1));

        const nextButton = document.querySelector('.qqq-next-animated');
        if(nextButton) nextButton.addEventListener('click', () => navigate(1));

        const shareButton = document.getElementById('qqq-share-btn-animated');
        if(shareButton) shareButton.addEventListener('click', shareCurrentImage);
        
        const downloadButton = document.getElementById('qqq-download-btn-animated');
        if(downloadButton) downloadButton.addEventListener('click', showDownloadMessage);
    });
})(); // इमेज गैलरी IIFE यहाँ समाप्त होता है


// ==========================================================
// === विजेट 2: वीडियो प्लेयर
// === यह कोड पहले से ही एक सुरक्षित IIFE में था, इसलिए इसमें कोई बदलाव की जरूरत नहीं है।
// ==========================================================
(function() {
    let playerVideos = [];
    let currentVideoIndex = 0;
    let messages = {};
    const videoPlayerModalEl = document.getElementById("player3_videoPlayerModal");
    const videoPlayerMainAreaEl = document.getElementById("player3_videoPlayerMainArea");
    const videoModalTitleEl = document.getElementById("player3_videoModalTitle");
    const videoDropdownMenuEl = document.getElementById("videoDropdownMenu");
    let autoOpenTimer = null;
    let isAutoOpenCancelled = false;
    const COUNTDOWN_SECONDS = 5;

    function getMessage(key) {
        return messages[key] || `[${key}]`;
    }

    function parseData() {
        const dataContainer = document.getElementById('player3_data');
        if (!dataContainer) return;
        const msgContainer = dataContainer.querySelector('#player3_messages');
        if (msgContainer) {
            msgContainer.querySelectorAll('span').forEach(span => {
                messages[span.dataset.msg] = span.textContent;
            });
        }
        dataContainer.querySelectorAll('div[data-platform]').forEach(platformDiv => {
            const platform = platformDiv.dataset.platform;
            const embedUrl = platformDiv.dataset.embedUrl;
            platformDiv.querySelectorAll('i').forEach(videoEl => {
                playerVideos.push({
                    platform: platform,
                    id: videoEl.dataset.id,
                    title: videoEl.dataset.title || 'Untitled Video',
                    embedUrl: embedUrl
                });
            });
        });
    }

    function renderVideoDropdownMenu() {
        if (!videoDropdownMenuEl) return;
        videoDropdownMenuEl.innerHTML = '';
        if (playerVideos.length === 0) return;
        playerVideos.forEach((video, index) => {
            const listItem = document.createElement('div');
            listItem.className = 'video-dropdown-item';
            listItem.textContent = video.title;
            listItem.title = video.title;
            listItem.onclick = () => {
                loadVideoInModal(index, true);
                videoDropdownMenuEl.classList.remove('open');
            };
            videoDropdownMenuEl.appendChild(listItem);
        });
    }

    function loadVideoInModal(index, autoplay = true) {
        currentVideoIndex = index;
        const video = playerVideos[index];
        if (!video || !videoPlayerMainAreaEl) return;
        if (videoModalTitleEl) videoModalTitleEl.textContent = video.title;
        if (videoDropdownMenuEl) {
            Array.from(videoDropdownMenuEl.children).forEach((item, idx) => {
                item.classList.toggle('active-video-item', idx === index);
            });
        }
        const existingVideo = videoPlayerMainAreaEl.querySelector('iframe, video, .player-message');
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
                newElement.className = 'player-message';
                newElement.style.cssText = 'color: #ff8a80; display: flex; align-items: center; justify-content: center; height: 100%;';
                newElement.textContent = getMessage('unsupported_video');
                break;
        }
        if (newElement.tagName === 'IFRAME') {
            newElement.setAttribute('frameborder', '0');
            newElement.setAttribute('allowfullscreen', '');
        }
        videoPlayerMainAreaEl.prepend(newElement);
    }
    
    window.player3_slideVideoInModal = (direction) => {
        if (playerVideos.length === 0) return;
        const newIndex = (currentVideoIndex + direction + playerVideos.length) % playerVideos.length;
        loadVideoInModal(newIndex, true);
    }
    window.player3_toggleVideoDropdown = () => {
        if (videoDropdownMenuEl) {
            videoDropdownMenuEl.classList.toggle('open');
        }
    }
    window.player3_openVideoPlayerModal = (startIndex = 0) => {
        if (!videoPlayerModalEl) return;
        if (playerVideos.length === 0) {
            clearTimeout(autoOpenTimer);
            hideTimerOverlay();
            alert(getMessage('no_videos'));
            return;
        }
        videoPlayerModalEl.style.display = "block";
        document.body.style.overflow = 'hidden';
        renderVideoDropdownMenu();
        loadVideoInModal(startIndex, true);
    }
    window.player3_closeVideoPlayerModal = () => {
        if (videoPlayerModalEl) videoPlayerModalEl.style.display = "none";
        const existingVideo = videoPlayerMainAreaEl.querySelector('iframe, video, .player-message');
        if (existingVideo) existingVideo.remove();
        document.body.style.overflow = 'auto';
        if (videoDropdownMenuEl) videoDropdownMenuEl.classList.remove('open');
    }
    
    document.addEventListener("keydown", function(e) {
        if (videoPlayerModalEl && videoPlayerModalEl.style.display === "block") {
            if (e.key === "Escape") window.player3_closeVideoPlayerModal();
            if (e.key === "ArrowRight") {
                e.preventDefault();
                window.player3_slideVideoInModal(1);
            }
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                window.player3_slideVideoInModal(-1);
            }
        }
    });
    
    document.addEventListener('click', function(event) {
        const menuBtn = document.querySelector('.ati-video-player-menu-btn');
        if (videoDropdownMenuEl && videoDropdownMenuEl.classList.contains('open')) {
            if (!videoDropdownMenuEl.contains(event.target) && (!menuBtn || !menuBtn.contains(event.target))) {
                videoDropdownMenuEl.classList.remove('open');
            }
        }
    });

    const timerOverlayEl = document.getElementById('ati-timer-overlay-id');

    function hideTimerOverlay() {
        if (timerOverlayEl) {
            timerOverlayEl.style.display = 'none';
        }
    }

    function cancelAutoOpen() {
        isAutoOpenCancelled = true;
        clearTimeout(autoOpenTimer);
        hideTimerOverlay();
    }

    function startAutoOpenCountdown() {
        if (isAutoOpenCancelled || playerVideos.length === 0) return;
        if (timerOverlayEl) timerOverlayEl.style.display = 'flex';
        autoOpenTimer = setTimeout(() => {
            if (!isAutoOpenCancelled) {
                hideTimerOverlay();
                window.player3_openVideoPlayerModal();
            }
        }, COUNTDOWN_SECONDS * 1000);
    }

    function initializeAutoOpenFeature() {
        const autoOpenBtn = document.getElementById('ati-auto-open-btn');
        if (!autoOpenBtn) return;
        autoOpenBtn.addEventListener('click', function() {
            if (isAutoOpenCancelled) {
                window.player3_openVideoPlayerModal();
            } else {
                cancelAutoOpen();
                window.player3_openVideoPlayerModal();
            }
        });
        autoOpenBtn.addEventListener('dblclick', function(e) {
            e.preventDefault();
            if (!isAutoOpenCancelled) {
                cancelAutoOpen();
            }
        });
        startAutoOpenCountdown();
    }
    
    parseData();
    document.addEventListener('DOMContentLoaded', initializeAutoOpenFeature);
})(); // वीडियो प्लेयर IIFE यहाँ समाप्त होता है
