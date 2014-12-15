mimosa-restart
===========

## Overview

This module will restart the Mimosa process when you delete certain folders/files.

For more information regarding Mimosa, see http://mimosa.io

NOTE: This module requires Mimosa `v2.2.4` or higher.

## Usage

Add `'restart'` to your list of modules.  That's all!  Mimosa will install the module for you when you start `mimosa watch` or `mimosa build`.

## Functionality

This module will watch configured directories and when they are removed/updated it will shut down the existing Mimosa and restart a new one within the same process.

This, for example, saves you the trouble of needing to restart Mimosa from the command line if your `compiledDir` gets out of sync, like when switching branches while Mimosa is running.

Or you could configure Mimosa to restart when the `mimosa-config.js` is changed.

## Default Configuration

```javascript
restart: {
  updated:[],
  deleted:[]
}
```
* `updated`, an array of strings. Paths, relative to the root of your project, to files/directories that, when updated, would cause Mimosa to be restarted.
* `deleted`, an array of strings. Paths, relative to the root of your project, to files/directories that, when removed, would cause Mimosa to be restarted.


## Example Configuration

```javascript
restart: {
  removed:["public"],
  updated:["mimosa-config.js"]
}
```