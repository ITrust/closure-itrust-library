// Copyright 2013 ITrust. All Rights Reserved.
//
// This file is part of closure-itrust-library.
//
// closure-itrust-library is free software: you can redistribute it and/or
// modify it under the terms of the GNU General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// closure-itrust-library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You may obtain a copy of the License at
//
//      http://www.gnu.org/licenses/gpl.txt


/**
 * @fileoverview The module loader for loading modules across the network.
 * Solves some load errors when loading a same file multiple times.
 *
 * Reuse code from original module by The Closure Library Authors
 *
 * @author j.chakra@itrust.fr (Julien Chakra-Breil)
 */

goog.provide('itrust.module.ModuleLoader');

goog.require('goog.module.ModuleLoader');

/**
 * A class that loads Javascript modules.
 * @constructor
 * @extends {goog.module.ModuleLoader}
 */
itrust.module.ModuleLoader = function(){
    goog.base(this);
};
goog.inherits(itrust.module.ModuleLoader, goog.module.ModuleLoader);

/**
 * Used to remain the loaded scripts' uri
 * @type{Object}
 */
itrust.module.ModuleLoader.prototype.loadedUris_ = {};

/**
 * @override
 */
itrust.module.ModuleLoader.prototype.downloadModules_ = function(ids, moduleInfoMap){
    var uris = []; // URIs to load
    var modUris; // URIs for one module
    var newUris = []; // New URIs to load
    for (var i = 0; i < ids.length; i++) {
        modUris = moduleInfoMap[ids[i]].getUris();
        for(var idx = 0; idx < modUris.length; idx++){
            if(!(modUris[idx] in this.loadedUris_)){
                // We research only new URIs in order to avoid
                // a double loading. Once new URIs added, save it in
                // loaded URIs array.
                newUris.push(modUris[idx]);
                this.loadedUris_[modUris[idx]] = true;
            }
        }
        goog.array.extend(uris, newUris);
        newUris = [];
    }
    this.logger.info('downloadModules ids:' + ids + ' uris:' + uris);

    if (this.getDebugMode() &&
        !this.usingSourceUrlInjection_()) {
        // In debug mode use <script> tags rather than XHRs to load the files.
        // This makes it possible to debug and inspect stack traces more easily.
        // It's also possible to use it to load JavaScript files that are hosted on
        // another domain.
        // The scripts need to load serially, so this is much slower than parallel
        // script loads with source url injection.
        goog.net.jsloader.loadMany(uris);
    } else {
        var loadStatus = this.loadingModulesStatus_[ids];
        loadStatus.requestUris = uris;

        var bulkLoader = new goog.net.BulkLoader(uris);

        var eventHandler = this.eventHandler_;
        eventHandler.listen(
            bulkLoader,
            goog.net.EventType.SUCCESS,
            goog.bind(this.handleSuccess_, this, bulkLoader, ids),
            false,
            null);
        eventHandler.listen(
            bulkLoader,
            goog.net.EventType.ERROR,
            goog.bind(this.handleError_, this, bulkLoader, ids),
            false,
            null);
        bulkLoader.load();
    }
};
