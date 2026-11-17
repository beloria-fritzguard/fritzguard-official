(function () {
  'use strict';
  var id = 'G-EPY8RTQP0M';
  var configured = false;
  var loaded = false;
  var layer = window.dataLayer = window.dataLayer || [];
  function queue() { layer.push(arguments); }
  function permitted() {
    return !!(window.Cookiebot && window.Cookiebot.consent && window.Cookiebot.consent.statistics);
  }
  function pageLocation() {
    var url = new URL(window.location.href);
    var clean = new URL(url.origin + url.pathname);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid'].forEach(function (key) {
      var value = url.searchParams.get(key);
      if (value && value.length <= 200 && !/[<>@\r\n]/.test(value)) clean.searchParams.set(key, value);
    });
    return clean.href;
  }
  function referrer() {
    try { var url = new URL(document.referrer); return url.origin + url.pathname; }
    catch (e) { return ''; }
  }
  function syncConsent() {
    var allowed = permitted();
    window['ga-disable-' + id] = !allowed;
    if (!allowed) return;
    if (!configured) {
      configured = true;
      queue('js', new Date());
      queue('config', id, {
        groups: 'fritzguard_owned',
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: pageLocation(),
        page_referrer: referrer()
      });
    }
    if (!loaded) {
      loaded = true;
      var script = document.createElement('script');
      script.async = true;
      script.id = 'fritzguard-google-analytics';
      script.setAttribute('data-cookieconsent', 'statistics');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
      document.head.appendChild(script);
    }
  }
  function track(name, provider) {
    if (!permitted()) return;
    syncConsent();
    // Send only fixed non-personal parameters to the property owned by Beloria.
    queue('event', name, {
      send_to: id,
      restaurant_id: '381641',
      booking_provider: provider,
      page_location: pageLocation(),
      page_referrer: referrer()
    });
  }
  ['CookiebotOnConsentReady', 'CookiebotOnAccept', 'CookiebotOnDecline'].forEach(function (name) {
    window.addEventListener(name, syncConsent);
  });
  window.addEventListener('zc-widget-opened', function () { track('reservation_widget_open', 'zenchef'); });
  window.addEventListener('zc-widget-booking-completed', function () {
    // Only the SDK's completed-booking callback counts as a confirmed reservation.
    // Do not forward event.detail: it may contain customer or booking information.
    track('reservation_confirmed', 'zenchef');
  });
  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    var url;
    try { url = new URL(link.href, window.location.href); } catch (e) { return; }
    if ((url.hostname === 'www.google.com' || url.hostname === 'google.com') && url.pathname.indexOf('/maps/reserve/') === 0) {
      track('reservation_click', 'google_reserve');
    }
  });
  syncConsent();
})();
