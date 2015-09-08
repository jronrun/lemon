###
	lemon.coffee
	@author paulo.ye https://github.com/jronrun/lemon
###

"use strict"

root = this; 
_ = (obj) -> 
	if obj instanceof _ 
		return obj
	unless this instanceof _ 
		return new _(obj)
	@_wrapped = obj 
	return

_.now = -> (Date.now || -> new Date().getTime())()
_.script_time = _.now(); theUniqueID = 0; _.CRLF = '\r\n'; theRef = _

#logger levels
loggerLevels = { log: 1, info: 2, warn: 3, error: 4, none: 5 }
#logger consoler
consoler = { c: false }
#thiz properties
properties = 
	ctxPath		: ''					#context path
	basePath	: ''					#base path
	logger		: loggerLevels.log				#logger level
	toStringEvent	: false				#convert event to string may cause Maximum call stack size exceeded exception
	toStringShowType: true				#if show object's type when convert object to string
	logPrefix	: (levelN) -> ">> #{levelN} [#{_.when.log()}]"			#the log prefix
	dateMask: { 'default': "yyyy-mm-dd HH:MM:ss", log: "yyyy-mm-dd HH:MM:ss l", day: "yyyy-mm-dd", time: "HH:MM:ss", week: "dddd" } #date time formats
	dateI18n: {							#week month i18n
		day: [
			"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", 
			"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
		],
		month: [
			"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
			"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
		]
	}
	
arrayForeach = Array::forEach; arrayFilter = Array::filter; breaker = false; escape = encodeURIComponent

_.each = (obj, iterator, context) ->
	if obj is null then return obj
	if arrayForeach and obj.forEach == arrayForeach
		obj.forEach(iterator, context)
	else if obj.length == +obj.length
		i = 0; l = obj.length
		loop then break if i < l or iterator.call(context, obj[i], i, obj) == breaker; i++
	else 
		keys = _.keys obj
		for key in keys then if iterator.call(context, obj[key], key, obj) == breaker then return
	obj

_.filter = (obj, predicate, context) ->
	results = []
	if obj is null then return results
	if arrayFilter and obj.filter is arrayFilter then return obj.filter predicate, context
	_.each obj, (value, index, list) -> (
		if predicate.call context, value, index, list
			results.push(index: value)
			return
	)
	results
	
# Extend a given object with all the properties in passed-in object(s)
_.extend = (obj) ->
	_.each _.slice(arguments, 1), (source) -> ( 
		if source then for prop of source then obj[prop] = source[prop]
		return
	)
	obj

_.capitalize = (word) -> 
	word.charAt(0).toUpperCase() + word.slice 1

#register dynamic method
dynamicMethod = (delegate, methodN, methodBody, prefixN) ->
	((methodN) ->
		delegate[if prefixN then prefixN + _.capitalize(methodN) else methodN] = methodBody
	)(methodN)

#type detect	
_.type = (obj, full = false) ->
	aType = Object::toString.call obj
	if full then aType else aType[8...-1]

#types
definedTypes = [
    'Arguments', 'Array', 'Boolean', 'Date', 'Error', 'Function', 'Null', 'Number', 'Object', 'RegExp', 'String', 'Undefined', 'global'
]

#bind types
bindTypes = (type) -> dynamicMethod theRef, type, ((obj) -> type is _.type obj), 'is'
bindTypes tmpType for tmpType in definedTypes
	
_.isFunc = _.isFunction 
_.isWin = _.isGlobal
_.isJson = (obj) -> typeof obj is 'object' and _.isObject(obj) and !obj.length
	
_.isEvent = (obj) ->
	!_.isNull(obj) and !_.isUndefined(obj) and (!_.isUndefined(obj.altKey) || !_.isUndefined(obj.preventDefault))
	
_.isBlank = (obj, valueAsBlank...) ->
	obj = if _.isString(obj) then _.trim(obj) else obj
	if valueAsBlank?
		for v in valueAsBlank when v is obj
			return true
	if _.isNull(obj) or _.isUndefined(obj) or (_.isString(obj) and obj.length < 1) or (_.isJson(obj) and (_.keys obj).length < 1)
		return true
	return false
	
