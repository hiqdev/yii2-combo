/**
 * @link http://hiqdev.com/yii2-combo
 * @copyright Copyright (c) 2015 HiQDev
 * @license http://hiqdev.com/yii2-combo/license
 */

$.fn.select2.amd.define('select2/combo/plugin', [
    'jquery'
], function ($) {
    function Plugin(element, options) {
        this.noextend = 1;
        this.form = $(element);
        this.fields = [];
        this.settings = $.extend({}, options);
        this.init();
        return this;
    }

    Plugin.prototype = {
        init: function () {
            return this;
        },
        /**
         * Registers the element in the combo form handler
         *
         * @param {object} element the element's selector or the jQuery object with the element
         * @param {string} id the type the field (according to the config storage)
         * @param {object=} [options={}] the additional options that will be passed directly to the select2 config
         * @returns {Plugin}
         * @see $.comboConfig
         */
        register: function (element, id, options) {
            options = options !== undefined ? options : {};
            if (typeof element == 'string') {
                element = this.form.find(element);
            }
            var field = $.comboConfig().get({
                'id': id,
                'form': this,
                'select2Options': options,
                'element': element
            });
            this.fields.push({
                id: id,
                type: field.type,
                field: field,
                element: element
            });
            this.update(new Event(element, {force: true}));

            return this;
        },
        setValue: function (type, data) {
            return this.getField(type).setValue(data);
        },
        getData: function (type) {
            var field = this.getField(type);
            if (field === null) return [];

            return field.getData();
        },
        getId: function (type) {
            var data = this.getData(type);
            return !$.isEmptyObject(data) ? data.id : '';
        },
        getValue: function (type) {
            var data = this.getData(type);
            return !$.isEmptyObject(data) ? data.text : '';
        },
        getListeners: function (type) {
            var listeners = [];
            $.each(this.fields, function (k, v) {
                if (v.type == type) {
                    listeners.push(v);
                }
            });
            return listeners;
        },
        isSet: function (type) {
            return this.getData(type).length > 0;
        },
        disable: function (type, clear) {
            if (clear) this.clear(type);
            return this.getField(type).disable();
        },
        enable: function (type, clear) {
            if (clear) this.clear(type);
            return this.getField(type).enable();
        },
        isEnabled: function (type) {
            return this.getField(type).isEnabled();
        },
        isReadonly: function (type) {
            return this.getField(type).isReadonly();
        },
        clear: function (type) {
            return this.getField(type).clear();
        },
        getField: function (type) {
            var result = null;
            $.each(this.fields, function (k, v) {
                if (v.type == type) {
                    result = v.field;
                    return false;
                }
            });
            return result;
        },
        hasField: function (type) {
            return this.getField(type) !== null;
        },
        areSet: function (names, skipMissing) {
            var isSet = true;
            var self = this;
            skipMissing = skipMissing || false;

            if (typeof names === 'string') {
                names = [names];
            }
            $.each(names, function (k, v) {
                if (!isSet) {
                    return false;
                }
                if ($.isFunction(v)) {
                    isSet = v(self);
                    if (typeof(isSet) !== 'boolean') {
                        throw "Closure should return only boolean value!"
                    }
                } else {
                    isSet = self.isSet(v) || (skipMissing && !self.hasField(v));
                }
            });
            return isSet;
        },
        updateAffected: function (event) {
            var _this = this;
            var updated_field = event.element.data('field');

            if (!updated_field.affects) {
                return this;
            }
            if (updated_field.isMultiple()) {
                console.error('Combo does not support affecting for multi-optional input');
            }

            var data = updated_field.getData();
            if ($.isEmptyObject(data)) return this;

            data = data[0];

            $.each(updated_field.affects, function (k, v) {
                var field = _this.getField(k),
                    event = {noAffect: true};

                if ($.isEmptyObject(field) || field.isReadonly()) return true;

                var keys = {};
                if (typeof v === 'string') {
                    keys = {
                        id: field.hasId ? (v + '_' + field.getPk()) : v,
                        value: v
                    };
                } else if ($.isFunction(v)) {
                    keys = v(updated_field);
                } else {
                    keys = v;
                }

                field.setData([{id: data[keys.id], text: data[keys.value]}], event);
            });
            return this;
        },
        /**
         * Updates select2 states, trigger 'update' trigger for each field
         * @param event
         */
        update: function (event) {
            var _this = this;
            var element = event.element;
            var reUpdate = false;

            if (!event.noAffect) {
                this.updateAffected(event);
            }

            $.each(this.fields, function (k, v) {
                if (reUpdate) return false;
                var field = v.field;
                var isActive = true;
                var needsClear = false;

                if (v.element[0] === element[0] && !event.force) return true;

                if (field.isReadonly()) {
                    isActive = false;
                } else if (field.activeWhen) {
                    if ($.isFunction(field.activeWhen)) {
                        isActive = field.activeWhen(field.name, _this);
                    } else {
                        isActive = _this.areSet(field.activeWhen);
                    }
                }

                if (field.clearWhen && !event.noAffect && !field.isReadonly()) {
                    if ($.isFunction(field.clearWhen)) {
                        needsClear = field.clearWhen(field.name, _this);
                    } else {
                        needsClear = !_this.areSet(field.clearWhen, true);
                    }
                    needsClear = needsClear || field.clearWhen.indexOf(element.data('field').type) >= 0;
                }

                if (isActive != _this.isEnabled(field.type) && !field.isReadonly()) {
                    reUpdate = true;
                }
                if (needsClear && _this.isSet(field.type)) {
                    reUpdate = true;
                }

                if (isActive) {
                    _this.enable(field.type);
                } else {
                    _this.disable(field.type, !field.isReadonly());
                }

                if (needsClear) {
                    _this.clear(field.type);
                }

                field.trigger('update', event);
            });

            if (reUpdate) return this.update(event);
        }
    };

    function Event(element, options) {
        this.element = element;
        this.options = $.extend(true, {}, options);
        this.force = this.options.force || false;
        this.noAffect = this.options.noAffect || false;
    }

    return Plugin;
});

