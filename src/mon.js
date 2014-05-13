/* eslint no-process-exit:0 */

"use strict";

var path = require( "path" )
  , fs = require( "fs" )
  , spawn = require( "child_process" ).spawn
  , watchDir = process.argv[2]
  , args = process.argv[3].split( "|%|" );

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
PathWatcher.watch(watchDir, function(event) {
  if ( [ "delete", "rename" ].indexOf( event ) > -1 ) {
    if ( !fs.existsSync( watchDir ) ) {
      /* eslint no-console:0 */
      console.log( "Restarting Mimosa...");
      restart();
    }
  }
});