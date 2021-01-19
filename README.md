# vue疫情大屏数据展示+数据导出+地图图片下载
<br />
[博客地址](https://blog.csdn.net/qq_42027681)
<br />
[博客文章地址](https://blog.csdn.net/qq_42027681/article/details/112854183)
<br />
## Project setup安装依赖包
```
npm install
```

### Compiles and hot-reloads for development运行
```
npm run serve
```

### Compiles and minifies for production打包
```
npm run build
```

打包后的在dist中

需要配置nginx代理转发


```html
"/api": {
        target: "https://www.ncovchina.com/data",
   
 "/ans": {
        target: "https://api.inews.qq.com/newsqa/v1/query/inner/publish/modules/list?modules=chinaDayList,chinaDayAddList,nowConfirmStatis,provinceCompare",

```