$.fn.select2.amd.define('select2/combo/data/hiqAdapter', [
    'select2/data/ajax',
    'select2/utils',
    'jquery'
], function (AjaxData, Utils, $) {
    function HiqDataAdapter ($element, options) {
        HiqDataAdapter.__super__.constructor.call(this, $element, options);

        this._isInitialized = false;
    }

    Utils.Extend(HiqDataAdapter, AjaxData);

    HiqDataAdapter.prototype.queryDeferred = function (params) {
        var deferred = $.Deferred();

        this.query(params, function (results) {
            deferred.resolve(results);
        });

        return deferred;
    };

    HiqDataAdapter.prototype.current = function (callback) {
        if (this._isInitialized) {
            HiqDataAdapter.__super__.current.call(this, callback);

            return;
        }

        var self = this,
            results = [],
            queryValues = [],
            element = this.$element,
            field = element.data('field'),
            value = element.val(),
            isMultiple = field.isMultiple(),
            finalize = function (data) {
                self._isInitialized = true;

                callback(data);
            };

        if (!isMultiple && value !== null) {
            value = [value];
        }
        if (!field.isEnabled() && field.isReadonly()) {
            value = $.map(element.find('option:selected'), function (option) {
                return option.value;
            });
        }
        if (value === null || value.length === 0) {
            finalize(results);
            return;
        }

        $.each(value, function (k, v) {
            if (v !== field.getOption(v).text() || !field.hasId) {
                results.push({
                    id: v,
                    text: field.getOption(v).text()
                });
                return true;
            }

            queryValues.push(v);
        }.bind(this));

        // Values can not be queried in parallel because
        // AjaxDataAdapter will terminate previous query immediately
        // Solution: query one-by-one
        var queryNextValue = function () {
            if (queryValues.length === 0) {
                finalize(results);
                return;
            }

            var pk = field.getPk(),
                filters = {};

            filters[pk] = {format: queryValues.pop()};

            this.queryDeferred({filters: filters}).done(function (values) {
                $.each(values.results, function (k, item) {
                    results.push(item);
                });

                queryNextValue();
            });
        }.bind(this);

        queryNextValue();
    };

    return HiqDataAdapter;
});

