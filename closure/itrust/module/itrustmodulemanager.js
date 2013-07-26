goog.provide('itrust.module.ModuleManager');

goog.require('goog.module.ModuleManager');

/**
 * The ModuleManager keeps track of all modules in the environment.
 * Since modules may not have their code loaded, we must keep track of them.
 * @constructor
 * @extends {goog.module.ModuleManager}
 */
itrust.module.ModuleManager = function(){
    goog.base(this);
}
goog.inherits(itrust.module.ModuleManager, goog.module.ModuleManager);
goog.addSingletonGetter(itrust.module.ModuleManager);

/**
 * Sets the module uris.
 *
 * @param {Object} moduleUriMap The map of id/uris pairs for each module.
 * @param {String} opt_rootInputPath The base path to the input files  
 * @param {String} opt_rootOutputPath The base path to the output script to load
 */
itrust.module.ModuleManager.prototype.setModuleUris =
        function(moduleUriMap, opt_rootInputPath, opt_rootOutputPath){

    if(!COMPILED){
        var uris = moduleUriMap;
        var input = opt_rootInputPath || "./";
        var output = opt_rootOutputPath || "./";
        var scripts = [];
        var seenScript = {};
        var deps = goog.dependencies_;

        function visitNode(path) {
            if (path in deps.requires) {
                for (var requireName in deps.requires[path]) {
                    if (!goog.isProvided_(requireName)) {
                        if (requireName in deps.nameToPath) {
                            visitNode(deps.nameToPath[requireName]);
                        } else {
                            throw Error('Undefined nameToPath for ' + requireName);
                        }
                    }
                }
            }

            scripts.push(output + path);
        }

        for (var mod in uris) {
            visitNode(input + uris[mod]);
            uris[mod] = scripts;
            scripts = [];
        }
    }

    goog.base(this, 'setModuleUris', moduleUriMap); 
};
