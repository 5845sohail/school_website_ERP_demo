import { addEnquiry } from "./store.js";
import { startScrollStory } from "./scroll-story.js";
import { createAlbumSlideshow } from "./album-slideshow.js";

const menu = document.querySelector("#school-nav");
const menuButton = document.querySelector(".menu-button");
menuButton.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
menu.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    menu.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }),
);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.classList.contains("open")) {
    menu.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.focus();
  }
});

startScrollStory();

// Tilts are limited to fine pointers, keeping touch scrolling comfortable.
if (matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1000px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg) translateY(-4px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

const dialog = document.querySelector("#info-modal");
const content = document.querySelector("#modal-content");
function show(html) {
  content.innerHTML = html;
  if (!dialog.open) dialog.showModal();
}
document
  .querySelector(".modal-close")
  .addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
document.querySelectorAll("[data-stage]").forEach((button) =>
  button.addEventListener("click", () => {
    document.querySelector('select[name="stage"]').value = button.dataset.stage;
    show(
      `<span class="eyebrow">ADMISSIONS AT YOUR SCHOOL</span><h2>${button.dataset.stage}</h2><p>Ask the school office about class availability, age requirements and the documents needed for admission.</p><p>Contact our school team to confirm the current admission dates, age eligibility and fee structure.</p><a href="#enquire" class="button button-blue" id="stage-enquiry">Ask the school office </a>`,
    );
    document
      .querySelector("#stage-enquiry")
      .addEventListener("click", () => dialog.close());
  }),
);
const photos = [
  ["assets/community.svg", "Together at school · Sample illustration"],
  ["assets/leadership.svg", "Student leadership · Sample illustration"],
  ["assets/discovery.svg", "Curiosity in action · Sample illustration"],
  ["assets/campus.svg", "Our sample school campus"],
  ["assets/campus-aerial.svg", "A wider view of the sample campus"],
];
// Each album card keeps its place in the collage while its photographs crossfade.
document.querySelectorAll("[data-photo]").forEach((button) => {
  createAlbumSlideshow(button, photos, Number(button.dataset.photo), (index) => {
    button.dataset.photo = String(index);
    button.querySelector("span").textContent = photos[index][1];
  });
  button.onclick = () => showPhoto(Number(button.dataset.photo));
});

let modalSlideshow;
function showPhoto(index = 0) {
  modalSlideshow?.destroy();
  show(
    `<span class="eyebrow">SCHOOL LIFE · DEMO GALLERY</span><h2 id="album-caption">${photos[index][1]}</h2><div class="album-slides"><img src="${photos[index][0]}" alt="${photos[index][1]}"></div><div class="gallery-controls"><button id="photo-prev" aria-label="Previous photo">Previous</button><span id="album-count">${index + 1} of ${photos.length} · Illustrative demo gallery</span><button id="photo-next" aria-label="Next photo">Next</button></div>`,
  );
  modalSlideshow = createAlbumSlideshow(
    content.querySelector(".album-slides"), photos, index, (next) => {
      document.querySelector("#album-caption").textContent = photos[next][1];
      document.querySelector("#album-count").textContent =
        `${next + 1} of ${photos.length} · Illustrative demo gallery`;
    },
  );
  document.querySelector("#photo-prev").onclick = () => modalSlideshow.step(-1);
  document.querySelector("#photo-next").onclick = () => modalSlideshow.step(1);
}
dialog.addEventListener("close", () => {
  modalSlideshow?.destroy();
  modalSlideshow = null;
});
document.querySelector("#gallery-open").onclick = () => showPhoto();

document.querySelector("#enquiry-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  addEnquiry({
    name: data.name.trim(),
    grade: data.stage,
    phone: data.phone,
    email: data.email,
    message: data.message,
  });
  document.querySelector(".form-feedback").innerHTML =
    'Your sample enquiry is ready. <a href="portal.html?role=admin#view=admissions">See it in the admin panel </a> Nothing has been sent to the school.';
  event.target.reset();
});
