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
 * @fileoverview A singleton object for managing Javascript code modules which
 * automatically resolves URI dependencies.
 *
 * @author j.chakra@itrust.fr (Julien Chakra-Breil)
 */

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
