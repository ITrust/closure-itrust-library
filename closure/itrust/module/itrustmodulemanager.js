// Copyright 2013 ITrust. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
