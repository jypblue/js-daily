/*
 * @Author: jypblue
 * @Date:   2016-09-22 17:49:55
 * @Last Modified by:   jypblue
 * @Last Modified time: 2016-09-22 18:00:46
 */

'use strict';
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return factory(root);
    })
  } else if (typeof exports === 'object') {
    module.exports = factory;
  } else {
    root.dialog = factory(root);
  }

})(this, function(win) {

  'use strict';
  var tips = {
    title: '提示信息',
    enter: '确定',
    cancel: '取消',
    close: ''
  }
  var d = {};

  d.init = function(options) {

    //弹框位置pos:[top,parent,self]
    d.globalSet = extend({
      pos: 'self'
    }, options || {});
    //所有的弹窗
    d.dialogs = [];
  }

  //弹窗alert 确定
  d.alert = function(options) {
    var parentWindow = win[this.globalSet.pos];
    var doc = parentWindow.document;
    console.log(parentWindow);
    var set = extend({
      width: 300, //宽
      height: 70, //高
      type: 'alert', //类型
      zIndex: 1000 //层级z-index
    }, options || {});

    //如果弹窗已经存在，则先关闭，再新建
    if (d.dialogs.length) {
      d.close();
    }

    //创建弹窗
    var doms = createElements.call(this, set);

    //收集弹窗
    d.dialogs.push(doms);

    //设置提示内容
    doms.dialogBody.innerHTML = set.content;

    //设置居中
    setCenter(doms, doc);

    //点击确定按钮执行的函数
    doms.btnEnter.onclick = function() {
      d.close();
      set.callback && set.callback.call(_this, true, doms)
    };

    //拖动
    doms.dialogHeader.onmousedown = function(e) {
      var mousePos = getMousePos.call(parentWindow, e),
        pos = getElementPos.call(parentWindow, doms.dialogWindow),
        _move = move.call(parentWindow, mousePos, doms.dialogWindow, pos.y, pos.x);

      //监听事件
      addEvent(doc, 'mousemove', _move);

      //鼠标离开，停止监听移动
      addEvent(doc, 'mouseup', function() {
        removeEvent(doc, 'mousemove', _move)
      });
    }

    //点击关闭按钮，关闭弹框
    doms.close.onclick = function() {
      d.close();
    }

    //重置弹框位置 居中
    addEvent(parentWindow, 'resize', function() {
      setCenter(doms, doc);
    })

    //返回doms对象，让下面的方法可以对其继续操作
    return doms;
  }

  //弹窗comfirm 选择
  d.comfirm = function(options) {

  }


  //关闭弹窗
  d.close = function() {
    var db = win[this.globalSet.pos].document.body,
      len = this.dialogs.length;
    //如果没有弹窗
    if (len === 0) {
      return this;
    }
    remove(this.dialogs[0], db);
    this.dialogs.length = 0;
  }


  //默认初始化
  d.init();
  return win.dialog = d;


  /*************************************************************************/
  /**
   * dialog插件内部自己使用到的js方法
   */

  //浅复制
  function extend(target, source) {
    for (var key in source) {
      target[key] = source[key];
    }
    return target;
  }

  //创建默认弹窗DOM结构
  function createElements(options) {
    //doc父节点文档,db->body,h高度
    var doc = win[this.globalSet.pos].document,
      db = doc.body,
      h = Math.max(doc.documentElement.clientHeight, db.offsetHeight);

    console.log(win);
    var width = options.width,
      height = options.height == 'auto' ? 'auto' : options.height + 'px';

    var dialogMask = createEl.call(doc,
        '<div class="ui_dialog_mask" style="height:' + h + 'px;z-index:' + (options.zIndex) + '"></div>', db),
      dialogWindow = createEl.call(doc, '<div class="ui_dialog_window ui_dialog_type_' + options.type + '" style="width:' + width + 'px;z-index:' + options.zIndex + '"></div>', db),
      dialogHeader = createEl.call(doc, '<div class="ui_dialog_hd"><h3>' + (options.title || tips.title) + '</h3></div>', dialogWindow),
      close = createEl.call(doc, '<a href="javascript:void(0);" class="ui_dialog_close">' + tips.close + '</a>', dialogHeader),
      dialogBody = createEl.call(doc, '<div class="ui_dialog_bd" style="height:' + height + ';"></div>', dialogWindow),
      dialogFooter = createEl.call(doc, '<div class="ui_dialog_ft"></div>', dialogWindow),
      btnEnter = createEl.call(doc, '<a href="javascript:;" class="btn btn_enter">' + (options.enter || tips.enter) + '</a>', dialogFooter),
      btnCancel = createEl.call(doc, '<a href="javascript:;" class="btn btn_cancel">' + (options.cancel || tips.cancel) + '</a>');

    return {
      dialogMask: dialogMask,
      dialogWindow: dialogWindow,
      dialogHeader: dialogHeader,
      close: close,
      dialogBody: dialogBody,
      dialogFooter: dialogFooter,
      btnEnter: btnEnter,
      btnCancel: btnCancel
    };
  }

  //创建指定DOM，给父节点就在父节点创建，不给就默认创建div
  function createEl(str, parent) {
    //在哪里创建节点，document就指向该页面
    var div = this.createElement('div'),
      el;
    div.innerHTML = str;
    el = div.firstChild;
    return parent ? parent.appendChild(el) : el;
  }

  //将弹框位置设定居中
  function setCenter(doms, doc) {
    if (!doms) {
      // statement
      return;
    }

    //T弹窗主窗口
    var T = doms.dialogWindow,
      w = T.offsetWidth,
      h = T.offsetHeight,
      timer = null;

    var dd = doc.documentElement,
      W = dd.clientWidth,
      H = dd.clientHeight,
      dbh = doc.body.offsetHeight;

    T.style.top = (H - h) / 2 + 'px';
    T.style.left = (W - w) / 2 + 'px';

    doms.dialogMask.style.height = Math.max(H, dbh) + 'px';
  }

  //去除doms结构
  function remove(doms, body) {
    if (!doms) {
      return;
    }
    body.removeChild(doms.dialogMask);
    body.removeChild(doms.dialogWindow);

    //?
    doms.btnEnter.onclick = doms.btnCancel.onclick = doms.close.onclick = doms.dialogHeader.onmousedown = null;
  }

  //获取鼠标坐标位置
  function getMousePos(e) {
    var doc = win.document;
    e = e || win.event;

    if (e.pageX || e.pageY) {
      return {
        left: e.pageX,
        top: e.pageY
      };
    }

    //返回位置参数
    return {
      left: e.clientX + doc.documentElement.scrollLeft - doc.body.clientLeft,
      top: e.clientY + doc.documentElement.scrollTop - doc.body.clientTop
    };
  }

  //监听事件封装
  function addEvent(el, type, fn) {
    if (el.addEventListener != undefined) {
      el.addEventListener(type, fn, false);
    } else if (el.attachEvent != undefined) {
      el.attachEvent('on' + type, fn);
    } else {
      el['on' + type] = fn;
    }
  }

  //移除事件监听
  function removeEvent(el, type, fn) {
    if (el.removeEventListener != undefined) {
      el.removeEventListener(type, fn, false);
    } else if (el.detachEvent != undefined) {
      el.detachEvent('on' + type, fn);
    } else {
      el['on' + type] = fn;
    }
  }

  //根据鼠标拖动位置移动弹框位置
  function move(oldPos, target, t, l) {
    var doc = win.document,
      dd = doc.documentElement,
      st = Math.max(dd.scrollTop, doc.body.scrollTop),
      sl = Math.max(dd.scrollLeft, doc.body.scrollLeft)

    var w = target.offsetWidth,
      h = target.offsetHeight,
      cw = dd.clientWidth,
      ch = dd.clientHeight;

    var rw = cw - w,
      rh = ch - h;

    return function(e) {
      var newPos = getMousePos(e);

      //clear selection
      if (doc.selection && doc.selection.empty) {
        doc.selection.empty(); //IE
      } else if (win.getSelection) {
        win.getSelection().removeAllRanges();
      }

      target.style.top = Math.max(0, Math.min(rh, (t + (newPos.top - oldPos.top) - st))) + 'px';
      target.style.left = Math.max(0, Math.min(rw, (l + (newPos.left - oldPos.left) - sl))) + 'px';
    }
  }

  //获取元素的位置
  function getElementPos(el) {
    var x = 0,
      y = 0,
      doc = win.document,
      d_root = doc.documentElement,
      db = doc.body;

    //获取元素距离上左下右的距离
    if (el.getBoundingClientRect) {
      var pos = el.getBoundingClientRect();
      x = pos.left + Math.max(d_root.scrollLeft, db.scrollLeft) - d_root.clientLeft;
      y = pos.top + Math.max(d_root.scrollTop, db.scrollTop) - d_root.clientTop;
    } else {
      while (el != db) {
        x += el.offsetLeft;
        y += el.offsetTop;
        el = el.offsetParent;
      }
    }
    return {
      x: x,
      y: y
    }
  }


  //判断是否有class
  function hasClass(el, oClass) {
    var elClass = el.className;

    //按位取反
    return ~(' ' + elClass + ' ').indexOf(' ' + oClass + ' ');
  }

  //添加class
  function addClass(el, oClass) {
    if (hasClass(el, oClass)) return;
    var elClass = el.className;
    el.className = (elClass + ' ' + oClass).replace(/^\s+|\s+$/, '').replace(/\s+/g, ' ');
  }

  //移除class
  function removeClass(el, oClass) {
    if (!hasClass(el, oClass)) {
      return;
    }
    var elClass = el.className;
    el.className = (' ' + elClass + ' ').replace(' ' + oClass + ' ', '');
  }

  function ajax(options) {
    var xhr = null;
    var set = extend({
      type: 'GET',
      url: ''
    }, options || {});

    if (typeof window.XMLHttpRequest != 'undefined') {
      xhr = new window.XMLHttpRequest();
    } else {
      xhr = new ActiveObject('MSXML2.XmlHttp.6.0');
    }

    xhr.open(set.type, set.url);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status >= 200 && xhr.status <= 304) {
          //回调函数
          set.success && set.success(xhr, responseText);
        } else {
          set.failure && set.failure(xhr.status);
        }
      }
    };

    xhr.send(null);
  }



});
