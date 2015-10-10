import angular from 'angular';
import css from 'style!css!./index.css';

angular
.module('carousel', [
  require('exports?"duScroll"!angular-scroll')
])
.directive('carousel', function($timeout) {
  return {
    restrict: 'C',
    controllerAs: 'carousel',
    controller: class {
      constructor($element) {
        const isScrollSnapSupported = 'scrollSnapType' in document.documentElement.style || 'webkitScrollSnapType' in document.documentElement.style,
              isTouchSupported = 'ontouchmove' in window;

        // only activate for touch + no scroll snap
        if (!isTouchSupported || isScrollSnapSupported)
          return;

        this.$element = $element;
        this.width = this.$element.prop('offsetWidth');
        this.x0 = this.x = this.$element.scrollLeft();
        this.t = null;
        this.v = 0;

        this.$element
          .addClass('hide-scrollbar')
          .css('overflow', 'hidden')
          .on('touchmove', this.onTouchMove.bind(this))
          .on('touchstart', this.onTouchStart.bind(this))
          .on('touchend', this.onTouchEnd.bind(this));
      }

      getCoordinates(e) {
        var touches = e.touches && e.touches.length ? e.touches : [e];
        var e = (e.changedTouches && e.changedTouches[0]) ||
            (e.originalEvent && e.originalEvent.changedTouches &&
                e.originalEvent.changedTouches[0]) ||
            touches[0].originalEvent || touches[0];

        return {
          x: e.clientX,
          y: e.clientY
        };
      }

      onTouchStart(e) {
        this.x0 = this.$element.scrollLeft();
        this.touch0 = this.getCoordinates(e);
      } 

      // track instantaneous velocity by watching position over time.
      onTouchMove(e) {
        const touch = this.getCoordinates(e),
              dx = Math.abs(touch.x - this.touch0.x),
              dy = Math.abs(touch.y - this.touch0.y);
        if (dy > dx)
          return;

        e.preventDefault();

        const x = this.touch0.x - touch.x
        this.$element
          .find('div')
          .css('webkitTransform', `translate3d(${-x}px,0,0)`);

        const t = Date.now(),
              dt = t - this.t;

        // too short/noisy of a sample duration; wait for another.
        if (dt < 8)
          return;

        this.v = (x - this.x) / dt;
        this.x = x;
        this.t = t;
      }

      onTouchEnd(e) {
        const x = this.x0 + this.touch0.x - this.getCoordinates(e).x;
        var xf = Math.round((x + this.v * 200) / this.width) * this.width;
        xf = this.constrain(xf, this.x0 - this.width, this.x0 + this.width)

        // minimum speed is 1.
        if (Math.abs(this.v) < 1)
          this.v = xf > x ? 1 : -1;

        this.dt = (xf - x) / this.v;
        let a = (Math.abs(this.v) - 1)/3;
        this.$element
          .find('div')
          .css('webkitTransform', 'translate3d(0,0,0)');
        this.$element
          .prop('scrollLeft', x)
          .scrollLeft(xf, this.dt, t => Math.min((a-1)*(t-1)*(t-1) + 1, 1));

        this.$element.scope().$digest(); // for debugging
      }

      constrain(x, min, max) {
        return Math.min(Math.max(x, min), max);
      }
    }
  };
});
