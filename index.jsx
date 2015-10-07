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
    controllerAs: 'carousel',
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
            .addClass('hide-scrollbar')
            .on('touchmove', this.onTouchMove.bind(this))
            .on('touchend', this.onTouchEnd.bind(this));
        }
      }

      onTouchMove(e) {
        const x = this.$element.scrollLeft(),
              t = Date.now(),
              dt = t - this.t0;

        if (dt < 8)
          return;

        this.v = (x - this.x0) / dt;
        this.x0 = x;
        this.t0 = t;
      }

      onTouchEnd() {
        const x = this.$element.scrollLeft(),
              xf = Math.round((x + this.v * 200) / this.width) * this.width;

        if (Math.abs(this.v) < 1)
          this.v = xf > x ? 1 : -1;

        const dt = Math.min((xf - x) / this.v, 500);

        this.dt = dt;
        this.$element
          .css('overflow', 'hidden')
          .scrollLeft(xf, dt, t => t*(2-t));
        $timeout(() => {
          this.$element.css('overflow', 'scroll');
        }, 10);
      }
    }
  };
});
