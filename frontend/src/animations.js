/* eslint-disable react-hooks/exhaustive-deps -- animation hooks intentionally accept caller-controlled dependency arrays */
import { useEffect } from 'react';
import { animate, stagger, createTimeline } from 'animejs';

/**
 * Anime.js v4 hooks for Wardly.
 * Uses the new v4 API: animate(), createTimeline(), stagger()
 */

// Stagger-fade children into view
export function useStaggerReveal(containerRef, selector = '.ward-card', deps = []) {
  useEffect(() => {
    if (!containerRef.current) return;
    const targets = containerRef.current.querySelectorAll(selector);
    if (!targets.length) return;
    
    animate(targets, {
      opacity: [0, 1],
      translateY: [24, 0],
      scale: [0.96, 1],
      delay: stagger(40, { start: 100 }),
      duration: 600,
      ease: 'outExpo',
    });
  }, deps);
}

// KPI counter animation
export function useCountUp(ref, targetValue, deps = []) {
  useEffect(() => {
    if (!ref.current || !targetValue) return;
    const obj = { val: 0 };
    animate(obj, {
      val: targetValue,
      duration: 1200,
      ease: 'outExpo',
      onUpdate: () => {
        ref.current.textContent = Math.round(obj.val).toLocaleString();
      }
    });
  }, deps);
}

// Pulse glow on silent ward cards
export function usePulseGlow(containerRef, deps = []) {
  useEffect(() => {
    if (!containerRef.current) return;
    const silentCards = containerRef.current.querySelectorAll('.ward-card.silent');
    if (!silentCards.length) return;

    animate(silentCards, {
      borderColor: ['rgba(248,113,113,0.3)', 'rgba(248,113,113,0.8)', 'rgba(248,113,113,0.3)'],
      duration: 2000,
      ease: 'inOutSine',
      loop: true,
    });
  }, deps);
}

// Hero title reveal timeline
export function useHeroTimeline(containerRef) {
  useEffect(() => {
    if (!containerRef.current) return;

    const tl = createTimeline({ defaults: { ease: 'outExpo' } });

    tl.add('.hero-grid-bg', {
      opacity: [0, 0.08],
      duration: 1500,
    })
    .add('.hero-title', {
      opacity: [0, 1],
      translateY: [50, 0],
      duration: 1000,
    }, '-=1200')
    .add('.hero-subtitle', {
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 800,
    }, '-=600')
    .add('.hero .btn', {
      opacity: [0, 1],
      scale: [0.9, 1],
      delay: stagger(100),
      duration: 600,
    }, '-=400');
  }, []);
}

// Bar chart growth animation
export function useBarGrow(containerRef, deps = []) {
  useEffect(() => {
    if (!containerRef.current) return;
    const bars = containerRef.current.querySelectorAll('.bar');
    if (!bars.length) return;

    animate(bars, {
      scaleY: [0, 1],
      delay: stagger(60, { start: 200 }),
      duration: 800,
      ease: 'outElastic(1, 0.6)',
      transformOrigin: 'bottom',
    });
  }, deps);
}

// Page entry animation
export function usePageEnter(pageRef) {
  useEffect(() => {
    if (!pageRef.current) return;
    animate(pageRef.current, {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 500,
      ease: 'outQuart',
    });
  }, []);
}

// Table row stagger
export function useTableReveal(tableRef, deps = []) {
  useEffect(() => {
    if (!tableRef.current) return;
    const rows = tableRef.current.querySelectorAll('tbody tr');
    if (!rows.length) return;

    animate(rows, {
      opacity: [0, 1],
      translateX: [-12, 0],
      delay: stagger(25, { start: 100 }),
      duration: 400,
      ease: 'outQuart',
    });
  }, deps);
}

// Sidebar item hover micro-animation
export function animateSidebarClick(el) {
  animate(el, {
    scale: [1, 0.96, 1],
    duration: 250,
    ease: 'outQuart',
  });
}

// Modal entrance
export function useModalEnter(modalRef) {
  useEffect(() => {
    if (!modalRef.current) return;
    const tl = createTimeline();
    tl.add(modalRef.current, {
      opacity: [0, 1],
      duration: 200,
    })
    .add('.modal-content', {
      opacity: [0, 1],
      scale: [0.92, 1],
      translateY: [20, 0],
      duration: 350,
      ease: 'outExpo',
    }, '-=100');
  }, []);
}
