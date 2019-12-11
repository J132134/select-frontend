// easing functions
// https://gist.github.com/gre/1650294
const easings = {
  linear(t: number) {
    return t;
  },
  easeInQuad(t: number) {
    return t * t;
  },
  easeOutQuad(t: number) {
    return t * (2 - t);
  },
  easeInOutQuad(t: number) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
  easeInCubic(t: number) {
    return t * t * t;
  },
  easeOutCubic(t: number) {
    return --t * t * t + 1;
  },
  easeInOutCubic(t: number) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  },
  easeInQuart(t: number) {
    return t * t * t * t;
  },
  easeOutQuart(t: number) {
    return 1 - --t * t * t * t;
  },
  easeInOutQuart(t: number) {
    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
  },
  easeInQuint(t: number) {
    return t * t * t * t * t;
  },
  easeOutQuint(t: number) {
    return 1 + --t * t * t * t * t;
  },
  easeInOutQuint(t: number) {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
  },
};

const horizontalAnimateScroll = (
  element: React.RefObject<HTMLElement>,
  moveTo: number,
  duration: number,
  refRafId: React.MutableRefObject<null | number>,
  easing = 'easeInOutQuad',
) => {
  if (!element.current) {
    return;
  }
  const startScrollPosition = element.current.scrollLeft;
  const startTime =
    'now' in window.performance ? performance.now() : new Date().getTime();

  const scrollToPosition =
    element.current.scrollLeft + moveTo <= 0
      ? 0
      : Math.round(element.current.scrollLeft + moveTo);

  if ('requestAnimationFrame' in window) {
    const scroll = () => {
      if (!element.current) {
        return;
      }
      const now = 'now' in window.performance ? performance.now() : new Date().getTime();
      const time = Math.min(1, (now - startTime) / duration);
      // @ts-ignore
      const timeFunction = easings[easing](time);
      element.current.scroll(
        Math.ceil(
          timeFunction * (scrollToPosition - startScrollPosition) + startScrollPosition,
        ),
        0,
      );

      const isRightScrollMax =
        moveTo > 0 &&
        element.current.scrollWidth ===
          element.current.scrollLeft + element.current.clientWidth;
      const finished =
        element.current.scrollLeft === scrollToPosition || isRightScrollMax;

      if (finished) {
        return;
      }
      refRafId.current = requestAnimationFrame(scroll);
    };
    scroll();
  }
  element.current.scroll(scrollToPosition, 0);
};

export default horizontalAnimateScroll;
