module.exports = {
  publicPath: "./",
  devServer: {
    // assetsSubDirectory: 'static',
    // assetsPublicPath: '/',
    proxy: {
      "/api": {
        target: "https://www.ncovchina.com/data",
        changeOrigin: true,
        pathRewrite: {
          "^/api": ""
        }
      },
      // https://news.qq.com/zt2020/page/feiyan.htm#/?nojump=1
      "/aki": {
        target: "https://api.inews.qq.com/newsqa/v1/automation/foreign/country",
        changeOrigin: true,
        pathRewrite: {
          "^/aki": ""
        }
      },
      "/ans": {
        target: "https://api.inews.qq.com/newsqa/v1/query/inner/publish/modules/list?modules=chinaDayList,chinaDayAddList,nowConfirmStatis,provinceCompare",
        changeOrigin: true,
        pathRewrite: {
          "^/ans": ""
        }
      }
    },
    host: "0.0.0.0",
    port: 8083,
    clientLogLevel: "info"
  }
  // build:{
  //     index: path.resolve(__dirname, '../dist/index.html'),
  //     // js,css,fonts夹等资源的路径
  //     assetsRoot: path.resolve(__dirname, '../dist'),
  //     // 下面这种写法指定静态文件 js/css夹等与index平级
  //     // 指定为'/' 会打包会出现错误，最高只能指定到当前目录’./'  指定目录不存在会自动创建
  //     // 也就是说js,css文件夹的路径其实是上面的: ’../dist' + assetsSubDirectory
  //     assetsSubDirectory: 'static'
  // }
};