_.isPlainObject = (obj) ->
	_.isObject(obj) and !_.isWin(obj) && Object.getPrototypeOf(obj) == Object.prototype
	
#getter setter methods
getsetMethods = (n, v, delegate) ->
	tgt = delegate || theRef
	dynamicMethod tgt, n, (-> if !_.isFunc(properties[n]) then properties[n] else properties[n].apply(this, arguments)), 'get'
	dynamicMethod tgt, n, ((value) -> properties[n] = value), 'set'
	properties[n] = v;	#initialize value
	return

_.getset = (args, delegate) ->
	props = {}
	if _.isString args
		props[args] = null
	else if _.isArray args
		for v, i in args
			props[v] = null
	else if _.isJson args
		props = args
	else
		throw new Error(_.type(arguments) + " is unsupported, must string|string array|JSON");
		
	for k, v of props
		getsetMethods k, v, delegate
	return
	
_.getset(properties);
_.getset(consoler, consoler);
_.settings = -> properties

#utilities methods

_.clone = (target) ->
	if !_.isObject target then target else (if _.isArray target then target.slice() else _.extend({}, target))
		
# 0: 'Arguments', 1: 'Array', 2: 'Boolean', 3: 'Date', 4: 'Error', 5: 'Function', 6: 'Null', 7: 'Number', 
# 8: 'Object', 9: 'RegExp', 10: 'String', 11: 'Undefined'
serialize = (params, obj, traditional, scope) ->
	array = _.isArray obj; hash = _.isPlainObject obj
	_.each obj, (value, key) -> (
		type = _.type(value)
		if scope
			key = if traditional then scope else "#{scope}[#{if (hash || type == definedTypes[8] || type == definedTypes[1]) then key else ''}]"
		if !scope and array
			params.add value.name, value.value
		# recurse into nested objects
		else if type == definedTypes[1] or (!traditional and type == definedTypes[8])
			serialize(params, value, traditional, key)
		else params.add key, value
		return
	)
	return

_.param = (obj, traditional) ->
	params = []; params.add = (k, v) -> this.push "#{escape(k)}=#{escape(v)}"
	serialize(params, obj, traditional)
	params.join('&').replace(/%20/g, '+')

_.getUrl = (uri, params) ->
	p = if _.isBlank(params) then '' else ('?' + (if _.isJson(params) then _.param(params) else String(params)))
	if /^http/.test(uri) then (uri + p) else (_.getBasePath() + _.aroundIf(_.getCtxPath(), '/') + uri + p)

_.getUrlVars = ->
	vars = {}; href = root.location.href; idx = href.indexOf('?')
	if idx is -1 
		return vars
	for v in href.slice(idx + 1).split('&')
		hash = v.split('=')
		vars[hash[0]] = hash[1]
	vars
		
_.href = (uri, params) ->
	root.location.href = _.getUrl(uri, params)
	return
	
_.slice = (args, start) ->
	if _.isArguments(args)
		return Array::slice.call(args, start)
	(args || [])[(start || 0)..]
	
_.startWith = (target, start) ->
	new RegExp('^' + (if _.isArray(start) then "[#{start.join('|')}]" else start)).test(target)

_.endWith = (target, end) ->
	new RegExp((if _.isArray(end) then "[#{end.join('|')}]" else end) + '$').test(target)
	
_.startIf = (target, start) ->
	if _.startWith(target, start) then target else (start + target)
	
_.endIf = (target, end) ->
	if _.endWith(target, end) then target else (target + end)
	
_.aroundWith = (target, around) ->
	_.startWith(target, around) and _.endWith(target, around)
	
_.aroundIf = (target, around) ->
	_.endIf(_.startIf(target, around), around)
	
_.prefix = (target, length, fill) ->
	(Array(length).join(fill || '0') + target).slice(-length)
	
_.suffix = (target, length, fill) ->
	target + Array(length + 1).join(fill || '0')[target.length..]

