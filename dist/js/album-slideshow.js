const imageLoads = new Map();

function preload(source) {
  if (!imageLoads.has(source)) {
    const image = new Image();
    image.src = source;
    imageLoads.set(source, image.decode().then(() => true, () => false));
  }
  return imageLoads.get(source);
}

/** Two persistent image layers keep the layout and keyboard focus stable. */
export function createAlbumSlideshow(container, photos, initialIndex, onChange) {
  photos.forEach(([source]) => preload(source));
  let index = initialIndex;
  let front = container.querySelector("img");
  let back = front.cloneNode();
  let destroyed = false;
  let request = 0;
  let timer;
  front.classList.add("album-slide", "is-active");
  back.classList.add("album-slide");
  back.classList.remove("is-active");
  back.alt = "";
  back.setAttribute("aria-hidden", "true");
  container.append(back);

  async function goTo(next) {
    const currentRequest = ++request;
    const [source, caption] = photos[next];
    const ready = await preload(source);
    if (!ready || destroyed || currentRequest !== request) return;
    back.src = source;
    back.alt = caption;
    back.removeAttribute("aria-hidden");
    front.alt = "";
    front.setAttribute("aria-hidden", "true");
    back.classList.add("is-active");
    front.classList.remove("is-active");
    [front, back] = [back, front];
    index = next;
    onChange(index);
  }

  function start() {
    clearInterval(timer);
    timer = setInterval(() => {
      if (!document.hidden) goTo((index + 1) % photos.length);
    }, 3000);
  }
  start();
  return {
    step(direction) {
      goTo((index + direction + photos.length) % photos.length);
      start();
    },
    destroy() {
      destroyed = true;
      clearInterval(timer);
    },
  };
}
