/* Load only the hero video used by this viewport; preserve the existing videos. */
(() => {
  const videos = [...document.querySelectorAll('.hero-video[data-video-src]')];
  if (!videos.length) return;
  const mobile = window.matchMedia('(max-width: 768px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;

  function updateVideo() {
    const activeId = mobile.matches ? 'homeHeroMobile' : 'homeHeroDesktop';
    const stillImage = reducedMotion.matches || Boolean(connection && connection.saveData);
    videos.forEach(video => {
      if (video.id !== activeId || stillImage) {
        video.pause();
        if (video.hasAttribute('src')) {
          video.removeAttribute('src');
          video.load();
        }
        return;
      }
      if (!video.hasAttribute('src')) {
        video.src = video.dataset.videoSrc;
        video.load();
      }
      video.muted = true;
      const playing = video.play();
      if (playing && typeof playing.catch === 'function') playing.catch(() => {});
    });
  }
  [mobile, reducedMotion].forEach(query => {
    if (query.addEventListener) query.addEventListener('change', updateVideo);
    else if (query.addListener) query.addListener(updateVideo);
  });
  if (connection && connection.addEventListener) connection.addEventListener('change', updateVideo);
  updateVideo();
})();
