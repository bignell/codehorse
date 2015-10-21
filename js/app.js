"use strict";

/*
* Utils
*/
var loadJSON = function(url, successHandler, errorHandler) {
  var xhr = new XMLHttpRequest();   // TODO: replace with new window.fetch() api
  xhr.open('GET', url, true);
  xhr.onload = function() {
    if (xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);
      successHandler && successHandler(data);
    } else {
      errorHandler && errorHandler(xhr.status);
    }
  };
  xhr.send();
};

/*
* Components
*/

// turn <textarea> into Prism-highlighted editor
var refract = function() {
  var editor = document.getElementById('editor');
  var pre = document.createElement('pre');
  var code = document.createElement('code');
  editor.insertBefore(pre, editor.firstChild).appendChild(code);
  var textarea = editor.querySelector('textarea');

  function highlight() {
    var highlighted = Prism.highlight(textarea.value, Prism.languages.javascript);
    code.innerHTML = highlighted;
  }

  highlight();

  textarea.addEventListener('input', highlight);

  textarea.addEventListener('scroll', function() {
    this.scrollTop = (this.scrollTop < 0) ? 0 : this.scrollTop; // TODO: fix remaining Safari jank
    pre.style.top = "-" + this.scrollTop + "px";
  });

  textarea.addEventListener('keydown', function(e) {
    var start = this.selectionStart, end = this.selectionEnd;

    if(e.keyCode === 9){ // tab
      // set textarea value to: text before caret + tab + text after caret
      this.value = this.value.substring(0, start) + "  " + this.value.substring(end);
      this.selectionStart = this.selectionEnd = start + 2; // reposition caret
      e.preventDefault(); // prevent .blur
      textarea.dispatchEvent(new Event('input')); // trigger 'input' on textarea
    }
    if(e.keyCode === 8){ // backspace
      var before = this.value.substring(0, start); // TODO: it's 4am, but I just realized there's also .lastIndexOf()...
      if( /\n(  )+$/.test(before) ){ // when only (even number of) spaces before caret
        e.preventDefault();
        this.value = before.slice(0, -2) + this.value.substring(end); // unINDENT!!!  :D/-<
        this.selectionStart = this.selectionEnd = start - 2;
        textarea.dispatchEvent(new Event('input')); // trigger 'input' on textarea
      }
    }
  });
};

/*
* App
*/

// mount point
var app = document.getElementById("app");


var gistTask = function(gistID) {

  // TODO: a lot, really, but first factor out Render from gistTask
  var render = function(data) {
    var task = JSON.parse(data.files['task.json'].content);

    // quick hack for proof of concept
    app.innerHTML = '<div id="challenge">'
                    + '<h2 id="title">' + task.title + '</h2>'
                    + '<p>' + task.description + '</p>'
                    + '</div><div id="solution">'
                    + '<div id="editor"><textarea></textarea></div>'
                    + '</div>';
    refract();
  };

  loadJSON('http://api.github.com/gists/' + gistID, render);
};




/*
* Routing (via Director [github.com/flatiron/director])
*/

var routes = {
  // "/:collection": showCollection
  // "/:collection/:task": showTask
  "/gist/:gistID": gistTask

};

var router = Router(routes);
router.configure({"strict": false}); // allows for trailing slashes
router.init();
