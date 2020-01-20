import { PureComponent, createElement, Component, Fragment } from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import styled, { css, ThemeProvider } from 'styled-components';
import debug from 'debug';
import { OpType, FocusMode, getRelationship, TopicRelationship, TopicDirection, DiagramLayoutType, ModelModifier, BlockType, TopicVisualLevel, Controller } from '@blink-mind/core';
import '@blink-mind/icons';
import { Breadcrumbs, PopoverPosition, Breadcrumb, Tooltip, Dialog, Classes, MenuItem, Divider, Button, Popover, NumericInput, InputGroup, ContextMenuTarget, Menu, PopoverInteractionKind, Drawer, Hotkey, Hotkeys, HotkeysTarget } from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';
import memoizeOne from 'memoize-one';
import SimpleTextEditorPlugin from '@blink-mind/plugin-simple-text-editor';
import { Stack, List } from 'immutable';
import { SketchPicker } from 'react-color';
import { Select } from '@blueprintjs/select';
import cx from 'classnames';
import { isEqual } from 'lodash';

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

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
}

var BaseWidget = /** @class */ (function (_super) {
    __extends(BaseWidget, _super);
    function BaseWidget(props) {
        return _super.call(this, props) || this;
    }
    BaseWidget.prototype.operation = function (opType, arg) {
        this.props.controller.run('operation', __assign({ opType: opType }, arg));
    };
    BaseWidget.prototype.run = function (name, arg) {
        this.props.controller.run(name, arg);
    };
    Object.defineProperty(BaseWidget.prototype, "topic", {
        get: function () {
            return this.props.model.getTopic(this.props.topicKey);
        },
        enumerable: true,
        configurable: true
    });
    return BaseWidget;
}(PureComponent));

var log = debug('node:drag-scroll-widget');
var DragScrollView = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  position: relative;\n  width: 100%;\n  height: 100%;\n  overflow: scroll;\n"], ["\n  position: relative;\n  width: 100%;\n  height: 100%;\n  overflow: scroll;\n"])));
var DragScrollContent = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  position: relative;\n  width: max-content;\n"], ["\n  position: relative;\n  width: max-content;\n"])));
var DragScrollWidget = /** @class */ (function (_super) {
    __extends(DragScrollWidget, _super);
    function DragScrollWidget(props) {
        var _this = _super.call(this, props) || this;
        _this.contentResizeCallback = function (entries, observer) {
            if (_this.oldContentRect) {
                var widgetStyle = {
                    width: _this.content.clientWidth + _this.viewBox.clientWidth * 2,
                    height: _this.content.clientHeight + _this.viewBox.clientHeight * 2
                };
                _this.bigView.style.width = widgetStyle.width + 'px';
                _this.bigView.style.height = widgetStyle.height + 'px';
            }
            _this.oldContentRect = entries[0].contentRect;
        };
        _this.contentResizeObserver = new ResizeObserver(_this.contentResizeCallback);
        _this.contentRef = function (ref) {
            if (ref) {
                _this.content = ref;
                _this.contentResizeObserver.observe(_this.content);
            }
        };
        _this.viewBoxRef = function (ref) {
            if (ref) {
                _this.viewBox = ref;
                _this.setViewBoxScroll(_this.viewBox.clientWidth, _this.viewBox.clientHeight);
            }
        };
        _this.bigViewRef = function (ref) {
            if (ref) {
                _this.bigView = ref;
            }
        };
        _this.setWidgetStyle = function () {
            if (_this.content && _this.viewBox && _this.bigView) {
                _this.bigView.style.width =
                    (_this.content.clientWidth + _this.viewBox.clientWidth) * 2 + 'px';
                _this.bigView.style.height =
                    (_this.content.clientHeight + _this.viewBox.clientHeight) * 2 + 'px';
                _this.content.style.left = _this.viewBox.clientWidth + 'px';
                _this.content.style.top = _this.viewBox.clientHeight + 'px';
            }
        };
        _this.setViewBoxScroll = function (left, top) {
            log("setViewBoxScroll " + left + " " + top);
            if (_this.viewBox) {
                _this.viewBox.scrollLeft = left;
                _this.viewBox.scrollTop = top;
            }
        };
        _this.setViewBoxScrollDelta = function (deltaLeft, deltaTop) {
            log("setViewBoxScrollDelta " + deltaLeft + " " + deltaTop);
            if (_this.viewBox) {
                _this.viewBox.scrollLeft += deltaLeft;
                _this.viewBox.scrollTop += deltaTop;
            }
        };
        _this.onMouseDown = function (e) {
            // log('Drag Scroll onMouseDown');
            // log(e.nativeEvent.target);
            // mouseKey 表示鼠标按下那个键才可以进行拖动，左键或者右键
            // needKeyPressed 为了支持是否需要按下ctrl键，才可以进行拖动
            // canDragFunc是一个函数，它是为了支持使用者以传入函数的方式，这个函数的返回值表示当前的内容是否可以被拖拽而移动
            var _a = _this.props, mouseKey = _a.mouseKey, needKeyPressed = _a.needKeyPressed, canDragFunc = _a.canDragFunc;
            if (canDragFunc && !canDragFunc())
                return;
            if ((e.button === 0 && mouseKey === 'left') ||
                (e.button === 2 && mouseKey === 'right')) {
                if (needKeyPressed) {
                    if (!e.ctrlKey)
                        return;
                }
                _this._lastCoordX = _this.viewBox.scrollLeft + e.nativeEvent.clientX;
                _this._lastCoordY = _this.viewBox.scrollTop + e.nativeEvent.clientY;
                window.addEventListener('mousemove', _this.onMouseMove);
                window.addEventListener('mouseup', _this.onMouseUp);
                // this.viewBox.addEventListener('mousemove', this.onMouseMove);
                // this.viewBox.addEventListener('mouseup', this.onMouseUp);
            }
        };
        _this.onMouseUp = function (e) {
            window.removeEventListener('mousemove', _this.onMouseMove);
            window.removeEventListener('mouseup', _this.onMouseUp);
            // this.viewBox.removeEventListener('mousemove', this.onMouseMove);
            // this.viewBox.removeEventListener('mouseup', this.onMouseUp);
        };
        _this.onMouseMove = function (e) {
            _this.viewBox.scrollLeft = _this._lastCoordX - e.clientX;
            _this.viewBox.scrollTop = _this._lastCoordY - e.clientY;
            // log(`onMouseMove ${this.viewBox.scrollLeft} ${this.viewBox.scrollTop}`);
        };
        _this.handleContextMenu = function (e) {
            e.preventDefault();
        };
        _this.state = {
            widgetStyle: {
                width: '10000px',
                height: '10000px'
            }
        };
        return _this;
    }
    DragScrollWidget.prototype.componentDidMount = function () {
        this.setWidgetStyle();
        document.addEventListener('contextmenu', this.handleContextMenu);
    };
    DragScrollWidget.prototype.componentWillUnmount = function () {
        document.removeEventListener('contextmenu', this.handleContextMenu);
    };
    DragScrollWidget.prototype.render = function () {
        return (createElement(DragScrollView, { ref: this.viewBoxRef, onMouseDown: this.onMouseDown },
            createElement("div", { style: this.state.widgetStyle, ref: this.bigViewRef },
                createElement(DragScrollContent, { ref: this.contentRef, style: this.state.contentStyle }, this.props.children(this.setViewBoxScroll, this.setViewBoxScrollDelta)))));
    };
    DragScrollWidget.defaultProps = {
        mouseKey: 'left',
        needKeyPressed: false
    };
    return DragScrollWidget;
}(Component));
var templateObject_1, templateObject_2;

