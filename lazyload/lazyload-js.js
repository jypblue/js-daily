/**
 *
 * @authors zx.wang (zx.wang1991@gmail.com)
 * @date    2016-09-19 19:54:10
 * @version $Id$
 */

'use strict';

var defaultOptions = {
  el: 'img',
  threshold: 80,
  placeholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8 PB/AAffA0nNPuCLAAAAAElFTkSuQmCC'
}

function LazyLoad(options) {

  var _self = this,
    doc = document,
    _winScrollTop = 0,
    _winHeight = doc.body.clientHeight;
  if (!(typeof options == 'object' && !(options instanceof Array))) {
    options = {};
  }

  options = this.extend(true, defaultOptions, options);

  console.log(options);
  this.winScrollTop = _winScrollTop;
  this.winHeight = _winHeight;
  this.options = options;
  //初始话
  this.loadImg();

  window.onscroll = function() {
    this.winScrollTop = doc.documentElement.scrollTop || doc.body.scrollTop;
    _self.loadImg();
  }

}

//初始化逻辑
LazyLoad.prototype.loadImg = function() {

  var dom = this.options.el;
  var options = this.options;
  var _winHeight = this.winHeight;
  var _winScrollTop = this.winScrollTop;

  var $el = document.querySelectorAll(dom);
  $el.forEach(function(el, i) {

    if (el.localName === 'img') {
      if (el.getAttribute('data-original')) {
        var _offsetTop = el.offsetTop;
        if ((_offsetTop - options.threshold) <= (_winHeight + _winScrollTop)) {
          el.setAttribute('src', el.getAttribute('data-original'));
          el.removeAttribute('data-original');
        }

      }
    } else {
      //不是图片就设定背景图片
      if (el.getAttribute('data-original')) {
        //默认占位图片
        if (el.style.backgroundImage === '') {
          el.style.backgroundImage = options.placeholder;
        }

        var _offsetTop = el.offsetTop;
        if ((_offsetTop - options.threshold) <= (_winHeight + _winScrollTop)) {
          el.style.backgroundImage = 'url(' + el.getAttribute('data-original') + ')';
          el.removeAttribute('data-original');
        }
      }
    }


  })


}

//深、浅拷贝
LazyLoad.prototype.extend = function(deep,
  target, options) {
  var _self = this;
  for (var name in options) {
    var copy = options[name];
    if (deep && copy instanceof Array) {
      target[name] = _self.extend(deep, [], copy);
    } else if (deep && copy instanceof Object) {
      target[name] = _self.extend(deep, {}, copy);
    } else {
      target[name] = options[name];
    }
  }
  return target;
}
