/* eslint no-process-exit:0 */

"use strict";

var _manageWindows = function() {
  var win32 = process.platform === "win32";
  if ( win32 ) {
    var readline = require( "readline" );
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.on("SIGINT", function (){
      var win32 = process.platform === "win32";
      if ( win32 ) {
        process.emit( "SIGINT" );
      }
    });
  }
};

var _monitorMimosa = function( mimosaConfig, options, next ) {
  var path = require( "path" )
    , fs = require( "fs" )
    , fork = require( "child_process" ).fork
    , args = process.argv.slice( 1, process.argv.length )
    , originalProcess = true
    , pidPath = path.join( __dirname, "pid" );

  // only write new pid file if pid file not there
  // if pid file there, append pid
  if ( !fs.existsSync( pidPath ) ) {
    fs.writeFileSync( pidPath, process.pid );
  } else {
    fs.appendFileSync(pidPath, "\n" + process.pid);
    originalProcess = false;
  }

  // readline for windows
  _manageWindows();

  // set up separate watcher in different process
  var monPath = path.join( __dirname, "mon.js" );
  var child = fork( monPath,
    [mimosaConfig.watch.compiledDir, args.join( "|%|" )],
    {
      detached: true,
      stdio:"inherit"
    }
  );

  child.on( "message", function( m ) {
    if (m === "RESTART_MIMOSA") {

      // if original mimosa, need to have things shut down
      // like watcher and server before new mimosa started
      // but do not exit
      if ( originalProcess ) {
        process.emit( "STOPMIMOSA" );
      } else {
        process.exit( 0 );
      }
    }
  });

  process.on( "exit", function() {
    if ( originalProcess ) {
      fs.unlinkSync( pidPath );
    }
    if ( child.connected ) {
      child.send( "ENDED" );
    }
  });

  process.on( "SIGINT", function (){
    // clean up any remaining pids
    var pids = fs.readFileSync( pidPath, "utf8" ).split( "\n" );
    pids.forEach( function( pid ) {
      if( pid !== "" + process.pid ) {
        try {
          process.kill( pid );
        } catch( err ) {
          // process doesn't exist, no big deal, some are cleaned up already
        }
      }
    });

    process.nextTick( function() {
      process.exit();
    });
  });

  fs.appendFileSync(pidPath, "\n" + child.pid);
  child.unref();

  next();
};

exports.registration = function( mimosaConfig, register ) {
  if ( mimosaConfig.isWatch ) {
    register( ["postBuild"], "complete", _monitorMimosa );
  }
};