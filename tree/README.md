### 简单的Js选择树

####1.tree.js
js实现的选择树

```
var t = tree({
	el : '.tree', //绘制js树的外层dom
	data: [{},{}] //树节点数据
})
//树节点数据配置参数
data = [{
	id: 2, //节点ID
	pid:1, //节点父ID
	cname:'', //节点name
	cvalue:'', //节点value值
	cshow: '', //节点显示名称
	cchecked:'', //节点是否被选中
	cdisabled:'', //节点是否被禁用
	url:'', //节点上链接
	title:'', //节点title
	target:'', //节点target
	icon:'', //节点自定义图标
	iconOpen:'', //节点自定义打开时的图标
	open:'', //节点是否展开
	
}]	

```


####2.ctree.js
jquery实现的选择树 

待补充...










