$.fn.select2.amd.define('select2/combo/field', [
    'select2/combo/data/hiqAdapter',
    'select2/data/tags',
    'select2/utils',
    'jquery'
], function (HiqDataAdapter, Tags, Utils, $) {
    function Field(config) {
        this.id = null;
        this.noextend = 1;
        this.name = null;
        this.type = null;
        this.form = null;
        this.config = null;
        this.element = null;
        this.activeWhen = null;
        /**
         * The array of fields, cleaning of which makes this field cleared too.
         * @type {array}
         */
        this.clearWhen = null;
        /**
         * The object-array of fields, that may be affected after the current field update
         * The key is the type of the field to be affected
         * For example:
         *
         * ```
         *   {
         *      affects: {
         *          'client': 'client',
         *          'server': function (field) {
         *              return {id: field.id, text: field.text};
         *          }
         *      }
         *   }
         * ```
         * @type {object}
         */
        this.affects = null;

        /**
         * Whether the field has an ID. Used by [[initSelection]]
         * @type {boolean|string}
         */
        this.hasId = true;

        this.select2Options = {
            placeholder: 'Enter a value',
            allowClear: true
        };

        /// Ajax defaults
        if (config.select2Options.ajax) {
            if (config.select2Options.dataAdapter == null) {
                this.select2Options.dataAdapter = HiqDataAdapter;

                if (config.select2Options.tags) {
                    this.select2Options.dataAdapter = Utils.Decorate(this.select2Options.dataAdapter, Tags);
                }
            }
            this.select2Options.ajax = {
                dataType: 'json',
                delay: 200,
                processResults: function (data) {
                    var ret = [];
                    $.each(data, function (k, v) {
                        ret.push(v);
                    });
                    return {results: ret};
                }
            };
        }

        this.events = {
            'select2:unselect': [
                function (e) {
                    if (!$(e.target).data('field').isMultiple()) {
                        $(e.target).data('field').ensureOption('', '');
                    }
                }
            ],
            'select2:select select2:unselect combo:update': [
                function (e) {
                    e.element = $(this);
                    if (e.noAffect) {
                        e.stopPropagation();
                    }
                    return $(this).data('field').form.update(e);
                }
            ],
            'select2:selecting': [
                function (event) {
                    var field = $(event.target).data('field');
                    var data = event.params.args.data;
                    if (field.getPk()) {
                        data.id = data[field.getPk()];
                    } else {
                        data.id = data.text;
                    }
                }
            ]
        };
        this.configure(config);

        this.init = function () {
            return Field.prototype.init.call(this);
        }
    }

    Field.prototype = {
        init: function () {
            var self = this;
            this.element.data('field', this);
            $.each(this.events, function (event, handlers) {
                $.each(handlers, function (k, handler) {
                    self.attachListener(event, handler);
                });
            });
            var options = this.getSelect2Options();
            this.element.select2(options);

            return this;
        },
        /**
         * Generates filters
         * @param fields Acceptable formats:
         *
         * A simple list of attributes
         * ```
         *  ['login', 'client', 'server']
         * ```
         *
         * Array of relations between the returned key and requested field
         * ```
         *  {'login_like': 'hosting/account', 'type': 'type'}
         * ```
         *
         * With custom format
         * ```
         *  {
         *      'server_ids': {
         *          field: 'server/server',
         *          format: function (id, text, field) { return id; }
         *      },
         *      'client_ids': {
         *          field: 'client/client',
         *          format: 'id'
         *      },
         *      'extremely_unusual_filter': {
         *          field: 'login',
         *          format: function (id, text, field) {
         *              return field.form.getValue('someOtherField') == '1';
         *          }
         *      },
         *      'filter_related_non-combo_field': {
         *          format: function (field) {
         *              return field.element.closest('.form').find('input[data-rel="login"]').val();
         *          }
         *      },
         *      'someStaticValue': {
         *          format: 'test'
         *      },
         *      'return': ['id', 'value']
         *  }
         * ```
         *
         * @returns {{}} the object of generated filters
         */
        createFilter: function (fields) {
            var form = this.form;
            var filters = {};
            var _this = this;

            if (!fields.return) fields['return'] = this.select2Options.ajax.return;
            if (!fields.rename) fields['rename'] = this.select2Options.ajax.rename;
            if (this.select2Options.ajax.filter) {
                $.extend(true, fields, this.select2Options.ajax.filter);
            }

            $.each(fields, function (k, v) {
                if (isNaN(parseInt(k)) === false) {
                    k = v;
                }
                if (typeof v === 'string') {
                    v = {field: v};
                } else if ($.isArray(v) || (typeof v === 'object' && v.format === undefined)) {
                    v = {format: v};
                }

                if (v.format === 'id') {
                    v.format = function (id, text) {
                        return id;
                    };
                } else if (typeof v.field !== 'string' && (['string', 'number', 'object'].indexOf(typeof v.format) !== -1 || $.isArray(v.format))) {
                    /// If the result is a static value - just set it and skip all below
                    filters[k] = v.format;
                    return true;
                } else if ($.isFunction(v.format) == false) {
                    v.format = function (id, text) {
                        return text;
                    };
                }

                if (v.field) {
                    var field = form.getField(v.field);
                    if ($.isEmptyObject(field)) return true;
                    var data = field.getData();
                    if (data.length === 0) return true;

                    filters[k] = $.map(data, function (item) {
                        return v.format(item.id, item.text, field);
                    });

                    if (!field.isMultiple()) {
                        filters[k] = filters[k][0];
                    }
                } else {
                    filters[k] = v.format(_this);
                }
            });
            return filters;
        },
        configure: function (config) {
            var self = this;
            $.each(config, function (k, v) {
                if (self[k] !== undefined) {
                    if (typeof self[k] == 'object' && v.noextend === undefined && self[k] !== null) {
                        $.extend(true, self[k], v);
                    } else {
                        self[k] = v;
                    }
                } else if (k.substr(0, 2) == 'on') {
                    var eventName = k.substr(2, 1).toLowerCase() + k.substr(3);
                    if (!$.isArray(v)) {
                        v = [v];
                    }
                    $.each(v, function (k, handler) {
                        if (!self.events[eventName]) self.events[eventName] = [];
                        self.events[eventName].push(handler);
                    });
                } else {
                    throw "Trying to set unknown property " + k;
                }
            });
            return this;
        },
        attachListener: function (event, handler) {
            var element = this.element;
            element.on(event, handler);
            return this;
        },
        /**
         * Returns the Select2 plugin options for the type
         * @returns {object} the Select2 plugin options for the type
         */
        getSelect2Options: function () {
            return this.select2Options;
        },
        getName: function () {
            return this.name;
        },
        getType: function () {
            return this.type;
        },
        getData: function () {
            return this.element.select2('data');
        },
        setData: function (data, triggerChange) {
            var self = this,
                values = [];
            data = data || [];

            $.each(data, function (k, item) {
                var value = item.id || item.text;
                self.ensureOption(value, item.text);
                values.push(value);
            });

            this.setValue(values, triggerChange);
            return this;
        },
        setValue: function (value, triggerChange) {
            this.element.val(value);

            if (triggerChange) {
                var event = {'type': 'change'};
                if (typeof triggerChange === 'object') {
                    event = $.extend(event, triggerChange);
                }

                this.element.trigger(event);
            }

            return true;
        },
        ensureOption: function (value, label) {
            if (value === null || value === undefined) {
                return true;
            }

            if (!this.optionExists(value)) {
                var option = this.buildOption().val(value).text(label || value);
                this.element.append(option);
            }

            return true;
        },
        optionExists: function (value) {
            return this.getOption(value).length > 0;
        },
        getOption: function (value) {
            return this.element.find('option').filter(function () {
                return this.value === value;
            });
        },
        getValue: function () {
            return this.element.select2('val');
        },
        trigger: function (type, event) {
            event.type = type;
            event.element = this.element;

            return this.element.trigger(event);
        },
        disable: function () {
            return this.element.prop('disabled', true);
        },
        enable: function () {
            return this.element.prop('disabled', false);
        },
        isEnabled: function () {
            return this.element.prop('disabled') !== true;
        },
        isReadonly: function () {
            return this.element.attr('readonly');
        },
        clear: function () {
            return this.setValue('', true);
        },
        isEmpty: function () {
            return this.getValue() === '';
        },
        isMultiple: function () {
            return this.element.prop('multiple');
        },
        getPk: function () {
            if (this.hasId === true) {
                return 'id';
            } else if (this.hasId === 'string') {
                return this.hasId;
            } else {
                return false;
            }
        },
        buildOption: function() {
            return $('<option />');
        }
    };

    return Field;
});