var SaveRef = /** @class */ (function (_super) {
    __extends(SaveRef, _super);
    function SaveRef() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.getRef = function (name) {
            return _this[name];
        };
        _this.saveRef = function (name) {
            return function (node) {
                if (node) {
                    _this[name] = node;
                    _this.fireListener(name, node);
                }
            };
        };
        _this.observers = new Map();
        _this.fireListener = function (name, ref) {
            var e_1, _a;
            if (_this.observers.has(name)) {
                var listeners = _this.observers.get(name);
                try {
                    for (var listeners_1 = __values(listeners), listeners_1_1 = listeners_1.next(); !listeners_1_1.done; listeners_1_1 = listeners_1.next()) {
                        var listener = listeners_1_1.value;
                        listener(name, ref);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (listeners_1_1 && !listeners_1_1.done && (_a = listeners_1.return)) _a.call(listeners_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        };
        _this.registerRefListener = function (name, listener) {
            if (!_this.observers.has(name)) {
                _this.observers.set(name, [listener]);
            }
            else {
                _this.observers.get(name).push(listener);
            }
        };
        return _this;
    }
    SaveRef.prototype.render = function () {
        return this.props.children(this.saveRef, this.getRef, this.registerRefListener.bind(this));
    };
    return SaveRef;
}(Component));

var Flex = styled.div(templateObject_1$1 || (templateObject_1$1 = __makeTemplateObject(["\n  display: flex;\n  align-items: ", ";\n"], ["\n  display: flex;\n  align-items: ", ";\n"])), function (props) { return props.alignItems; });
var Margin = styled.div(templateObject_2$1 || (templateObject_2$1 = __makeTemplateObject(["\n  margin: ", ";\n"], ["\n  margin: ", ";\n"])), function (props) { return props.margin; });
var ShowMenuIcon = styled.a(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  font-size: 20px !important;\n"], ["\n  font-size: 20px !important;\n"])));
var IconBg = styled.div(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  padding: 5px;\n  cursor: pointer;\n"], ["\n  padding: 5px;\n  cursor: pointer;\n"])));
var CloseIcon = styled.div(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n  position: absolute;\n  right: 5px;\n  top: 5px;\n  cursor: pointer;\n  &:hover {\n    color: #1ea7fd;\n  }\n"], ["\n  position: absolute;\n  right: 5px;\n  top: 5px;\n  cursor: pointer;\n  &:hover {\n    color: #1ea7fd;\n  }\n"])));
var Title = styled.div(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n  height: 16px;\n"], ["\n  height: 16px;\n"])));
var templateObject_1$1, templateObject_2$1, templateObject_3, templateObject_4, templateObject_5, templateObject_6;

var IconName = {
    SHOW_MENU: 'show-menu',
    CLOSE: 'close',
    COLOR_PICKER: 'color-picker',
    NOTES: 'notes'
};
function iconClassName(name) {
    return "icon iconfont bm-" + name;
}
function Icon(iconName) {
    return createElement("span", { className: iconClassName(iconName) });
}

function contentRefKey(key) {
    return "content-" + key;
}
function topicRefKey(key) {
    return "topic-" + key;
}
function linksRefKey(key) {
    return "links-" + key;
}
function linksSvgRefKey(key) {
    return "links-svg-" + key;
}
function collapseRefKey(key) {
    return "collapse-" + key;
}
var DIAGRAM_ROOT_KEY = 'DIAGRAM-ROOT';

var cancelEvent = function (e) {
    e.stopPropagation();
};

function getLinkKey(fromKey, toKey) {
    return "link-" + fromKey + "-" + toKey;
}
function centerY(rect) {
    return (rect.top + rect.bottom) / 2;
}
function centerX(rect) {
    return (rect.left + rect.right) / 2;
}
function centerPointX(p1, p2) {
    return (p1.x + p2.x) / 2;
}
function centerPointY(p1, p2) {
    return (p1.y + p2.y) / 2;
}

var log$1 = debug('node:topic-drop-effect');
var DropEffectSvg = styled.svg(templateObject_1$2 || (templateObject_1$2 = __makeTemplateObject(["\n  width: 100%;\n  height: 100%;\n  position: absolute;\n  left: 0;\n  top: 0;\n  z-index: 2;\n  pointer-events: none;\n"], ["\n  width: 100%;\n  height: 100%;\n  position: absolute;\n  left: 0;\n  top: 0;\n  z-index: 2;\n  pointer-events: none;\n"])));
var TopicDropEffect = /** @class */ (function (_super) {
    __extends(TopicDropEffect, _super);
    function TopicDropEffect() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            content: null
        };
        return _this;
    }
    TopicDropEffect.prototype.layout = function () {
        var props = this.props;
        var _a = this.props, getRef = _a.getRef, model = _a.model, controller = _a.controller;
        var targetProps = controller.run('getDragTargetProps', props);
        var key = targetProps.key, dropDir = targetProps.dropDir;
        log$1('layout', dropDir);
        if (key === null) {
            this.setState({
                content: null
            });
            return;
        }
        var dropAreaRefKey;
        if (dropDir === 'in') {
            dropAreaRefKey = contentRefKey(key);
        }
        else {
            dropAreaRefKey = "dropArea-" + dropDir + "-" + key;
        }
        var contentRect = getRef(dropAreaRefKey).getBoundingClientRect();
        var svgRect = getRef('svg-drop-effect').getBoundingClientRect();
        var padding = 3;
        var x = contentRect.left - svgRect.left - padding;
        var y = contentRect.top - svgRect.top - padding;
        var width = contentRect.width + 2 * padding;
        var height = contentRect.height + 2 * padding;
        this.setState({
            content: (createElement("g", null,
                createElement("rect", { x: x, y: y, width: width, height: height, fill: "none", stroke: model.config.theme.highlightColor, strokeDasharray: "5,5", strokeWidth: 2 })))
        });
    };
    TopicDropEffect.prototype.render = function () {
        var saveRef = this.props.saveRef;
        return (createElement(DropEffectSvg, { ref: saveRef('svg-drop-effect') }, this.state.content));
    };
    return TopicDropEffect;
}(BaseWidget));
var templateObject_1$2;

var log$2 = debug('plugin:drag-and-drop');
var DropArea = styled.div(templateObject_1$3 || (templateObject_1$3 = __makeTemplateObject(["\n  height: ", ";\n  width: 100%;\n  margin: 5px 0px;\n"], ["\n  height: ", ";\n  width: 100%;\n  margin: 5px 0px;\n"])), function (props) { return props.height + "px"; });
var DropEffects = styled.svg(templateObject_2$2 || (templateObject_2$2 = __makeTemplateObject([""], [""])));
function DragAndDrop() {
    var dragTargetKey = null;
    var dragTargetDir = null;
    return {
        renderTopicDropArea: function (props) {
            var topicKey = props.topicKey, dropDir = props.dropDir, saveRef = props.saveRef, controller = props.controller, model = props.model;
            var onDragEnter = function (ev) {
                log$2('onDragEnter', topicKey, dropDir);
                controller.run('handleTopicDragEnter', __assign(__assign({}, props), { ev: ev, dropDir: dropDir }));
            };
            var onDragLeave = function (ev) {
                log$2('onDragLeave', topicKey, dropDir);
                controller.run('handleTopicDragLeave', __assign(__assign({}, props), { ev: ev, dropDir: dropDir }));
            };
            var onDragOver = function (ev) {
                ev.preventDefault();
            };
            var onDrop = function (ev) {
                log$2('onDrop', topicKey, dropDir);
                controller.run('handleTopicDrop', __assign(__assign({}, props), { ev: ev, dropDir: dropDir }));
            };
            var eventHandlers = {
                onDragEnter: onDragEnter,
                onDragLeave: onDragLeave,
                onDragOver: onDragOver,
                onDrop: onDrop
            };
            return (createElement(DropArea, __assign({ height: model.config.theme.marginV / 2, ref: saveRef("dropArea-" + dropDir + "-" + topicKey) }, eventHandlers)));
        },
        renderDragAndDropEffect: function (props) {
            log$2('renderDragAndDropEffect');
            var saveRef = props.saveRef;
            return (createElement(TopicDropEffect, __assign({ ref: saveRef('drop-effect') }, props)));
        },
        // getTopicDropEventHandlers(props) {
        //   const { dropDir, controller, topicKey } = props;
        //   const onDragEnter = ev => {
        //     log('onDragEnter', topicKey, dropDir);
        //     controller.run('handleTopicDragEnter', { ...props, ev, dropDir });
        //   };
        //   const onDragLeave = ev => {
        //     log('onDragLeave', topicKey, dropDir);
        //     controller.run('handleTopicDragLeave', { ...props, ev, dropDir });
        //   };
        //   const onDragOver = ev => {
        //     ev.preventDefault();
        //   };
        //   const onDrop = ev => {
        //     log('onDrop', topicKey, dropDir);
        //     controller.run('handleTopicDrop', { ...props, ev, dropDir });
        //   };
        //   const eventHandlers = {
        //     onDragEnter,
        //     onDragLeave,
        //     onDragOver,
        //     onDrop
        //   };
        //   return eventHandlers;
        // },
        getDragTargetProps: function (props) {
            return {
                key: dragTargetKey,
                dropDir: dragTargetDir
            };
        },
        handleTopicDragStart: function (props) {
            var controller = props.controller, ev = props.ev;
            ev.stopPropagation();
            controller.run('operation', __assign(__assign({}, props), { opType: OpType.FOCUS_TOPIC, focusMode: FocusMode.DRAGGING }));
        },
        canDrop: function (props) {
            var srcKey = props.srcKey, dstKey = props.dstKey, model = props.model, dropDir = props.dropDir;
            if (srcKey === model.editorRootTopicKey ||
                srcKey === dstKey ||
                getRelationship(model, srcKey, dstKey) === TopicRelationship.ANCESTOR)
                return false;
            if (dstKey === model.editorRootTopicKey && dropDir !== 'in')
                return false;
            var srcTopic = model.getTopic(srcKey);
            if (srcTopic.parentKey === dstKey && dropDir === 'in')
                return false;
            return true;
        },
        handleTopicDragEnter: function (props) {
            var dropDir = props.dropDir, topicKey = props.topicKey, controller = props.controller, model = props.model, ev = props.ev;
            log$2('handleTopicDragEnter:', topicKey, dropDir);
            var canDrop = controller.run('canDrop', __assign(__assign({}, props), { srcKey: model.focusKey, dstKey: topicKey }));
            if (canDrop) {
                dragTargetKey = topicKey;
                dragTargetDir = dropDir;
                controller.change(model);
            }
        },
        handleTopicDragLeave: function (props) {
            var controller = props.controller, model = props.model, topicKey = props.topicKey, dropDir = props.dropDir, getRef = props.getRef, ev = props.ev;
            var relatedTarget = ev.nativeEvent.relatedTarget;
            log$2('handleTopicDragLeave:', topicKey, dropDir);
            var content = getRef(contentRefKey(topicKey));
            if (content == relatedTarget || content.contains(relatedTarget)) {
                return;
            }
            dragTargetKey = null;
            dragTargetDir = null;
            controller.change(model);
        },
        handleTopicDrop: function (props) {
            log$2('handleTopicDrop');
            var controller = props.controller, topicKey = props.topicKey, model = props.model;
            props = __assign(__assign({}, props), { srcKey: model.focusKey, dstKey: topicKey });
            dragTargetKey = null;
            dragTargetDir = null;
            if (controller.run('canDrop', props)) {
                controller.run('operation', __assign(__assign({}, props), { opType: OpType.DRAG_AND_DROP }));
            }
        }
    };
}
var templateObject_1$3, templateObject_2$2;

var log$3 = debug('plugin:event');
function EventPlugin() {
    return {
        handleTopicClick: function (props) {
            log$3('handleTopicClick');
            var controller = props.controller, model = props.model, topicKey = props.topicKey;
            if (model.editingDescKey !== null)
                return;
            if (model.editingContentKey === topicKey)
                return;
            if (model.focusKey === topicKey &&
                model.focusMode === FocusMode.EDITING_CONTENT)
                return;
            controller.run('operation', __assign(__assign({}, props), { opType: OpType.FOCUS_TOPIC, focusMode: FocusMode.NORMAL }));
        },
        handleTopicDoubleClick: function (props) {
            var controller = props.controller, model = props.model;
            if (model.editingDescKey !== null)
                return;
            controller.run('operation', __assign(__assign({}, props), { opType: OpType.FOCUS_TOPIC, focusMode: FocusMode.EDITING_CONTENT }));
        },
        handleTopicContextMenu: function (props) {
            var controller = props.controller;
            controller.run('operation', __assign(__assign({}, props), { opType: OpType.FOCUS_TOPIC, focusMode: FocusMode.SHOW_POPUP }));
        },
        handleActiveModalClose: function (props) {
            var controller = props.controller;
            var activeModalProps = controller.run('getActiveModalProps', props);
            if (activeModalProps == null)
                return null;
            if (activeModalProps.name === 'edit-desc') {
                return function () {
                    controller.run('operation', __assign(__assign({}, props), { focusMode: FocusMode.NORMAL, opType: OpType.FOCUS_TOPIC }));
                };
            }
        }
    };
}

var HotKeyName = {
    ADD_CHILD: 'ADD_CHILD',
    ADD_SIBLING: 'ADD_SIBLING',
    DELETE_TOPIC: 'DELETE_TOPIC',
    EDIT_CONTENT: 'EDIT_CONTENT',
    EDIT_NOTES: 'EDIT_NOTES',
    SET_EDITOR_ROOT: 'SET_EDITOR_ROOT'
};
function op(opType, props) {
    var topicKey = props.topicKey, model = props.model, controller = props.controller;
    if (topicKey === undefined) {
        props = __assign(__assign({}, props), { topicKey: model.focusKey });
    }
    controller.run('operation', __assign(__assign({}, props), { opType: opType }));
}
function HotKeyPlugin() {
    return {
        customizeHotKeys: function (props) {
            var handleKeyDown = function (opType) { return function (e) {
                // log('HotKeyPlugin', opType);
                op(opType, props);
            }; };
            var hotKeyMap = new Map([
                [
                    HotKeyName.ADD_CHILD,
                    {
                        label: 'add child',
                        combo: 'tab',
                        onKeyDown: handleKeyDown(OpType.ADD_CHILD)
                    }
                ],
                [
                    HotKeyName.ADD_SIBLING,
                    {
                        label: 'add sibling',
                        combo: 'enter',
                        onKeyDown: handleKeyDown(OpType.ADD_SIBLING)
                    }
                ],
                [
                    HotKeyName.DELETE_TOPIC,
                    {
                        label: 'delete topic',
                        combo: 'backspace',
                        onKeyDown: handleKeyDown(OpType.DELETE_TOPIC)
                    }
                ],
                [
                    HotKeyName.EDIT_CONTENT,
                    {
                        label: 'edit content',
                        combo: 'space',
                        onKeyDown: handleKeyDown(OpType.START_EDITING_CONTENT)
                    }
                ],
                [
                    HotKeyName.EDIT_NOTES,
                    {
                        label: 'edit notes',
                        combo: 'alt + d',
                        onKeyDown: handleKeyDown(OpType.START_EDITING_DESC)
                    }
                ],
                [
                    HotKeyName.SET_EDITOR_ROOT,
                    {
                        label: 'set editor root',
                        combo: 'alt + shift + f',
                        onKeyDown: handleKeyDown(OpType.SET_EDITOR_ROOT)
                    }
                ]
            ]);
            return hotKeyMap;
        }
    };
}

var log$4 = debug('node:topic-widget');
var Node = styled.div(templateObject_1$4 || (templateObject_1$4 = __makeTemplateObject(["\n  display: flex;\n  align-items: center;\n  flex-direction: ", ";\n"], ["\n  display: flex;\n  align-items: center;\n  flex-direction: ",
    ";\n"])), function (props) {
    return props.topicDirection === TopicDirection.RIGHT ? 'row' : 'row-reverse';
});
// TODO
var NodeChildren = styled.div(templateObject_2$3 || (templateObject_2$3 = __makeTemplateObject(["\n  position: relative;\n  padding: ", ";\n"], ["\n  position: relative;\n  padding: ",
    ";\n"])), function (props) {
    return props.dir === TopicDirection.RIGHT
        ? "0 0 0 " + props.marginH + "px"
        : "0 " + props.marginH + "px 0 0";
});
var NodeTopic = styled.div(templateObject_3$1 || (templateObject_3$1 = __makeTemplateObject(["\n  display: flex;\n  position: relative;\n  align-items: center;\n\n  flex-direction: ", ";\n"], ["\n  display: flex;\n  position: relative;\n  align-items: center;\n\n  flex-direction: ",
    ";\n"])), function (props) {
    return props.topicDirection === TopicDirection.RIGHT ? 'row' : 'row-reverse';
});
var TopicWidget = /** @class */ (function (_super) {
    __extends(TopicWidget, _super);
    function TopicWidget() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TopicWidget.prototype.renderSubTopics = function () {
        var props = this.props;
        var controller = props.controller, model = props.model, topicKey = props.topicKey, dir = props.dir, saveRef = props.saveRef, getRef = props.getRef;
        var topics = model.getTopic(topicKey).subKeys.toArray();
        var res = controller.run('createSubTopics', { props: props, topics: topics });
        if (!res)
            return null;
        var subTopics = res.subTopics;
        var subLinks = controller.run('renderSubLinks', props);
        return (createElement(NodeChildren, { dir: dir, marginH: model.config.theme.marginH },
            subTopics,
            " ",
            subLinks));
    };
    TopicWidget.prototype.componentDidUpdate = function () {
        this.layoutLinks();
    };
    TopicWidget.prototype.componentDidMount = function () {
        this.layoutLinks();
    };
    TopicWidget.prototype.layoutLinks = function () {
        var _a = this.props, getRef = _a.getRef, topicKey = _a.topicKey;
        var links = getRef(linksRefKey(topicKey));
        links && links.layout();
    };
    TopicWidget.prototype.render = function () {
        log$4('render');
        var props = this.props;
        var controller = props.controller, topicKey = props.topicKey, dir = props.dir, saveRef = props.saveRef;
        var topicStyle = controller.run('getTopicContentStyle', props);
        var propsMore = __assign(__assign({}, props), { topicStyle: topicStyle });
        var topicContent = controller.run('renderTopicContent', propsMore);
        return (createElement(Node, { topicDirection: dir },
            createElement(NodeTopic, { topicDirection: dir, ref: saveRef(topicRefKey(topicKey)) }, topicContent),
            this.renderSubTopics()));
    };
    return TopicWidget;
}(Component));
var templateObject_1$4, templateObject_2$3, templateObject_3$1;

function LayoutPlugin() {
    return {
        getPartTopics: function (_a) {
            var layout = _a.layout, model = _a.model, topicKey = _a.topicKey;
            var topic = model.getTopic(topicKey);
            var subTopicCount = topic.subKeys.size;
            var topics = topic.subKeys.toArray();
            switch (layout) {
                case DiagramLayoutType.LEFT_TO_RIGHT:
                    return { R: topics };
                case DiagramLayoutType.RIGHT_TO_LEFT:
                    return { L: topics };
                case DiagramLayoutType.LEFT_AND_RIGHT:
                    return {
                        L: topics.slice(Math.ceil(subTopicCount / 2), subTopicCount),
                        R: topics.slice(0, Math.ceil(subTopicCount / 2))
                    };
                case DiagramLayoutType.TOP_TO_BOTTOM:
                    return {
                        B: topics
                    };
            }
        },
        createSubTopics: function (_a) {
            var props = _a.props, topics = _a.topics;
            var model = props.model, topicKey = props.topicKey;
            var topic = model.getTopic(topicKey);
            if (topics.size === 0 || topic.collapse)
                return null;
            var subTopics = [];
            topics.forEach(function (tKey) {
                var subTopicProps = __assign(__assign({}, props), { topicKey: tKey });
                subTopics.push(createElement(TopicWidget, __assign({ key: tKey }, subTopicProps)));
            });
            return { subTopics: subTopics };
        },
        layout: function (props) {
            var getRef = props.getRef, topicKey = props.topicKey;
            var links = getRef(linksRefKey(topicKey));
            var highlight = getRef('focus-highlight');
            var dropEffect = getRef('drop-effect');
            links && links.layout();
            highlight && highlight.layout();
            dropEffect && dropEffect.layout();
        },
        setLayoutDir: function (props) {
            var layoutDir = props.layoutDir, model = props.model, controller = props.controller;
            controller.change(ModelModifier.setLayoutDir({ model: model, layoutDir: layoutDir }));
        }
    };
}

var log$5 = debug('plugin:operation');
function OperationPlugin() {
    var startEditingContent = function (_a) {
        var model = _a.model, topicKey = _a.topicKey;
        return ModelModifier.focusTopic({
            model: model,
            topicKey: topicKey,
            focusMode: FocusMode.EDITING_CONTENT
        });
    };
    var startEditingDesc = function (_a) {
        var model = _a.model, topicKey = _a.topicKey;
        var topic = model.getTopic(topicKey);
        var desc = topic.getBlock(BlockType.DESC);
        if (desc.block == null || desc.block.data == null) {
            model = ModelModifier.setDesc({ model: model, topicKey: topicKey, data: '' });
        }
        return ModelModifier.focusTopic({
            model: model,
            topicKey: topicKey,
            focusMode: FocusMode.EDITING_DESC
        });
    };
    function dragAndDrop(props) {
        var srcKey = props.srcKey, dstKey = props.dstKey, dropDir = props.dropDir;
        var model = props.model;
        var srcTopic = model.getTopic(srcKey);
        var dstTopic = model.getTopic(dstKey);
        var srcParentKey = srcTopic.parentKey;
        var srcParentTopic = model.getTopic(srcParentKey);
        var srcParentSubKeys = srcParentTopic.subKeys;
        var srcIndex = srcParentSubKeys.indexOf(srcKey);
        srcParentSubKeys = srcParentSubKeys.delete(srcIndex);
        if (dropDir === 'in') {
            var dstSubKeys_1 = dstTopic.subKeys;
            dstSubKeys_1 = dstSubKeys_1.push(srcKey);
            model = model.withMutations(function (m) {
                m.setIn(['topics', srcParentKey, 'subKeys'], srcParentSubKeys)
                    .setIn(['topics', srcKey, 'parentKey'], dstKey)
                    .setIn(['topics', dstKey, 'subKeys'], dstSubKeys_1)
                    .setIn(['topics', dstKey, 'collapse'], false);
            });
        }
        else {
            var dstParentKey_1 = dstTopic.parentKey;
            var dstParentItem = model.getTopic(dstParentKey_1);
            var dstParentSubKeys_1 = dstParentItem.subKeys;
            var dstIndex = dstParentSubKeys_1.indexOf(dstKey);
            //src 和 dst 的父亲相同，这种情况要做特殊处理
            if (srcParentKey === dstParentKey_1) {
                var newDstParentSubKeys_1 = List();
                dstParentSubKeys_1.forEach(function (key) {
                    if (key !== srcKey) {
                        if (key === dstKey) {
                            if (dropDir === 'prev') {
                                newDstParentSubKeys_1 = newDstParentSubKeys_1
                                    .push(srcKey)
                                    .push(key);
                            }
                            else {
                                newDstParentSubKeys_1 = newDstParentSubKeys_1
                                    .push(key)
                                    .push(srcKey);
                            }
                        }
                        else {
                            newDstParentSubKeys_1 = newDstParentSubKeys_1.push(key);
                        }
                    }
                });
                model = model.withMutations(function (m) {
                    m.setIn(['topics', dstParentKey_1, 'subKeys'], newDstParentSubKeys_1);
                });
            }
            else {
                if (dropDir === 'prev') {
                    dstParentSubKeys_1 = dstParentSubKeys_1.insert(dstIndex, srcKey);
                }
                else if (dropDir === 'next') {
                    dstParentSubKeys_1 = dstParentSubKeys_1.insert(dstIndex + 1, srcKey);
                }
                model = model.withMutations(function (m) {
                    m.setIn(['topics', srcParentKey, 'subKeys'], srcParentSubKeys)
                        .setIn(['topics', srcKey, 'parentKey'], dstParentKey_1)
                        .setIn(['topics', dstParentKey_1, 'subKeys'], dstParentSubKeys_1)
                        .setIn(['topics', dstParentKey_1, 'collapse'], false);
                });
            }
        }
        return model;
    }
    var OpMap = new Map([
        [OpType.TOGGLE_COLLAPSE, ModelModifier.toggleCollapse],
        [OpType.ADD_CHILD, ModelModifier.addChild],
        [OpType.ADD_SIBLING, ModelModifier.addSibling],
        [OpType.DELETE_TOPIC, ModelModifier.deleteTopic],
        [OpType.FOCUS_TOPIC, ModelModifier.focusTopic],
        [OpType.SET_STYLE, ModelModifier.setStyle],
        [OpType.SET_TOPIC_CONTENT, ModelModifier.setContent],
        [OpType.SET_TOPIC_DESC, ModelModifier.setDesc],
        [OpType.START_EDITING_CONTENT, startEditingContent],
        [OpType.START_EDITING_DESC, startEditingDesc],
        [OpType.DRAG_AND_DROP, dragAndDrop],
        [OpType.SET_EDITOR_ROOT, ModelModifier.setEditorRootTopicKey]
    ]);
    var undoStack = Stack();
    var redoStack = Stack();
    return {
        getAllowUndo: function (props) {
            var model = props.model, opType = props.opType;
            if (opType) {
                switch (opType) {
                    case OpType.FOCUS_TOPIC:
                    case OpType.START_EDITING_CONTENT:
                    case OpType.START_EDITING_DESC:
                        return false;
                }
            }
            switch (model.focusMode) {
                case 'EDITING_DESC':
                case 'EDITING_CONTENT':
                    return false;
            }
            return model.config.allowUndo;
        },
        getUndoRedoStack: function () {
            return {
                undoStack: undoStack,
                redoStack: redoStack
            };
        },
        setUndoStack: function (props) {
            log$5('setUndoStack', props.undoStack);
            undoStack = props.undoStack;
        },
        setRedoStack: function (props) {
            log$5('setRedoStack', props.redoStack);
            redoStack = props.redoStack;
        },
        canUndo: function (props) {
            var controller = props.controller;
            var undoStack = controller.run('getUndoRedoStack', props).undoStack;
            var allowUndo = controller.run('getAllowUndo', props);
            return undoStack.size > 0 && allowUndo;
        },
        canRedo: function (props) {
            var controller = props.controller;
            var redoStack = controller.run('getUndoRedoStack', props).redoStack;
            var allowUndo = controller.run('getAllowUndo', props);
            return redoStack.size > 0 && allowUndo;
        },
        undo: function (props) {
            var controller = props.controller, model = props.model;
            if (!controller.run('getAllowUndo', props)) {
                return;
            }
            var _a = controller.run('getUndoRedoStack', props), undoStack = _a.undoStack, redoStack = _a.redoStack;
            var newModel = undoStack.peek();
            if (!newModel)
                return;
            controller.run('setUndoStack', __assign(__assign({}, props), { undoStack: undoStack.shift() }));
            controller.run('setRedoStack', __assign(__assign({}, props), { redoStack: redoStack.push(model) }));
            log$5(newModel);
            controller.change(newModel);
        },
        redo: function (props) {
            var controller = props.controller, model = props.model;
            if (!controller.run('getAllowUndo', props)) {
                return;
            }
            var _a = controller.run('getUndoRedoStack', props), undoStack = _a.undoStack, redoStack = _a.redoStack;
            var newModel = redoStack.peek();
            if (!newModel)
                return;
            controller.run('setUndoStack', __assign(__assign({}, props), { undoStack: undoStack.push(model) }));
            controller.run('setRedoStack', __assign(__assign({}, props), { redoStack: redoStack.shift() }));
            controller.change(newModel);
        },
        beforeOperation: function (props) { },
        operation: function (props) {
            var opType = props.opType, controller = props.controller, model = props.model, opArray = props.opArray;
            log$5('operation:', opType || opArray);
            log$5('model:', model);
            controller.run('beforeOperation', props);
            if (opType != null && opArray != null) {
                throw new Error('operation: opType and opArray conflict!');
            }
            if (controller.run('getAllowUndo', props)) {
                var undoStack_1 = controller.run('getUndoRedoStack', props).undoStack;
                controller.run('setUndoStack', __assign(__assign({}, props), { undoStack: undoStack_1.push(model) }));
            }
            var newModel;
            if (opArray != null) {
                if (!Array.isArray(opArray)) {
                    throw new Error('operation: the type of opArray must be array!');
                }
                newModel = opArray.reduce(function (acc, cur) {
                    var opType = cur.opType;
                    if (!OpMap.has(opType))
                        throw new Error("opType:" + opType + " not exist!");
                    var opFunc = OpMap.get(opType);
                    var res = opFunc(__assign(__assign({ controller: controller }, cur), { model: acc }));
                    return res;
                }, model);
            }
            else {
                if (!OpMap.has(opType))
                    throw new Error("opType:" + opType + " not exist!");
                var opFunc = OpMap.get(opType);
                newModel = opFunc(props);
            }
            log$5('newModel:', newModel);
            controller.change(newModel);
            controller.run('afterOperation', props);
        },
        afterOperation: function (props) { }
    };
}

var EditorRootBreadcrumbsRoot = styled.div(templateObject_1$5 || (templateObject_1$5 = __makeTemplateObject(["\n  position: absolute;\n  width: 20%;\n  padding: 0 5px;\n  background: white;\n  left: 30px;\n  top: 20px;\n  border-radius: 2px;\n  z-index: 4;\n"], ["\n  position: absolute;\n  width: 20%;\n  padding: 0 5px;\n  background: white;\n  left: 30px;\n  top: 20px;\n  border-radius: 2px;\n  z-index: 4;\n"])));
var TooltipContent = styled.div(templateObject_2$4 || (templateObject_2$4 = __makeTemplateObject(["\n  max-width: 600px;\n"], ["\n  max-width: 600px;\n"])));
var BreadcrumbTitle = styled.span(templateObject_3$2 || (templateObject_3$2 = __makeTemplateObject([""], [""])));
var EditorRootBreadcrumbs = /** @class */ (function (_super) {
    __extends(EditorRootBreadcrumbs, _super);
    function EditorRootBreadcrumbs(props) {
        var _this = _super.call(this, props) || this;
        _this.setEditorRootTopicKey = function (topicKey) { return function () {
            var _a = _this.props, model = _a.model, controller = _a.controller;
            if (model.editorRootTopicKey !== topicKey) {
                controller.change(ModelModifier.setEditorRootTopicKey({
                    model: model,
                    topicKey: topicKey
                }));
            }
        }; };
        _this.breadcrumbRenderer = function (props) {
            var text = props.text, breadProps = __rest(props, ["text"]);
            var needTooltip = text.length > 8;
            var title = needTooltip ? text.substr(0, 8) + '...' : text;
            //TODO
            var content = createElement(TooltipContent, null, text);
            var tooltipProps = {
                content: content,
                position: PopoverPosition.BOTTOM_RIGHT
            };
            var breadcrumb = (createElement(Breadcrumb, __assign({}, breadProps),
                createElement(BreadcrumbTitle, null, title)));
            return needTooltip ? (createElement(Tooltip, __assign({}, tooltipProps), breadcrumb)) : (breadcrumb);
            // return (
            //   <Breadcrumb {...breadProps}>
            //     <BreadcrumbTitle>{title}</BreadcrumbTitle>
            //   </Breadcrumb>
            // );
        };
        _this.state = {
            show: false
        };
        return _this;
    }
    EditorRootBreadcrumbs.prototype.render = function () {
        var props = this.props;
        var model = props.model, controller = props.controller;
        var editingRootKey = model.editorRootTopicKey;
        if (editingRootKey === model.rootTopicKey)
            return null;
        var items = [];
        var topic = model.getTopic(editingRootKey);
        while (topic != null) {
            var title = controller.run('getTopicTitle', __assign(__assign({}, props), { topicKey: topic.key }));
            items.unshift({
                text: title,
                onClick: this.setEditorRootTopicKey(topic.key)
            });
            topic = model.getTopic(topic.parentKey);
        }
        var breadcrumbProps = {
            items: items,
            breadcrumbRenderer: this.breadcrumbRenderer
        };
        return (createElement(EditorRootBreadcrumbsRoot, null,
            createElement(Breadcrumbs, __assign({}, breadcrumbProps))));
    };
    return EditorRootBreadcrumbs;
}(BaseWidget));
var templateObject_1$5, templateObject_2$4, templateObject_3$2;

var NodeLayer = styled.div(templateObject_1$6 || (templateObject_1$6 = __makeTemplateObject(["\n  position: relative;\n  display: flex;\n  align-items: center;\n  padding: 5px;\n"], ["\n  position: relative;\n  display: flex;\n  align-items: center;\n  padding: 5px;\n"])));
var DIV = styled.div(templateObject_2$5 || (templateObject_2$5 = __makeTemplateObject(["\n  width: 100%;\n  height: 100%;\n  background: ", ";\n"], ["\n  width: 100%;\n  height: 100%;\n  background: ", ";\n"])), function (props) { return props.theme.background; });
var MindDragScrollWidget = /** @class */ (function (_super) {
    __extends(MindDragScrollWidget, _super);
    function MindDragScrollWidget(props) {
        var _this = _super.call(this, props) || this;
        _this.onClick = function (e) { };
        return _this;
    }
    MindDragScrollWidget.prototype.componentDidMount = function () {
        var _a = this.props, getRef = _a.getRef, model = _a.model;
        var rootTopic = getRef(topicRefKey(model.editorRootTopicKey));
        var nodeLayer = getRef('node-layer');
        var rootTopicRect = rootTopic.getBoundingClientRect();
        var nodeLayerRect = nodeLayer.getBoundingClientRect();
        this.dragScrollWidget.setViewBoxScrollDelta(0, rootTopicRect.top -
            nodeLayerRect.top -
            this.dragScrollWidget.viewBox.getBoundingClientRect().height / 2 +
            rootTopicRect.height);
    };
    Object.defineProperty(MindDragScrollWidget.prototype, "dragScrollWidget", {
        get: function () {
            return this.props.getRef('DragScrollWidget');
        },
        enumerable: true,
        configurable: true
    });
    MindDragScrollWidget.prototype.render = function () {
        var _this = this;
        var _a = this.props, saveRef = _a.saveRef, model = _a.model, controller = _a.controller;
        var nodeKey = model.editorRootTopicKey;
        return (createElement(DIV
        // onClick={this.onClick}
        , null,
            createElement(DragScrollWidget, __assign({}, this.state, { ref: saveRef('DragScrollWidget') }), function (setViewBoxScroll, setViewBoxScrollDelta) {
                var rootWidgetProps = __assign(__assign({}, _this.props), { topicKey: nodeKey, setViewBoxScroll: setViewBoxScroll,
                    setViewBoxScrollDelta: setViewBoxScrollDelta });
                return (createElement(NodeLayer, { ref: saveRef('node-layer') }, controller.run('renderRootWidget', rootWidgetProps)));
            })));
    };
    return MindDragScrollWidget;
}(Component));
var templateObject_1$6, templateObject_2$5;

var Modals = /** @class */ (function (_super) {
    __extends(Modals, _super);
    function Modals() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleClose = function () {
            var controller = _this.props.controller;
            var handleActiveModalClose = controller.run('handleActiveModalClose', _this.props);
            handleActiveModalClose && handleActiveModalClose();
        };
        return _this;
    }
    Modals.prototype.render = function () {
        var controller = this.props.controller;
        var activeModal = controller.run('renderModal', this.props);
        var activeModalProps = controller.run('getActiveModalProps', this.props);
        return (createElement(Dialog, { onClose: this.handleClose, isOpen: activeModal !== null, autoFocus: true, enforceFocus: true, usePortal: true, title: activeModalProps && activeModalProps.title, style: activeModalProps && activeModalProps.style },
            createElement("div", { className: Classes.DIALOG_BODY, style: { minHeight: 0 } }, activeModal)));
    };
    return Modals;
}(BaseWidget));

var RootLinksSvg = styled.svg(templateObject_1$7 || (templateObject_1$7 = __makeTemplateObject(["\n  width: 100%;\n  height: 100%;\n  position: absolute;\n  left: 0;\n  top: 0;\n  z-index: 1;\n  pointer-events: none;\n"], ["\n  width: 100%;\n  height: 100%;\n  position: absolute;\n  left: 0;\n  top: 0;\n  z-index: 1;\n  pointer-events: none;\n"])));
var log$6 = debug('node:topic-sub-links');
var RootSubLinks = /** @class */ (function (_super) {
    __extends(RootSubLinks, _super);
    function RootSubLinks() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            curves: []
        };
        return _this;
    }
    RootSubLinks.prototype.layout = function () {
        var props = this.props;
        var model = props.model, getRef = props.getRef, topicKey = props.topicKey, dir = props.dir, controller = props.controller;
        var topic = model.getTopic(topicKey);
        var contentRect = getRef(contentRefKey(topicKey)).getBoundingClientRect();
        var svgRect = getRef(linksSvgRefKey(topicKey)).getBoundingClientRect();
        var p1, p2;
        p1 = {
            x: centerX(contentRect) - svgRect.left,
            y: centerY(contentRect) - svgRect.top
        };
        var curves = [];
        topic.subKeys.forEach(function (key) {
            var style = controller.run('getTopicContentStyle', __assign(__assign({}, props), { topicKey: key }));
            var linkStyle = controller.run('getLinkStyle', __assign(__assign({}, props), { topicKey: key }));
            var lineType = linkStyle.lineType;
            var rect = getRef(contentRefKey(key)).getBoundingClientRect();
            if (rect.left > contentRect.right) {
                p2 = {
                    x: rect.left,
                    y: centerY(rect)
                };
            }
            else {
                p2 = {
                    x: rect.right,
                    y: centerY(rect)
                };
            }
            p2 = { x: p2.x - svgRect.left, y: p2.y - svgRect.top };
            var curve;
            if (lineType === 'curve') {
                curve = "M " + p1.x + " " + p1.y + " C " + p1.x + " " + centerPointY(p1, p2) + " " + centerPointX(p1, p2) + " " + p2.y + " " + p2.x + " " + p2.y;
            }
            else if (lineType === 'line') {
                curve = "M " + p1.x + " " + p1.y + " L " + p2.x + " " + p2.y;
            }
            else if (lineType === 'round') {
                var vDir = p2.y > p1.y ? 1 : -1;
                var hDir = p2.x > p1.x ? 1 : -1;
                var radius = linkStyle.lineRadius;
                if (radius == null) {
                    throw new Error('link line type is round, but lineRadius is not provided!');
                }
                if (p2.y === p1.y) {
                    curve = "M " + p1.x + " " + p1.y + " H " + p2.x;
                }
                else {
                    // 0 表示逆时针 1 表示顺时针
                    curve = "M " + p1.x + " " + p1.y + "  V " + (p2.y -
                        vDir * radius) + " A " + radius + " " + radius + " 0 0 " + (vDir * hDir === 1 ? 0 : 1) + " " + (p1.x + radius * hDir) + " " + p2.y + " H " + p2.x;
                }
            }
            curves.push(createElement("path", { key: "link-" + key, d: curve, strokeWidth: linkStyle.lineWidth, stroke: linkStyle.lineColor, fill: "none" }));
        });
        this.setState({
            curves: curves
        });
    };
    RootSubLinks.prototype.render = function () {
        var _a = this.props, topicKey = _a.topicKey, saveRef = _a.saveRef;
        return (createElement(RootLinksSvg, { ref: saveRef(linksSvgRefKey(topicKey)) },
            createElement("g", null, this.state.curves)));
    };
    return RootSubLinks;
}(BaseWidget));
var templateObject_1$7;

var log$7 = debug('RootNode');
var LayerPart = styled.div(templateObject_1$8 || (templateObject_1$8 = __makeTemplateObject(["\n  display: flex;\n  position: relative;\n\n  align-items: ", ";\n  flex-direction: column;\n\n  padding: ", ";\n"], ["\n  display: flex;\n  position: relative;\n\n  align-items: ",
    ";\n  flex-direction: column;\n\n  padding: ",
    ";\n"])), function (props) {
    //@ts-ignore
    return props.topicDirection === TopicDirection.LEFT ? 'flex-end' : 'flex-start';
}, function (props) {
    //@ts-ignore
    return props.topicDirection === TopicDirection.LEFT
        ? '15px 60px 15px 0px'
        : '15px 0px 15px 60px';
});
var Topic = styled.div(templateObject_2$6 || (templateObject_2$6 = __makeTemplateObject(["\n  display: flex;\n  position: relative;\n  align-items: center;\n  z-index: 3;\n"], ["\n  display: flex;\n  position: relative;\n  align-items: center;\n  z-index: 3;\n"])));
var RootWidget = /** @class */ (function (_super) {
    __extends(RootWidget, _super);
    function RootWidget() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RootWidget.prototype.renderPartTopics = function (topics, dir) {
        var _a = this.props, controller = _a.controller, saveRef = _a.saveRef;
        var res = controller.run('createSubTopics', {
            props: __assign(__assign({}, this.props), { dir: dir, isRoot: true }),
            topics: topics
        });
        if (!res)
            return null;
        var subTopics = res.subTopics;
        var cxName = "bm-layer-" + (dir === TopicDirection.LEFT ? 'left' : 'right');
        return (
        //@ts-ignore
        createElement(LayerPart, { topicDirection: dir, ref: saveRef(cxName) }, subTopics));
    };
    RootWidget.prototype.componentDidMount = function () {
        this.layout();
    };
    RootWidget.prototype.componentDidUpdate = function () {
        this.layout();
    };
    RootWidget.prototype.layout = function () {
        var controller = this.props.controller;
        controller.run('layout', this.props);
    };
    RootWidget.prototype.render = function () {
        log$7('render');
        var props = this.props;
        var model = props.model, topicKey = props.topicKey, saveRef = props.saveRef, controller = props.controller, dir = props.dir;
        var topicStyle = controller.run('getTopicContentStyle', props);
        var config = model.config;
        var topicContent = controller.run('renderTopicContent', __assign(__assign({}, props), { topicStyle: topicStyle, dir: TopicDirection.MAIN }));
        var partTopics = controller.run('getPartTopics', {
            layout: config.layoutDir,
            model: model,
            topicKey: topicKey
        });
        var rootTopic = (createElement(Topic, { ref: saveRef(topicRefKey(topicKey)) }, topicContent));
        var children = controller.run('renderRootWidgetOtherChildren', props);
        switch (config.layoutDir) {
            case DiagramLayoutType.LEFT_AND_RIGHT:
                return (createElement(Fragment, null,
                    this.renderPartTopics(partTopics.L, 'L'),
                    rootTopic,
                    this.renderPartTopics(partTopics.R, 'R'),
                    children));
            case DiagramLayoutType.LEFT_TO_RIGHT:
                return (createElement(Fragment, null,
                    rootTopic,
                    this.renderPartTopics(partTopics.R, 'R'),
                    children));
            case DiagramLayoutType.RIGHT_TO_LEFT:
                return (createElement(Fragment, null,
                    this.renderPartTopics(partTopics.L, 'L'),
                    rootTopic,
                    children));
            case DiagramLayoutType.TOP_TO_BOTTOM:
                return (createElement(Fragment, null,
                    rootTopic,
                    this.renderPartTopics(partTopics.B, 'B'),
                    children));
        }
        return null;
    };
    return RootWidget;
}(Component));
var templateObject_1$8, templateObject_2$6;

var SettingTitle = styled.div(templateObject_1$9 || (templateObject_1$9 = __makeTemplateObject(["\n  margin-top: 10px;\n  margin-bottom: 5px;\n  font-weight: bold;\n"], ["\n  margin-top: 10px;\n  margin-bottom: 5px;\n  font-weight: bold;\n"])));
var SettingItem = styled.span(templateObject_2$7 || (templateObject_2$7 = __makeTemplateObject(["\n  margin: 0px 10px 0px 0px;\n"], ["\n  margin: 0px 10px 0px 0px;\n"])));
var SettingRow = styled(Flex)(templateObject_3$3 || (templateObject_3$3 = __makeTemplateObject(["\n  margin: 5px 0;\n"], ["\n  margin: 5px 0;\n"])));
var SettingGroup = function (props) {
    return (createElement("div", null,
        props.children,
        createElement(Divider, { style: { margin: '10px 0' } })));
};
var ColorBar = styled.div(templateObject_4$1 || (templateObject_4$1 = __makeTemplateObject(["\n  height: 3px;\n  width: 80%;\n  margin-left: 10%;\n  margin-right: 10%;\n  margin-bottom: 2px;\n  background: ", ";\n"], ["\n  height: 3px;\n  width: 80%;\n  margin-left: 10%;\n  margin-right: 10%;\n  margin-bottom: 2px;\n  background: ", ";\n"])), function (props) { return props.color; });
var WithBorder = styled.div(templateObject_5$1 || (templateObject_5$1 = __makeTemplateObject(["\n  border: 1px solid grey;\n  cursor: pointer;\n  font-weight: bold;\n"], ["\n  border: 1px solid grey;\n  cursor: pointer;\n  font-weight: bold;\n"])));
var renderItem = function (unit) { return function (width, _a) {
    var handleClick = _a.handleClick, modifiers = _a.modifiers, query = _a.query;
    return (createElement(MenuItem, { text: "" + width + unit, key: width, onClick: handleClick }));
}; };
var PxSelect = Select.ofType();
var borderWidthItems = __spread(Array(7).keys());
var templateObject_1$9, templateObject_2$7, templateObject_3$3, templateObject_4$1, templateObject_5$1;

var borderWidthItems$1 = __spread(Array(7).keys());
var borderRadiusItems = [0, 5, 10, 15, 20, 25, 30, 35];
var borderStyleItems = ['none', 'solid', 'dotted', 'dashed', 'double'];
function BorderStyleEditor(props) {
    var topicStyle = props.topicStyle, setStyle = props.setStyle;
    var handleBorderWidthChange = function (value) {
        // log('handleBorderWithChange:', value);
        setStyle({ borderWidth: value + "px" });
    };
    var handleBorderStyleChange = function (value) {
        setStyle({ borderStyle: value });
    };
    var handleBorderRadiusChange = function (value) {
        // log('handleBorderRadiusChange:', value);
        setStyle({ borderRadius: value + "px" });
    };
    var handleBorderColorChange = function (color) {
        setStyle({ borderColor: color.hex });
    };
    return (createElement(SettingGroup, null,
        createElement(SettingTitle, null, "Border"),
        createElement("div", null,
            createElement(SettingItem, null,
                createElement(PxSelect, { items: borderWidthItems$1, itemRenderer: renderItem('px'), filterable: false, onItemSelect: handleBorderWidthChange },
                    createElement(Button, { text: "width: " + (topicStyle.borderWidth ? topicStyle.borderWidth : '0px') }))),
            createElement(SettingItem, null,
                createElement(PxSelect, { items: borderStyleItems, itemRenderer: renderItem(''), filterable: false, onItemSelect: handleBorderStyleChange },
                    createElement(Button, { text: "style: " + (topicStyle.borderStyle ? topicStyle.borderStyle : 'none') }))),
            createElement(SettingItem, null,
                createElement(PxSelect, { items: borderRadiusItems, itemRenderer: renderItem('px'), filterable: false, onItemSelect: handleBorderRadiusChange },
                    createElement(Button, { text: "radius: " + topicStyle.borderRadius }))),
            createElement(SettingItem, null,
                createElement(Popover, null,
                    createElement(WithBorder, null,
                        createElement("div", { className: iconClassName(IconName.COLOR_PICKER) }),
                        createElement(ColorBar, { color: topicStyle.borderColor })),
                    createElement("div", null,
                        createElement(SketchPicker, { color: topicStyle.borderColor, onChangeComplete: handleBorderColorChange })))))));
}

function ClearAllCustomStyle(props) {
    var controller = props.controller;
    var handleClearAllCustomStyle = function (e) {
        controller.run('clearAllCustomStyle', props);
    };
    return (createElement(SettingGroup, null,
        createElement(SettingItem, null,
            createElement(Button, { onClick: handleClearAllCustomStyle }, "Clear All Custom Styles"))));
}

var lineTypes = ['curve', 'round', 'line'];
var renderLineTypeItem = function (lineType, _a) {
    var handleClick = _a.handleClick, modifiers = _a.modifiers, query = _a.query;
    return createElement(MenuItem, { text: "" + lineType, key: lineType, onClick: handleClick });
};
function LinkStyleEditor(props) {
    var controller = props.controller;
    // const topicStyle: TopicStyle = controller.run('getTopicStyle', props);
    var linkStyle = controller.run('getLinkStyle', props);
    var subLinkStyle = controller.run('getSubLinkStyle', props);
    var handleLinkWidthChange = function (value) {
        controller.run('setLinkStyle', __assign(__assign({}, props), { linkStyle: { lineWidth: value + "px" } }));
    };
    var handleLinkTypeChange = function (value) {
        controller.run('setLinkStyle', __assign(__assign({}, props), { linkStyle: { lineType: value } }));
    };
    var handleSubLinkWidthChange = function (value) {
        controller.run('setSubLinkStyle', __assign(__assign({}, props), { subLinkStyle: { lineWidth: value + "px" } }));
    };
    var handleSubLinkTypeChange = function (value) {
        controller.run('setSubLinkStyle', __assign(__assign({}, props), { subLinkStyle: { lineType: value } }));
    };
    var handleLinkColorChange = function (color) {
        controller.run('setLinkStyle', __assign(__assign({}, props), { linkStyle: { lineColor: color.hex } }));
    };
    var handleSubLinkColorChange = function (color) {
        controller.run('setSubLinkStyle', __assign(__assign({}, props), { subLinkStyle: { lineColor: color.hex } }));
    };
    return (createElement(SettingGroup, null,
        createElement(SettingTitle, null, "Link"),
        createElement(SettingRow, { alignItems: "center" },
            createElement(Margin, { margin: "0 5px 0 0" }, "LinkToParent: "),
            createElement(SettingItem, null,
                createElement(PxSelect, { items: borderWidthItems, itemRenderer: renderItem('px'), filterable: false, onItemSelect: handleLinkWidthChange },
                    createElement(Button, { text: "width: " + (linkStyle ? linkStyle.lineWidth + 'px' : '0px') }))),
            createElement(SettingItem, null,
                createElement(PxSelect, { items: lineTypes, itemRenderer: renderLineTypeItem, filterable: false, onItemSelect: handleLinkTypeChange },
                    createElement(Button, { text: "lineType: " + linkStyle.lineType }))),
            createElement(SettingItem, null,
                createElement(Popover, null,
                    createElement(WithBorder, null,
                        createElement("div", { className: iconClassName(IconName.COLOR_PICKER) }),
                        createElement(ColorBar, { color: linkStyle.lineColor })),
                    createElement("div", null,
                        createElement(SketchPicker, { color: linkStyle.lineColor, onChangeComplete: handleLinkColorChange }))))),
        createElement(SettingRow, { alignItems: "center" },
            createElement(Margin, { margin: "0 5px 0 0" }, "SubLinks: "),
            createElement(SettingItem, null,
                createElement(PxSelect, { items: borderWidthItems, itemRenderer: renderItem('px'), filterable: false, onItemSelect: handleSubLinkWidthChange },
                    createElement(Button, { text: "width: " + (subLinkStyle ? subLinkStyle.lineWidth + 'px' : '0px') }))),
            createElement(SettingItem, null,
                createElement(PxSelect, { items: lineTypes, itemRenderer: renderLineTypeItem, filterable: false, onItemSelect: handleSubLinkTypeChange },
                    createElement(Button, { text: "lineType: " + subLinkStyle.lineType }))),
            createElement(SettingItem, null,
                createElement(Popover, null,
                    createElement(WithBorder, null,
                        createElement("div", { className: iconClassName(IconName.COLOR_PICKER) }),
                        createElement(ColorBar, { color: subLinkStyle.lineColor })),
                    createElement("div", null,
                        createElement(SketchPicker, { color: subLinkStyle.lineColor, onChangeComplete: handleSubLinkColorChange })))))));
}

function TextStyleEditor(props) {
    var topicStyle = props.topicStyle, setStyle = props.setStyle;
    var handleFontSizeChange = function (value) {
        // log('handleFontSizeChange:', value);
        setStyle({ fontSize: value });
    };
    var handleLineHeightChange = function (e) {
        // log('handleLineHeightChange:', e.target.value);
        setStyle({ lineHeight: e.target.value });
    };
    var handleColorChange = function (color) {
        setStyle({ color: color.hex });
    };
    var fontSizeNumInputProps = {
        min: 12,
        max: 100,
        value: parseInt(topicStyle.fontSize),
        style: {
            width: 50
        },
        onValueChange: handleFontSizeChange
    };
    var lineHeightInputProps = {
        style: {
            width: 50
        },
        value: topicStyle.lineHeight || '',
        onChange: handleLineHeightChange
    };
    return (createElement(SettingGroup, null,
        createElement(SettingTitle, null, "Text Editor"),
        createElement(Flex, null,
            createElement(SettingItem, null,
                createElement(Flex, { alignItems: "center" },
                    createElement(Margin, { margin: "0 5px 0 0" }, "FontSize: "),
                    createElement(NumericInput, __assign({}, fontSizeNumInputProps)))),
            createElement(SettingItem, null,
                createElement(Flex, { alignItems: "center" },
                    createElement(Margin, { margin: "0 5px 0 0" }, "LineHeight: "),
                    createElement(InputGroup, __assign({}, lineHeightInputProps)))),
            createElement(SettingItem, null,
                createElement(Popover, null,
                    createElement(WithBorder, null,
                        createElement("div", { className: iconClassName(IconName.COLOR_PICKER) }),
                        createElement(ColorBar, { color: topicStyle.color })),
                    createElement("div", null,
                        createElement(SketchPicker, { color: topicStyle.color, onChangeComplete: handleColorChange })))))));
}

var log$8 = debug('node:style-editor');
var StyleEditorRoot = styled.div(templateObject_1$a || (templateObject_1$a = __makeTemplateObject(["\n  position: absolute;\n  background: white;\n  right: 30px;\n  top: 20px;\n  border-radius: 2px;\n  z-index: 4;\n"], ["\n  position: absolute;\n  background: white;\n  right: 30px;\n  top: 20px;\n  border-radius: 2px;\n  z-index: 4;\n"])));
var PopRoot = styled.div(templateObject_2$8 || (templateObject_2$8 = __makeTemplateObject(["\n  padding: 10px;\n"], ["\n  padding: 10px;\n"])));
var StyleEditor = /** @class */ (function (_super) {
    __extends(StyleEditor, _super);
    function StyleEditor(props) {
        var _this = _super.call(this, props) || this;
        _this.setShowPanel = function (showPanel) { return function () {
            _this.setState({
                showPanel: showPanel
            });
        }; };
        _this.setTopicContentStyle = function (style) {
            var props = _this.props;
            var controller = props.controller;
            controller.run('setTopicContentStyle', __assign(__assign({}, props), { style: style }));
        };
        _this.handleBackgroundColorChange = function (color) {
            _this.setTopicContentStyle({ background: color.hex });
        };
        _this.handleClearStyle = function () {
            if (_this.topic.style) {
                _this.operation(OpType.SET_STYLE, __assign(__assign({}, _this.props), { style: null }));
                _this.setState({});
            }
        };
        _this.handleCopyStyle = function () {
            var props = _this.props;
            var controller = props.controller;
            _this.copiedStyle = controller.run('getTopicStyle', props);
            log$8(_this.copiedStyle);
        };
        _this.handlePasteStyle = function () {
            if (_this.copiedStyle) {
                _this.operation(OpType.SET_STYLE, __assign(__assign({}, _this.props), { style: JSON.stringify(_this.copiedStyle) }));
                _this.setState({});
            }
        };
        _this.state = {
            showPanel: false
        };
        return _this;
    }
    StyleEditor.prototype.render = function () {
        var props = this.props;
        var controller = props.controller, model = props.model;
        if (!model.focusKey)
            return null;
        var topicStyle = controller.run('getTopicContentStyle', props);
        if (!this.state.showPanel) {
            return (createElement(StyleEditorRoot, null,
                createElement(IconBg, { onClick: this.setShowPanel(true) },
                    createElement(ShowMenuIcon, { className: iconClassName(IconName.SHOW_MENU) }))));
        }
        var setStyle = this.setTopicContentStyle;
        return (createElement(StyleEditorRoot, null,
            createElement(Title, null,
                createElement(CloseIcon, { className: iconClassName(IconName.CLOSE), onClick: this.setShowPanel(false) })),
            createElement(PopRoot, null,
                BorderStyleEditor(__assign(__assign({}, props), { topicStyle: topicStyle, setStyle: setStyle })),
                TextStyleEditor(__assign(__assign({}, props), { topicStyle: topicStyle, setStyle: setStyle })),
                createElement(SettingGroup, null,
                    createElement(SettingTitle, null, "Background"),
                    createElement("div", null,
                        createElement(SettingItem, null,
                            createElement(Popover, null,
                                createElement(WithBorder, null,
                                    createElement("div", { className: iconClassName(IconName.COLOR_PICKER) }),
                                    createElement(ColorBar, { color: topicStyle.background })),
                                createElement("div", null,
                                    createElement(SketchPicker, { color: topicStyle.background, onChangeComplete: this.handleBackgroundColorChange })))))),
                LinkStyleEditor(props),
                createElement(SettingGroup, null,
                    createElement(SettingItem, null,
                        createElement(Button, { onClick: this.handleClearStyle }, "Clear Topic Style")),
                    createElement(SettingItem, null,
                        createElement(Button, { onClick: this.handleCopyStyle }, "Copy Style")),
                    createElement(SettingItem, null,
                        createElement(Button, { onClick: this.handlePasteStyle }, "Paste Style"))),
                ClearAllCustomStyle(props))));
    };
    return StyleEditor;
}(BaseWidget));
var templateObject_1$a, templateObject_2$8;

var Icon$1 = styled.div(templateObject_3$4 || (templateObject_3$4 = __makeTemplateObject(["\n  position: absolute;\n  top: calc(50% - 10px);\n  ", ";\n  border-radius: 50%;\n  width: 20px;\n  height: 20px;\n  text-align: center;\n  //@ts-ignore\n  background: ", ";\n  cursor: pointer;\n  padding: 0;\n  font-size: 14px;\n  line-height: 20px;\n  border: 0;\n  z-index: 2;\n"], ["\n  position: absolute;\n  top: calc(50% - 10px);\n  ",
    ";\n  border-radius: 50%;\n  width: 20px;\n  height: 20px;\n  text-align: center;\n  //@ts-ignore\n  background: ", ";\n  cursor: pointer;\n  padding: 0;\n  font-size: 14px;\n  line-height: 20px;\n  border: 0;\n  z-index: 2;\n"])), function (_a) {
    var dir = _a.dir;
    if (dir === TopicDirection.RIGHT)
        return css(templateObject_1$b || (templateObject_1$b = __makeTemplateObject(["\n        right: -25px;\n      "], ["\n        right: -25px;\n      "])));
    if (dir === TopicDirection.LEFT)
        return css(templateObject_2$9 || (templateObject_2$9 = __makeTemplateObject(["\n        left: -25px;\n      "], ["\n        left: -25px;\n      "])));
}, function (props) { return props.background; });
function TopicCollapseIcon(props) {
    var _a;
    var model = props.model, topicKey = props.topicKey, topicStyle = props.topicStyle, dir = props.dir, saveRef = props.saveRef, onClickCollapse = props.onClickCollapse;
    var topic = model.getTopic(topicKey);
    return topic.subKeys.size > 0 ? (createElement(Icon$1, { ref: saveRef(collapseRefKey(topicKey)), onClick: onClickCollapse, background: topicStyle.background, dir: dir, className: cx((_a = {
                icon: true,
                iconfont: true
            },
            _a["bm-" + (topic.collapse ? 'plus' : 'minus')] = true,
            _a)) })) : null;
}
var templateObject_1$b, templateObject_2$9, templateObject_3$4;

var log$9 = debug('node:topic-content2');
var EditingRoot = styled.div(templateObject_1$c || (templateObject_1$c = __makeTemplateObject(["\n  position: relative;\n"], ["\n  position: relative;\n"])));
var EditingWrapper = styled.div(templateObject_2$a || (templateObject_2$a = __makeTemplateObject(["\n  position: absolute;\n  left: 0;\n  top: 0;\n  width: auto;\n  z-index: 10;\n  color: black;\n"], ["\n  position: absolute;\n  left: 0;\n  top: 0;\n  width: auto;\n  z-index: 10;\n  color: black;\n"])));
var cancelEvent$1 = function (e) {
    log$9('cancelEvent');
    e.preventDefault();
    e.stopPropagation();
};
function TopicContent(props) {
    var controller = props.controller, model = props.model, topicKey = props.topicKey, getRef = props.getRef;
    var readOnly = model.editingContentKey !== topicKey;
    var editor = controller.run('renderTopicContentEditor', __assign(__assign({}, props), { readOnly: readOnly }));
    var child;
    if (readOnly) {
        child = editor;
    }
    else {
        var wrapper_1;
        var wrapperRef = function (ref) {
            if (ref) {
                wrapper_1 = ref;
                contentResizeObserver_1.observe(wrapper_1);
            }
        };
        var rect_1 = { width: 50, height: 40 };
        var editorDiv = getRef("content-editor-" + topicKey);
        if (editorDiv)
            rect_1 = editorDiv.getBoundingClientRect();
        var contentResizeCallback = function (entries, observer) {
            var r = entries[0].contentRect;
            wrapper_1.style.left = (rect_1.width - r.width) / 2 + 'px';
            wrapper_1.style.top = (rect_1.height - r.height) / 2 + 'px';
        };
        var contentResizeObserver_1 = new ResizeObserver(contentResizeCallback);
        log$9(rect_1);
        child = (createElement(Fragment, null,
            createElement("div", { style: { width: rect_1.width, height: rect_1.height } }),
            createElement(EditingWrapper, { ref: wrapperRef }, editor)));
    }
    return (createElement(EditingRoot, { onDragEnter: cancelEvent$1, onDragOver: cancelEvent$1 }, child));
}
var templateObject_1$c, templateObject_2$a;

var log$a = debug('node:topic-content-widget');
var TopicContent$1 = styled.div(templateObject_1$d || (templateObject_1$d = __makeTemplateObject(["\n  display: flex;\n  align-items: center;\n  cursor: pointer;\n  //overflow: hidden;\n  position: relative;\n"], ["\n  display: flex;\n  align-items: center;\n  cursor: pointer;\n  //overflow: hidden;\n  position: relative;\n"])));
var TopicContentWithDropArea = styled.div(templateObject_2$b || (templateObject_2$b = __makeTemplateObject(["\n  position: relative;\n"], ["\n  position: relative;\n"])));
var TopicContentWidget = /** @class */ (function (_super) {
    __extends(TopicContentWidget, _super);
    function TopicContentWidget(props) {
        var _this = _super.call(this, props) || this;
        _this.onDragStart = function (ev) {
            _this.run('handleTopicDragStart', __assign(__assign({}, _this.props), { ev: ev }));
        };
        _this.onDragOver = function (ev) {
            // log('onDragOver');
            ev.preventDefault();
        };
        _this.onDragEnter = function (ev) {
            log$a('onDragEnter', _this.props.topicKey);
            _this.run('handleTopicDragEnter', __assign(__assign({}, _this.props), { ev: ev, dropDir: 'in' }));
        };
        _this.onDragLeave = function (ev) {
            _this.run('handleTopicDragLeave', __assign(__assign({}, _this.props), { ev: ev, dropDir: 'in' }));
        };
        _this.onDrop = function (ev) {
            log$a('onDrop');
            _this.run('handleTopicDrop', __assign(__assign({}, _this.props), { ev: ev, dropDir: 'in' }));
        };
        _this.onClick = function (ev) {
            _this.isDoubleClick = false;
            var props = _this.props;
            var controller = props.controller;
            setTimeout(function () {
                if (!_this.isDoubleClick) {
                    controller.run('handleTopicClick', __assign(__assign({}, props), { ev: ev }));
                }
            });
        };
        _this.onDoubleClick = function (ev) {
            _this.isDoubleClick = true;
            var controller = _this.props.controller;
            controller.run('handleTopicDoubleClick', __assign(__assign({}, _this.props), { ev: ev }));
        };
        _this.needRelocation = false;
        _this.onClickCollapse = function (e) {
            e.stopPropagation();
            var _a = _this.props, topicKey = _a.topicKey, getRef = _a.getRef;
            _this.needRelocation = true;
            _this.oldCollapseIconRect = getRef(collapseRefKey(topicKey)).getBoundingClientRect();
            _this.operation(OpType.TOGGLE_COLLAPSE, _this.props);
        };
        _this.state = {
            dragEnter: false
        };
        return _this;
    }
    TopicContentWidget.prototype.renderContextMenu = function () {
        var controller = this.props.controller;
        this.operation(OpType.FOCUS_TOPIC, __assign(__assign({}, this.props), { focusMode: FocusMode.SHOW_POPUP }));
        return controller.run('renderTopicContextMenu', this.props);
    };
    TopicContentWidget.prototype.onContextMenuClose = function () {
        // Optional method called once the context menu is closed.
    };
    TopicContentWidget.prototype.componentDidUpdate = function () {
        if (this.needRelocation) {
            var _a = this.props, getRef = _a.getRef, topicKey = _a.topicKey, setViewBoxScrollDelta = _a.setViewBoxScrollDelta;
            var newRect = getRef(collapseRefKey(topicKey)).getBoundingClientRect();
            log$a('newRect:', newRect);
            log$a('oldRect:', this.oldCollapseIconRect);
            setViewBoxScrollDelta(newRect.left - this.oldCollapseIconRect.left, newRect.top - this.oldCollapseIconRect.top);
            this.needRelocation = false;
        }
    };
    TopicContentWidget.prototype.render = function () {
        var props = this.props;
        var saveRef = props.saveRef, topicKey = props.topicKey, model = props.model, controller = props.controller, topicStyle = props.topicStyle, dir = props.dir;
        var draggable = model.editingContentKey !== topicKey;
        var collapseIcon = controller.run('renderTopicCollapseIcon', __assign(__assign({}, props), { onClickCollapse: this.onClickCollapse.bind(this) }));
        // log(dir);
        var prevDropArea = controller.run('renderTopicDropArea', __assign(__assign({}, props), { dropDir: 'prev' }));
        var nextDropArea = controller.run('renderTopicDropArea', __assign(__assign({}, props), { dropDir: 'next' }));
        var dropEventHandlers = {
            onDragEnter: this.onDragEnter,
            onDragLeave: this.onDragLeave,
            onDragOver: this.onDragOver,
            onDrop: this.onDrop
        };
        log$a(topicKey, 'style', topicStyle);
        return (createElement(TopicContentWithDropArea, null,
            prevDropArea,
            createElement(TopicContent$1, __assign({ style: topicStyle, draggable: draggable, ref: saveRef(contentRefKey(topicKey)), onDragStart: this.onDragStart, onClick: this.onClick, onDoubleClick: this.onDoubleClick }, dropEventHandlers), controller.run('renderTopicBlocks', props)),
            nextDropArea,
            dir !== TopicDirection.MAIN && collapseIcon));
    };
    TopicContentWidget = __decorate([
        ContextMenuTarget
    ], TopicContentWidget);
    return TopicContentWidget;
}(BaseWidget));
var templateObject_1$d, templateObject_2$b;

var TopicContextMenu = /** @class */ (function (_super) {
    __extends(TopicContextMenu, _super);
    function TopicContextMenu() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TopicContextMenu.prototype.render = function () {
        var controller = this.props.controller;
        return (createElement(Menu, null, controller.run('customizeTopicContextMenu', this.props)));
    };
    return TopicContextMenu;
}(BaseWidget));

var log$b = debug('node:topic-desc');
//TODO
var DescIcon = styled.div(templateObject_1$e || (templateObject_1$e = __makeTemplateObject([""], [""])));
var DescEditorWrapper = styled.div(templateObject_2$c || (templateObject_2$c = __makeTemplateObject(["\n  overflow: auto;\n  padding: 0px 0px 0px 20px;\n  background: #88888850;\n"], ["\n  overflow: auto;\n  padding: 0px 0px 0px 20px;\n  background: #88888850;\n"])));
var TooltipContentWrapper = styled.div(templateObject_3$5 || (templateObject_3$5 = __makeTemplateObject(["\n  overflow: auto;\n"], ["\n  overflow: auto;\n"])));
function TopicDesc(props) {
    var controller = props.controller, model = props.model, topicKey = props.topicKey, getRef = props.getRef;
    var isEditing = model.editingDescKey === topicKey;
    log$b('isEditing', isEditing);
    var onClick = function (e) {
        e.stopPropagation();
        controller.run('operation', __assign(__assign({}, props), { opType: OpType.START_EDITING_DESC }));
    };
    var onDescEditorClose = function (e) {
        e.stopPropagation();
        var key = "topic-desc-data-" + topicKey;
        var descData = controller.run('deleteTempValue', { key: key });
        controller.run('operation', __assign(__assign({}, props), { opArray: [
                {
                    opType: OpType.SET_TOPIC_DESC,
                    topicKey: topicKey,
                    data: descData
                },
                {
                    opType: OpType.FOCUS_TOPIC,
                    topicKey: topicKey,
                    focusMode: FocusMode.NORMAL
                }
            ] }));
    };
    var desc = model.getTopic(topicKey).getBlock(BlockType.DESC);
    if (!isEditing &&
        controller.run('isBlockEmpty', __assign(__assign({}, props), { block: desc.block })))
        return null;
    var descEditor = controller.run('renderTopicDescEditor', props);
    var diagramRoot = getRef(DIAGRAM_ROOT_KEY);
    var style = {
        maxWidth: '800px',
        maxHeight: '600px'
    };
    if (diagramRoot) {
        var dRect = diagramRoot.getBoundingClientRect();
        style.maxWidth = dRect.width * 0.6 + "px";
        style.maxHeight = dRect.height * 0.8 + "px";
    }
    var tooltipContent = (createElement(TooltipContentWrapper, { onClick: cancelEvent, classname: Classes.POPOVER_DISMISS, style: style }, descEditor));
    var icon = (createElement(DescIcon, { onClick: onClick, className: iconClassName(IconName.NOTES), tabIndex: -1 }));
    var tooltipProps = {
        autoFocus: false,
        content: tooltipContent,
        target: icon,
        interactionKind: PopoverInteractionKind.HOVER,
        hoverOpenDelay: 500
    };
    var descIcon = desc.block && createElement(Popover, __assign({}, tooltipProps));
    return (createElement(Fragment, null,
        descIcon,
        createElement(Drawer, { title: "Edit Notes", icon: Icon('note'), isOpen: isEditing, hasBackdrop: true, isCloseButtonShown: false, onClose: onDescEditorClose, size: "70%" },
            createElement(DescEditorWrapper, null, descEditor))));
}
var templateObject_1$e, templateObject_2$c, templateObject_3$5;

var FocusHighlightSvg = styled.svg(templateObject_1$f || (templateObject_1$f = __makeTemplateObject(["\n  width: 100%;\n  height: 100%;\n  position: absolute;\n  left: 0;\n  top: 0;\n  z-index: 2;\n  pointer-events: none;\n"], ["\n  width: 100%;\n  height: 100%;\n  position: absolute;\n  left: 0;\n  top: 0;\n  z-index: 2;\n  pointer-events: none;\n"])));
var TopicHighlight = /** @class */ (function (_super) {
    __extends(TopicHighlight, _super);
    function TopicHighlight() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            content: null
        };
        return _this;
    }
    TopicHighlight.prototype.layout = function () {
        var _a = this.props, getRef = _a.getRef, model = _a.model;
        var focusKey = model.focusKey;
        var focusMode = model.focusMode;
        if (!focusKey || focusMode === FocusMode.EDITING_CONTENT) {
            this.setState({
                content: null
            });
            return;
        }
        var contentRect = getRef(contentRefKey(focusKey)).getBoundingClientRect();
        var svgRect = getRef('svg-highlight').getBoundingClientRect();
        var padding = 3;
        var x = contentRect.left - svgRect.left - padding;
        var y = contentRect.top - svgRect.top - padding;
        var width = contentRect.width + 2 * padding;
        var height = contentRect.height + 2 * padding;
        this.setState({
            content: (createElement("rect", { x: x, y: y, width: width, height: height, fill: "none", stroke: model.config.theme.highlightColor, strokeWidth: 2 }))
        });
    };
    TopicHighlight.prototype.render = function () {
        var saveRef = this.props.saveRef;
        return (createElement(FocusHighlightSvg, { ref: saveRef('svg-highlight') }, this.state.content));
    };
    return TopicHighlight;
}(BaseWidget));
var templateObject_1$f;

var TopicLinksSvg = styled.svg(templateObject_1$g || (templateObject_1$g = __makeTemplateObject(["\n  width: 100%;\n  height: 100%;\n  position: absolute;\n  left: 0;\n  top: 0;\n  z-index: 1;\n  pointer-events: none;\n"], ["\n  width: 100%;\n  height: 100%;\n  position: absolute;\n  left: 0;\n  top: 0;\n  z-index: 1;\n  pointer-events: none;\n"])));
var log$c = debug('node:topic-sub-links');
var TopicSubLinks = /** @class */ (function (_super) {
    __extends(TopicSubLinks, _super);
    function TopicSubLinks() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            curves: []
        };
        return _this;
    }
    TopicSubLinks.prototype.layout = function () {
        var props = this.props;
        var model = props.model, getRef = props.getRef, topicKey = props.topicKey, dir = props.dir, controller = props.controller;
        var topic = model.getTopic(topicKey);
        var content = getRef(contentRefKey(topicKey));
        var svgRect = getRef(linksSvgRefKey(topicKey)).getBoundingClientRect();
        var collapseRect = getRef(collapseRefKey(topicKey)).getBoundingClientRect();
        var contentRect = content.getBoundingClientRect();
        var p1, p2, p3;
        if (dir === TopicDirection.RIGHT) {
            p1 = {
                x: 0,
                y: centerY(contentRect) - svgRect.top
            };
            p2 = {
                x: collapseRect.right - svgRect.left + 10,
                y: p1.y
            };
        }
        else if (dir === TopicDirection.LEFT) {
            p1 = {
                x: svgRect.right - svgRect.left,
                y: centerY(contentRect) - svgRect.top
            };
            p2 = {
                x: collapseRect.left - svgRect.left - 10,
                y: p1.y
            };
        }
        var curves = [];
        topic.subKeys.forEach(function (key) {
            var curve;
            var linkStyle = controller.run('getLinkStyle', __assign(__assign({}, props), { topicKey: key }));
            var rect = getRef(contentRefKey(key)).getBoundingClientRect();
            if (dir === TopicDirection.RIGHT) {
                p3 = {
                    x: rect.left - svgRect.left,
                    y: centerY(rect) - svgRect.top
                };
            }
            if (dir === TopicDirection.LEFT) {
                p3 = {
                    x: rect.right - svgRect.left,
                    y: centerY(rect) - svgRect.top
                };
            }
            var lineType = linkStyle.lineType;
            if (lineType === 'curve') {
                curve = "M " + p1.x + " " + p1.y + " L " + p2.x + " " + p2.y + " C " + p2.x + " " + centerPointY(p2, p3) + " " + centerPointX(p2, p3) + " " + p3.y + " " + p3.x + " " + p3.y;
            }
            else if (lineType === 'round') {
                var vDir = p3.y > p1.y ? 1 : -1;
                var hDir = p3.x > p1.x ? 1 : -1;
                var radius = linkStyle.lineRadius;
                // if (p3.y === p1.y) { //这样判断不可靠
                if (topic.subKeys.size === 1 || Math.abs(p3.y - p1.y) <= 1) {
                    curve = "M " + p1.x + " " + p1.y + " L " + p3.x + " " + p3.y;
                }
                else {
                    // 0 表示逆时针 1 表示顺时针
                    curve = "M " + p1.x + " " + p1.y + " H " + p2.x + " V " + (p3.y -
                        vDir * radius) + " A " + radius + " " + radius + " 0 0 " + (vDir * hDir === 1 ? 0 : 1) + " " + (p2.x + radius * hDir) + " " + p3.y + " H " + p3.x;
                }
            }
            else if (lineType === 'line') {
                curve = "M " + p1.x + " " + p1.y + " H " + p2.x + " L " + p3.x + " " + p3.y;
            }
            curves.push(createElement("path", { key: "link-" + key, d: curve, strokeWidth: linkStyle.lineWidth, stroke: linkStyle.lineColor, fill: "none" }));
        });
        this.setState({
            curves: curves
        });
    };
    TopicSubLinks.prototype.render = function () {
        var _a = this.props, topicKey = _a.topicKey, saveRef = _a.saveRef;
        return (createElement(TopicLinksSvg, { ref: saveRef(linksSvgRefKey(topicKey)) },
            createElement("g", null, this.state.curves)));
    };
    return TopicSubLinks;
}(BaseWidget));
var templateObject_1$g;

