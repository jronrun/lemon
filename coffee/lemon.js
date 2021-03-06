
/*
	lemon.coffee
	@author paulo.ye https://github.com/jronrun/lemon
 */

(function() {
  "use strict";
  var _, arrayFilter, arrayForeach, bindTypes, breaker, consoler, convertAsString, datetimeFmt, definedTypes, doMixing, dolog, dynamicMethod, escape, getsetMethods, j, k, len1, loggerLevels, loggerMethods, properties, registerModule, removeValue, replaces, result, root, serialize, showTypeIf, theRef, theUniqueID, tmpType, v,
    slice = [].slice,
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  root = typeof global === 'undefined' ? window : global;

  _ = function(obj) {
    if (obj instanceof _) {
      return obj;
    }
    if (!(this instanceof _)) {
      return new _(obj);
    }
    this._wrapped = obj;
  };

  _.now = function() {
    return (Date.now || function() {
      return new Date().getTime();
    })();
  };

  _.script_time = _.now();

  theUniqueID = 0;

  _.CRLF = '\r\n';

  theRef = _;

  loggerLevels = {
    log: 1,
    info: 2,
    warn: 3,
    error: 4,
    none: 5
  };

  consoler = {
    c: false
  };

  properties = {
    ctxPath: '',
    basePath: '',
    logger: loggerLevels.log,
    toStringEvent: false,
    toStringShowType: true,
    logPrefix: function(levelN) {
      return ">> " + levelN + " [" + (_.when.log()) + "]";
    },
    dateMask: {
      'default': "yyyy-mm-dd HH:MM:ss",
      log: "yyyy-mm-dd HH:MM:ss l",
      day: "yyyy-mm-dd",
      time: "HH:MM:ss",
      week: "dddd"
    },
    dateI18n: {
      day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    }
  };

  arrayForeach = Array.prototype.forEach;

  arrayFilter = Array.prototype.filter;

  breaker = false;

  escape = encodeURIComponent;

  _.each = function(obj, iterator, context) {
    var i, j, key, keys, l, len1;
    if (obj === null) {
      return obj;
    }
    if (arrayForeach && obj.forEach === arrayForeach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      i = 0;
      l = obj.length;
      while (true) {
        if (i < l || iterator.call(context, obj[i], i, obj) === breaker) {
          break;
        }
        i++;
      }
    } else {
      keys = _.keys(obj);
      for (j = 0, len1 = keys.length; j < len1; j++) {
        key = keys[j];
        if (iterator.call(context, obj[key], key, obj) === breaker) {
          return;
        }
      }
    }
    return obj;
  };

  _.filter = function(obj, predicate, context) {
    var results;
    results = [];
    if (obj === null) {
      return results;
    }
    if (arrayFilter && obj.filter === arrayFilter) {
      return obj.filter(predicate, context);
    }
    _.each(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) {
        results.push({
          index: value
        });
      }
    });
    return results;
  };

  _.extend = function(obj) {
    _.each(_.slice(arguments, 1), function(source) {
      var prop;
      if (source) {
        for (prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  _.capitalize = function(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  dynamicMethod = function(delegate, methodN, methodBody, prefixN) {
    return (function(methodN) {
      return delegate[prefixN ? prefixN + _.capitalize(methodN) : methodN] = methodBody;
    })(methodN);
  };

  _.type = function(obj, full) {
    var aType;
    if (full == null) {
      full = false;
    }
    aType = Object.prototype.toString.call(obj);
    if (full) {
      return aType;
    } else {
      return aType.slice(8, -1);
    }
  };

  definedTypes = ['Arguments', 'Array', 'Boolean', 'Date', 'Error', 'Function', 'Null', 'Number', 'Object', 'RegExp', 'String', 'Undefined', 'global'];

  bindTypes = function(type) {
    return dynamicMethod(theRef, type, (function(obj) {
      return type === _.type(obj);
    }), 'is');
  };

  for (j = 0, len1 = definedTypes.length; j < len1; j++) {
    tmpType = definedTypes[j];
    bindTypes(tmpType);
  }

  _.isFunc = _.isFunction;

  _.isWin = _.isGlobal;

  _.isJson = function(obj) {
    return typeof obj === 'object' && _.isObject(obj) && !obj.length;
  };

  _.isEvent = function(obj) {
    return !_.isNull(obj) && !_.isUndefined(obj) && (!_.isUndefined(obj.altKey) || !_.isUndefined(obj.preventDefault));
  };

  _.isBlank = function() {
    var len2, obj, q, v, valueAsBlank;
    obj = arguments[0], valueAsBlank = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    obj = _.isString(obj) ? _.trim(obj) : obj;
    if (valueAsBlank != null) {
      for (q = 0, len2 = valueAsBlank.length; q < len2; q++) {
        v = valueAsBlank[q];
        if (v === obj) {
          return true;
        }
      }
    }
    if (_.isNull(obj) || _.isUndefined(obj) || (_.isString(obj) && obj.length < 1) || (_.isJson(obj) && (_.keys(obj)).length < 1)) {
      return true;
    }
    return false;
  };

  _.isPlainObject = function(obj) {
    return _.isObject(obj) && !_.isWin(obj) && Object.getPrototypeOf(obj) === Object.prototype;
  };

  getsetMethods = function(n, v, delegate) {
    var tgt;
    tgt = delegate || theRef;
    dynamicMethod(tgt, n, (function() {
      if (!_.isFunc(properties[n])) {
        return properties[n];
      } else {
        return properties[n].apply(this, arguments);
      }
    }), 'get');
    dynamicMethod(tgt, n, (function(value) {
      return properties[n] = value;
    }), 'set');
    properties[n] = v;
  };

  _.getset = function(args, delegate) {
    var i, k, len2, props, q, v;
    props = {};
    if (_.isString(args)) {
      props[args] = null;
    } else if (_.isArray(args)) {
      for (i = q = 0, len2 = args.length; q < len2; i = ++q) {
        v = args[i];
        props[v] = null;
      }
    } else if (_.isJson(args)) {
      props = args;
    } else {
      throw new Error(_.type(arguments) + " is unsupported, must string|string array|JSON");
    }
    for (k in props) {
      v = props[k];
      getsetMethods(k, v, delegate);
    }
  };

  _.getset(properties);

  _.getset(consoler, consoler);

  _.settings = function() {
    return properties;
  };

  _.clone = function(target) {
    if (!_.isObject(target)) {
      return target;
    } else {
      if (_.isArray(target)) {
        return target.slice();
      } else {
        return _.extend({}, target);
      }
    }
  };

  serialize = function(params, obj, traditional, scope) {
    var array, hash;
    array = _.isArray(obj);
    hash = _.isPlainObject(obj);
    _.each(obj, function(value, key) {
      var type;
      type = _.type(value);
      if (scope) {
        key = traditional ? scope : scope + "[" + (hash || type === definedTypes[8] || type === definedTypes[1] ? key : '') + "]";
      }
      if (!scope && array) {
        params.add(value.name, value.value);
      } else if (type === definedTypes[1] || (!traditional && type === definedTypes[8])) {
        serialize(params, value, traditional, key);
      } else {
        params.add(key, value);
      }
    });
  };

  _.param = function(obj, traditional) {
    var params;
    params = [];
    params.add = function(k, v) {
      return this.push((escape(k)) + "=" + (escape(v)));
    };
    serialize(params, obj, traditional);
    return params.join('&').replace(/%20/g, '+');
  };

  _.getUrl = function(uri, params) {
    var p;
    p = _.isBlank(params) ? '' : '?' + (_.isJson(params) ? _.param(params) : String(params));
    if (/^http/.test(uri)) {
      return uri + p;
    } else {
      return _.getBasePath() + _.aroundIf(_.getCtxPath(), '/') + uri + p;
    }
  };

  _.getUrlVars = function() {
    var hash, href, idx, len2, q, ref, v, vars;
    vars = {};
    href = root.location.href;
    idx = href.indexOf('?');
    if (idx === -1) {
      return vars;
    }
    ref = href.slice(idx + 1).split('&');
    for (q = 0, len2 = ref.length; q < len2; q++) {
      v = ref[q];
      hash = v.split('=');
      vars[hash[0]] = hash[1];
    }
    return vars;
  };

  _.href = function(uri, params) {
    root.location.href = _.getUrl(uri, params);
  };

  _.slice = function(args, start) {
    if (_.isArguments(args)) {
      return Array.prototype.slice.call(args, start);
    }
    return (args || []).slice(start || 0);
  };

  _.startWith = function(target, start) {
    return new RegExp('^' + (_.isArray(start) ? "[" + (start.join('|')) + "]" : start)).test(target);
  };

  _.endWith = function(target, end) {
    return new RegExp((_.isArray(end) ? "[" + (end.join('|')) + "]" : end) + '$').test(target);
  };

  _.startIf = function(target, start) {
    if (_.startWith(target, start)) {
      return target;
    } else {
      return start + target;
    }
  };

  _.endIf = function(target, end) {
    if (_.endWith(target, end)) {
      return target;
    } else {
      return target + end;
    }
  };

  _.aroundWith = function(target, around) {
    return _.startWith(target, around) && _.endWith(target, around);
  };

  _.aroundIf = function(target, around) {
    return _.endIf(_.startIf(target, around), around);
  };

  _.prefix = function(target, length, fill) {
    return (Array(length).join(fill || '0') + target).slice(-length);
  };

  _.suffix = function(target, length, fill) {
    return target + Array(length + 1).join(fill || '0').slice(target.length);
  };

  _.trim = function(target, chars) {
    if (!_.isString(target)) {
      return target;
    }
    if (_.isUndefined(chars)) {
      return target.replace(/(^\s*)|(\s*$)/g, "");
    }
    return target.replace(new RegExp("(^(" + chars + ")*)|((" + chars + ")*$)", "gi"), "");
  };

  _.repeat = function(target, count) {
    return new Array(1 + count).join(target);
  };

  _.ltrim = function(target, chars) {
    if (!_.isString(target)) {
      return target;
    }
    return target.replace(new RegExp("(^" + (_.isBlank(chars) ? "\\s" : chars) + "*)"), "");
  };

  _.rtrim = function(target, chars) {
    if (!_.isString(target)) {
      return target;
    }
    return target.replace(new RegExp("(" + (_.isBlank(chars) ? "\\s" : chars) + "*$)"), "");
  };

  _.randomStr = function(length) {
    var str;
    str = '';
    while (true) {
      str += Math.random().toString(36).substr(2);
      if (str.length >= length) {
        break;
      }
    }
    return str.substr(0, length);
  };

  _.uniqueId = function(prefix) {
    var id;
    id = ++theUniqueID + '';
    if (prefix) {
      return prefix + id;
    } else {
      return id;
    }
  };

  _.times = function(n, iterator, context) {
    var accum, i;
    accum = Array(Math.max(0, n));
    i = 0;
    while (true) {
      accum[i] = iterator.call(context, i);
      ++i;
      if (i >= n) {
        break;
      }
    }
    return accum;
  };

  _.delay = function(func, wait) {
    var args;
    args = _.slice(arguments, 2);
    return setTimeout((function() {
      return func.apply(null, args);
    }), wait);
  };

  _.once = function(func) {
    var memo, ran;
    ran = false;
    memo = null;
    return function() {
      if (ran) {
        return memo;
      }
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  _.wrap = function(func, wrapper) {
    return function() {
      var args;
      args = [func];
      Array.prototype.push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  _.prop = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  _.format = function(msg, args) {
    if (!_.isArray(args)) {
      args = _.slice(arguments, 1);
    }
    return msg.replace(/\{(\d+)\}/gm, function(m, i) {
      var v;
      v = _.isUndefined(args[i]) ? m : args[i];
      if (_.isObject(v)) {
        return convertAsString(v);
      } else {
        return v;
      }
    });
  };

  removeValue = function(target, element) {
    var index, k, v;
    if (_.isArray(target)) {
      index = target.indexOf(element);
      if (index > -1) {
        target.splice(index, 1);
      }
    } else if (_.isJson(target)) {
      for (k in target) {
        v = target[k];
        if (v === element) {
          delete target[k];
        }
      }
    }
  };

  _.rmByVal = function() {
    var element, len2, q, target, v;
    target = arguments[0], element = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    for (q = 0, len2 = element.length; q < len2; q++) {
      v = element[q];
      removeValue(target, v);
    }
    return target;
  };

  _.getKey = function(obj, value) {
    var k, v;
    for (k in obj) {
      if (!hasProp.call(obj, k)) continue;
      v = obj[k];
      if (v === value) {
        return k;
      }
    }
    return null;
  };

  _.has = function(obj, target) {
    if (_.isBlank(obj)) {
      return false;
    } else if (_.isArray(obj)) {
      return indexOf.call(obj, target) >= 0;
    } else if (_.isObject(obj)) {
      return target in obj;
    } else {
      return Object.prototype.hasOwnProperty.call(obj, target);
    }
  };

  _.sleep = function(milliseconds) {
    var i, start;
    start = _.now();
    i = -1;
    while (true) {
      i++;
      if ((_.now() - start) >= milliseconds) {
        break;
      }
    }
  };


  /*
  var strtest = '<div>abc</div>happy<div>efg</div>';
  kiwi.betn(strtest , '<div>', '</div>', true);
  <div>abc</div>,<div>efg</div>
  kiwi.betn(strtest , '<div>', '</div>');
  abc,efg
   */

  _.betn = function(target, startTag, endTag, isContainTag) {
    var i, len, q, r, re, ref, ref1, result, tmp, v;
    if (_.isBlank(startTag) || _.isBlank(endTag)) {
      return target;
    }
    result = new Array();
    re = new RegExp("(?:\\" + startTag + ")([\\s\\S]*?)(?:" + endTag + ")", 'gim');
    len = target.match(re);
    if (isContainTag) {
      for (v = q = 0, ref = len.length - 1; 0 <= ref ? q <= ref : q >= ref; v = 0 <= ref ? ++q : --q) {
        result.push(len[v]);
      }
      return result;
    }
    tmp = null;
    if (_.isNull(len)) {
      return result;
    }
    for (i = r = 0, ref1 = len.length - 1; 0 <= ref1 ? r <= ref1 : r >= ref1; i = 0 <= ref1 ? ++r : --r) {
      tmp = re.exec(target);
      if (!_.isNull(tmp)) {
        result.push(tmp[1]);
      }
    }
    return result;
  };


  /*
  callback
  arg1 include start/end tag substring
  arg2 exclude start/end tag substring
  arg3 substring start position
  
  var strtest = '<div>abc</div>happy<div>efg</div>';
  kiwi.betns(strtest , '<div>', '</div>', function(a, b, c){
  	return '<span>' + b + '</span>';
  });
  <span>abc</span>happy<span>efg</span>
  
  var replace = { abc : 'red', efg : 'green' };
  kiwi.betns(strtest , '<div>', '</div>', function(a, b, c){
  	return '<li>' + replace[b] + '</li>';
  });
  <li>red</li>happy<li>green</li>
   */

  _.betns = function(target, startTag, endTag, callback) {
    if (_.isBlank(startTag) || _.isBlank(endTag) || !_.isFunc(callback)) {
      return target;
    }
    return target.replace(new RegExp("(?:\\" + startTag + ")([\\s\\S]*?)(?:" + endTag + ")", 'gim'), callback);
  };

  _.querySelector = function(selector, isAll, context) {
    if (isAll == null) {
      isAll = false;
    }
    if (context == null) {
      context = document;
    }
    if (isAll) {
      return context.querySelectorAll(selector);
    } else {
      return context.querySelector(selector);
    }
  };

  _.query = function() {
    var doc, isAll, l, params, results, selector;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    l = params.length;
    selector = '';
    doc;
    isAll = false;
    switch (l) {
      case 1:
      case 2:
      case 3:
        selector = params[0];
        if (l === 2) {
          if (_.isBoolean(params[1])) {
            isAll = params[1];
          } else {
            doc = params[1];
          }
        }
        if (l === 3) {
          doc = params[1];
          isAll = params[2];
        }
    }
    doc = doc || document;
    if (/^[A-Za-z0-9]+$/.test(selector)) {
      results = _.querySelector(selector, isAll, doc);
      if (results === null) {
        selector = "[name=" + selector + "]";
      } else {
        return results;
      }
    }
    return _.querySelector(selector, isAll, doc);
  };

  _.removeEl = function() {
    var el, params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    el = _.query(params);
    if (el) {
      el.parentNode.removeChild(el);
    }
  };

  _.chkParam = function() {
    var args, errMsg, exp, params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    exp = params[0];
    errMsg = params[1] || '';
    args = _.slice(params, 2);
    if (!exp) {
      throw new Error(_.format(errMsg, args));
    }
    return true;
  };

  _.fillParam = function() {
    var aEl, data, elId, element, els, k, l, len2, newVs, params, q, ref, selector, textArr, v, vals;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    elId = '';
    data = null;
    textArr = ['div', 'span'];
    l = params.length;
    switch (l) {
      case 1:
        data = params[0];
        break;
      case 3:
      case 2:
        if (l === 3) {
          textArr = textArr.concat(_.isArray(params[2]) ? params[2] : [params[2]]);
        }
        elId = params[0];
        data = params[1];
    }
    elId = _.startIf(elId, '#');
    for (k in data) {
      v = data[k];
      selector = null;
      if (_.startWith(k, ['#', '\\.'])) {
        selector = elId + ' ' + k;
      } else {
        selector = elId + ' [name="' + k + '"]';
      }
      els = _.query(selector, true);
      if (!_.isBlank(els)) {
        if (els.length > 1) {
          vals = _.isArray(v) ? v : [v + ''];
          newVs = [];
          _.each(vals, function(tmp) {
            newVs.push(tmp + '');
          });
          for (q = 0, len2 = els.length; q < len2; q++) {
            aEl = els[q];
            if (newVs.indexOf(aEl.value) !== -1) {
              aEl.checked = 'checked';
            }
          }
        } else if (els.length === 1) {
          element = els[0];
          if (ref = (element.tagName || '').toLowerCase(), indexOf.call(textArr, ref) >= 0) {
            element.innerHTML = v;
          } else {
            element.value = v;
          }
        }
      }
    }
  };

  _.getParam = function() {
    var ctx, data, defaultEl, defaultInputType, el, elName, elVal, elementId, extraSelector, invisibleVlaueEl, len2, len3, q, r, ref, ref1, v;
    elementId = arguments[0], extraSelector = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    elementId = _.startIf(elementId, '#');
    defaultInputType = ['hidden', 'text', 'checkbox', 'password', 'radio', 'tel', 'email', 'url', 'number', 'date', 'time', 'datetime', 'month'];
    invisibleVlaueEl = ['li'];
    defaultEl = ['select'].concat(extraSelector);
    for (q = 0, len2 = defaultInputType.length; q < len2; q++) {
      v = defaultInputType[q];
      defaultEl.push("input[type=" + v + "]");
    }
    data = {};
    ctx = _.query(elementId);
    if (_.isBlank(ctx)) {
      return data;
    }
    ref = _.query(defaultEl.join(','), ctx, true);
    for (r = 0, len3 = ref.length; r < len3; r++) {
      el = ref[r];
      elName = el.getAttribute('name');
      if ((elName || '').length > 0) {
        if ((el.type || '').toLowerCase() === 'checkbox') {
          elVal = data[elName] || [];
          if (el.checked) {
            elVal = elVal.concat(el.value);
          }
        } else if ((el.type || '').toLowerCase() === 'radio') {
          if (el.checked) {
            elVal = el.value;
          } else {
            elVal = _.has(data, elName) ? data[elName] : '';
          }
        } else if (el.value) {
          elVal = el.value;
        } else if ((el.tagName || '').toLowerCase() === 'select') {
          if (el.options[el.options.selectedIndex]) {
            elVal = el.options[el.options.selectedIndex].value;
          } else {
            elVal = '';
          }
        } else if (ref1 = (el.tagName || '').toLowerCase(), indexOf.call(invisibleVlaueEl, ref1) >= 0) {
          elVal = el.innerText;
        } else {
          elVal = el.innerHTML;
        }
        data[elName] = _.trim(elVal);
      }
    }
    return data;
  };

  replaces = function(target) {
    var k, regexpS, regexpr, v;
    regexpS = [];
    for (k in target) {
      v = target[k];
      regexpS.push(k);
    }
    regexpr = new RegExp(regexpS.join('|'), 'ig');
    return function(s) {
      return s.replace(regexpr, (function(str, p1, p2, offset, s) {
        var a;
        return a = target[str] || a;
      }));
    };
  };

  _.replacer = function(configuration) {
    return new replaces(configuration);
  };

  registerModule = function(moduleN, obj, delegate, override) {
    var ctx, target;
    ctx = delegate || theRef;
    if (_.has(ctx, moduleN) && !override) {
      throw new Error("module exists: " + moduleN);
    }
    ctx[moduleN] = obj;
    if (_.isFunc(obj) && ctx.mixin) {
      target = {};
      target[moduleN] = obj;
      ctx.mixin(target);
    }
  };

  _.register = function() {
    var k, params, ref, v;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (_.isJson(params[0])) {
      ref = params[0];
      for (k in ref) {
        v = ref[k];
        registerModule(k, v, params[1], params[2]);
      }
    } else {
      registerModule.apply(this, arguments);
    }
  };

  _.unregister = function(moduleN, delegate) {
    delete (delegate || theRef)[moduleN];
  };

  _.methodRegister = function(delegate, methodN, methodBody, prefixN) {
    dynamicMethod(delegate, methodN, methodBody, prefixN);
  };

  showTypeIf = function(type, showType) {
    if ((_.isUndefined(showType) ? _.getToStringShowType() : showType)) {
      return type;
    } else {
      return '';
    }
  };

  _.asStr = function(target, separator, showType) {
    return convertAsString(target, separator || '', showType || false);
  };

  _.rmEvtProp = function(obj, keepTheEventKey) {
    var _evtSimpleStr, k, noEventObj, v;
    noEventObj = {};
    if (_.isObject(obj) && _.isJson(obj)) {
      for (k in obj) {
        v = obj[k];
        if (_.isEvent(v)) {
          _evtSimpleStr = showTypeIf('[object event]: ') + v.type;
          if (keepTheEventKey) {
            noEventObj[k] = _evtSimpleStr;
          }
          if (_.isInfoEnabled()) {
            consoler.getC().info("The " + _evtSimpleStr + " from \'" + k + "\' below is event detail:");
            consoler.getC().info(v);
          }
        } else {
          noEventObj[k] = v;
        }
      }
    }
    return noEventObj;
  };

  convertAsString = function(target, separator, showType) {
    var _stringifyCache, detailA, detailO, details, docEl, e, fullType, innerH, k, len2, objType, ocrlf, q, recursion, v;
    details = [];
    ocrlf = separator || _.CRLF;
    objType = _.type(target);
    fullType = _.type(target, true) + ': ';
    recursion = convertAsString;
    switch (objType) {
      case definedTypes[11]:
      case definedTypes[7]:
      case definedTypes[10]:
      case definedTypes[2]:
      case definedTypes[5]:
      case definedTypes[6]:
        details.push(showTypeIf(fullType, showType) + target);
        break;
      case definedTypes[3]:
      case definedTypes[9]:
        details.push(showTypeIf(fullType, showType) + String(target));
        break;
      case definedTypes[4]:
        details.push(showTypeIf(fullType, showType) + (target.stack || target));
        break;
      case definedTypes[0]:
      case definedTypes[1]:
        if (objType === definedTypes[0]) {
          target = _.slice(target);
        }
        detailA = [];
        for (q = 0, len2 = target.length; q < len2; q++) {
          v = target[q];
          detailA.push(typeof v === 'object' ? recursion(v, ocrlf, false) : v);
        }
        details.push(showTypeIf(fullType, showType) + '[' + ocrlf + detailA.join(',' + ocrlf) + ocrlf + ']');
        break;
      case definedTypes[8]:
        if (!_.getToStringEvent()) {
          target = _.rmEvtProp(target, true);
        }
        if (root.JSON && _.isJson(target)) {
          try {
            _stringifyCache = [];
            details.push(JSON.stringify(target, (function(key, value) {
              if (typeof value === 'object' && value !== null) {
                if (_stringifyCache.indexOf(value) !== -1) {
                  return;
                }
                _stringifyCache.push(value);
              }
              return value;
            })));
          } catch (_error) {
            e = _error;
            _.warn(e.message, 'JSON.stringify error (ignorable)');
          }
        }
        break;
      default:
        detailO = [];
        for (k in target) {
          if (!hasProp.call(target, k)) continue;
          v = target[k];
          if (/^HTML/.test(objType)) {
            innerH = 'innerHTML';
            docEl = 'documentElement';
            if (_.has(v, innerH)) {
              v = v + ' ' + v[innerH];
            } else if (_.has(v, docEl)) {
              v = v + ' ' + v[docEl];
            }
          } else {
            v = _.isJson(v) ? recursion(v) : v;
          }
          detailO.push(k + ': ' + v);
        }
        details.push(showTypeIf(fullType, showType) + "{" + ocrlf + detailO.join(',' + ocrlf) + ocrlf + "}");
    }
    return details.join(ocrlf);
  };

  loggerMethods = function(k, v) {
    dynamicMethod(theRef, k, (function(target, mark, separator, showType) {
      return dolog({
        name: k,
        level: v
      }, target, mark, separator, showType);
    }));
    dynamicMethod(theRef, k + 'Enabled', (function() {
      return consoler.getC() && (parseInt(v) >= parseInt(_.getLogger()));
    }), 'is');
    return dynamicMethod(theRef, k + 'Enabled', (function() {
      return _.setLogger(loggerLevels[k]);
    }), 'set');
  };

  for (k in loggerLevels) {
    v = loggerLevels[k];
    if (v !== loggerLevels.none) {
      loggerMethods(k, v);
    }
  }

  dolog = function(logger, target, mark, separator, showType) {
    var _c, tgt4log;
    _c = consoler.getC();
    if (_c && (parseInt(logger.level) >= parseInt(_.getLogger())) && _c[logger.name]) {
      tgt4log = _.getLogPrefix(logger.name) + (mark ? mark + _.CRLF : '') + convertAsString(target, separator, showType);
      _c[logger.name].call(_c, tgt4log);
    }
  };

  _.console = function(impl, reset) {
    if (_.isNull(impl)) {
      consoler.setC(false);
      return impl;
    }
    if (!consoler.getC() || reset) {
      if (_.isFunc(impl)) {
        consoler.setC({
          log: impl,
          info: impl,
          warn: impl,
          error: impl
        });
      } else if (_.isObject(impl)) {
        consoler.setC(impl);
      } else if (typeof console !== "undefined") {
        consoler.setC(console);
      }
    }
    return consoler.getC();
  };

  _.getLoggerName = function(level) {
    level = level || _.getLogger();
    return _.getKey(loggerLevels, parseInt(level) > loggerLevels.none ? loggerLevels.none : level);
  };

  datetimeFmt = function() {
    var pad, timezone, timezoneClip, token;
    token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g;
    timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
    timezoneClip = /[^-+\dA-Z]/g;
    pad = function(val, len) {
      return _.prefix(val, len || 2);
    };
    return function(date, mask, utc) {
      var D, H, L, M, _u, d, d_, flags, i_, m, o, s, y;
      if (_.isUndefined(mask) && _.isString(date) && !/\d/.test(date)) {
        mask = date;
        date = void 0;
      }
      i_ = _.getDateI18n();
      d_ = _.getDateMask();
      date = !_.isBlank(date) ? new Date(date) : new Date();
      if (isNaN(date)) {
        throw SyntaxError('invalid date: ' + date);
      }
      mask = String(d_[mask] || mask || d_["default"]);
      if (mask.slice(0, 4) === "UTC:") {
        mask = mask.slice(4);
        utc = true;
      }
      _u = !_.isBlank(utc) ? "getUTC" : "get";
      d = date[_u + "Date"]();
      D = date[_u + "Day"]();
      m = date[_u + "Month"]();
      y = date[_u + "FullYear"]();
      H = date[_u + "Hours"]();
      M = date[_u + "Minutes"]();
      s = date[_u + "Seconds"]();
      L = date[_u + "Milliseconds"]();
      o = !_.isBlank(utc) ? 0 : date.getTimezoneOffset();
      flags = {
        d: d,
        dd: pad(d),
        ddd: i_.day[D],
        dddd: i_.day[D + 7],
        m: m + 1,
        mm: pad(m + 1),
        mmm: i_.month[m],
        mmmm: i_.month[m + 12],
        yy: String(y).slice(2),
        yyyy: y,
        h: H % 12 || 12,
        hh: pad(H % 12 || 12),
        H: H,
        HH: pad(H),
        M: M,
        MM: pad(M),
        s: s,
        ss: pad(s),
        l: pad(L, 3),
        L: pad(L > 99 ? Math.round(L / 10) : L),
        t: H < 12 ? "a" : "p",
        tt: H < 12 ? "am" : "pm",
        T: H < 12 ? "A" : "P",
        TT: H < 12 ? "AM" : "PM",
        Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
        o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
        S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
      };
      return mask.replace(token, (function($0) {
        if ($0 in flags) {
          return flags[$0];
        } else {
          return $0.slice(1, $0.length - 1);
        }
      }));
    };
  };

  datetimeFmt = datetimeFmt();

  _.addDateMask = function(mask, host) {
    _.extend(properties.dateMask, (mask = mask || {}));
    _.each(mask, function(v, k) {
      _.methodRegister(host || _['when'], k, function(date, utc) {
        return _.dateFmt(date, v, utc);
      });
    });
  };

  _.dateFmt = function(date, mask, utc) {
    return datetimeFmt(date, mask, utc);
  };

  _.keys = function(obj, precodition) {
    var results1;
    if (precodition == null) {
      precodition = function() {
        return true;
      };
    }
    if (_.isObject(obj) && Object.keys) {
      return Object.keys(obj);
    }
    results1 = [];
    for (k in obj) {
      if (!hasProp.call(obj, k)) continue;
      v = obj[k];
      if (precodition(v, k)) {
        results1.push(k);
      }
    }
    return results1;
  };

  _.vals = function(obj) {
    var keys, l, len2, q, results1, vals;
    keys = _.keys(obj);
    l = keys.length;
    vals = new Array(l);
    results1 = [];
    for (q = 0, len2 = keys.length; q < len2; q++) {
      k = keys[q];
      results1.push(obj[k]);
    }
    return results1;
  };

  _.funcs = function(obj) {
    return _.keys(obj, function(v) {
      return _.isFunc(v);
    });
  };

  doMixing = function(name, func) {
    return _.prototype[name] = function() {
      var args;
      args = [this._wrapped];
      Array.prototype.push.apply(args, arguments);
      return result.call(this, func.apply(_, args));
    };
  };

  _.mixin = function(obj) {
    var func, len2, name, q, ref;
    ref = _.funcs(obj);
    for (q = 0, len2 = ref.length; q < len2; q++) {
      name = ref[q];
      func = _[name] = obj[name];
      doMixing(name, func);
    }
  };

  result = function(obj) {
    if (this._chain) {
      return _(obj).chain();
    } else {
      return obj;
    }
  };

  _.mixin(_);

  _.chain = function(obj) {
    return _(obj).chain();
  };

  _.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  _.prototype.value = function() {
    return this._wrapped;
  };

  (function(kiwi, component) {
    var proto;
    proto = function(mask, date, utc) {
      return kiwi.dateFmt(date, mask, utc);
    };
    kiwi.addDateMask(kiwi.getDateMask(), proto);
    proto.idesc = {
      year: ' years ago',
      month: ' months ago',
      week: ' weeks ago',
      day: ' days ago',
      hour: ' hours ago',
      minute: ' minutes ago',
      just: 'just now'
    };
    proto.time = function(target) {
      var tmp;
      target = target || new Date();
      if (!kiwi.isDate(target)) {
        tmp = new Date(target);
        if (isNaN(tmp)) {
          target = new Date(target.replace(/-/g, '/'));
        } else {
          target = tmp;
        }
      }
      return target.getTime();
    };
    proto.interval = function(target) {
      var dayUnit, hourUnit, interval, minUnit, unit;
      unit = 1000.0;
      dayUnit = 86400;
      hourUnit = 3600;
      minUnit = 60;
      target = proto.time(target);
      interval = (proto.time() - target) / unit;
      if (interval >= 0.0) {
        if (interval / 157680000 > 1.0) {
          return proto["default"](target);
        } else if (interval / 31536000 > 1.0) {
          return parseInt(interval / 31536000) + proto.idesc.year;
        } else if (interval / 2592000 > 1.0) {
          return parseInt(interval / 2592000) + proto.idesc.month;
        } else if (interval / 604800 >= 1.0) {
          return 7 + proto.idesc.day;
        } else if ((interval / 604800 < 1.0) && (interval / dayUnit >= 1.0)) {
          return parseInt(interval / dayUnit) + proto.idesc.day;
        } else if ((interval / dayUnit < 1.0) && (interval / hourUnit >= 1.0)) {
          return parseInt(interval / hourUnit) + proto.idesc.hour;
        } else if ((interval < hourUnit) && (interval >= minUnit)) {
          return parseInt(interval / minUnit) + proto.idesc.minute;
        } else {
          return proto.idesc.just;
        }
      } else {
        return proto["default"](target);
      }
    };
    kiwi.register(component, proto);
  })(theRef, 'when');

  (function(kiwi, component) {
    var _tmplCache, proto;
    proto = function(target, data) {
      return tmpl(target, data);
    };
    _tmplCache = {};
    var tmpl = function tmpl(target, data){
        var fn = !/\W/.test(target) ? _tmplCache[target] = _tmplCache[target] || tmpl(document.getElementById(target).innerHTML) :
          new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" +
            "with(obj){p.push('" +
            target.replace(/[\r\t\n]/g, " ")
              .split("<%").join("\t")
              .replace(/((^|%>)[^\t]*)'/g, "$1\r")
              .replace(/\t=(.*?)%>/g, "',$1,'")
              .split("\t").join("');")
              .split("%>").join("p.push('")
              .split("\r").join("\\'")
          + "');}return p.join('');");
        return data ? fn( data ) : fn;
    };;
    kiwi.register(component, proto);
  })(theRef, 'tmpl');

  (function(kiwi, component) {
    if (typeof module === 'object' && module && typeof module.exports === 'object') {
      module.exports = kiwi;
    } else {
      root.kiwi = root[component] = kiwi;
      if (typeof define === 'function' && define.amd) {
        define(component, [], function() {
          return kiwi;
        });
      }
      if (typeof define === 'function' && define.cmd) {
        define(function(require, exports, module) {
          exports[component] = kiwi;
        });
      }
    }
  })(theRef, 'lemon');

}).call(this);

//# sourceMappingURL=lemon.js.map
