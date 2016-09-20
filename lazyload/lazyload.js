/**
 *
 * @authors zx.wang (zx.wang1991@gmail.com)
 * @date    2016-09-14 17:36:29
 * @version $Id$
 */

;
(function(factory) {

  //amd
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
    //define(['zepto'], factory);

  } else if (typeof module !== 'undefined' && typeof exports === 'object' && define.cmd) {
    //cmd
    module.exports = factory;
  } else {
    factory(window.jQuery || window.Zepto);
  }

})(function($, undefined) {

  var defaultOptions = {
    threshold: 80,
    placeholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8 PB/AAffA0nNPuCLAAAAAElFTkSuQmCC'
  }

  if (!$.fn.hasOwnProperty('lazyload')) {

    $.fn.lazyload = function(options) {

      var $this = $(this),
        _winScrollTop = 0,
        _winHeight = $(window).height();

      if (!$.isPlainObject(options)) {
        options = {};
      }

      options = $.extend(defaultOptions, options);

      //调用lazyload

      lazyload();

      $(window).on('scroll', function() {
        _winScrollTop = $(window).scrollTop();
        lazyload();
      })


      function lazyload() {

        $this.each(function(index, el) {
          var _self = $(this);

          if (_self.is('img')) {
            if (_self.attr('data-original')) {
              var _offsetTop = _self.offset().top;

              if ((_offsetTop - options.threshold) <= (_winHeight + _winScrollTop)) {
                _self.attr('src', _self.attr('data-original'));
                _self.removeAttr('data-original');
              }

            }
          } else {
            //不是图片就设定背景图片
            if (_self.attr('data-original')) {

              //默认占位图片
              if (_self.css('background-image') == "none") {
                _self.css('background-image', 'url(' + options.placeholder + ')');
              }

              var _offsetTop = _self.offset().top;
              if ((_offsetTop - options.threshold) <= (_winHeight + _winScrollTop)) {

                _self.css('background-image', 'url(' + _self.attr('data-original') + ')');
                _self.removeAttr('data-original');
              }
            }
          }
        });
      }
    }
  }
});
