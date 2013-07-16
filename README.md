ITrust's complements for Google's Closure library
================================

Javascript module tools
-------------------------
With [Google Closure library](https://code.google.com/p/closure-library/), it is possible to divide an application into several modules.

**How to build automatically javascript modules ?**
Using [Closure builder](https://developers.google.com/closure/library/docs/closurebuilder), you can build your application into several output files. For this, you have to specify to the *closure compiler* all files included in each plugins:
e.g: *Mod1* includes *file1*, *file2*, *file3* and *Mod2* includes *file4* and *file5*, and has a dependency to *Mod1*.

    (closure_builder)
    --module Mod1:3 \
    --module Mod2:2:Mod1 \
    --module_output_path_prefix build/module_ \
    --js ./file1.js \
    --js ./file2.js \
    --js ./file3.js \
    --js ./file4.js \
    --js ./file5.js \
    
When your application contains a lot of files, that could be boring to list all of them.
Using itrustbuilder, you can write a json file describing your modules like this :

    {
        "MODULES_INFO": {
            "Mod1":[],
            "Mod2":["Mod1"]
        },
        "MODULES_URIS":{
            "Mod1":["mod1.js"],
            "Mod2":["mod2.js"]
        }
    }

And pass it to the `itrustbuilder.py`:

    itrustbuilder.py \
        --root=closure-library/ \
        --root=myproject/ \
        --namespace="mynamespace" \
        --modules_info=myproject/module_info.js

Additionnal parameters can be provided :
 * modules_info_root: Root path for all URIs specified in the given file;
 * modules_info_deps_key: Key used in the file for the deps part;
 * modules_info_uris_key: Key used in the file for the URIs part;
 * use_renaming_map: Provides an existing renaming map file for the compilation (see [Google Closure Stylesheets](https://code.google.com/p/closure-stylesheets/))

The builder will automatically create `--module` flags as you define them in your JSON file. You will get 2 files once the compilation successed: `mod1.js` and `mod2.js`.

**Resolving file dependencies into modules**
Modules loading is managed by [ModuleLoader](http://docs.closure-library.googlecode.com/git/class_goog_module_ModuleLoader.html) and [ModuleManager](http://docs.closure-library.googlecode.com/git/class_goog_module_ModuleManager.html).

    var moduleManager_ = goog.module.ModuleManager.getInstance();
    var moduleLoader_ = new goog.module.ModuleLoader();

    moduleManager_.setLoader(moduleLoader_);
    moduleManager_.setAllModuleInfo(/*modules infos*/);
    
    moduleManager_.setModuleUris(/*modules uris*/);

Usually, have a file containing all modules informations is better. For instance, the following module_info.js:

    goog.provide("myproject.ModuleInfo");

    myproject.ModuleInfo = {
        "MODULES_INFO": {
            "Mod1":[],
            "Mod2":["Mod1"]
        },
        "MODULES_URIS":{
            "Mod1":["mod1/mod1_controller.js", "mod1_init.js"],
            "Mod2":["mod2/mod2_class.js", "mod2_init.js"]
        }
    }

*Note: We use JSON in this object in order to use this same file for the compiler, as explain in the first part.*

In order to "deploy" your modules, you have to specify all files' URIs to the `ModuleManager`. These file will be loaded in the order you give and once all file are loaded, your module is executed. So this chain of dependency is very important !
E.g. your `Mod1` module requires `mod1_controller.js` and `mod1_init.js`. You have to give these URIs to the `setModuleUris` method:

    goog.require('myproject.ModuleInfo');

    ...

    moduleManager_.setModuleUris(myproject.ModuleInfo["MODULES_URIS"]);

When you will load your module, all js file will be retrieved and interpreted.
However, when you compile your application, you obtain one file per modules you defined (See **How to build automatically javascript modules ?** part).
You will have to change your module info file to this : 

    goog.provide("myproject.ModuleInfo");

    myproject.ModuleInfo = {
        "MODULES_INFO": {
            "Mod1":[],
            "Mod2":["Mod1"]
        },
        "MODULES_URIS":{
            "Mod1":["mod1.js"],
            "Mod2":["mod2.js"]
        }
    }

So if you want to work with a compiled and a development version of your application, instead of use `goog.module.ModuleManager` and `goog.module.ModuleLoader`, use `itrust.module.ModuleManager` and `itrust.module.ModuleLoader`. With the module info file just above and these two files, both your compiled and development version will work properly, and the file dependencies will be automatically resolved using the `goog.require()` in your code.
The use of these files are transparent for you and  works as same as closure's file:

    goog.require("itrust.module.ModuleManager");
    goog.require("itrust.module.ModuleLoader");
    goog.require("myproject.ModuleInfo");

    var moduleManager_ = itrust.modules.ModuleManager.getInstance();
    var moduleLoader_ = new itrust.modules.ModuleLoader();

    moduleManager_.setLoader(moduleLoader_);
    moduleManager_.setAllModuleInfo(myproject.ModulesInfo["MODULES_INFO"]);
    
    moduleManager_.setModuleUris(myproject.ModulesInfo["MODULES_URIS"], '../', 'goog/');

The only change is about the `setModuleUris` method: two new optional parameters are available.
 * The root input path: TO FINISH
 * The root output path: TO FINISH
