import debug from 'debug';
import memoizeOne from 'memoize-one';
import warning from 'tiny-warning';
import { List, Record, Map as Map$1 } from 'immutable';
import isPlainObject from 'is-plain-object';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __values(o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

function CorePlugin(options) {
    if (options === void 0) { options = {}; }
    var _a = options.plugins, plugins = _a === void 0 ? [] : _a;
    return __spread(plugins);
}

var log = debug('core:controller');
function registerPlugin(controller, plugin) {
    if (Array.isArray(plugin)) {
        plugin.forEach(function (p) { return registerPlugin(controller, p); });
        return;
    }
    if (plugin == null) {
        return;
    }
    for (var key in plugin) {
        var fn = plugin[key];
        controller.middleware[key] = controller.middleware[key] || [];
        controller.middleware[key].push(fn);
    }
}
// modified from koa-compose
function compose(middleware) {
    var e_1, _a;
    if (!Array.isArray(middleware))
        throw new TypeError('Middleware stack must be an array!');
    try {
        for (var middleware_1 = __values(middleware), middleware_1_1 = middleware_1.next(); !middleware_1_1.done; middleware_1_1 = middleware_1.next()) {
            var fn = middleware_1_1.value;
            if (typeof fn !== 'function')
                throw new TypeError('Middleware must be composed of functions!');
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (middleware_1_1 && !middleware_1_1.done && (_a = middleware_1.return)) _a.call(middleware_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return function (context, next) {
        // last called middleware #
        var index = -1;
        return dispatch(0);
        function dispatch(i) {
            if (i <= index)
                throw new Error('next() called multiple times');
            index = i;
            var fn = middleware[i];
            if (i === middleware.length)
                fn = next;
            if (!fn)
                return null;
            try {
                return fn(context, dispatch.bind(null, i + 1));
            }
            catch (err) {
                throw err;
            }
        }
    };
}
var Controller = /** @class */ (function () {
    function Controller(options) {
        if (options === void 0) { options = {}; }
        var _a = options.diagram, diagram = _a === void 0 ? this : _a, _b = options.plugins, plugins = _b === void 0 ? [] : _b, onChange = options.onChange, readOnly = options.readOnly;
        this.diagram = diagram;
        this.readOnly = readOnly;
        this.onChange = onChange;
        this.middleware = new Map();
        var corePlugin = CorePlugin({ plugins: plugins });
        registerPlugin(this, corePlugin);
    }
    Controller.prototype.run = function (key) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var middleware = this.middleware;
        var fns = middleware[key] || [];
        warning(fns.length !== 0, "the middleware function " + key + " is not found!");
        var composedFn = memoizeOne(compose)(fns);
        // @ts-ignore
        return composedFn.apply(void 0, __spread(args));
    };
    Controller.prototype.change = function (model) {
        this.onChange(model);
    };
    return Controller;
}());

var defaultBlockRecord = {
    type: null,
    key: null,
    data: null
};
var Block = /** @class */ (function (_super) {
    __extends(Block, _super);
    function Block() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Block.prototype, "data", {
        get: function () {
            return this.get('data');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Block.prototype, "type", {
        get: function () {
            return this.get('type');
        },
        enumerable: true,
        configurable: true
    });
    Block.create = function (obj) {
        return new Block(obj);
    };
    Block.createList = function (obj) {
        if (List.isList(obj) || Array.isArray(obj)) {
            // @ts-ignore
            return List(obj.map(Block.create));
        }
        throw new Error("Block.createList only accepts Array or List, but you passed it: " + obj);
    };
    return Block;
}(Record(defaultBlockRecord)));

var defaultTheme = {
    name: 'default',
    randomColor: true,
    background: 'rgb(57,60,65)',
    highlightColor: '#50C9CE',
    marginH: 60,
    marginV: 20,
    contentStyle: {
        lineHeight: '1.5'
    },
    linkStyle: {
        lineRadius: 5,
        lineType: 'curve',
        lineWidth: 3
    },
    rootTopic: {
        contentStyle: {
            fontSize: '34px',
            borderRadius: '35px',
            padding: '16px 18px 16px 18px'
        },
        subLinkStyle: {
            lineType: 'curve',
            lineWidth: 3,
            lineColor: 'rgb(113, 203, 45)'
        }
    },
    primaryTopic: {
        contentStyle: {
            borderWidth: '1px',
            borderStyle: 'solid',
            borderRadius: '20px',
            fontSize: '17px',
            padding: '10px 15px 10px 15px'
        },
        subLinkStyle: {
            lineType: 'curve',
            lineWidth: 3,
            lineColor: 'rgb(113, 203, 45)'
        }
    },
    normalTopic: {
        contentStyle: {
            border: '1px solid #e8eaec',
            borderRadius: '20px',
            fontSize: '17px',
            padding: '4px 10px'
        },
        subLinkStyle: {
            lineType: 'curve',
            lineWidth: 3,
            lineColor: 'white'
        }
    }
};

var TopicDirection = {
    LEFT: 'L',
    RIGHT: 'R',
    BOTTOM: 'B',
    MAIN: 'M' // root
};
var DiagramLayoutType;
(function (DiagramLayoutType) {
    DiagramLayoutType[DiagramLayoutType["LEFT_TO_RIGHT"] = 0] = "LEFT_TO_RIGHT";
    DiagramLayoutType[DiagramLayoutType["RIGHT_TO_LEFT"] = 1] = "RIGHT_TO_LEFT";
    DiagramLayoutType[DiagramLayoutType["LEFT_AND_RIGHT"] = 2] = "LEFT_AND_RIGHT";
    DiagramLayoutType[DiagramLayoutType["TOP_TO_BOTTOM"] = 3] = "TOP_TO_BOTTOM";
})(DiagramLayoutType || (DiagramLayoutType = {}));
var TopicVisualLevel = {
    ROOT: 0,
    PRIMARY: 1,
    NORMAL: 2
};
var BlockType = {
    CONTENT: 'CONTENT',
    DESC: 'DESC'
};
var FocusMode = {
    NORMAL: 'NORMAL',
    EDITING_CONTENT: 'EDITING_CONTENT',
    EDITING_DESC: 'EDITING_DESC',
    SHOW_POPUP: 'SHOW_POPUP',
    DRAGGING: 'DRAGGING'
};
var TopicRelationship = {
    ANCESTOR: 'ANCESTOR',
    DESCENDANT: 'DESCENDANT',
    SIBLING: 'SIBLING',
    NONE: 'NONE'
};
var OpType = {
    TOGGLE_COLLAPSE: 'TOGGLE_COLLAPSE',
    ADD_CHILD: 'ADD_CHILD',
    ADD_SIBLING: 'ADD_SIBLING',
    DELETE_TOPIC: 'DELETE_TOPIC',
    FOCUS_TOPIC: 'FOCUS_TOPIC',
    SET_STYLE: 'SET_STYLE',
    SET_TOPIC_CONTENT: 'SET_TOPIC_CONTENT',
    SET_TOPIC_DESC: 'SET_TOPIC_DESC',
    START_EDITING_CONTENT: 'START_EDITING_CONTENT',
    START_EDITING_DESC: 'START_EDITING_DESC',
    DRAG_AND_DROP: 'DRAG_AND_DROP',
    SET_EDITOR_ROOT: 'SET_EDITOR_ROOT'
};

var defaultConfigRecord = {
    readOnly: false,
    allowUndo: true,
    layoutDir: DiagramLayoutType.LEFT_AND_RIGHT,
    theme: defaultTheme
};
var Config = /** @class */ (function (_super) {
    __extends(Config, _super);
    function Config() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Config.prototype, "layoutDir", {
        get: function () {
            return this.get('layoutDir');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "readOnly", {
        get: function () {
            return this.get('readOnly');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "allowUndo", {
        get: function () {
            return this.get('allowUndo');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "theme", {
        get: function () {
            return this.get('theme');
        },
        enumerable: true,
        configurable: true
    });
    Config.fromJSON = function (obj) {
        return new Config(obj);
    };
    return Config;
}(Record(defaultConfigRecord)));

/**
 * Data.
 *
 * This isn't an immutable record, it's just a thin wrapper around `Map` so that
 * we can allow for more convenient creation.
 *
 * @type {Object}
 */
var Data = /** @class */ (function () {
    function Data() {
    }
    /**
     * Create a new `Data` with `attrs`.
     *
     * @param {Object|Map} attrs
     * @return {Data} data
     */
    Data.create = function (attrs) {
        if (attrs === void 0) { attrs = {}; }
        if (Map$1.isMap(attrs)) {
            return attrs;
        }
        if (isPlainObject(attrs)) {
            return Data.fromJSON(attrs);
        }
        throw new Error("`Data.create` only accepts objects or maps, but you passed it: " + attrs);
    };
    /**
     * Create a `Data` from a JSON `object`.
     *
     * @param {Object} object
     * @return {Data}
     */
    Data.fromJSON = function (object) {
        return Map$1(object);
    };
    return Data;
}());

function createKey() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0, v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

var defaultTopicRecord = {
    key: null,
    parentKey: null,
    collapse: false,
    subKeys: null,
    blocks: null,
    relations: null,
    style: null
};
var Topic = /** @class */ (function (_super) {
    __extends(Topic, _super);
    function Topic() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Topic.prototype, "key", {
        get: function () {
            return this.get('key');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Topic.prototype, "parentKey", {
        get: function () {
            return this.get('parentKey');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Topic.prototype, "collapse", {
        get: function () {
            return this.get('collapse');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Topic.prototype, "subKeys", {
        get: function () {
            return this.get('subKeys');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Topic.prototype, "blocks", {
        get: function () {
            return this.get('blocks');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Topic.prototype, "relations", {
        get: function () {
            return this.get('relations');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Topic.prototype, "style", {
        get: function () {
            return this.get('style');
        },
        enumerable: true,
        configurable: true
    });
    Topic.prototype.getBlock = function (type) {
        var index = this.blocks.findIndex(function (b) { return b.type === type; });
        if (index === -1)
            return { index: index, block: null };
        return { index: index, block: this.blocks.get(index) };
    };
    Topic.fromJSON = function (obj) {
        var key = obj.key, _a = obj.parentKey, parentKey = _a === void 0 ? null : _a, blocks = obj.blocks, _b = obj.subKeys, subKeys = _b === void 0 ? [] : _b, _c = obj.collapse, collapse = _c === void 0 ? false : _c;
        return new Topic({
            key: key,
            parentKey: parentKey,
            collapse: collapse,
            subKeys: List(subKeys),
            blocks: Block.createList(blocks)
        });
    };
    Topic.create = function (_a) {
        var key = _a.key, _b = _a.parentKey, parentKey = _b === void 0 ? null : _b, _c = _a.content, content = _c === void 0 ? '' : _c, _d = _a.subKeys, subKeys = _d === void 0 ? [] : _d, _e = _a.collapse, collapse = _e === void 0 ? false : _e;
        var block = Block.create({
            type: BlockType.CONTENT,
            data: content,
            key: null
        });
        var blocks = List([block]);
        return new Topic({
            key: key,
            parentKey: parentKey,
            blocks: blocks,
            subKeys: List(subKeys),
            collapse: collapse
        });
    };
    return Topic;
}(Record(defaultTopicRecord)));

var defaultModelRecord = {
    topics: Map$1(),
    data: null,
    config: null,
    rootTopicKey: null,
    editorRootTopicKey: null,
    focusKey: null,
    focusMode: null,
    version: null
};
var Model = /** @class */ (function (_super) {
    __extends(Model, _super);
    function Model() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Model.isModel = function (obj) {
        return obj instanceof Model;
    };
    Model.create = function (attrs) {
        if (attrs === void 0) { attrs = null; }
        if (attrs == null)
            return Model.createEmpty();
        if (Model.isModel(attrs)) {
            return attrs;
        }
        if (isPlainObject(attrs)) {
            return Model.fromJSON(attrs);
        }
        throw new Error("`Value.create` only accepts objects or values, but you passed it: " + attrs);
    };
    Model.createEmpty = function () {
        var model = new Model();
        var rootTopic = Topic.create({ key: createKey() });
        return model
            .update('topics', function (topics) { return topics.set(rootTopic.key, rootTopic); })
            .set('rootTopicKey', rootTopic.key);
    };
    Model.fromJSON = function (object) {
        var model = new Model();
        var _a = object.data, data = _a === void 0 ? {} : _a, _b = object.topics, topics = _b === void 0 ? [] : _b, _c = object.config, config = _c === void 0 ? {} : _c, rootTopicKey = object.rootTopicKey;
        var editorRootTopicKey = object.editorRootTopicKey;
        if (editorRootTopicKey === undefined)
            editorRootTopicKey = rootTopicKey;
        model = model.merge({
            rootTopicKey: rootTopicKey,
            editorRootTopicKey: editorRootTopicKey
        });
        model = model.withMutations(function (model) {
            topics.forEach(function (topic) {
                model.update('topics', function (topics) {
                    return topics.set(topic.key, Topic.fromJSON(topic));
                });
            });
            model.set('config', Config.fromJSON(config));
            model.set('data', Data.fromJSON(data));
        });
        return model;
    };
    Model.prototype.toJS = function () {
        var obj = {
            rootTopicKey: this.rootTopicKey,
            topics: Object.values(this.topics.toJS()),
            config: this.config,
            data: this.data
        };
        return obj;
    };
    Object.defineProperty(Model.prototype, "topics", {
        get: function () {
            return this.get('topics');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "config", {
        get: function () {
            return this.get('config');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "version", {
        get: function () {
            return this.get('version');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "rootTopicKey", {
        get: function () {
            return this.get('rootTopicKey');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "editorRootTopicKey", {
        get: function () {
            return this.get('editorRootTopicKey');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "focusKey", {
        get: function () {
            return this.get('focusKey');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "focusMode", {
        get: function () {
            return this.get('focusMode');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "editingContentKey", {
        get: function () {
            return this.focusMode === FocusMode.EDITING_CONTENT ? this.focusKey : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "editingDescKey", {
        get: function () {
            return this.focusMode === FocusMode.EDITING_DESC ? this.focusKey : null;
        },
        enumerable: true,
        configurable: true
    });
    Model.prototype.getTopic = function (key) {
        return this.topics.get(key);
    };
    Model.prototype.getParentTopic = function (key) {
        var topic = this.getTopic(key);
        return topic.parentKey ? this.getTopic(topic.parentKey) : null;
    };
    Model.prototype.getTopicVisualLevel = function (key) {
        var topic = this.getTopic(key);
        var level = 0;
        while (topic && topic.key !== this.editorRootTopicKey) {
            level++;
            topic = this.getParentTopic(topic.key);
        }
        return level;
    };
    Object.defineProperty(Model.prototype, "rootTopic", {
        get: function () {
            return this.getTopic(this.rootTopicKey);
        },
        enumerable: true,
        configurable: true
    });
    return Model;
}(Record(defaultModelRecord)));

function getAllSubTopicKeys(model, topicKey) {
    var item = model.getTopic(topicKey);
    var res = [];
    if (item.subKeys.size > 0) {
        var subKeys = item.subKeys.toArray();
        res.push.apply(res, __spread(subKeys));
        res = subKeys.reduce(function (acc, key) {
            acc.push.apply(acc, __spread(getAllSubTopicKeys(model, key)));
            return acc;
        }, res);
    }
    return res;
}
function getRelationship(model, srcKey, dstKey) {
    var srcTopic = model.getTopic(srcKey);
    var dstTopic = model.getTopic(dstKey);
    if (srcTopic && dstTopic) {
        if (srcTopic.parentKey == dstTopic.parentKey)
            return TopicRelationship.SIBLING;
        var pTopic = srcTopic;
        while (pTopic.parentKey) {
            if (pTopic.parentKey === dstTopic.key)
                return TopicRelationship.DESCENDANT;
            pTopic = model.getParentTopic(pTopic.key);
        }
        pTopic = dstTopic;
        while (pTopic.parentKey) {
            if (pTopic.parentKey === srcTopic.key)
                return TopicRelationship.ANCESTOR;
            pTopic = model.getParentTopic(pTopic.key);
        }
    }
    return TopicRelationship.NONE;
}

var log$1 = debug('modifier');
function toggleCollapse(_a) {
    var model = _a.model, topicKey = _a.topicKey;
    var topic = model.getTopic(topicKey);
    if (topic && topic.subKeys.size !== 0) {
        topic = topic.merge({
            collapse: !topic.collapse
        });
        model = model.updateIn(['topics', topic.key, 'collapse'], function (collapse) { return !collapse; });
    }
    return model;
}
function focusTopic(_a) {
    var model = _a.model, topicKey = _a.topicKey, focusMode = _a.focusMode;
    log$1('focus topic');
    if (topicKey !== model.focusKey)
        model = model.set('focusKey', topicKey);
    if (focusMode !== model.focusMode)
        model = model.set('focusMode', focusMode);
    return model;
}
function addChild(_a) {
    var model = _a.model, topicKey = _a.topicKey;
    log$1('addChild:', topicKey);
    var topic = model.getTopic(topicKey);
    if (topic) {
        var child_1 = Topic.create({ key: createKey(), parentKey: topic.key });
        topic = topic
            .set('collapse', false)
            .update('subKeys', function (subKeys) { return subKeys.push(child_1.key); });
        model = model.update('topics', function (topics) {
            return topics.set(topicKey, topic).set(child_1.key, child_1);
        });
        return focusTopic({
            model: model,
            topicKey: child_1.key,
            focusMode: FocusMode.EDITING_CONTENT
        });
    }
    return model;
}
function addSibling(_a) {
    var model = _a.model, topicKey = _a.topicKey;
    if (topicKey === model.rootTopicKey)
        return model;
    var topic = model.getTopic(topicKey);
    if (topic) {
        var pItem = model.getTopic(topic.parentKey);
        var idx_1 = pItem.subKeys.indexOf(topicKey);
        var sibling_1 = Topic.create({ key: createKey(), parentKey: pItem.key });
        model = model
            .update('topics', function (topics) { return topics.set(sibling_1.key, sibling_1); })
            .updateIn(['topics', pItem.key, 'subKeys'], function (subKeys) {
            return subKeys.insert(idx_1 + 1, sibling_1.key);
        });
        return focusTopic({
            model: model,
            topicKey: sibling_1.key,
            focusMode: FocusMode.EDITING_CONTENT
        });
    }
    return model;
}
function deleteTopic(_a) {
    var model = _a.model, topicKey = _a.topicKey;
    if (topicKey === model.rootTopicKey)
        return model;
    var item = model.getTopic(topicKey);
    if (item) {
        model = model.withMutations(function (m) {
            m.update('topics', function (topics) {
                topics = topics.delete(topicKey);
                var deleteKeys = getAllSubTopicKeys(model, topicKey);
                topics = topics.withMutations(function (t) {
                    deleteKeys.forEach(function (dKey) {
                        t.delete(dKey);
                    });
                });
                return topics;
            });
            m.updateIn(['topics', item.parentKey, 'subKeys'], function (subKeys) {
                return subKeys.delete(subKeys.indexOf(topicKey));
            });
            if (m.focusKey === topicKey)
                m.set('focusKey', null).set('focusMode', null);
        });
    }
    return model;
}
function setContent(_a) {
    var model = _a.model, topicKey = _a.topicKey, data = _a.data;
    var topic = model.getTopic(topicKey);
    if (topic) {
        var _b = topic.getBlock(BlockType.CONTENT), index = _b.index, block = _b.block;
        if (block.data !== data) {
            model = model.updateIn(['topics', topicKey, 'blocks', index, 'data'], function (dt) { return data; });
        }
        return focusTopic({
            model: model,
            topicKey: topicKey,
            focusMode: FocusMode.EDITING_CONTENT
        });
    }
    return model;
}
function setStyle(_a) {
    var model = _a.model, topicKey = _a.topicKey, style = _a.style;
    var topic = model.getTopic(topicKey);
    if (topic) {
        if (style !== topic.style) {
            model = model.updateIn(['topics', topicKey, 'style'], function (s) { return style; });
        }
    }
    return model;
}
function setDesc(_a) {
    var model = _a.model, topicKey = _a.topicKey, data = _a.data;
    var topic = model.getTopic(topicKey);
    if (topic) {
        var _b = topic.getBlock(BlockType.DESC), index = _b.index, block = _b.block;
        if (index === -1) {
            model = model.updateIn(['topics', topicKey, 'blocks'], function (blocks) {
                return blocks.push(Block.create({
                    type: BlockType.DESC,
                    data: data
                }));
            });
        }
        else {
            if (block.data !== data) {
                model = model.updateIn(['topics', topicKey, 'blocks', index, 'data'], function (dt) { return data; });
            }
        }
        return focusTopic({
            model: model,
            topicKey: topicKey,
            focusMode: FocusMode.EDITING_DESC
        });
    }
    return model;
}
function setTheme(_a) {
    var model = _a.model, theme = _a.theme;
    model = model.setIn(['config', 'theme'], theme);
    return model;
}
function setLayoutDir(_a) {
    var model = _a.model, layoutDir = _a.layoutDir;
    if (model.config.layoutDir === layoutDir)
        return model;
    model = model.setIn(['config', 'layoutDir'], layoutDir);
    return model;
}
function setEditorRootTopicKey(_a) {
    var model = _a.model, topicKey = _a.topicKey;
    if (model.editorRootTopicKey !== topicKey)
        model = model.set('editorRootTopicKey', topicKey);
    if (model.getTopic(topicKey).collapse)
        model = model.setIn(['topics', topicKey, 'collapse'], false);
    return model;
}
var index = {
    addChild: addChild,
    addSibling: addSibling,
    toggleCollapse: toggleCollapse,
    focusTopic: focusTopic,
    deleteTopic: deleteTopic,
    setContent: setContent,
    setDesc: setDesc,
    setStyle: setStyle,
    setTheme: setTheme,
    setLayoutDir: setLayoutDir,
    setEditorRootTopicKey: setEditorRootTopicKey
};

var index$1 = {
    Block: Block,
    Config: Config,
    Model: Model,
    Topic: Topic,
    Data: Data
};

export { Block, BlockType, Config, Controller, Data, DiagramLayoutType, FocusMode, Model, index as ModelModifier, index as Modifiers, OpType, Topic, TopicDirection, TopicRelationship, TopicVisualLevel, defaultTheme, getAllSubTopicKeys, getRelationship, index$1 as models };
//# sourceMappingURL=main.es.js.map
