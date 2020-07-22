var FStream = require('fs');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const outPutName = 'dist';
module.exports = {
  transpileDependencies: ['vuetify'],
  publicPath: '/',
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'sit' || process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'sit_green') {
      config.plugins[1].definitions['process.env'].VUE_APP_VERSION = new Date().getTime()
      console.log("当前版本",config.plugins[1].definitions['process.env'].VUE_APP_VERSION)
      FStream.writeFile("public/version.js", config.plugins[1].definitions['process.env'].VUE_APP_VERSION, function (err) {
        if (err) throw err;
        console.log("版本信息写入成功!");
      });

      let fileManager = new FileManagerPlugin({
        onEnd: {
          /* copy: [
            { source: 'public/version.js', destination: 'web' },
          ], */
          archive: [
            {
              source: outPutName,
              destination: `${outPutName}.zip`,
              format: 'zip',
            },
          ],
        },
      });
      // 对大的文件进行gzip压缩
      let compress = new CompressionPlugin({
        test: /\.js$|\.html$|\.css/,
        threshold: 10240, // 对超过10kb的数据进行压缩
        deleteOriginalAssets: false, // 不删除源文件
      });
      config.plugins.push(fileManager);
      config.plugins.push(compress);
    }
  },
};
