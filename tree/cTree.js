/*
 * @Author: jypblue
 * @Date:   2016-09-22 23:19:43
 * @Last Modified by:   jypblue
 * @Last Modified time: 2016-09-25 11:12:49
 */


(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return factory(root);
    });
  } else if (typeof exports === 'object') {
    module.exports = factory;
  } else {
    root.dialog = factory(root);
  }

})(this, function(win) {
  'use strict';
  //树结构 Node
  /**
   * [Node description]
   * @param {[type]} id        [description]
   * @param {[type]} pid       [description]
   * @param {[type]} cname     [description]
   * @param {[type]} cvalue    [description]
   * @param {[type]} cshow     [description]
   * @param {[type]} cchecked  [description]
   * @param {[type]} cdisabled [description]
   * @param {[type]} url       [description]
   * @param {[type]} title     [description]
   * @param {[type]} target    [description]
   * @param {[type]} icon      [description]
   * @param {[type]} iconOpen  [description]
   * @param {[type]} open      [description]
   */
  function Node(options) {

    this.id = options.id;
    this.pid = options.pid;

    this.cname = options.cname;
    this.cvalue = options.cvalue;

    this.cshow = options.cshow;
    this.ccheckede = options.cchecked || false;
    this.cdisabled = options.cdisabled || false;

    this.url = url || '###';
    this.title = title;
    this.target = target;
    this.icon = icon;
    this.iconOpen = iconOpen;

    this._io = open || false;
    this._is = false;
    this._ls = false;
    this._hc = false;
    this._ai = 0; //?
    this._p;
  }


  //树插件 cTree
  function cTree(options) {

    if (!options) return;

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
    };

    this.icon = {
      root: 'img/base.gif',
      folder: 'img/folder.gif',
      folderOpen: 'img/folderOpen.gif',
      node: 'img/page.gif',
      empty: 'img/empty.gif',
      line: 'img/line.gif',
      join: 'img/join.gif',
      joinBottom: 'img/joinBottom.gif',
      plus: 'img/plus.gif',
      plusBottom: 'img/plusBottom.gif',
      minus: 'img/minus.gif',
      minusBottom: 'img/minusBottom.gif',
      nlPlus: 'img/nolines_plus.gif',
      nlMinus: 'img/nolines_minus.gif'
    };

    this.el = option.el;
    this.aNodes = options.data;
    this.aIndent = [];
    this.root = new Node(-1);
    this.selectedNode = null;
    this.selectedFound = false;
    this.completed = false;
  };

  //添加树节点
  cTree.prototype.add = function(options) {
    this.aNodes[this.aNodes.length] = new Node(options);
  };

  //打开所有的树节点
  cTree.prototype.openAll = function() {
    this.oAll(true);
  };

  //关闭所有树节点
  cTree.prototype.closeAll = function() {
    this.oAll(false);
  };

  //绘出树节点,返回节点字符串
  cTree.prototype.toString = function() {

    var str = this.addNode(this.root);
    if (this.config.useCookies) {
      this.selectedNode = this.getSelected();
    };

    if (!this.selectedFound) {
      this.selectedNode = null;
    };
    this.completed = true;

    return str;
  };


  //创建树形结构
  cTree.prototype.addNode = function(pNode) {
    var str = '';
    var n = 0;
    if (this.config.inOrder) {
      n = pNode._ai;
    };

    for (n; n < this.aNodes.length; n++) {
      //如果这个节点的pid与传入的节点的id相等
      if (this.aNodes[n].pid == pNode.id) {
        //当前节点
        var cn = this.aNodes[n];
        //父节点
        cn._p = pNode;
        //位置
        cn._ai = n;

        //?
        this.setCS(cn);
        //
        if (!cn.target && this.config.target) {
          cn.target = this.config.target;
        }



      }
    }


  };


});
