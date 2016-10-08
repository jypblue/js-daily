/*
 * @Author: jypblue
 * @Date:   2016-10-06 11:51:21
 * @Last Modified by:   jypblue
 * @Last Modified time: 2016-10-08 18:05:05
 */

;
! function(win) {
  'use strict';

  var doc = document,
    query = 'querySelectorAll',
    claname = 'getElementsByClassName',
    S = function(s) {
      //document.querySelectorAll(s);
      return doc[query](s);
    };

  //默认配置
  var config = {
    type: 0,
    shade: true,
    shadeClose: true,
    fixed: true,
    anim: 'scale' //默认动画类型
  };

  var ready = {
    extend: function(obj) {
      //浅复制
      var newobj = JSON.parse(JSON.stringify(config));
      for (var i in obj) {
        newobj[i] = obj[i];
      }
      return newobj;
    },
    timer: {},
    end: {}
  };

  //点击事件
  ready.touch = function(elem, fn) {
    elem.addEventListener('click', function(e) {
      //执行回调函数，并传入参数e
      fn.call(this, e);
    }, false);
  };

  var index = 0,
    classs = ['layui-m-layer'],
    Layer = function(options) {
      var that = this;
      that.config = ready.extend(options);
      that.view();
    };

  //构建弹窗view
  Layer.prototype.view = function() {
    // body...
    var that = this,
      config = that.config,
      layerbox = doc.createElement('div');

    that.id = layerbox.id = classs[0] + index;

    layerbox.setAttribute('class', classs[0] + ' ' + classs[0] + (config.type || 0));
    layerbox.setAttribute('index', index);

    //标题区域
    var title = (function() {
      var titype = typeof config.title === 'object';
      return config.title ? '<h3 style="' + (titype ? config.title[1] : '') + '">' + (titype ? config.title[0] : config.title) + '</h3>' : '';
    }());

    //按钮区域
    var button = (function() {

      //如果传入的是字符串，则改为数组
      typeof config.btn === 'string' && (config.btn = [config.btn]);
      var btns = (config.btn || []).length,
        btndom;
      if (btns === 0 || !config.btn) {
        return '';
      }

      btndom = '<span yes type="1">' + config.btn[0] + '</span>';

      if (btns === 2) {
        //?
        btndom = '<span no type="0">' + config.btn[1] + '</span>' + btndom;
      }

      return '<div class="layui-m-layerbtn">' + btndom + '</div>';

    }());

    //如果不需要position:fixed
    if (!config.fixed) {
      config.top = config.hasOwnProperty('top') ? config.top : 100;
      config.style = config.style || '';
      config.style += ' top:' + (doc.body.scrollTop + config.top) + 'px';
    }

    //加载提示动画
    if (config.type === 2) {
      config.content = '<i></i><i class="layui-m-layerload"></i><i></i><p>' + (config.content || '') + '</p>';
    };

    if (config.skin) {
      config.anim = 'up';
    };

    //如果是提示逛，就关闭背景蒙版
    if (config.skin === 'msg') {
      config.shade = false;
    }

    //拼装弹窗dom模板
    layerbox.innerHTML = (config.shade ? '<div' + (typeof config.shade === 'string' ? 'style="' + config.shade + '"' : '') + ' class="layui-m-layershade"></div>' : '') + '<div class="layui-m-layermain" ' + (!config.fixed ? 'style="position:static;"' : '') + '>' + '<div class="layui-m-layersection">' + '<div class="layui-m-layerchild ' + (config.skin ? 'layui-m-layer-' + config.skin + ' ' : '') + (config.className ? config.className : '') + ' ' + (config.anim ? 'layui-m-anim-' + config.anim : '') + '" ' + (config.style ? 'style="' + config.style + '"' : '') + '>' + title + '<div class="layui-m-layercont">' + config.content + '</div>' + button + '</div>' + '</div>' + '</div>';

    //关闭弹窗
    if (!config.type || config.type === 2) {
      var dialogs = doc[claname](classs[0] + config.type),
        dialen = dialogs.length;

      if (dialen >= 1) {
        layer.close(dialogs[0].getAttribute('index'));
      }
    }

    document.body.appendChild(layerbox);
    //获取弹窗的dom
    var elem = that.elem = S('#' + that.id)[0];

    //回调函数传入弹窗dom对象
    config.success && config.success(elem);

    that.index = index++;
    //绑定事件
    that.action(config, elem);
  };

  /**
   * 绑定弹窗事件
   * @param  {[type]} config [配置]
   * @param  {[type]} elem   [获取的弹窗对象]
   * @return {[type]}        [description]
   */
  Layer.prototype.action = function(config, elem) {
    var that = this;

    //自动关闭
    if (config.time) {
      ready.timer[that.index] = setTimeout(function() {
        // body...
        layer.close(that.index);
      }, config.time * 1000);
    };


    //确定取消
    var btn = function() {
      var type = this.getAttribute('type');
      if (type == 0) {
        //回调函数
        config.no && config.no();
        layer.close(that.index);
      } else {
        //回调函数
        config.yes ? config.yes(that.index) : layer.close(that.index);
      }
    };

    if (config.btn) {
      //获取btn下的按钮span
      var btns = elem[claname]('layui-m-layerbtn')[0].children,
        btnlen = btns.length;

      for (var ii = 0; ii < btnlen; ii++) {
        //对应执行回调函数
        ready.touch(btns[ii], btn);
      }
    };

    //点击遮罩关闭
    if (config.shade && config.shadeClose) {
      var shade = elem[claname]('layui-m-layershade')[0];

      ready.touch(shade, function() {
        //执行关闭回调，并执行end函数
        layer.close(that.index, config.end);
      })
    };

    config.end && (ready.end[that.index] = config.end);

  };

  win.layer = {
    v: '2.0',
    index: index,

    //核心方法,初始化Layer构造函数
    open: function(options) {
      var o = new Layer(options || {});
      return o.index;
    },

    close: function(index) {
      //通过相同规则根据index获取到该弹窗对象
      var ibox = S('#' + classs[0] + index)[0];
      if (!ibox) {
        return;
      }

      ibox.innerHTML = '';
      doc.body.removeChild(ibox);

      clearTimeout(ready.timer[index]);
      delete ready.timer[index];

      typeof ready.end[index] === 'function' && ready.end[index]();

      delete ready.end[index];
    },

    //关闭所有弹窗层
    closeAll: function() {
      var boxs = doc[claname](classs[0]);
      //循环执行关闭函数关闭所有
      for (var i = 0, len = boxs.length; i < len; i++) {
        layer.close((boxs[0].getAttribute('index') | 0));
      }
    }
  };


  //引用方式，支持amd
  'function' == typeof define ? define(function() {
    return layer;
  }) : function() {
    var js = document.scripts,
      script = js[js.length - 1],
      jsPath = script.src;
    var path = jsPath.substring(0, jsPath.lastIndexOf('/') + 1);

    if (script.getAttribute('merge')) {
      return;
    };

    //创建默认css引入代码
    document.head.appendChild(function() {
      var link = doc.createElement('link');
      link.href = path + 'css/layerh5.css';
      link.type = 'text/css';
      link.rel = 'styleSheet';
      link.id = 'layerh5css';
      return link;
    }());
  }();

}(window);
