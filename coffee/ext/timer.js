// https://github.com/odyniec/jQuery-tinyTimer
(function(root, core, component) {
	
	var proto = function(options) {
		var p = arguments; if (p.length == 2) {
			var el = p[0], opt = p[1]; $.extend(opt, { element: el }); options = opt;
		} proto.tinyTimer(options);
	};
	
	proto.tinyTimer = function(options) {
        var tick, tt = this, elem = (tt.options = options).element, 
        	ref = new Date(options.from || options.to).getTime(), 
        	dir = !!options.from || -1, M = Math, doNothing = function() {};
        tt.interval = setInterval(tick = function() {
            if (!tt.paused) {
                var sec = M.max(M.round((core.now() - ref) * dir / 1e3), 0), val = {
                    S: sec,
                    s: sec % 60,
                    M: M.floor(sec /= 60),
                    H: M.floor(sec /= 60),
                    D: M.floor(sec /= 24)
                };
                val.m = val.M % 60, val.h = val.H % 24, val.d = val.D, 
                val.text = (options.format || "%-H{:}%0m:%0s").replace(/%(-?)(0?)([dhms])(\s*)(?:\{(.+?)\})?/gi, options.replacer 
                		|| function(match, omit, zero, part, space, forms) {
                    var v = val[part];
                    return (forms = (forms || "").split("|"))[2] = forms[2] || (forms[1] = forms[1] || forms[0]), 
                    !v && omit ? "" : (v > 9 ? "" : zero) + v + space + forms[+(1 != v) + (1 != v && (2 > v % 10 || v % 10 > 4) || v > 10 && 20 > v)];
                }), elem ? $(elem).html(val.text) : elem = tt, (options.onTick || doNothing).call(elem, tt.val = val), 
                0 > dir && !sec && (clearInterval(tt.interval), (options.onEnd || doNothing).call(elem, val));
            }
        }, 1e3), tick(), tt.pause = tt.stop = function() {
            tt.paused = core.now();
        }, tt.resume = function() {
            ref -= (tt.paused - core.now()) * dir, tt.paused = 0;
        }, tt.start = function() {
            tt.paused = 0;
        };
    };
    
    core.register(component, proto);
	
})((typeof global === 'undefined' ? window : global), lemon, 'timer');
