(function() {
  if (typeof window === 'undefined') return;

  function updateLocaleSwitchHref() {
    var link = document.querySelector('.locale-switch-link');
    if (!link) return;
    try {
      var current = new URL(window.location.href);
      var target = new URL(link.href);
      link.href = current.protocol + '//' + target.host + current.pathname + current.search + current.hash;
    } catch (e) {
      // ignore
    }
  }


  // Intercept clicks on the locale switch link to rewrite URL immediately
  function handleLocaleSwitchClick(event) {
    var link = event.target.closest('.locale-switch-link');
    if (!link) return;
    
    try {
      updateLocaleSwitchHref();
    } catch (e) {}
  }

  // Set up click listener on document to catch all clicks
  document.addEventListener('click', handleLocaleSwitchClick, true);
  
  // Initial update on load
  setTimeout(updateLocaleSwitchHref, 1000);

  if ('navigation' in window && window.navigation) {
    // Update when URL changes due to SPA navigation
    window.navigation.addEventListener('navigate', function () {
      // run after route has settled
      setTimeout(updateLocaleSwitchHref, 0);
    });
  }
  
  
})();