var items = [
    {
        icon: 'edit',
        label: 'edit',
        shortcut: 'Space',
        rootCanUse: true,
        opType: OpType.START_EDITING_CONTENT
    },
    {
        icon: 'add-sibling',
        label: 'add sibling',
        shortcut: 'Enter',
        opType: OpType.ADD_SIBLING
    },
    {
        icon: 'add-child',
        label: 'add child',
        shortcut: 'Tab',
        rootCanUse: true,
        opType: OpType.ADD_CHILD
    },
    {
        icon: 'notes',
        label: 'edit notes',
        shortcut: 'Alt + D',
        rootCanUse: true,
        opType: OpType.START_EDITING_DESC
    },
    {
        icon: 'delete-node',
        label: 'delete node',
        shortcut: 'delete',
        opType: OpType.DELETE_TOPIC
    },
    {
        icon: 'root',
        label: 'set as editor root',
        shortcut: 'Alt + Shift + F',
        opType: OpType.SET_EDITOR_ROOT
    }
];
function customizeTopicContextMenu(props) {
    var topicKey = props.topicKey, model = props.model, controller = props.controller;
    var isRoot = topicKey === model.editorRootTopicKey;
    function onClickItem(item) {
        return function (e) {
            item.opType &&
                controller.run('operation', __assign(__assign({}, props), { opType: item.opType }));
        };
    }
    return items.map(function (item) {
        return isRoot && !item.rootCanUse ? null : (createElement(MenuItem, { key: item.label, icon: Icon(item.icon), text: item.label, labelElement: createElement("kbd", null, item.shortcut), onClick: onClickItem(item) }));
    });
}

