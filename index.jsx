import _ from 'lodash';
import angular from 'angular';
import css from 'style!css!./index.css';

angular
.module('carousel', [
  require('exports?"duScroll"!angular-scroll')
])
.directive('carousel', function($timeout) {
  return {
    restrict: 'C',
    controller: class {
      constructor($element) {
        this.$element = $element;
        this.width = this.$element.prop('offsetWidth');
        this.x0 = this.$element.scrollLeft();
        this.t0 = null;
        this.v = 0;

        var isScrollSnapSupported = 'scrollSnapType' in document.documentElement.style || 'webkitScrollSnapType' in document.documentElement.style;
        var isTouchSupported = 'ontouchstart' in window;
        
        if (isTouchSupported && !isScrollSnapSupported) {
          this.$element
            .addClass('snap')
            .on('touchstart', this.onTouchStart.bind(this))
            .on('touchend', this.onTouchEnd.bind(this))
            .on('scroll', this.onScroll.bind(this));
        }
      }

      onTouchStart(e) {
        this.t0 = Date.now();
      }

      onTouchEnd(e) {
        const x = this.$element.scrollLeft(),
              xf = x + this.v * 100;
        console.log({ x: x, v: this.v, xf: xf, width: this.width });
        //this.xf = Math.round(x / this.width) * this.width;
        //var dt = Math.min(Math.abs((this.xf - x) / (this.v0 || 200)), 300);

        this.$element
          .off('scroll')
          .css('overflow', 'hidden');
        $timeout(() => {
          this.$element
            .css('overflow', 'scroll')
            .scrollLeft(xf, 100, 'easeOutQuad').finally(() => {
              this.$element.on('scroll', this.onScroll.bind(this));
            });
        }, 0);

        // I've decided I know where you're going. Let me help you along.
        //console.log('xf:', this.xf);
      }

      onScroll(e) {
        const x = this.$element.scrollLeft(),
              t = Date.now(),
              dt = t - this.t0;

        if (dt < 5)
          return;

        this.v = (x - this.x0) / dt;
        //console.log({ x: x, dt: dt, v: this.v });
        this.x0 = x;
        this.t0 = t;
      }

      haltUserScrolling(xf) {
      }
    }
  };
});
