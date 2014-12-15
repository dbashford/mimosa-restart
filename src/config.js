"use strict";

var path = require("path");

exports.defaults = function() {
  return {
    restart: {
      removed: [],
      updated: []
    }
  };
};

exports.placeholder = function() {
  return "\t\n\n" +
  "  restart:\n" +
  "    removed: []     # Folders/files, relative to project root that will\n" +
  "                  # trigger a restart of mimosa when they are removed\n" +
  "    updated: []     # Folders/files, relative to project root that will\n" +
  "                  # trigger a restart of mimosa when they are updated\n";

};

var massagePaths = function(config, type) {
  if ( config.restart[type] ) {
    config.restart[type] = config.restart[type].map( function( p ) {
      return path.join(config.root, p) + "||" + type;
    });
  } else {
    config.restart[type] = [];
  }
};

exports.validate = function(config, validators) {
  var errors = [];

  if ( validators.ifExistsIsObject( errors, "restart config", config.restart ) ) {
    validators.ifExistsIsArrayOfStrings( errors, "restart.removed", config.restart.removed );
    validators.ifExistsIsArrayOfStrings( errors, "restart.updated", config.restart.updated );

  }

  if ( !errors.length ) {
    massagePaths( config, "removed" );
    massagePaths( config, "updated" );
  }

  return errors;
};