function Theme(_a) {
    var theme = _a.theme, children = _a.children;
    return (
    //@ts-ignore
    createElement(ThemeProvider, { theme: theme },
        createElement(Fragment, null, children)));
}

var log$d = debug('plugin:rendering');
function RenderingPlugin() {
    var DiagramRoot = styled.div(templateObject_1$h || (templateObject_1$h = __makeTemplateObject(["\n    width: 100%;\n    height: 100%;\n    background: ", ";\n    position: relative;\n  "], ["\n    width: 100%;\n    height: 100%;\n    background: ", ";\n    position: relative;\n  "])), function (props) { return props.theme.background; });
    return {
        renderDiagram: function (props) {
            var model = props.model, controller = props.controller;
            return (createElement(SaveRef, null, function (saveRef, getRef) {
                var widgetProps = __assign(__assign({}, props), { saveRef: saveRef,
                    getRef: getRef });
                log$d('renderDiagram', model);
                return (createElement(Theme, { theme: model.config.theme },
                    createElement(DiagramRoot, { ref: saveRef(DIAGRAM_ROOT_KEY) },
                        createElement(MindDragScrollWidget, __assign({}, widgetProps)),
                        controller.run('renderDiagramCustomize', widgetProps))));
            }));
        },
        renderDiagramCustomize: function (props) {
            var controller = props.controller, model = props.model;
            var breadcrumbs = controller.run('renderEditorRootBreadcrumbs', __assign(__assign({}, props), { topicKey: model.focusKey }));
            var styleEditor = controller.run('renderStyleEditor', __assign(__assign({}, props), { topicKey: model.focusKey }));
            var modals = controller.run('renderModals', __assign(__assign({}, props), { topicKey: model.focusKey }));
            return [breadcrumbs, styleEditor, modals];
        },
        renderEditorRootBreadcrumbs: function (props) {
            return createElement(EditorRootBreadcrumbs, __assign({ key: "EditorRootBreadcrumbs" }, props));
        },
        renderModals: function (props) {
            return createElement(Modals, __assign({ key: "modals" }, props));
        },
        renderModal: function (props) {
            // const { controller, model } = props;
            // const activeModalProps = controller.run('getActiveModalProps', props);
            // if (activeModalProps) {
            //   if (activeModalProps.name === 'edit-desc') {
            //     const modalProps = { ...props, topicKey: model.focusKey };
            //     return (
            //       <ModalBody>
            //         <ModalDescEditor>
            //           {controller.run('renderTopicDescEditor', modalProps)}
            //         </ModalDescEditor>
            //       </ModalBody>
            //     );
            //   }
            // }
            return null;
        },
        getActiveModalProps: function (props) {
            // const { model } = props;
            // if (model.focusKey && model.focusMode === FocusMode.EDITING_DESC)
            //   return {
            //     name: 'edit-desc',
            //     title: 'Edit Notes',
            //     style: {
            //       width: '50%',
            //       height: '600px'
            //     }
            //   };
            return null;
        },
        renderDoc: function (_a) {
            var children = _a.children;
            return children;
        },
        renderRootWidget: function (props) {
            return createElement(RootWidget, __assign({}, props));
        },
        renderTopicWidget: function (props) {
            return createElement(TopicWidget, __assign({}, props));
        },
        renderTopicContent: function (props) {
            return createElement(TopicContentWidget, __assign({}, props));
        },
        renderTopicContextMenu: function (props) {
            return createElement(TopicContextMenu, __assign({}, props));
        },
        customizeTopicContextMenu: customizeTopicContextMenu,
        renderTopicCollapseIcon: function (props) {
            return createElement(TopicCollapseIcon, __assign({}, props));
        },
        renderTopicBlocks: function (props) {
            var model = props.model, topicKey = props.topicKey, controller = props.controller;
            var topic = model.getTopic(topicKey);
            var blocks = topic.blocks;
            var res = [];
            var i = 0;
            blocks.forEach(function (block) {
                var b = controller.run('renderTopicBlock', __assign(__assign({}, props), { block: block, blockKey: "block-" + i }));
                if (b) {
                    res.push(createElement(Fragment, { key: "block-" + i }, b));
                    i++;
                }
            });
            return res;
        },
        renderTopicBlock: function (props) {
            var controller = props.controller, block = props.block, topicKey = props.topicKey, model = props.model;
            switch (block.type) {
                case BlockType.CONTENT:
                    return controller.run('renderTopicBlockContent', props);
                case BlockType.DESC:
                    return controller.run('renderTopicBlockDesc', props);
            }
            return null;
        },
        renderTopicBlockContent: function (props) {
            return createElement(TopicContent, __assign({}, props));
        },
        renderTopicBlockDesc: function (props) {
            return createElement(TopicDesc, __assign({}, props));
        },
        renderSubLinks: function (props) {
            var saveRef = props.saveRef, topicKey = props.topicKey, model = props.model;
            var topic = model.getTopic(topicKey);
            if (topic.subKeys.size === 0 || topic.collapse)
                return null;
            return createElement(TopicSubLinks, __assign({ ref: saveRef(linksRefKey(topicKey)) }, props));
        },
        renderRootSubLinks: function (props) {
            var saveRef = props.saveRef, topicKey = props.topicKey, model = props.model;
            var topic = model.getTopic(topicKey);
            if (topic.subKeys.size === 0)
                return null;
            return createElement(RootSubLinks, __assign({ ref: saveRef(linksRefKey(topicKey)) }, props));
        },
        renderFocusItemHighlight: function (props) {
            var saveRef = props.saveRef;
            return createElement(TopicHighlight, __assign({ ref: saveRef('focus-highlight') }, props));
        },
        renderRootWidgetOtherChildren: function (props) {
            var controller = props.controller;
            return (createElement(Fragment, null,
                controller.run('renderRootSubLinks', props),
                controller.run('renderFocusItemHighlight', props),
                controller.run('renderDragAndDropEffect', props)));
        },
        renderStyleEditor: function (props) {
            return createElement(StyleEditor, __assign({ key: "style-editor" }, props));
        }
    };
}
var templateObject_1$h;

