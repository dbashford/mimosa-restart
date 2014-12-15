/* eslint no-process-exit:0 */

"use strict";

var path = require( "path" )
  , fs = require( "fs" )
  , spawn = require( "child_process" ).spawn;

var args = process.argv[ process.argv.length - 1 ].split( "|%|" );
var watchDirs = [];

// argv[0] = node
// argv[1] = mon.js
// argv[1] - argv[argv.length - 1] = folders
// argv[argv.length - 1] = mimosa arguments
for ( var i = 2; i < process.argv.length - 1; i++ ) {
  watchDirs.push(process.argv[i]);
}

// listen for parent process to tell this one to go away
process.on( "message", function( m ) {
  if ( m === "ENDED" ) {
    process.exit( 0 );
  }
});

// check if matching directory, if so, let parent process know
// it needs to restart, then exit this process
var restart = function() {
  // make current mimosa stop watching/shutdown/restart
  process.send( "RESTART_MIMOSA" );

  // start new mimosa
  var newMimosa = spawn("node",
    args,
    {
      detached: true,
      stdio:"inherit"
    }
  );
  newMimosa.unref();

  process.nextTick( function() {
    process.exit( 0 );
  });
};

var PathWatcher = require( "pathwatcher" );
watchDirs.forEach( function( watchDir) {
  var dirConfig = watchDir.split( "||" );
  var pathh = dirConfig[0];
  var isRemoved = dirConfig[1] === "removed";
  PathWatcher.watch(pathh, function(event, eventPath) {
    console.log("SOMETHING HAPPENED", event, eventPath)
    if ( isRemoved && [ "delete", "rename" ].indexOf( event ) > -1 ) {
      if ( !fs.existsSync( pathh ) ) {
        /* eslint no-console:0 */
        console.log( "[[ " + pathh + " ]] has been removed, restarting Mimosa...");
        restart();
      }
    } else {
      if ( event === "change"  ) {
        /* eslint no-console:0 */
        console.log( "[[ " + pathh + " ]] has been updated, restarting Mimosa...");
        restart();
      }
    }
  });
});