_.trim = (target, chars) ->
	unless _.isString target then return target
	if _.isUndefined(chars)
		return target.replace(/(^\s*)|(\s*$)/g, "")
	target.replace(new RegExp("(^(" + chars + ")*)|((" + chars + ")*$)", "gi"), "")
	
_.repeat = (target, count) ->
	new Array(1 + count).join(target)
	
_.ltrim = (target, chars) ->
	unless _.isString target then return target
	target.replace(new RegExp("(^" + (if _.isBlank(chars) then "\\s" else chars) + "*)"), "")
	
_.rtrim = (target, chars) ->
	unless _.isString target then return target
	target.replace(new RegExp("(" + (if _.isBlank(chars) then "\\s" else chars) + "*$)"), "")
	
_.randomStr = (length) ->
	str = ''
	loop 
		str += Math.random().toString(36).substr(2)
		break if str.length >= length
	str.substr(0, length)
	
_.uniqueId = (prefix) ->
	id = ++theUniqueID + ''
	if prefix then (prefix + id) else id

_.times = (n, iterator, context) ->
	accum = Array(Math.max(0, n)); i = 0
	loop 
		accum[i] = iterator.call(context, i)
		++i
		break if i >= n
	accum

_.delay = (func, wait) ->
	args = _.slice(arguments, 2)
	setTimeout((-> func.apply(null, args)), wait)
	
_.once = (func) ->
	ran = false; memo = null
	-> (
		if ran 
			return memo
		ran = true
		memo = func.apply(this, arguments)
		func = null
		memo
	)
	
_.wrap = (func, wrapper) ->
	-> (
		args = [func]
		Array::push.apply(args, arguments)
		wrapper.apply(this, args)
	)	
	
_.prop = (key) ->
	(obj) -> obj[key]	
	
_.format = (msg, args) ->
	unless _.isArray(args)
		args = _.slice(arguments, 1)
	msg.replace(/\{(\d+)\}/gm, (m, i) -> (
		v = args[i] || m
		if _.isObject(v) then convertAsString(v) else v
	))

removeValue = (target, element) ->
	if _.isArray target
		index = target.indexOf(element)
		if index > -1
			target.splice index, 1
	else if _.isJson target
		for k, v of target when v == element
			delete target[k]
	return

_.rmByVal = (target, element...) ->
	for v in element	
		removeValue target, v
	return target
	

_.getKey = (obj, value) ->
	for own k, v of obj when v == value
		return k
	return null
	
_.has = (obj, target) ->
	if _.isBlank obj then false
	else if _.isArray obj then target in obj
	else if _.isObject obj then target of obj
	else Object::hasOwnProperty.call(obj, target);
	
_.sleep = (milliseconds) ->
	start = _.now()
	i = -1
	loop
		i++
		break if (_.now() - start) >= milliseconds
	return

###
var strtest = '<div>abc</div>happy<div>efg</div>';
kiwi.betn(strtest , '<div>', '</div>', true);
<div>abc</div>,<div>efg</div>
kiwi.betn(strtest , '<div>', '</div>');
abc,efg
###
_.betn = (target, startTag, endTag, isContainTag) ->
	if _.isBlank(startTag) or _.isBlank(endTag) then return target
	result = new Array(); re = new RegExp("(?:\\" + startTag + ")([\\s\\S]*?)(?:" + endTag + ")", 'gim')
	len = target.match(re)
	if isContainTag 
		(result.push len[v]) for v in [0..len.length - 1]
		return result
		
	tmp = null;
	if _.isNull len then return result
	(tmp = re.exec target;if !_.isNull tmp then result.push tmp[1]) for i in [0..len.length - 1]
	result
	
###
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
###
_.betns = (target, startTag, endTag, callback) ->
	if _.isBlank(startTag) or _.isBlank(endTag) or !_.isFunc(callback) then return target
	return target.replace(new RegExp("(?:\\" + startTag + ")([\\s\\S]*?)(?:" + endTag + ")", 'gim'), callback)
	
# paramters
# expression, errorMsg || errorMsg Template, template args

