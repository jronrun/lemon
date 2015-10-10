//storage see https://github.com/marcuswestin/store.js/blob/master/store.js
(function(root, core, component){
	
	var proto = {};
	
	proto = function(key, value, options) {
		if (core.isUndefined(value)) {
			return proto.get(key);
		}
		if (core.isNull(value)) {
			var v = proto.get(key); proto.remove(key); return v;
		}
		
		proto.set(key, value);
		return value;
	};
	
	var doc = root.document, localStorageName = 'localStorage', scriptTag = 'script', storage;
	
	proto.isSupport = function() {
		try { return (localStorageName in root && root[localStorageName]); } catch(e) { return false; }
	};
	
	proto.serialize = function(value) {
		if (root.JSON && core.isJson(value)) { return JSON.stringify(value); } return value;
	};
	proto.deserialize = function(value) {
		if (typeof value != 'string') { return value || undefined; }
		try { return JSON.parse(value); } catch(e) { return value || undefined; }
	};
	proto.transact = function(key, defaultVal, transactionFn) {
		var val = proto.get(key); if (transactionFn == null) { transactionFn = defaultVal; defaultVal = null; }
		if (typeof val == _undef) { val = defaultVal || {}; } transactionFn(val); proto.set(key, val);
	};
	proto.exists = function(key) {
		return proto.get(key) != null;
	};
	proto.keys = function() {
		var ret = []; core.each(proto.getAll(), function(v, k){ ret.push(k); }); return ret;
	};
	proto.size = function(key, value) {
		return proto.keys().length;
	};
	
	if (proto.isSupport()) {
		storage = root[localStorageName];
		proto.set = function(key, val) {
			if (val === undefined) { return proto.remove(key); }
			storage.setItem(key, proto.serialize(val)); return val;
		};
		
		proto.get = function(key) { return proto.deserialize(storage.getItem(key)); };
		proto.remove = function(key) { storage.removeItem(key); };
		proto.clear = function() { storage.clear(); };
		proto.getAll = function() {
			var ret = {}; proto.forEach(function(key, val) { ret[key] = val; }); return ret;
		};
		proto.forEach = function(callback) {
			for (var i = 0; i<storage.length; i++) { var key = storage.key(i); callback(key, proto.get(key)); }
		};
	} else if (doc.documentElement.addBehavior) {
		var storageOwner, storageContainer;
		try {
			storageContainer = new ActiveXObject('htmlfile');
			storageContainer.open();
			storageContainer.write('<'+scriptTag+'>document.w=window</'+scriptTag+'><iframe src="/favicon.ico"></iframe>');
			storageContainer.close();
			storageOwner = storageContainer.w.frames[0].document;
			storage = storageOwner.createElement('div');
		} catch(e) {
			storage = doc.createElement('div'); storageOwner = doc.body;
		}
		
		function withIEStorage(storeFunction) {
			return function() {
				var args = _a.slice.call(arguments, 0); args.unshift(storage);
				storageOwner.appendChild(storage); storage.addBehavior('#default#userData');
				storage.load(localStorageName); var result = storeFunction.apply(store, args);
				storageOwner.removeChild(storage); return result;
			};
		}

		var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g");
		function ieKeyFix(key) { return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___'); }
		proto.set = withIEStorage(function(storage, key, val) {
			key = ieKeyFix(key); if (val === undefined) { return proto.remove(key); }
			storage.setAttribute(key, proto.serialize(val)); storage.save(localStorageName); return val;
		});
		proto.get = withIEStorage(function(storage, key) {
			key = ieKeyFix(key); return proto.deserialize(storage.getAttribute(key));
		});
		proto.remove = withIEStorage(function(storage, key) {
			key = ieKeyFix(key); storage.removeAttribute(key); storage.save(localStorageName);
		});
		proto.clear = withIEStorage(function(storage) {
			var attributes = storage.XMLDocument.documentElement.attributes;
			storage.load(localStorageName);
			for (var i=0, attr; attr=attributes[i]; i++) { storage.removeAttribute(attr.name); }
			storage.save(localStorageName);
		});
		proto.getAll = function(storage) {
			var ret = {}; proto.forEach(function(key, val) { ret[key] = val; }); return ret;
		};
		proto.forEach = withIEStorage(function(storage, callback) {
			var attributes = storage.XMLDocument.documentElement.attributes;
			for (var i=0, attr; attr=attributes[i]; ++i) {
				callback(attr.name, proto.deserialize(storage.getAttribute(attr.name)));
			}
		});
	}
	
	core.register(component, proto);
	
})(this, this.kiwi, 'store');

//Html5 fetures support check
(function(root, core, component) {
	
	var proto = {};
	
	proto.pushState = window.history && window.history.pushState && window.history.replaceState &&
	  // pushState isn't reliable on iOS until 5.
	  !navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/);
	
	proto.store = core.store.isSupport() ? true : false;
	
	core.register(component, proto);
	
})(this, this.kiwi, 'support');

