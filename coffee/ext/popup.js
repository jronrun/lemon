//popup plugin
(function(core, module){
	
	var proto = {};
	
	// see http://swip.codylindley.com/popupWindowDemo.html http://www.w3schools.com/jsref/met_win_open.asp
	//1. 常规 -》 选项卡 设置 -》 遇到弹出窗口时 始终在新窗口中打开弹出窗口
	//2. 安全 -》 自定义级别 -》 允许脚本初始化的窗口，不受大小或位置限制
	//3. 安全 -》 自定义级别 -》 允许网站打开没有地址或状态栏的窗口
	var _popupDefaultSettings = {
		channelmode:0,		// whether or not to display the window in theater mode. Default is no. IE only yes|no|1|0
		fullscreen:0,		// whether or not to display the browser in full-screen mode. Default is no.
							// A window in full-screen mode must also be in theater mode. IE only yes|no|1|0
		titlebar:0,			// whether or not to display the title bar. 
							// Ignored unless the calling application is an HTML Application or a trusted dialog box
		centerBrowser:0, 	// center window over browser window? {1 (YES) or 0 (NO)}. overrides top and left
		centerScreen:0, 	// center window over entire screen? {1 (YES) or 0 (NO)}. overrides top and left
		height:500, 		// sets the height in pixels of the window.
		left:0, 			// left position when the window appears.
		location:0, 		// determines whether the address bar is displayed {1 (YES) or 0 (NO)}.
		menubar:0, 			// determines whether the menu bar is displayed {1 (YES) or 0 (NO)}.
		resizable:0, 		// whether the window can be resized {1 (YES) or 0 (NO)}. Can also be overloaded using resizable.
		scrollbars:0, 		// determines whether scrollbars appear on the window {1 (YES) or 0 (NO)}.
		status:0, 			// whether a status line appears at the bottom of the window {1 (YES) or 0 (NO)}.
		width:500, 			// sets the width in pixels of the window.
		windowName:null, 	// name of window set from the name attribute of the element that invokes the click
		windowURL:null, 	// url used for the popup
		top:0, 				// top position when the window appears.
		toolbar:0 			// determines whether a toolbar (includes the forward and back buttons) is displayed {1 (YES) or 0 (NO)}.
	};
	
	var _popup = function(instanceSettings, callback) {
		var settings = $.extend({}, _popupDefaultSettings, instanceSettings || {}); var args = [];
		var excludeK = ['left', 'top', 'windowName', 'name', 'windowURL', 'href'];
		$.each(settings, function(k, v){ if (excludeK.indexOf(k) == -1) { args.push(k + '=' + v); } });
		var windowFeatures = args.join(',');

		settings.windowName = settings.name || settings.windowName;
		settings.windowURL = settings.href || settings.windowURL;
		
		var centeredY, centeredX, winObj;
		if (settings.centerBrowser) {
			if (($.browser && $.browser.msie) || (/msie/.test(navigator.userAgent.toLowerCase()))) {	// hacked together for IE browsers
				centeredY = (root.screenTop - 120) + ((((document.documentElement.clientHeight + 120) / 2) - (settings.height / 2)));
				centeredX = root.screenLeft + ((((document.body.offsetWidth + 20) / 2) - (settings.width / 2)));
			} else {
				centeredY = root.screenY + (((root.outerHeight / 2) - (settings.height / 2)));
				centeredX = root.screenX + (((root.outerWidth / 2) - (settings.width / 2)));
			}
			windowFeatures = windowFeatures + ',left=' + centeredX + ',top=' + centeredY;
			winObj = root.open( settings.windowURL, settings.windowName, windowFeatures);
		} else if (settings.centerScreen) {
			centeredY = (screen.height - settings.height) / 2;
			centeredX = (screen.width - settings.width) / 2;
			windowFeatures = windowFeatures + ',left=' + centeredX + ',top=' + centeredY;
			winObj = root.open( settings.windowURL, settings.windowName, windowFeatures);
		} else {
			windowFeatures = windowFeatures + ',left=' + settings.left + ',top=' + settings.top;
			winObj = root.open( settings.windowURL, settings.windowName, windowFeatures);
		}
		
		if (core.isInfoEnabled()) {
			core.info('window open ' + settings.windowName + '(' + settings.windowURL + ') with arguments: ' + windowFeatures);
		}
		
		core.delay(function(winObj){
			if (winObj && core.isFunc(callback)) { callback(winObj); }
		}, 500, winObj);
	};
	
	$.each({
		fullscreen: [{fullscreen : 1}, function(winObj){
			root.opener = null; 
			root.open('', '_self'); 
			root.close(); 
			root.moveTo(0, 0); 
			root.resizeTo(screen.availWidth, screen.availHeight); 
		}],
		win: [],
		centerScreen: [{centerScreen : 1}],
		centerBrowser: [{centerBrowser : 1}]
	}, function(k, v){
		core.methodRegister(proto, k, function(href, settings, callback){
			_popup($.extend({href : href}, settings, v[0]), (core.isFunc(callback) ? callback : v[1]));
		});
	});
	
	core.register(module, core.delegate(proto));
	
})(lemon, 'popup');
