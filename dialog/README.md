### 简单的Js弹窗组件
>练手写的简单弹窗组件

超级简单的弹窗组件，目前只有alert,confirm,loadHtml,loadIframe四个功能.

可以设定宽高，拖动，加载页面，iframe,关闭回调等简单功能
暴露的Api有：

```
{
	width:500,
	height:100,
	content:'',//内容
	success:function(){
	//弹窗成功回掉
	},
	close:function(){
		//关闭回掉
	}
}
```

详细使用请参看example










































