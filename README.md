mimosa-restart
===========

## Overview

This module will restart the Mimosa process when you delete the `watch.compiledDir`.

For more information regarding Mimosa, see http://mimosa.io

NOTE: This module requires Mimosa `v2.2.4` or higher.

## Usage

Add `'restart'` to your list of modules.  That's all!  Mimosa will install the module for you when you start `mimosa watch` or `mimosa build`.

## Functionality

This module will watch the `watch.compiledDir` and when it is removed, it will shut down the existing Mimosa and restart a new one within the same process.

This saves you the trouble of needing to restart Mimosa from the command line if your `compiledDir` gets out of sync, for instance, if you are switching branches.

## Default Configuration

This module has no configuration.  It uses the `watch.compiledDir` setting of Mimosa.