_.querySelector = (selector, isAll = false, context = document) ->
	if isAll then context.querySelectorAll(selector) else context.querySelector(selector)

_.query = (params...) ->
	l = params.length; selector = ''; doc; isAll = false
	switch l
		when 1, 2, 3 then (
			selector = params[0]
			if l is 2
				if _.isBoolean(params[1]) then isAll = params[1] else doc = params[1]
			if l is 3
				doc = params[1]; isAll = params[2]
		)
	doc = doc || document
	#query by element name
	if /^[A-Za-z0-9]+$/.test(selector)
		results = _.querySelector selector, isAll, doc
		if results is null
			selector = "[name=#{selector}]"
		else 
			return results
		
	_.querySelector selector, isAll, doc
	
_.removeEl = (params...) ->
	el = _.query params
	if el
		el.parentNode.removeChild el
	return

_.chkParam = (params...) ->
	exp = params[0]; errMsg = params[1] || ''; args = _.slice(params, 2)
	unless exp
		throw new Error(_.format(errMsg, args))
	return true

#elementId, data, selector supports: id, class, name
_.fillParam = (params...) ->
	elId = ''; data = null; textArr = ['div', 'span']; l = params.length
	switch(l)
		when 1 then data = params[0]
		when 3, 2 then (
			if l is 3
				(textArr = textArr.concat(if _.isArray(params[2]) then params[2] else [params[2]]))
			elId = params[0]; data = params[1]
		)
	elId = _.startIf(elId, '#')
	
	for k, v of data
		selector = null
		if _.startWith k, [ '#', '\\.' ]
			selector = elId + ' ' + k
		else 
			selector = elId + ' [name=' + k + ']'
		element = _.query selector
		unless _.isBlank element
			if (element.tagName || '').toLowerCase() in textArr
				element.innerHTML = v
			else
				element.value = v
	return
	
_.getParam = (elementId, extraSelector...) ->
	elementId = _.startIf elementId, '#'
	defaultInputType = [ 
	    'hidden', 'text', 'checkbox', 'password',
		'tel', 'email', 'url', 'number', 'date', 'time', 'datetime', 'month'
	]
	invisibleVlaueEl = ['li']
	defaultEl = ['select'].concat extraSelector
	for v in defaultInputType
		defaultEl.push "input[type=#{v}]"
	data = {}; ctx = _.query(elementId)
	if _.isBlank ctx then return data 
	for el in _.query(defaultEl.join(','), ctx, true)
		elName = el.getAttribute('name')
		if (elName || '').length > 0
			data[elName] = if _.has(el, 'value') then (
				if (el.tagName || '').toLowerCase() in invisibleVlaueEl then el.innerText else _.trim(el.value)
			) else el.innerHTML
	return data;
	
#string replacer

replaces = (target) ->
	regexpS = []
	for k, v of target
		regexpS.push k
	regexpr = new RegExp(regexpS.join('|'), 'ig') # g: global, m:multi-line, i: ignore case
	(s) -> s.replace(regexpr, ((str, p1, p2, offset, s) -> (a = (target[str] || a))))
    
_.replacer = (configuration) ->
    new replaces(configuration)
	
registerModule = (moduleN, obj, delegate, override) ->
	ctx = delegate || theRef
	if _.has(ctx, moduleN) and !override
		throw new Error("module exists: " + moduleN)
	ctx[moduleN] = obj
	if _.isFunc(obj) and ctx.mixin
		target = {}
		target[moduleN] = obj
		ctx.mixin(target)
	return

# moduleNmae | {}, [obj,] delegate, override
_.register = (params...) ->
	if _.isJson params[0]
		for k, v of params[0]
			registerModule k, v, params[1], params[2]
	else
		registerModule.apply this, arguments
	return
	
_.unregister = (moduleN, delegate) ->
	delete (delegate || theRef)[moduleN];
	return
	
_.methodRegister = (delegate, methodN, methodBody, prefixN) ->	
	dynamicMethod delegate, methodN, methodBody, prefixN
	return

#show type if
showTypeIf = (type, showType) ->
	if (if _.isUndefined(showType) then _.getToStringShowType() else showType) then type else '';