var log$e = debug('plugin:utils');
function UtilsPlugin() {
    var tempValueMap = new Map();
    return {
        getTempValue: function (props) {
            var key = props.key;
            log$e('getTempValue', key);
            return tempValueMap.get(key);
        },
        setTempValue: function (props) {
            var key = props.key, value = props.value;
            log$e('setTempValue', key);
            tempValueMap.set(key, value);
        },
        deleteTempValue: function (props) {
            var key = props.key;
            log$e('deleteTempValue', key);
            var value = tempValueMap.get(key);
            tempValueMap.delete(key);
            return value;
        }
    };
}

function ReactPlugin(options) {
    return [RenderingPlugin(), UtilsPlugin()];
}

var log$f = debug('plugin:StylePlugin');
function StylePlugin() {
    var colorMap = new Map();
    var colorIndex = 0;
    return {
        getTopicStyle: function (props) {
            var controller = props.controller;
            return {
                contentStyle: controller.run('getTopicContentStyle', props),
                linkStyle: controller.run('getLinkStyle', props),
                subLinkStyle: controller.run('getSubLinkStyle', props)
            };
        },
        getTopicContentStyle: function (props) {
            var topicKey = props.topicKey, model = props.model, controller = props.controller;
            log$f('getTopicContentStyle:', topicKey, model);
            var visualLevel = model.getTopicVisualLevel(topicKey);
            var theme = model.config.theme;
            var themeStyle;
            if (visualLevel === TopicVisualLevel.ROOT)
                themeStyle = theme.rootTopic;
            else if (visualLevel === TopicVisualLevel.PRIMARY)
                themeStyle = theme.primaryTopic;
            else
                themeStyle = theme.normalTopic;
            themeStyle = __assign(__assign({}, theme.contentStyle), themeStyle.contentStyle);
            if (theme.randomColor) {
                var randomColor = controller.run('getRandomColor', props);
                themeStyle = __assign(__assign({}, themeStyle), { background: randomColor, borderColor: randomColor, subLinkStyle: __assign(__assign({}, themeStyle.subLinkStyle), { lineColor: randomColor }) });
            }
            var topic = model.getTopic(topicKey);
            if (!topic.style) {
                return themeStyle;
            }
            var customStyle = JSON.parse(topic.style);
            return __assign(__assign({}, themeStyle), customStyle.contentStyle);
        },
        getLinkStyle: function (props) {
            var topicKey = props.topicKey, model = props.model, controller = props.controller;
            log$f('getLinkStyle', topicKey);
            var visualLevel = model.getTopicVisualLevel(topicKey);
            var theme = model.config.theme;
            var linkStyle = theme.linkStyle;
            var presetStyle;
            if (visualLevel === TopicVisualLevel.ROOT)
                presetStyle = theme.rootTopic.linkStyle;
            else if (visualLevel === TopicVisualLevel.PRIMARY)
                presetStyle = theme.primaryTopic.linkStyle;
            else
                presetStyle = theme.normalTopic.linkStyle;
            linkStyle = __assign(__assign({}, linkStyle), presetStyle);
            var topic = model.getTopic(topicKey);
            // 获取父节点的color
            // if (theme.randomColor) {
            //   const randomColor = controller.run('getRandomColor', {
            //     ...props,
            //     topicKey:
            //       topic.parentKey !== model.editorRootTopicKey
            //         ? topic.parentKey
            //         : topicKey
            //   });
            //   log(randomColor);
            //   linkStyle = {
            //     ...linkStyle,
            //     lineColor: randomColor
            //   };
            // }
            if (topic.parentKey != null) {
                var parentSubLinkStyle = controller.run('getSubLinkStyle', __assign(__assign({}, props), { topicKey: topic.parentKey }));
                linkStyle = __assign(__assign({}, linkStyle), parentSubLinkStyle);
            }
            if (!topic.style) {
                return linkStyle;
            }
            var customStyle = JSON.parse(topic.style);
            return __assign(__assign({}, linkStyle), customStyle.linkStyle);
        },
        getSubLinkStyle: function (props) {
            var topicKey = props.topicKey, model = props.model, controller = props.controller;
            log$f('getLinkStyle', topicKey);
            var visualLevel = model.getTopicVisualLevel(topicKey);
            var theme = model.config.theme;
            var subLinkStyle = theme.linkStyle;
            var presetStyle;
            if (visualLevel === TopicVisualLevel.ROOT)
                presetStyle = theme.rootTopic.subLinkStyle;
            else if (visualLevel === TopicVisualLevel.PRIMARY)
                presetStyle = theme.primaryTopic.subLinkStyle;
            else
                presetStyle = theme.normalTopic.subLinkStyle;
            subLinkStyle = __assign(__assign({}, subLinkStyle), presetStyle);
            var topic = model.getTopic(topicKey);
            // 获取父节点的color
            if (theme.randomColor) {
                var randomColor = controller.run('getRandomColor', props);
                log$f(randomColor);
                subLinkStyle = __assign(__assign({}, subLinkStyle), { lineColor: randomColor });
            }
            if (!topic.style) {
                return subLinkStyle;
            }
            var customStyle = JSON.parse(topic.style);
            var res = __assign(__assign({}, subLinkStyle), customStyle.subLinkStyle);
            // if (res.lineRadius == null) res.lineRadius = 5;
            return res;
        },
        setTopicContentStyle: function (props) {
            var topicKey = props.topicKey, controller = props.controller, style = props.style, model = props.model;
            var topic = model.getTopic(topicKey);
            var topicStyle = topic.style;
            var styleObj = topicStyle ? JSON.parse(topicStyle) : {};
            var newStyleObj = __assign(__assign({}, styleObj), { contentStyle: __assign(__assign({}, styleObj.contentStyle), style) });
            if (!isEqual(styleObj, newStyleObj)) {
                var newStyleStr = JSON.stringify(newStyleObj);
                controller.run('operation', __assign(__assign({}, props), { opType: OpType.SET_STYLE, style: newStyleStr }));
            }
        },
        setLinkStyle: function (props) {
            var topicKey = props.topicKey, controller = props.controller, linkStyle = props.linkStyle, model = props.model;
            var topic = model.getTopic(topicKey);
            var style = topic.style;
            var styleObj = style ? JSON.parse(style) : {};
            var newStyleObj = __assign(__assign({}, styleObj), { linkStyle: __assign(__assign({}, styleObj.linkStyle), linkStyle) });
            if (!isEqual(styleObj, newStyleObj)) {
                var newStyleStr = JSON.stringify(newStyleObj);
                controller.run('operation', __assign(__assign({}, props), { opType: OpType.SET_STYLE, style: newStyleStr }));
            }
        },
        setSubLinkStyle: function (props) {
            var topicKey = props.topicKey, controller = props.controller, subLinkStyle = props.subLinkStyle, model = props.model;
            var topic = model.getTopic(topicKey);
            var style = topic.style;
            var styleObj = style ? JSON.parse(style) : {};
            var newStyleObj = __assign(__assign({}, styleObj), { subLinkStyle: __assign(__assign({}, styleObj.subLinkStyle), subLinkStyle) });
            if (!isEqual(styleObj, newStyleObj)) {
                var newStyleStr = JSON.stringify(newStyleObj);
                controller.run('operation', __assign(__assign({}, props), { opType: OpType.SET_STYLE, style: newStyleStr }));
            }
        },
        getTopicThemeStyle: function (props) {
            var topicKey = props.topicKey, model = props.model;
            var visualLevel = model.getTopicVisualLevel(topicKey);
            var theme = model.config.theme;
            if (visualLevel === TopicVisualLevel.ROOT)
                return theme.rootTopic;
            if (visualLevel === TopicVisualLevel.PRIMARY)
                return theme.primaryTopic;
            return theme.normalTopic;
        },
        getRandomColor: function (props) {
            var topicKey = props.topicKey;
            if (colorMap.has(topicKey))
                return colorMap.get(topicKey);
            var colors = [
                '#00CC99',
                '#FFEE88',
                '#A167A5',
                '#E5F993',
                '#F5C396',
                '#DB995A',
                '#83BCFF',
                '#ED7B84',
                '#739E82',
                '#D3BCC0',
                '#FFA0FD',
                '#EFD3D7',
                '#C6878F'
            ];
            var color = colors[++colorIndex % colors.length];
            colorMap.set(topicKey, color);
            log$f('getRandomColor', topicKey, color);
            return color;
        },
        clearAllCustomStyle: function (props) {
            var model = props.model, controller = props.controller;
            var newModel = model.withMutations(function (model) {
                model.topics.keySeq().forEach(function (key) {
                    model.setIn(['topics', key, 'style'], null);
                });
            });
            controller.change(newModel);
        }
    };
}

