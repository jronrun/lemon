//http://wiki.github.com/bkuzmic/jquery-crossdomain-data-plugin/
(function(root, core, component){
	
	var proto = {};
	
	proto = function(url, callback) {
		return remoteData(url, callback);
	};
	
	proto.mozilla = /firefox/.test(navigator.userAgent.toLowerCase());
	proto.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
	proto.opera = /opera/.test(navigator.userAgent.toLowerCase());
	proto.msie = /msie/.test(navigator.userAgent.toLowerCase());
	
	proto.form = function(callback, formId, action, method) {
		remoteForm(callback, formId, action, method);
	};
	
	var remoteForm = function(callback, formId, action, method) {
		var _cb; 				// holds postMessage callback
		var frm;				// jQuery iFrame object
		var rform;				// form object using formId
		var loaded = false; 	// iFrame loading indicator, for window.name transport only
		rform = $(lemon.startIf(formId, '#'));
				
		rform.submit(function() {
			frm = $('<iframe name="_rmfrm_form" id="_rmfrm_form" style="display:none;" scrolling="no" frameborder="0"></iframe>');		
			$(document.body).append(frm);
			
			// set form parameters
			rform.attr('target', '_rmfrm_form');
			rform.attr('action', action);
			rform.attr('method', method);
			
			// use window.postMessage if available for message transport
			if (root.postMessage) {
				if (callback) {
					_cb = null;
					_cb = function(e) {
						// cleanup						
						$(root).unbind('message', _cb);					
						frm.remove();
						rform.remove();
						callback(e.originalEvent.data);
					};
					
					$(root).bind('message', _cb);						
				}			
			} else {
				// fall back to window.name transport
				frm.load(function() {
					if (loaded) {
						if (!proto.msie) {
							retrieveData();
						}
					} else {
						loaded = true;
						frm.get(0).contentWindow.location = "about:blank";
					}
				});
			
				if (proto.msie) {
					frm.get(0).onreadystatechange = function() {
						if (loaded) {
							retrieveData();
						}
					};
				}
			}
			
			function retrieveData() {
				try {
					var data = frm.get(0).contentWindow.name || null;
					if (data != null) {
						frm.remove();
						rform.remove();
						callback(data);
					}
				} catch (e) {/**/}	
			}
		});
	};

	var remoteData = function(url, callback) {
		var _cb; 				// holds postMessage callback
		var frm;				// jQuery iFrame object
		var loaded = false; 	// iFrame loading indicator, for window.name transport only
	
		frm = $('<iframe name="_rmfrm" id="_rmfrm" style="display:none;" scrolling="no" frameborder="0"></iframe>');		
		$(document.body).append(frm);
		frm.attr('src', url);

		// use window.postMessage if available for message transport
		if (root.postMessage) {
			if (callback) {
				_cb = null;
				_cb = function(e) {
					$(root).unbind('message', _cb);					
					frm.remove();
					callback(e.originalEvent.data);
				};
				
				$(root).bind('message', _cb);						
			}			
		} else {
			// fall back to window.name transport
			frm.load(function() {
				if (loaded) {
					if (!proto.msie) {
						retrieveData();
					}
				} else {
					loaded = true;
					frm.get(0).contentWindow.location = "about:blank";
				}
			});
		
			if (proto.msie) {
				frm.get(0).onreadystatechange = function() {
					if (loaded) {
						retrieveData();
					}
				};
			}
		}
		
		function retrieveData() {
			try {
				var data = frm.get(0).contentWindow.name || null;
				if (data != null) {
					frm.remove();
					callback(data);
				}
			} catch (e) {/**/}	
		}		
	
	};
	
	core.register(component, proto);
	
})((typeof global === 'undefined' ? window : global), lemon, 'cross');