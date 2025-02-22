$(window).on('load', function () {
    // Initialize features
    initializePwaFeatures();
    initializeGoogleAnalytics();
    initializeProjectFilter();
});

// Initialize PWA Features
function initializePwaFeatures() {
    addManifestLink();
    registerServiceWorker();
    setupPwaInstallation();
}

// Dynamically add the manifest link
function addManifestLink() {
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/manifest.json'; // Ensure manifest.json exists in the root
    document.head.appendChild(manifestLink);
    console.log('Manifest added:', manifestLink.href);
}

// Register the service worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
                trackEvent('PWA_service_worker', 'Service Worker', 'Registered', 1);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
                trackEvent('PWA_service_worker', 'Service Worker', 'Failed', 0);
            });
    } else {
        console.warn('Service Worker not supported in this browser.');
        trackEvent('PWA_service_worker', 'Service Worker', 'Not Supported', 0);
    }
}

// Set up Google Analytics
function initializeGoogleAnalytics() {
    const googleAnalyticsScript = document.createElement('script');
    googleAnalyticsScript.async = true;
    googleAnalyticsScript.src = "https://www.googletagmanager.com/gtag/js?id=G-6BPGNZNTLZ";
    document.head.appendChild(googleAnalyticsScript);

    googleAnalyticsScript.onload = function () {
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-6BPGNZNTLZ');
        console.log('Google Analytics initialized.');
    };
}

// Set up PWA installation prompt
function setupPwaInstallation() {
    let deferredPrompt;
    const isPwaInstalled = localStorage.getItem('pwaInstalled');

    if (!isPwaInstalled && !isMobileDevice()) {
        const popupHTML = `
            <div id="pwa-popup" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.8); color: #333; text-align: center; z-index: 1000; display: flex; align-items: center; justify-content: center;">
                <div style="padding: 25px; background: #f5f5f5; border-radius: 20px; width: 90%; max-width: 450px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); text-align: center;">
                    <h2 style="font-size: 22px; margin-bottom: 15px; color: #2c3e50;">Install Our App for a Faster, Seamless Experience!</h2>
                    <button id="install-button" style="padding: 12px 28px; font-size: 18px; cursor: pointer; background: #7f2525; color: white; border: none; border-radius: 30px;">Add to Home Screen</button>
                    <button id="close-popup" style="padding: 12px 28px; font-size: 18px; cursor: pointer; background-color: transparent; color: #888; border: none; border-radius: 30px;">Not Now</button>
                </div>
            </div>
        `;
        $('body').append(popupHTML);

        const popup = $('#pwa-popup');
        const installButton = $('#install-button');
        const closePopupButton = $('#close-popup');

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            popup.show();
            console.log('beforeinstallprompt event triggered');
            trackEvent('PWA_prompt', 'PWA', 'Prompt Displayed', 1);
        });

        installButton.on('click', () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('PWA installation accepted');
                        trackEvent('PWA_installation', 'PWA', 'Accepted', 1);
                        localStorage.setItem('pwaInstalled', 'true');
                    } else {
                        console.log('PWA installation dismissed');
                        trackEvent('PWA_installation', 'PWA', 'Dismissed', 0);
                    }
                    deferredPrompt = null;
                    popup.hide();
                }).catch(error => {
                    console.error('Error during PWA installation:', error);
                });
            }
        });

        closePopupButton.on('click', () => {
            popup.hide();
            console.log('PWA popup closed.');
            trackEvent('PWA_prompt', 'PWA', 'Closed', 0);
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA installed successfully.');
            trackEvent('PWA_installation', 'PWA', 'Successful', 1);
            localStorage.setItem('pwaInstalled', 'true');
            popup.hide();
        });
    } else {
        console.log('PWA is already installed or device is mobile.');
    }
}

// Detect mobile devices
function isMobileDevice() {
    return window.matchMedia("(max-width: 767px)").matches || /Mobi|Android/i.test(navigator.userAgent);
}

// Track events in Google Analytics
function trackEvent(action, category, label, value) {
    if (typeof gtag === 'function') {
        gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
        });
        console.log(`Event tracked: ${action}, ${category}, ${label}, ${value}`);
    } else {
        console.warn('gtag not initialized. Event not tracked:', action);
    }
}

// Initialize project filter
function initializeProjectFilter() {
    const $container = $('.projectContainer');
    $('.projectFilter a').on('click', function () {
        $('.projectFilter .current').removeClass('current');
        $(this).addClass('current');
        const selector = $(this).attr('data-filter');
        requestAnimationFrame(() => {
            if ($container.length) {
                $container.isotope({
                    filter: selector,
                    animationOptions: {
                        duration: 750,
                        easing: 'linear',
                        queue: false
                    }
                });
            }
        });
        console.log('Project filter applied:', selector);
        return false;
    });
}
