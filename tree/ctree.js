/*
 * @Author: jypblue
 * @Date:   2016-10-02 14:51:43
 * @Last Modified by:   jypblue
 * @Last Modified time: 2016-10-04 14:17:16
 */

'use strict';

(function(factory) {

  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof module !== 'undefined' && typeof exports === 'object' && define.cmd) {
    module.exports = factory;
  } else {
    factory(window.jQuery);
  }

})(function($, undefined) {

  'use strict';

  if (!$.fn.hasOwnProperty('ctree')) {

    var T = {};

    $.fn.ctree = function(opts) {

      //当前dom节点
      var $this = $(this);
      //传入树节点的数据json数组
      var data = opts.data || '';
      T.data = data;

      if (!data) {
        console.log('no data');
        return;
      }

      var str = '';
      //绘制根节点
      for (var i = 0; i < data.length; i++) {

        if (data[i].pid == 0) {
          str += '<li class="expandable">' + '<input type="checkbox" name="ckTree" class="ckTree" id="c' + data[i].id + '" ctid="' + data[i].id + '" ctpid="' + data[i].pid + '" />' + '<div class="hitArea"></div>' + '<span class="folder" val="' + data[i].id + '" loaded="false">' + data[i].name + '</span></li>';
        }
      }

      $this.append(str);


      //树主体操作
      fnInitTree($this);

    };


    function fnInitTree($this) {



      $this.find('span[loaded="false"]').each(function() {

        var _this = $(this);
        var id = _this.attr('val');
        var flag = false;

        //判断是否存在子节点
        T.data.forEach(function(nd, i) {

          if (nd.pid === id) {
            flag = true;
            return;
          }

        });

        //没有子节点

        if (!flag) {
          //点击span
          _this.on('click').attr('loaded', 'true').removeClass('folder').addClass('file');
          //
          if (_this.parent().next().html()) {
            //
            _this.parent().removeClass();
          } else {
            _this.parent().removeClass().addClass('last');
          }
        }

        //如果有子节点点击则展开
        //调用子函数递归绘出子节点
        fnAddChildList(_this);

        //节点展开收缩

        _this.on('click', function() {
          var _nodeParent = _this.parent();
          var isdisplay = _nodeParent.children('ul').is(':visible');
          if (!isdisplay) {
            _nodeParent.children('ul').show();

            if (_nodeParent.hasClass('lastExpandable')) {
              _nodeParent.addClass('lastCollapsible').removeClass('lastExpandable');
            } else {
              _nodeParent.addClass('collapsible').removeClass('expandable');
            }
          } else {
            _nodeParent.children('ul').hide();

            if (_nodeParent.hasClass('lastCollapsible')) {
              _nodeParent.addClass('lastExpandable').removeClass('lastCollapsible');
            } else {
              _nodeParent.addClass('expandable').removeClass('collapsible');
            }
          }
        });

        //点击加减号
        _this.prev().on('click', function() {
          $(this).next().click();
        });
      });


      //checkbox点击事件
      $this.find('span[loaded]').each(function(index, el) {
        var _this = $(this);
        var flag = false;
        var id = _this.attr('val');
        T.data.forEach(function(nd, i) {
          if (nd.pid === id) {
            flag = true;
            return;
          }
        });

        //当前checkbox点击之后调用fnNodeCheck函数
        $(this).prev().prev().on('click', function() {
          //debugger;
          fnNodeCheck($(this), flag);
        });
      });

      //如果它是最后的兄弟节点，检查是否有任何的子节点
      var li = $this.children('ul').children('li:last') || null;

      if (li.hasClass('expandable')) {
        li.addClass('lastExpandable').removeClass('expandable');
      } else {
        li.addClass('lastCollapsible').removeClass('collapsible');
      }

      $this.find('.last').removeClass().addClass('last');

    };


    //绘出子节点
    function fnAddChildList($span) {
      var id = $span.attr('val');
      var str = '';

      for (var i = 0; i < T.data.length; i++) {
        if (T.data[i].pid === id) {
          str += '<li class="expandable">' + '<input type="checkbox" name="ckTree" class="ckTree" id="c' + T.data[i].id + '" ctid="' + T.data[i].id + '" ctpid="' + T.data[i].pid + '" />' + '<div class="hitArea"></div>' + '<span class="folder" val="' + T.data[i].id + '" loaded="false">' + T.data[i].name + '</span></li>';
        }
      };

      if (str) {
        $span.parent().append('<ul class="subtree" style="display:none">' + str + '</ul>');
      }

      $span.attr('loaded', 'true');

      //递归调用
      fnInitTree($span.parent());
    };

    /**
     * checkbox节点是否选择
     * @param  {[type]} node [checkbox对象]
     * @param  {[type]} flag [是否有子节点]
     * @return {[type]}      [description]
     */
    function fnNodeCheck($node, flag) {
      debugger;
      //递归选父节点对象（无论是叶节点还是中间节点）
      //判断同级中有无被选中的，如果有选中的就不可以反选
      console.log($node);
      var ctid = $node.attr('ctid');
      var ctpid = $node.attr('ctpid');
      var ischecked = false;

      if ($node[0].checked == true) {
        ischecked = true;
      }

      if (!fnSiblingsNodeCheck(ctid, ctpid)) {
        //选中就一直选到根节点
        fnParentNodeCheck(ctpid, ischecked);
      }

      // if (ischecked) {
      //   fnParentNodeCheck(ctpid, ischecked);
      // } else {
      //   //去掉选中仅将其父节点去掉选中
      //   fnOnlyCheckParentNode(ctpid, ischecked);
      // }

      //如果中间节点，具有子节点就递归子节点对象

      if (flag) {
        fnChildNodeCheck(ctid, ischecked);
      }
    };

    /**
     * 同级中是否有选中的节点
     * @param  {[type]} id  [节点id]
     * @param  {[type]} pid [节点pid即父节点的id]
     * @return {[type]} ischecked [返回同级是否有选中节点bool值]
     */
    function fnSiblingsNodeCheck(id, pid) {

      var ischecked = false;
      for (var i = 0; i < T.data.length; i++) {

        if (T.data[i].id != id && T.data[i].pid == pid) {
          if ($('#c' + T.data[i].id)[0].checked == true) {
            ischecked = true;
            return ischecked;
          }
        }
      }

    };

    /**
     * 递归选中父节点对象
     * @param  {[type]} pid       [节点的父节点id]
     * @param  {[type]} ischecked [是否被选中]
     * @return {[type]}           [description]
     */
    function fnParentNodeCheck(pid, ischecked) {

      for (var i = 0; i < T.data.length; i++) {
        if (T.data[i].id == pid) {
          $("#c" + T.data[i].id)[0].checked = ischecked;
          if (!fnSiblingsNodeCheck(T.data[i].id, T.data[i].pid)) {
            fnParentNodeCheck(T.data[i].pid, ischecked);
          }
          break;
        }
      }

    };

    /**
     * 递归选中子节点对象
     * @param  {[type]} id        [节点id]
     * @param  {[type]} ischecked [是否被选中]
     * @return {[type]}           [description]
     */
    function fnChildNodeCheck(id, ischecked) {
      for (var i = 0; i < T.data.length; i++) {
        if (T.data[i].pid == id) {
          $('#c' + T.data[i].id)[0].checked = ischecked;
          fnChildNodeCheck(T.data[i].id, ischecked);
        }
      }
    };

    /**
     * 仅选中当前节点父节点对象
     * @param  {[type]} pid       [description]
     * @param  {[type]} ischecked [description]
     * @return {[type]}           [description]
     */
    function fnOnlyCheckParentNode(pid, ischecked) {
      for (var i = 0; i < T.data.length; i++) {
        if (T.data[i].id == pid) {
          $('#c' + T.data[i].id)[0].checked = ischecked;

          var ctid = $('#c' + T.data[i].id).parent().parent().siblings('input').attr('ctid');
          var ctpid = $('#c' + T.data[i].id).parent().parent().siblings('input').attr('ctpid');

          if (!fnSiblingsNodeCheck(ctid, ctpid)) {
            fnOnlyCheckParentNode(ctpid, ischecked);
          }

          break;
        }
      }
    }


  };


});
