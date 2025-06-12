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
function initializeAnimatedGallery() {if (galleryData.length > 0) {displaySlide(0);}}

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
        if(counterElement) {counterElement.innerText = `${currentSlideIndex + 1} / ${galleryData.length}`;}
    }, 300);
    document.getElementById("qqq-image-title-animated").innerText = item.title || "";
    document.getElementById("qqq-image-description-animated").innerText = item.description || "";
}

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
});