_.asStr = (target, separator, showType) ->
	convertAsString(target, separator || '', showType || false)
	
#remove the event property
_.rmEvtProp = (obj, keepTheEventKey) ->
	noEventObj = {}
	if _.isObject(obj) and _.isJson(obj)
		for k, v of obj
			if _.isEvent(v)
				_evtSimpleStr = showTypeIf('[object event]: ') + v.type
				if keepTheEventKey
					noEventObj[k] = _evtSimpleStr
				if _.isInfoEnabled()
					consoler.getC().info("The #{_evtSimpleStr} from \'#{k}\' below is event detail:");
					consoler.getC().info(v);
			else
				noEventObj[k] = v
	noEventObj

#convert obj as string
# 0: 'Arguments', 1: 'Array', 2: 'Boolean', 3: 'Date', 4: 'Error', 5: 'Function', 6: 'Null', 7: 'Number', 
# 8: 'Object', 9: 'RegExp', 10: 'String', 11: 'Undefined'
convertAsString = (target, separator, showType) ->
	details = []; ocrlf = separator || _.CRLF; objType = _.type(target)
	fullType = _.type(target, true) + ': '; recursion = convertAsString #recursion = arguments.callee
	
	switch objType
		when definedTypes[11], definedTypes[7], definedTypes[10], definedTypes[2], definedTypes[5], definedTypes[6] then details.push(showTypeIf(fullType, showType) + target)
			
		when definedTypes[3], definedTypes[9] then details.push(showTypeIf(fullType, showType) + String(target))
		when definedTypes[4] then details.push(showTypeIf(fullType, showType) + (target.stack || target))
		
		when definedTypes[0], definedTypes[1] then (
			if objType is definedTypes[0]
				target = _.slice(target)
			detailA = []
			for v in target
				detailA.push(if typeof v is 'object' then recursion(v, ocrlf, false) else v)
			details.push(showTypeIf(fullType, showType) + '[' + ocrlf + detailA.join(',' + ocrlf) + ocrlf + ']')
		)
			
		when definedTypes[8] then (
			if !_.getToStringEvent()
				target = _.rmEvtProp target, true
			
			#JSON http://bestiejs.github.io/json3
			if root.JSON and _.isJson(target)
				try
					#see http://stackoverflow.com/questions/11616630/json-stringify-avoid-typeerror-converting-circular-structure-to-json
					_stringifyCache = []
					details.push(JSON.stringify(target, ( 
						(key, value)-> 
							if typeof value == 'object' and value != null
								# Circular reference found, discard key
								if _stringifyCache.indexOf(value) != -1
									return
								_stringifyCache.push(value)
							value
						)
					))
				catch e
					_.warn e.message, 'JSON.stringify error (ignorable)'
		)
		
		else
			detailO = []
			for own k, v of target
				if /^HTML/.test(objType)
					innerH = 'innerHTML'; docEl = 'documentElement'
					if _.has v, innerH then v = (v + ' ' + v[innerH])
					else if _.has v, docEl then v = (v + ' ' + v[docEl])
				else
					v = if _.isJson(v) then recursion(v) else v
				detailO.push(k + ': ' + v)
			details.push(showTypeIf(fullType, showType) + "{" + ocrlf + detailO.join(',' + ocrlf) + ocrlf + "}")
	
	details.join(ocrlf)
	
#logger methods
loggerMethods = (k, v) ->
	dynamicMethod theRef, k, ((target, mark, separator, showType) -> dolog({name: k, level: v}, target, mark, separator, showType))
	dynamicMethod theRef, k + 'Enabled', (-> consoler.getC() and (parseInt(v) >= parseInt(_.getLogger()))), 'is'
	dynamicMethod theRef, k + 'Enabled', (-> _.setLogger(loggerLevels[k])), 'set'
	
loggerMethods k, v for k, v of loggerLevels when v != loggerLevels.none
	