$.fn.select2.amd.define('select2/combo/config', [
    'select2/combo/field',
    'jquery'
], function (Field, $) {
    /**
     * The plugin config storage
     *
     * @constructor
     */
    function Plugin() {
        this.init();
    }

    Plugin.prototype = {
        fields: {},
        init: function () {
            return this;
        },
        /**
         * Adds a field behaviors to the config storage.
         *
         * @param {string} id the id of the field
         * @param {object=} config
         * @returns {*}
         */
        add: function (id, config) {
            return this.fields[id] = config;
        },
        /**
         * Returns the requested config by the type or id, may extend the config with the user-defined
         * @param {(string|object)} options
         *    string - returns the stored config for the provided id
         *    object - have to contain the `type` field with the type of the config
         * @returns {*}
         */
        get: function (options) {
            if (typeof options == 'string') {
                options['id'] = options;
            }
            if (!options.id && options.type) {
                options.id = this.findByType(options.type);
            }
            return new Field(this.fields[options.id]).configure(options).init();
        },
        /**
         * Checks whether the requested config type is registered
         * @param {string} type the config type of the select2 field
         * @returns {boolean}
         */
        exists: function (type) {
            return this.fields[type] !== undefined;
        },
        findByType: function (type) {
            var result = false;
            $.each(this.field, function (id, options) {
                if (options.type == type) {
                    result = id;
                    return false;
                }
            });
            return result;
        }
    };

    return Plugin;
});

(function ($, window, document, undefined) {
    var Combo = $.fn.select2.amd.require('select2/combo/plugin'),
        Config = $.fn.select2.amd.require('select2/combo/config');

    $.fn.combo = function (options) {
        if (!$(this).data('plugin_combo')) {
            $(this).data('plugin_combo', new Combo(this, options));
        }

        return $(this).data('plugin_combo');
    };

    $.comboConfig = function (type) {
        return new Config(type);
    };
})(jQuery, window, document);
