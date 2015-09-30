import _ from 'lodash';
import angular from 'angular';
import css from 'style!css!./index.css';

angular
.module('carousel', [
  require('exports?"duScroll"!angular-scroll')
])
.directive('carousel', function() {
  return {
    restrict: 'C',
    controller: class {
      constructor($element) {
        this.$element = $element;
        this.width = this.$element[0].offsetWidth;
        this.x0 = this.$element[0].scrollLeft;
        this.v0 = 0;
        this.a0 = 0;
        this.t0 = null;
        this.xf = null;

        var isScrollSnapSupported = 'scrollSnapType' in document.documentElement.style || 'webkitScrollSnapType' in document.documentElement.style;
        var isTouchSupported = 'ontouchstart' in window;
        
        if (isTouchSupported && !isScrollSnapSupported) {
          $element
            .addClass('snap')
            .on('touchstart', this.onTouchStart.bind(this))
            .on('touchend', this.onTouchEnd.bind(this))
            .on('scroll', this.onScroll.bind(this));
        }
      }

      onTouchStart(e) {
        this.xf = null;
      }

      onTouchEnd(e) {
        var x = this.$element.scrollLeft() + this.v0 * 100;
        this.xf = Math.round(x / this.width) * this.width;
        var dt = Math.min(Math.abs((this.xf - x) / (this.v0 || 200)), 300);

        this.$element.css('overflow', 'hidden');
        setTimeout(() => {
          this.$element
            .css('overflow', 'scroll')
            .scrollLeft(this.xf, dt);
        }, 0);
      }

      onScroll(e) {
        var x = this.$element[0].scrollLeft,
            t = Date.now();

        if (this.t0) {
          var v = (x - this.x0) / (t - this.t0),
              a = v - this.v0;

          this.v0 = v;
          this.a0 = a;
        }

        if (this.xf !== null) {
          // I've decided I know where you're going. Let me help you along.
          console.log('xf:', this.xf);
        }

        this.x0 = x;
        this.t0 = t;
      }
    }
  };
});
