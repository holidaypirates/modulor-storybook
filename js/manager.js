const Split = require('split.js');
const { storyOf, getStories } = require('./story');

const storiesTreeTemplate = require('../templates/stories_tree.html');

const stories = getStories();

if(inIframe()){
  previewApp();
} else {
  managerApp();
}

function previewApp(){
  console.log('preview app init', stories);
}

function managerApp(){
  console.log('manager app init', stories);

  Split(['.left-panel', '.right-panel'], {
    sizes: [20, 80],
    gutterSize: 8,
    cursor: 'col-resize'
  });

  Split(['#preview-block', '#info-block'], {
    direction: 'vertical',
    sizes: [25, 75],
    gutterSize: 8,
    cursor: 'row-resize'
  });

  document.querySelector('#stories-tree').innerHTML = storiesTreeTemplate({ stories });

}

function inIframe(){
  return window.self !== window.top;
}

