/* ================================================================== */
/* SCRIPT FOR WIDGET 1: IMAGE GALLERY (PREFIX: qqq-) - FINAL WITH POPUP DOWNLOAD */
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

        // *** डाउनलोड बटन का नया और अपडेटेड लॉजिक ***
        downloadButton.addEventListener('click', () => {
            if (!currentHighQualitySrc) return;

            // स्टेप 1: इमेज को नई टैब में खोलें
            window.open(currentHighQualitySrc, '_blank');

            // स्टेप 2: मूल पेज पर पॉप-अप संदेश दिखाएं
            if (toast) {
                // नया संदेश और आइकन सेट करें
                toast.innerHTML = "<i class='fa-solid fa-circle-info'></i> नई टैब में खुली इमेज को दबाकर रखें और 'Download Image' चुनें।";
                
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