function DefaultPlugin() {
    return [
        ReactPlugin(),
        LayoutPlugin(),
        OperationPlugin(),
        StylePlugin(),
        EventPlugin(),
        HotKeyPlugin(),
        DragAndDrop(),
        SimpleTextEditorPlugin()
    ];
}

var log$g = debug('node:Diagram');
var Diagram = /** @class */ (function (_super) {
    __extends(Diagram, _super);
    function Diagram() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.resolveController = memoizeOne(function (plugins, commands, TheDefaultPlugin) {
            if (plugins === void 0) { plugins = []; }
            var defaultPlugin = TheDefaultPlugin();
            _this.controller = new Controller({
                plugins: [plugins, defaultPlugin],
                commands: commands,
                construct: false,
                onChange: _this.props.onChange
            });
            _this.controller.run('onConstruct');
        });
        return _this;
    }
    Diagram.prototype.getDiagramProps = function () {
        return this.diagramProps;
    };
    Diagram.prototype.renderHotkeys = function () {
        var controller = this.diagramProps.controller;
        var hotKeys = controller.run('customizeHotKeys', this.diagramProps);
        if (hotKeys === null)
            return null;
        if (!(hotKeys instanceof Map)) {
            throw new TypeError('customizeHotKeys must return a Map');
        }
        var children = [];
        hotKeys.forEach(function (v, k) {
            children.push(createElement(Hotkey, __assign({ key: k }, v, { global: true })));
        });
        return createElement(Hotkeys, null, children);
    };
    Diagram.prototype.render = function () {
        var _a = this.props, commands = _a.commands, plugins = _a.plugins, model = _a.model;
        this.resolveController(plugins, commands, DefaultPlugin);
        this.diagramProps = __assign(__assign({}, this.props), { controller: this.controller, model: model, diagram: this });
        return this.controller.run('renderDiagram', this.diagramProps);
    };
    Diagram = __decorate([
        HotkeysTarget
    ], Diagram);
    return Diagram;
}(Component));

export { BaseWidget, CloseIcon, DIAGRAM_ROOT_KEY, Diagram, DragScrollWidget, Flex, Icon, IconBg, IconName, Margin, SaveRef, ShowMenuIcon, Title, cancelEvent, centerPointX, centerPointY, centerX, centerY, collapseRefKey, contentRefKey, getLinkKey, iconClassName, linksRefKey, linksSvgRefKey, topicRefKey };
//# sourceMappingURL=main.es.js.map
