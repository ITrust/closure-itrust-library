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
