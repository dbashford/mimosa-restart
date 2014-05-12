/* eslint no-process-exit:0 */

"use strict";

var path = require( "path" )
  , spawn = require( "child_process" ).spawn
  , watch = require( "chokidar" )
  , watchDir = process.argv[2]
  , args = process.argv[3].split( "|%|" )
  , watchConfig = { persistent: true }
  , watcher = watch.watch( path.dirname( watchDir ), watchConfig );

// listen for parent process to tell this one to go away
process.on( "message", function( m ) {
  if ( m === "ENDED" ) {
    process.exit( 0 );
  }
});

// check if matching directory, if so, let parent process know
// it needs to restart, then exit this process
var onunlinkDir = function( dirName ) {
  if ( watchDir === dirName) {
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
  }
};

watcher.on( "unlinkDir", onunlinkDir );