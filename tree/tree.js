/*
 * @Author: jypblue
 * @Date:   2016-09-29 10:26:50
 * @Last Modified by:   jypblue
 * @Last Modified time: 2016-09-30 23:44:45
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
    root.tree = factory(root);
  }

})(this, function(win) {
  'use strict';

  function Node(opts) {
    this.id = opts.id;
    this.pid = opts.pid;

    //checkbox的名称
    this.cname = opts.cname;
    //checkbox的值
    this.cvalue = opts.cvalue;
    //checkbox的显示
    this.cshow = opts.cshow;
    //checkbox是否被选中，默认是不选
    this.cchecked = opts.cchecked || false;
    //checkbox是否可用，默认是不可用
    this.cdisabled = opts.cdisabled || false;

    //节点连接，默认是##
    this.url = opts.url || '###';

    this.title = opts.title;
    this.target = opts.target;
    this.icon = opts.icon;
    this.iconOpen = opts.iconOpen;
    //是否打开（状态标记）
    this._io = opts.open || false;
    //是否有兄弟节点
    this._is = false;
    //是否是最后一个兄弟节点
    this._ls = false;
    //是否含有子节点
    this._hc = false;
    //当前元素位置编号
    this._ai = 0;
    //父节点
    this._p;
  }

  //选择树构造函数
  function Tree(opts) {

    if (!opts.el || !opts.data) {
      return;
    }

    //状态配置项
    this.config = {
      target: null,
      folderLinks: false,
      useSelection: false,
      useCookies: false,
      useLines: true,
      useIcons: false,
      useStatusText: true,
      closeSameLevel: false,
      inOrder: false
    }

    //图标配置项
    this.icon = {
      root: 'img/base.gif',
      folder: 'img/folder.gif',
      folderOpen: 'img/folderopen.gif',
      node: 'img/page.gif',
      empty: 'img/empty.gif',
      line: 'img/line.gif',
      join: 'img/join.gif',
      joinBottom: 'img/joinbottom.gif',
      plus: 'img/plus.gif',
      plusBottom: 'img/plusbottom.gif',
      minus: 'img/minus.gif',
      minusBottom: 'img/minusbottom.gif',
      nlPlus: 'img/nolines_plus.gif',
      nlMinus: 'img/nolines_minus.gif'
    };

    //基本选项

    this.obj = opts.objName;
    this.el = opts.el;
    this.aNodes = [];
    this.aIndent = [];
    this.root = new Node({
      id: -1
    });

    this.selectedNode = null;
    this.selectedFound = false;
    this.completed = false;
    this.initNode(opts.data);
    this.createTree();
  }

  //实例化树节点存入数组中备用
  Tree.prototype.initNode = function(data) {
    for (var i = 0; i < data.length; i++) {
      this.aNodes[this.aNodes.length] = new Node(data[i]);
    }
  };

  //输出树到页面中
  Tree.prototype.createTree = function() {
    var el = this.el;
    var str = '<div class="ctree">\n';
    //如果支持js
    if (document.getElementById) {
      if (this.config.useCookies) {
        this.selectedNode = this.getSelected();
      }
      str += this.createNode(this.root);
    } else {
      str += 'Browser not supported javascript.';
    }
    str += '</div>';
    if (!this.selectedFound) {
      this.selectedNode = null;
    };
    this.completed = true;

    if (el) {
      document.querySelector(el).innerHTML = str;
    } else {
      var div = document.createElement('div');
      div.innerHTML = str;
      document.appendChild(div);
    }
  };

  /**
   * 创建树结构
   * @param  {[type]} pNode [父节点]
   * @return {[type]}       [树结构dom字符串]
   */
  Tree.prototype.createNode = function(pNode) {
    var str = '';
    var n = 0;
    //如果按次序
    if (this.config.inOrder) {
      n = pNode._ai;
    }
    for (n; n < this.aNodes.length; n++) {
      //如果节点父id与父节点id相等
      if (this.aNodes[n].pid == pNode.id) {
        //当前节点
        var cn = this.aNodes[n];
        //给当前节点的父节点属性赋值
        cn._p = pNode;
        //当前节点位置
        cn._ai = n;
        //判断当前节点的位置信息
        this.setChildSibling(cn);

        //如果当前节点没有目标对象，或者配置项也没有目标对象，就把配置项空对象指针赋值给当前节点
        if (!cn.target && this.config.target) {
          cn.target = this.config.target;
        }

        //如果当前节点有子节点且没有展开且运用cookie，则检查是否展开
        if (cn._hc && !cn._io && this.config.useCookies) {
          cn._io = this.isOpen(cn.id);
        }

        //如果没有文件夹链接，且有子节点，url设置为null
        if (!this.config.folderLinks && cn._hc) {
          cn.url = null;
        }

        //如果需要选中，且当前id与需要选中node的位置属性相等，且标记为未被选中过
        if (this.config.useSelection && cn.id == this.selectedNode && !this.selectedFound) {
          cn._is = true;
          this.selectedNode = n;
          this.selectedFound = true;
        }

        str += this.treeNode(cn, n);
        if (cn._ls) {
          break;
        }
      }
    }
    return str;
  };

  /**
   * [treeNode 创建节点的图标，链接，文字]
   * @param  {[type]} node   [当前节点]
   * @param  {[type]} nodeId [节点位置]
   * @return {[type]}        [返回树节点字符串]
   */
  Tree.prototype.treeNode = function(node, nodeId) {
    var str = '<div class="treeNode">' + this.indent(node, nodeId);

    // 如果需要使用自定义的图标
    if (this.config.useIcons) {
      //当节点没有图标时
      if (!node.icon) {
        //如果是父节点，就用父节点图；否则如果有子节点就用文件夹图标，不然用节点图标
        node.icon = (this.root.id == node.pid) ? this.icon.root : ((node._hc) ? this.icon.folder : this.icon.node);
      }
      //如果图标没展开
      if (!node.iconOpen) {
        node.iconOpen = (node._hc) ? this.icon.folderOpen : this.icon.node;
      }

      if (this.root.id == node.pid) {
        node.icon = this.icon.root;
        node.iconOpen = this.icon.root;
      }

      str += '<img id="i' + this.obj + nodeId + '" src="' + ((node._io) ? node.iconOpen : node.icon) + '" alt="" />';

    }
    //如果节点有url
    if (node.url) {
      str += '<a id="s' + this.obj + nodeId + '" class="' + ((this.config.useSelection) ? ((node._is ? 'nodeSel' : 'node')) : 'node') + '" href="' + node.url + '"';

      if (node.title) {
        str += 'title="' + node.title + '"';
      }
      if (node.target) {
        str += 'target="' + node.target + '"';
      }

      if (this.config.useStatusText) {
        str += 'onmouseover="window.status=\'' + node.cname + '\';return true;" onmouseout="window.status=\'\';return true;" ';
      }

      if (this.config.useSelection && ((node._hc && this.config.folderLinks) || !node._hc)) {
        str += 'onClick="javascript:' + this.obj + '.s(' + nodeId + ');"';
      }
      str += '>';
    } else if ((!this.config.folderLinks || !node.url) && node._hc && node.pid != this.root.id) {
      str += '<a href="javascript: ' + this.obj + '.o(' + nodeId + ');" class="node">';
    }

    if (node.pid == this.root.id) {
      str += node.cname;
    } else {
      var checkboxStr = '<input type="checkbox" desc="' + node.cshow + '" name="' + node.cname + '" id="' + node.cname + '_' + node.id + '" value="' + node.cvalue + '" onClick="javascript: ' + this.obj + '.checkNode(' + node.id + ',' + node.pid + ',' + node._hc + ',this.checked);"';

      if (node.cchecked) {
        checkboxStr += ' checked ';
      }

      if (node.cdisabled) {
        checkboxStr += ' disabled ';
      }

      checkboxStr += '>' + node.cshow;

      str += checkboxStr;
    }

    //如果有url或者没url及文件链接为false而有子节点
    if (node.url || ((!this.config.folderLinks || !node.url) && node._hc)) {
      str += '</a>';
    }

    str += '</div>';

    if (node._hc) {
      str += '<div id="ct' + this.obj + nodeId + '" class="clip" style="display:' + ((this.root.id == node.pid || node._io) ? 'block' : 'none') + ';">';
      str += this.createNode(node);
      str += '</div>';
    }
    //
    this.aIndent.pop();
    return str;
  };

  /**
   * 添加空格以及线条图标
   * @param  {[type]} node   [当前节点对象]
   * @param  {[type]} nodeId [当前节点位置]
   * @return {[type]}        [返回空格dom结构字符串]
   */
  Tree.prototype.indent = function(node, nodeId) {
    var str = '';

    if (this.root.id != node.pid) {
      for (var n = 0; n < this.aIndent.length; n++) {
        str += '<img src="' + ((this.aIndent[n] == 1 && this.config.useLines) ? this.icon.line : this.icon.empty) + '" alt="" />';
      }

      (node._ls) ? this.aIndent.push(0): this.aIndent.push(1);

      if (node._hc) {
        str += '<a href="javascript:' + this.obj + '.o(' + nodeId + ');"><img id="j' + this.obj + nodeId + '" src="';

        if (!this.config.useLines) {
          str += (node._io) ? this.icon.nlMinus : this.icon.nlPlus;
        } else {
          str += ((node._io) ? ((node._ls && this.config.useLines) ? this.icon.minusBottom : this.icon.minus) : ((node._ls && this.config.useLines) ? this.icon.plusBottom : this.icon.plus));
        }

        str += '" alt="" /></a>';
      } else {
        str += '<img src="' + ((this.config.useLines) ? ((node._ls) ? this.icon.joinBottom : this.icon.join) : this.icon.empty) + '" alt="" />';
      }
    }

    return str;
  };

  //检查当前节点是否拥有任何子节点或者是否最后一个兄弟节点
  Tree.prototype.setChildSibling = function(node) {
    var lastId;
    for (var n = 0; n < this.aNodes.length; n++) {
      if (this.aNodes[n].pid == node.id) {
        node._hc = true;
      }
      if (this.aNodes[n].pid == node.pid) {
        lastId = this.aNodes[n].id;
      }
    }

    if (lastId == node.id) {
      node._ls = true;
    }
  };

  //返回选中的节点
  Tree.prototype.getSelected = function() {
    var sn = this.getCookie('cs' + this.obj);
    return (sn) ? sn : null;
  };

  /**
   * 选者框选中后做相应的判断
   * @param  {[type]} id      [description]
   * @param  {[type]} pid     [description]
   * @param  {[type]} _hc     [description]
   * @param  {[type]} checked [description]
   * @return {[type]}         [description]
   */
  Tree.prototype.checkNode = function(id, pid, _hc, checked) {
    //debugger;
    if (!this.isHaveBNode(id, pid)) {
      if (checked) {

        this.checkPNodeRecursion(pid, checked);
      } else {

        this.checkPNode(pid, checked);
      }
    }

    if (_hc) {
      this.checkSNodeRecursion(id, checked);
    }

  };

  /**
   * [isHaveBNode description]
   * @param  {[type]}  id  [description]
   * @param  {[type]}  pid [description]
   * @return {Boolean}     [description]
   */
  Tree.prototype.isHaveBNode = function(id, pid) {
    var isChecked = false;

    for (var n = 0; n < this.aNodes.length; n++) {
      //
      if (this.aNodes[n].pid != -1 && this.aNodes[n].id != id && this.aNodes[n].pid == pid) {
        if (eval("document.all." + this.aNodes[n].cname + "_" + this.aNodes[n].id + ".checked")) {
          isChecked = true;
        }
      }
    }

    return isChecked;
  };

  /**
   * [checkPNodeRecursion description]
   * @param  {[type]} id        [description]
   * @param  {[type]} ischecked [description]
   * @return {[type]}           [description]
   */
  Tree.prototype.checkPNodeRecursion = function(pid, ischecked) {
    for (var n = 0; n < this.aNodes.length; n++) {
      if (this.aNodes[n].pid != -1 && this.aNodes[n].id == pid) {
        eval("document.all." + this.aNodes[n].cname + "_" + this.aNodes[n].id + ".checked = " + ischecked);
        //递归调用
        this.checkPNodeRecursion(this.aNodes[n].pid, ischecked);
        break;
      }

    }
  };

  /**
   * [checkSNodeRecursion description]
   * @param  {[type]} id        [description]
   * @param  {[type]} ischecked [description]
   * @return {[type]}           [description]
   */
  Tree.prototype.checkSNodeRecursion = function(id, ischecked) {
    for (var n = 0; n < this.aNodes.length; n++) {
      if (this.aNodes[n].pid != -1 && this.aNodes[n].pid == id) {
        //需要改正
        eval("document.all." + this.aNodes[n].cname + "_" + this.aNodes[n].id + ".checked = " + ischecked);
        this.checkSNodeRecursion(this.aNodes[n].id, ischecked);
      }
    }
  };

  /**
   * [checkPNode description]
   * @param  {[type]} pid       [description]
   * @param  {[type]} ischecked [description]
   * @return {[type]}           [description]
   */
  Tree.prototype.checkPNode = function(pid, ischecked) {
    for (var n = 0; n < this.aNodes.length; n++) {
      if (this.aNodes[n].pid != -1 && this.aNodes[n].id == pid) {
        eval('document.all.' + this.aNodes[n].cname + "_" + this.aNodes[n].id + ".checked = " + ischecked);
        break;
      }
    }
  };

  Tree.prototype.openAll = function() {
    this.oAll(true);
  }

  Tree.prototype.closeAll = function() {
    this.oAll(false);
  }

  //高亮选中的节点
  Tree.prototype.s = function(id) {
    if (!this.config.useSelection) {
      return;
    }
    var cn = this.aNodes[id];
    if (cn._hc && !this.config.folderLinks) {
      return;
    }
    if (this.selectedNode != id) {
      if (this.selectedNode || this.selectedNode == 0) {
        var eOld = document.getElementById("s" + this.obj + this.selectedNode);
        eOld.className = "node";
      }

      var eNew = document.getElementById("s" + this.obj + id);
      eNew.className = "nodeSel";
      this.selectedNode = id;
      if (this.config.useCookies) {
        this.setCookie('cs' + this.obj, cn.id);
      }

    }
  }

  //展开或收起节点
  Tree.prototype.o = function(id) {
    var cn = this.aNodes[id];
    this.nodeStatus(!cn._io, id, cn._ls);
    cn._io = !cn._io;
    if (this.config.closeSameLevel) {
      this.closeLevel(cn);
    }

    if (this.config.useCookies) {
      this.updateCookie();
    }
  };

  //展开或收起所有节点
  Tree.prototype.oAll = function(status) {
    for (var n = 0; n < this.aNodes.length; n++) {
      if (this.aNodes[n]._hc && this.aNodes[n].pid != this.root.id) {
        this.nodeStatus(status, n, this.aNodes[n]._ls);
        this.aNodes[n]._io = status;
      }
    }
    if (this.config.useCookies) {
      this.updateCookie();
    }
  }

  //展开特定树节点
  /**
   * [openTo description]
   * @param  {[type]} nId     [description]
   * @param  {[type]} bSelect [description]
   * @param  {[type]} bFirst  [description]
   * @return {[type]}         [description]
   */
  Tree.prototype.openTo = function(nId, bSelect, bFirst) {
    if (!bFirst) {
      for (var n = 0; n < this.aNodes.length; n++) {
        if (this.aNodes[n].id == nId) {
          nId = n;
          break;
        }
      }
    }

    var cn = this.aNodes[nId];
    if (cn.pid == this.root.id || !cn._p) {
      return;
    }
    cn._io = true;
    cn._is = bSelect;
    if (this.completed && cn._hc) {
      this.nodeStatus(true, cn._ai, cn._ls);
    }

    if (this.completed && bSelect) {
      this.s(cn._ai);
    } else if (bSelect) {
      this._sn = cn._ai;
    }
    this.openTo(cn._p._ai, false, true);
  };

  /**
   * 关闭某些在同一位置的所有节点
   * @param  {[type]} node [description]
   * @return {[type]}      [description]
   */
  Tree.prototype.closeLevel = function(node) {
    for (var n = 0; n < this.aNodes.length; n++) {
      if (this.aNodes[n].pid == node.pid && this.aNodes[n].id != node.id && this.aNodes[n]._hc) {
        this.nodeStatus(false, n, this.aNodes[n].ls);
        this.aNodes[n]._io = false;
        this.closeAllChildren(this.aNodes[n]);
      }
    }
  };


  /**
   * 关闭某个节点的所有子节点
   * @param  {[type]} node [description]
   * @return {[type]}      [description]
   */
  Tree.prototype.closeAllChildren = function(node) {
    for (var n = 0; n < this.aNodes.length; n++) {
      if (this.aNodes[n].pid == node.id && this.aNodes[n]._hc) {
        if (this.aNodes[n]._io) {
          this.nodeStatus(false, n, this.aNodes[n]._ls);
        }
        this.aNodes[n]._io = false;
        this.closeAllChildren(this.aNodes[n]);
      }
    }
  };

  /**
   * 改变节点展开或者收起的状态
   * @param  {[type]} status [description]
   * @param  {[type]} id     [description]
   * @param  {[type]} bottom [description]
   * @return {[type]}        [description]
   */
  Tree.prototype.nodeStatus = function(status, id, bottom) {
    var eDiv = document.getElementById('ct' + this.obj + id);
    var eJoin = document.getElementById('j' + this.obj + id);

    if (this.config.useIcons) {
      var eIcon = document.getElementById('i' + this.obj + id);
      eIcon.src = (status) ? this.aNodes[id].iconOpen : this.aNodes[id].icon;
    }

    eJoin.src = (this.config.useLines) ?
      ((status) ? ((bottom) ? this.icon.minusBottom : this.icon.minus) : ((status) ? this.icon.nlMinus : this.icon.nlPlus)) :
      ((status) ? this.icon.nlMinus : this.icon.nlPlus);
    eDiv.style.display = (status) ? 'block' : 'none';

  };

  var tree = function(opts) {
    opts.objName = opts.objName || 't';
    var t = new Tree(opts);
    win.t = t;
    return t;
  }

  return win.tree = tree;



  /**
   * Cookies
   */

  Tree.prototype.clearCookie = function() {
    var now = new Date();
    var yesterday = new Date(now.getDate() - 1000 * 60 * 60 * 24);
    this.setCookie('co' + this.obj, 'cookieVlue', yesterday);
    this.setCookie('cs' + this.obj, 'cookieVlue', yesterday);
  }

  Tree.prototype.setCookie = function(cookieName, cookieValue, expires, path, domain, secure) {
    document.cookie =
      escape(cookieName) + '=' + escape(cookieValue) + (expires ? ';expires=' + expires.toGMTString() : '') + (path ? ';path=' + path : '') + (domain ? ';domain=' + domain : '') + (secure ? ';secure' : '');
  };

  Tree.prototype.getCookie = function(cookieName) {
    var cookieValue = '';
    var posName = document.cookie.indexOf(escape(cookieName) + '=');

    if (posName != -1) {
      var posValue = posName + (escape(cookieName) + '=').length;
      var endPos = document.cookie.indexOf(';', posValue);

      if (endPos != -1) {
        cookieValue = unescape(document.cookie.substring(posValue, endPos));
      } else {
        cookieValue = unescape(document.cookie.substring(posValue));
      }
    }
    return cookieValue;
  };

  Tree.prototype.updateCookie = function() {
    var str = '';
    for (var n = 0; n < this.aNodes.length; n++) {
      if (this.aNodes[n]._io && this.aNodes[n].pid != this.root.id) {
        if (str) str += '.';
        str += this.aNodes[n].id;
      }
    }
    this.setCookie('co' + this.obj, str);
  };


  Tree.prototype.isOpen = function(id) {
    var aOpen = this.getCookie('co' + this.obj).split('.');
    for (var n = 0; n < aOpen.length; n++)
      if (aOpen[n] == id) return true;
    return false;
  };

});
