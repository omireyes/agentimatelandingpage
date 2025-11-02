import {
  animate,
  createTimeline,
  createTimer,
  stagger,
  splitText,
  utils,
} from '../../dist/modules/index.js';

// Year in footer
document.querySelector('#year').textContent = new Date().getFullYear();

// 1) Hero text split + entrance timeline
const split = splitText('.hero-title', { words: true, chars: true });
createTimeline({
  defaults: { duration: 700, ease: 'outExpo' },
})
.add('.hero-title', { y: [24, 0], opacity: [0, 1] })
.add(split.words, { y: [20, 0], opacity: [0, 1] }, stagger(30))
.add('.sub', { opacity: [0, 1], y: [8, 0] }, 100)
.add('.cta-row .btn', { opacity: [0, 1], y: [12, 0] }, stagger(80))
.init();

// marquee loop using seamless timeline style
const $track = document.querySelector('.marquee-track');
const loopTl = createTimeline({
  defaults: { duration: 8000, ease: 'linear' },
  loop: true,
});
loopTl.add($track, { x: ['0%', '-50%'] }).init();

// 2) Additive fireflies background (inspired by examples/additive-fireflies)
const $bgWrapper = document.querySelector('#bg-animation');
const $bgCircle = document.querySelector('#bg-circle');
const rows = 14;
const viewport = { w: window.innerWidth * .5, h: window.innerHeight * .5 };
const baseRadius = $bgCircle.offsetWidth / 1.6;
const activeRadius = $bgCircle.offsetWidth / .8;
const pointer = { x: 0, y: 0, isDown: false, radius: baseRadius };
const radiusTimer = createTimer({ duration: 160, onComplete: () => (pointer.radius = baseRadius) });

function animateParticle($el) {
  createTimer({
    frameRate: 4,
    onUpdate: () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = pointer.isDown ? activeRadius : baseRadius;
      animate($el, {
        x: { to: Math.cos(angle) * radius + pointer.x, duration: () => utils.random(900, 1700) },
        y: { to: Math.sin(angle) * radius + pointer.y, duration: () => utils.random(900, 1700) },
        scale: .5 + utils.random(.1, 1.1, 2),
        duration: () => utils.random(900, 1400),
        ease: `inOut(${utils.random(1, 5)})`,
        composition: 'blend',
      });
    },
  });
}

document.addEventListener('mousemove', (e) => {
  pointer.x = e.pageX - viewport.w;
  pointer.y = e.pageY - viewport.h;
  pointer.radius = pointer.isDown ? activeRadius : baseRadius * 1.2;
  radiusTimer.restart();
  utils.set($bgCircle, { translateX: pointer.x, translateY: pointer.y });
});
document.addEventListener('mousedown', () => {
  pointer.isDown = true;
  animate($bgCircle, { scale: .6, opacity: 1, filter: 'saturate(1.25)' });
});
document.addEventListener('mouseup', () => {
  pointer.isDown = false;
  animate($bgCircle, { scale: 1, opacity: .3, filter: 'saturate(1)' });
});

const colors = ['#61C3FF', '#00FFB2', '#7B61FF'];
for (let i = 0; i < rows * rows; i++) {
  const $p = document.createElement('div');
  $p.classList.add('particle');
  utils.set($p, { backgroundColor: colors[utils.random(0, colors.length - 1)] });
  $bgWrapper.appendChild($p);
  animateParticle($p);
}

// 3) Features + cards: reveal on scroll with stagger
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const items = entry.target.querySelectorAll('.feature, .card');
      animate(items, { y: [16, 0], opacity: [0, 1] }, stagger(80));
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

observer.observe(document.querySelector('.feature-grid'));
observer.observe(document.querySelector('.cards'));


