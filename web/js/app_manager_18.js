/**
 * @package manager.js
 * @doc manager.js : Handles DOM resources creation and delivery to clients
 */
var hb = (function (hb) {
    "use strict";
    var _moduleName = "ui:manager/manager.js";
    if(((typeof hb.getLoadedModules==="function"?hb.getLoadedModules():[])).includes(_moduleName)) {
        console.log(_moduleName + " already loaded, skipping");
        return hb;
    }
    hb.ui = (function (hb,$) {
        var _requiredModules = [];

        let _resources = {
            "hdatepicker":null
        };



        /**
         * @doc instanciate available unique resources
         * @returns {object}
         * @private
         */
        let _instanciateUniques = function() {
            let loadedModules = ((typeof hb.getLoadedModules==="function")?hb.getLoadedModules():[]);

            if(loadedModules.includes("ui:HDatePicker/HDatePicker.js")){
                _resources.hdatepicker = new hb.ui.HDatePicker();
            }
        };

        _instanciateUniques();

        /**
         * @module hb/ui/manager
         * @class hb.ui.manager
         */
        hb.ui.manager = {
            /**
             * @doc get requested HBase resource : either a new object or the instanciated one if it's unique
             * @param {string} str
             * @return {object|null}
             */
            get : function (str) {
                if(!(str in _resources)){return null;}
                if(typeof _resources[str] === 'function') {
                    return new _resources[str]();
                }
                return _resources[str];
            },
            /**
             * @doc returns the name of the module
             * @return {string}
             */
            getModuleName : function() {
                return _moduleName;
            },
            /**
             * @doc returns list of required modules and libraries for this module
             * @return {Array}
             */
            getRequiredModules : function () {
                return _requiredModules;
            }
        };
        console.log(_moduleName + " loaded");
        return hb.ui;
    }(hb.util || {}));

    let _loadedModules = ((typeof hb.getLoadedModules==="function")?hb.getLoadedModules():[]);
    _loadedModules.push(_moduleName);
    hb.getLoadedModules = function() {
        return _loadedModules;
    }
    return hb;
}(hb || {}));