dolog = (logger, target, mark, separator, showType) ->
	_c = consoler.getC()
	if _c and (parseInt(logger.level) >= parseInt(_.getLogger())) and _c[logger.name]
		tgt4log = _.getLogPrefix(logger.name) + (if mark then (mark + _.CRLF) else '') + convertAsString(target, separator, showType)
		_c[logger.name].call(_c, tgt4log)
		return
		
_.console = (impl, reset) ->
	if _.isNull impl
		consoler.setC(false)
		return impl
	if !consoler.getC() || reset
		if _.isFunc(impl)
			consoler.setC { log: impl, info: impl, warn: impl, error: impl }
		else if _.isObject(impl)
			consoler.setC(impl)
		else if !_.isUndefined root.console
			consoler.setC(root.console) #eval('consoler.setC(console);')
	consoler.getC()
	
_.getLoggerName = (level) ->
	level = level || _.getLogger()
	_.getKey loggerLevels, if parseInt(level) > loggerLevels.none then loggerLevels.none else level 
	
# date see http://blog.stevenlevithan.com/archives/date-time-format
datetimeFmt = -> 
	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g
	timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g
	timezoneClip = /[^-+\dA-Z]/g
	pad = (val, len) ->
		_.prefix(val, len || 2)
		
	# Regexes and supporting functions are cached through closure
	(date, mask, utc) -> (
		if _.isUndefined(mask) and _.isString(date) and !/\d/.test(date)
			mask = date; date = undefined
			
		#Passing date through Date applies Date.parse, if necessary
		i_ = _.getDateI18n(); d_ = _.getDateMask()
		date = if !_.isBlank(date) then new Date(date) else new Date()
		if isNaN date then throw SyntaxError('invalid date: ' + date)
		mask = String(d_[mask] || mask || d_["default"])
		
		#Allow setting the utc argument via the mask
		if mask.slice(0, 4) == "UTC:" 
			mask = mask.slice(4); utc = true
			
		_u = if !_.isBlank(utc) then "getUTC" else "get"
		d = date[_u + "Date"]()
		D = date[_u + "Day"]()
		m = date[_u + "Month"]()
		y = date[_u + "FullYear"]()
		H = date[_u + "Hours"]()
		M = date[_u + "Minutes"]()
		s = date[_u + "Seconds"]()
		L = date[_u + "Milliseconds"]()
		o = if !_.isBlank(utc) then 0 else date.getTimezoneOffset()
		flags = {
			d:    d,
			dd:   pad(d),
			ddd:  i_.day[D],
			dddd: i_.day[D + 7],
			m:    m + 1,
			mm:   pad(m + 1),
			mmm:  i_.month[m],
			mmmm: i_.month[m + 12],
			yy:   String(y).slice(2),
			yyyy: y,
			h:    H % 12 || 12,
			hh:   pad(H % 12 || 12),
			H:    H,
			HH:   pad(H),
			M:    M,
			MM:   pad(M),
			s:    s,
			ss:   pad(s),
			l:    pad(L, 3),
			L:    pad(if L > 99 then Math.round(L / 10) else L),
			t:    if H < 12 then "a"  else "p",
			tt:   if H < 12 then "am" else "pm",
			T:    if H < 12 then "A"  else "P",
			TT:   if H < 12 then "AM" else "PM",
			Z:    if utc then "UTC" else (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
			o:    (if o > 0 then "-" else "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
			S:    ["th", "st", "nd", "rd"][if d % 10 > 3 then 0 else (d % 100 - d % 10 != 10) * d % 10]
		}
		
		mask.replace(token, (($0) -> (if $0 of flags then flags[$0] else $0.slice(1, $0.length - 1))))
	)
datetimeFmt = datetimeFmt()
	
_.addDateMask = (mask) -> 
	_.extend(properties.dateMask, mask || {});
	
_.dateFmt = (date, mask, utc) ->
	datetimeFmt(date, mask, utc)

# Object-oriented style begin

_.keys = (obj, precodition = -> true) ->
	if _.isObject(obj) and Object.keys then return Object.keys obj
	for own k, v of obj when precodition v, k then k

_.vals = (obj) ->
	keys = _.keys obj; l = keys.length; vals = new Array(l)
	for k in keys then obj[k]

_.funcs = (obj) -> 
	_.keys(obj, (v) -> _.isFunc(v))
	
#do mixing
doMixing = (name, func) -> 
	_::[name] = ->
		args = [ @_wrapped ];
		Array::push.apply(args, arguments);
		result.call(this, func.apply(_, args));

_.mixin = (obj) ->
	for name in _.funcs(obj)
		func = _[name] = obj[name]
		doMixing name, func
	return

#result
result = (obj) ->
	if @_chain then _(obj).chain() else obj
	
_.mixin(_);

_.chain = (obj) ->
	_(obj).chain()


_::chain = -> 
	@_chain = true;
	this

_::value = ->
	@_wrapped
	
# Object-oriented style end

# when plugin
((kiwi, component) -> (

	proto = (mask, date, utc) -> kiwi.dateFmt date, mask, utc
	
	kiwi.each kiwi.getDateMask(), (v, k) -> (
		kiwi.methodRegister proto, k, (date, utc) -> kiwi.dateFmt(date, v, utc)
		return
	)
	
	proto.idesc =
		year: ' years ago'
		month: ' months ago'
		week: ' weeks ago'
		day: ' days ago'
		hour: ' hours ago'
		minute: ' minutes ago'
		just: 'just now'
			
	proto.time = (target) ->
		target = target || new Date()
		if !kiwi.isDate target
			tmp = new Date(target)
			if isNaN tmp
				target = new Date(target.replace(/-/g, '/'))
			else
				target = tmp
		target.getTime()
	
	proto.interval = (target) ->
		unit = 1000.0
		# 24 * 60 * 60 * 1000 / unit 
		dayUnit = 86400
		# 60 * 60 * 1000 / unit
		hourUnit = 3600
		# 60 * 1000 / unit
		minUnit = 60
		target = proto.time target; interval = (proto.time() - target) / unit
		
		if interval >= 0.0
			# 5 * 365 * dayUnit
			if interval / 157680000 > 1.0
				proto.default target
			# 365 * dayUnit
			else if interval / 31536000 > 1.0
				parseInt(interval / 31536000) + proto.idesc.year
			# 30 * dayUnit
			else if interval / 2592000 > 1.0
				parseInt(interval / 2592000) + proto.idesc.month
			# 7 * dayUnit
			#else if (interval / 2592000 <= 1.0) && (interval / 604800 >= 1.0)
			#	parseInt(interval / 604800 ) + proto.idesc.week
			else if interval / 604800 >= 1.0
				7 + proto.idesc.day
			else if (interval / 604800 < 1.0) && (interval / dayUnit >= 1.0)
				parseInt(interval / dayUnit) + proto.idesc.day
			else if (interval / dayUnit < 1.0) && (interval / hourUnit >= 1.0)
				parseInt(interval / hourUnit) + proto.idesc.hour
			else if (interval < hourUnit) && (interval >= minUnit) 
				parseInt(interval / minUnit) + proto.idesc.minute
			else
				proto.idesc.just
		else
			proto.default target
	
	kiwi.register component, proto
	return
	
))(theRef, 'when')

# micro template (jsp style), see http://ejohn.org/blog/javascript-micro-templating/
((kiwi, component) -> (

	proto = (target, data) -> tmpl target, data
	_tmplCache = {}
	
	`var tmpl = function tmpl(target, data){
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
    };`
	
	kiwi.register component, proto
	return
	
))(theRef, 'tmpl')
	
# registration	
((kiwi, component) -> (

	# Expose as module.exports in loaders that implement the Node module pattern (including browserify).
	if typeof module is 'object' and module and typeof module.exports is 'object' then module.exports = kiwi
	else
		# expose to the global object
		root.kiwi = root[component] = kiwi
		
		# AMD registration happens at the end for compatibility with AMD loaders
		if typeof define is 'function' and define.amd
			define component, [], -> kiwi

		# Register as a named CMD module
		if typeof define is 'function' and define.cmd
			define (require, exports, module) -> exports[component] = kiwi; return

	return
	
))(theRef, 'lemon')	
