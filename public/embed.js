/**
 * Fitnezstudios Embed Script
 * 
 * Usage:
 * 1. Add a container div with id="fitnezstudios-widget"
 * 2. Include this script on your page
 * 3. The widget will automatically load in the container
 * 
 * Example:
 * <div id="fitnezstudios-widget"></div>
 * <script src="YOUR_DOMAIN/embed.js"></script>
 * 
 * Or manually initialize with options:
 * <script>
 *   window.FitnezstudiosWidget.init({
 *     container: '#my-container',
 *     width: '100%',
 *     height: '700px'
 *   });
 * </script>
 */

(function() {
  'use strict';

  // Configuration
  const WIDGET_URL = window.BOOKIFY_WIDGET_URL || (function() {
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      const src = scripts[i].src;
      if (src && src.includes('embed.js')) {
        const url = new URL(src);
        return url.origin + '/widget';
      }
    }
    return window.location.origin + '/widget';
  })();

  const DEFAULT_OPTIONS = {
    container: '#fitnezstudios-widget',
    width: '100%',
    height: '700px',
    minHeight: '600px',
    borderRadius: '12px',
    shadow: true
  };

  function createWidget(options) {
    const config = { ...DEFAULT_OPTIONS, ...options };
    
    // Find container
    const container = typeof config.container === 'string' 
      ? document.querySelector(config.container)
      : config.container;

    if (!container) {
      console.error('Fitnezstudios Widget: Container not found:', config.container);
      return null;
    }

    // Create iframe — parent origin is detected inside the widget via
    // postMessage / ancestorOrigins / document.referrer (never URL params)
    const iframe = document.createElement('iframe');
    iframe.src = WIDGET_URL;
    iframe.style.width = config.width;
    iframe.style.height = config.height;
    iframe.style.minHeight = config.minHeight;
    iframe.style.border = 'none';
    iframe.style.borderRadius = config.borderRadius;
    iframe.style.display = 'block';
    
    if (config.shadow) {
      iframe.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
    }

    // Allow necessary features
    iframe.setAttribute('allow', 'clipboard-write');
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('title', 'Fitnezstudios - Gym Class Booking');

    // Notify widget of parent origin — event.origin is browser-verified
    iframe.addEventListener('load', function() {
      try {
        const widgetOrigin = new URL(WIDGET_URL).origin;
        iframe.contentWindow.postMessage({ type: 'BOOKIFY_EMBED_INIT' }, widgetOrigin);
      } catch (e) {
        console.warn('Fitnezstudios Widget: could not post embed init message', e);
      }
    });

    // Clear container and append iframe
    container.innerHTML = '';
    container.appendChild(iframe);

    // Handle responsive resizing
    function handleResize() {
      if (window.innerWidth < 640) {
        iframe.style.height = '800px';
      } else {
        iframe.style.height = config.height;
      }
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return {
      iframe,
      destroy: function() {
        window.removeEventListener('resize', handleResize);
        container.innerHTML = '';
      }
    };
  }

  // Auto-initialize if container exists
  function autoInit() {
    const container =
      document.querySelector('#fitnezstudios-widget') ||
      document.querySelector('#bookify-widget');
    if (container) {
      createWidget({ container });
    }
  }

  // Expose API (BookifyWidget kept as alias for backward compatibility)
  window.FitnezstudiosWidget = {
    init: createWidget,
    WIDGET_URL: WIDGET_URL
  };
  window.BookifyWidget = window.FitnezstudiosWidget;

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
})();
