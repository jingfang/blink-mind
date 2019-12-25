import { Model, Config, Topic, Block } from '@blink-mind/core';
import debug from 'debug';
import { List, Map } from 'immutable';

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

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var log = debug('plugin:json-serializer');
var DATA_VERSION = '0.0';
function JsonSerializerPlugin() {
    return {
        serializeModel: function (props) {
            var model = props.model, controller = props.controller;
            var obj = {
                rootTopicKey: model.rootTopicKey,
                topics: model.topics
                    .valueSeq()
                    .toArray()
                    .map(function (topic) { return controller.run('serializeTopic', __assign(__assign({}, props), { topic: topic })); }),
                config: controller.run('serializeConfig', __assign(__assign({}, props), { config: model.config })),
                formatVersion: model.formatVersion
            };
            return obj;
        },
        deserializeModel: function (props) {
            var obj = props.obj, controller = props.controller;
            if (obj.formatVersion == null) {
                obj.formatVersion = '0.0';
            }
            var rootTopicKey = obj.rootTopicKey, topics = obj.topics, config = obj.config, formatVersion = obj.formatVersion;
            var model = new Model();
            model = model.merge({
                rootTopicKey: rootTopicKey,
                editorRootTopicKey: rootTopicKey,
                config: controller.run('deserializeConfig', __assign(__assign({}, props), { obj: config, formatVersion: formatVersion })),
                topics: controller.run('deserializeTopics', __assign(__assign({}, props), { obj: topics, formatVersion: formatVersion })),
                formatVersion: DATA_VERSION
            });
            log('deserializeModel', model);
            return model;
        },
        serializeConfig: function (props) {
            var config = props.config;
            return config.toJS();
        },
        deserializeConfig: function (props) {
            var obj = props.obj;
            return new Config(obj);
        },
        serializeTopic: function (props) {
            var topic = props.topic, controller = props.controller;
            return {
                key: topic.key,
                parentKey: topic.parentKey,
                subKeys: topic.subKeys.toArray(),
                collapse: topic.collapse,
                style: topic.style,
                blocks: topic.blocks.map(function (block) {
                    return controller.run('serializeBlock', __assign(__assign({}, props), { block: block }));
                })
            };
        },
        deserializeTopic: function (props) {
            var obj = props.obj, controller = props.controller;
            var key = obj.key, parentKey = obj.parentKey, subKeys = obj.subKeys, blocks = obj.blocks, style = obj.style, collapse = obj.collapse;
            var topic = new Topic();
            topic = topic.merge({
                key: key,
                parentKey: parentKey,
                subKeys: List(subKeys),
                style: style,
                collapse: collapse,
                blocks: controller.run('deserializeBlocks', __assign(__assign({}, props), { obj: blocks }))
            });
            return topic;
        },
        deserializeTopics: function (props) {
            var obj = props.obj, controller = props.controller;
            var topics = Map();
            topics = topics.withMutations(function (topics) {
                obj.forEach(function (topic) {
                    return topics.set(topic.key, controller.run('deserializeTopic', __assign(__assign({}, props), { obj: topic })));
                });
            });
            return topics;
        },
        serializeBlock: function (props) {
            var block = props.block;
            return block.toJS();
        },
        deserializeBlock: function (props) {
            var obj = props.obj;
            return new Block(obj);
        },
        deserializeBlocks: function (props) {
            var obj = props.obj, controller = props.controller;
            var blocks = List();
            blocks = blocks.withMutations(function (blocks) {
                obj.forEach(function (block) {
                    return blocks.push(controller.run('deserializeBlock', __assign(__assign({}, props), { obj: block })));
                });
            });
            return blocks;
        }
    };
}

export { JsonSerializerPlugin };
//# sourceMappingURL=main.es.js.map
