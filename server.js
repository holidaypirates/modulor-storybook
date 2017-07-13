const express = require('express');
const webpack = require("webpack");
const program = require('commander');
const fileHound = require('filehound');
const path = require('path');
const fs = require('fs');

const commonTemplate = require('./templates/common.html');
const managerTemplate = require('./templates/manager.html');
const previewTemplate = require('./templates/preview.html');

const webpackMiddleware = require("webpack-dev-middleware");


//read arguments
program
  .version('0.1.0')
  .option('-p, --port <n>', 'Port')
  .parse(process.argv);


//settings
const PORT = program.port || 3000;
const TARGET_DIR = process.cwd();
const PROJECT_DIR = __dirname;


let projectConfig = {};
try {
  projectConfig = require(path.resolve(TARGET_DIR, '.storybook', 'config.js'));
} catch(e) {
}

const config = Object.assign({}, require('./defaults/config.js'), projectConfig);


let webpackConfig = {};
try {
  webpackConfig = require(path.resolve(TARGET_DIR, '.storybook', 'webpack.config.js'));
} catch(e) {
  console.log('using default webpack config');
  webpackConfig = require('./defaults/webpack.config.js');
}


//app
const app = express();

const stories = fileHound.create()
  .paths(TARGET_DIR)
  .match(config.storiesMask)
  .find();



stories.then((storyFiles) => {

  const webpackConfigPrepared = Object.assign({}, webpackConfig, {
    entry: {
      application: storyFiles.concat(path.resolve(PROJECT_DIR, 'js/manager.js'))
    }
  });

  const compiler = webpack(webpackConfigPrepared);

  app.use(webpackMiddleware(compiler, { serverSideRender: true }));
  app.get('/preview.html', previewMiddleware);
  app.use(appMiddleware);

  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });

});


function normalizeAssets(assets) {
  return [].concat(assets || []);
}

function appMiddleware(req, res) {
  const assetsByChunkName = res.locals.webpackStats.toJson().assetsByChunkName;

  res.send(commonTemplate({
    headContent: `
      <title>Stories manager</title>
    `,
    bodyContent: managerTemplate({
      assets: normalizeAssets(assetsByChunkName.application)
    })
  }));
}

function previewMiddleware(req, res) {
  const assetsByChunkName = res.locals.webpackStats.toJson().assetsByChunkName;

  res.send(commonTemplate({
    headContent: `
      <title>Story preview</title>
    `,
    bodyContent: previewTemplate({
      assets: normalizeAssets(assetsByChunkName.application)
    })
  }));
}
