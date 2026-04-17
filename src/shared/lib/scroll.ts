const MAIN_CONTENT_ID = "main-content";

function clampScrollTop(el: Element) {
  const max = el.scrollHeight - el.clientHeight;
  if (el.scrollTop > max) {
    el.scrollTop = Math.max(0, max);
  }
}

export function resetScroll() {
  document.getElementById(MAIN_CONTENT_ID)?.scrollTo({ top: 0, behavior: "instant" });
}

export function initResizeScrollClamp() {
  const main = document.getElementById(MAIN_CONTENT_ID);
  if (!main) return () => {};
  const observer = new ResizeObserver(() => {
    clampScrollTop(main);
    main.querySelectorAll(".pf-m-overflow-scroll").forEach(clampScrollTop);
  });
  observer.observe(main);
  return () => observer.disconnect();
}
