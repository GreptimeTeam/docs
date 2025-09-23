(function() {
  if (typeof window === 'undefined') return;

  function rewriteLocaleSwitchHref() {
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
      var current = new URL(window.location.href);
      var target = new URL(link.href);
      var newUrl = current.protocol + '//' + target.host + current.pathname + current.search + current.hash;
      
      // Update the href immediately before navigation
      link.href = newUrl;
      console.log('Rewritten locale switch URL:', newUrl);
    } catch (e) {
      console.error('Error rewriting locale switch URL:', e);
    }
  }

  // Set up click listener on document to catch all clicks
  document.addEventListener('click', handleLocaleSwitchClick, true);
  
})();