'use strict';

const carousel = document.querySelector('#menu-carousel');
const cards = [...document.querySelectorAll('.dish-card')];
const dots = [...document.querySelectorAll('.dot')];
let activeIndex = 0;
let pointerStart = 0;
let scrollStart = 0;
let dragging = false;
let frame = 0;

function cardStep() {
  const card = cards[0];
  if (!card) return 0;
  return card.getBoundingClientRect().width + (parseFloat(getComputedStyle(carousel).columnGap) || 0);
}

function updateActive() {
  if (!cards.length) return;
  const center = carousel.scrollLeft + carousel.clientWidth / 2;
  let nearest = 0;
  let distance = Infinity;
  cards.forEach((card, index) => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const nextDistance = Math.abs(center - cardCenter);
    if (nextDistance < distance) { distance = nextDistance; nearest = index; }
  });
  activeIndex = nearest;
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === activeIndex);
    dot.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
  });
}

function moveTo(index) {
  activeIndex = (index + cards.length) % cards.length;
  carousel.scrollTo({ left: cards[activeIndex].offsetLeft - (carousel.clientWidth - cards[activeIndex].offsetWidth) / 2, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}

document.querySelector('.arrow-prev').addEventListener('click', () => moveTo(activeIndex - 1));
document.querySelector('.arrow-next').addEventListener('click', () => moveTo(activeIndex + 1));
dots.forEach((dot, index) => dot.addEventListener('click', () => moveTo(index)));
carousel.addEventListener('scroll', () => {
  if (!frame) frame = requestAnimationFrame(() => { updateActive(); frame = 0; });
}, { passive: true });

carousel.addEventListener('pointerdown', event => {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  dragging = true;
  pointerStart = event.clientX;
  scrollStart = carousel.scrollLeft;
  carousel.classList.add('dragging');
  carousel.setPointerCapture(event.pointerId);
});
carousel.addEventListener('pointermove', event => {
  if (!dragging) return;
  carousel.scrollLeft = scrollStart - (event.clientX - pointerStart);
});
function endDrag() { dragging = false; carousel.classList.remove('dragging'); }
carousel.addEventListener('pointerup', endDrag);
carousel.addEventListener('pointercancel', endDrag);
carousel.addEventListener('lostpointercapture', endDrag);
carousel.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') { event.preventDefault(); moveTo(activeIndex + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); moveTo(activeIndex - 1); }
});
window.addEventListener('resize', updateActive, { passive: true });
document.querySelector('#year').textContent = new Date().getFullYear();
updateActive();
