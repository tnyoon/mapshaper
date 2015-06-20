/* @requires
mapshaper-gui-utils
mapshaper-common
mapshaper-file-types
mapshaper-gui-error
*/

var gui = api.gui = {};
var error = stop; // replace default error() function
window.mapshaper = api;

// Show a popup error message, then throw an error
function stop() {
  var msg = MapShaper.formatArgs(arguments);
  msg = msg.replace(/^\[[^\]]+\] ?/, ''); // remove cli cmd name
  new Message(msg);
  throw new APIError(msg);
}

gui.isReadableFileType = function(filename) {
  return !!MapShaper.guessInputFileType(filename);
};

// Run a series of tasks in sequence. Each task can be run after a timeout.
// TODO: add node-style error handling
gui.queueSync = function() {
  var tasks = [],
      timeouts = [];
  return {
    defer: function(task, timeout) {
      tasks.push(task);
      timeouts.push(timeout | 0);
      return this;
    },
    await: function(done) {
      var retn;
      runNext();
      function runNext() {
        var task = tasks.shift(),
            ms = timeouts.shift();
        if (task) {
          setTimeout(function() {
            retn = task(retn);
            runNext();
          }, ms);
        } else {
          done(retn);
        }
      }
    } // await()
  };
};
