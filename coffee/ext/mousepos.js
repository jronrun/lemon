//Direction Event, supports direct: left, leftTop, leftBottom, right, rightTop, rightBottom, top, bottom; 
(function(root, core, component){
	
	var proto = {};
	
	//selctor || area eg: {left: 10, top: 70, w: 100, h: 300}
	proto = function(watch) {
		return new direct(watch);
	};

	var listening = {};
	function direct(watch) {
		var theWatch = {};
		if (lemon.isString(watch) && $(watch).length) {
			var listenArea = $(watch).offset();
			listenArea.w = $(watch).width();
			listenArea.h = $(watch).height();
			theWatch.el = watch;
			theWatch.area = listenArea;
		} else if (lemon.isJson(watch) 
			&& lemon.has(watch, 'left') 
			&& lemon.has(watch, 'top') 
			&& lemon.has(watch, 'w') 
			&& lemon.has(watch, 'h')) {
			theWatch.el = 'body';
			theWatch.area = watch;
		} else {
			throw new Error('Arguments ilegal, supports jQuery selector || area eg: {left: 10, top: 70, w: 100, h: 300}');
		}

		this.watch = theWatch;
		this.area = {};
		this.start();
	}

	direct.prototype.start = function() {
		var selector = this.watch.el;
		if (!listening[selector]) {
			$(selector).bind('mousemove', { rel: this }, moving);
			listening[selector] = 1;
		}
		return this;
	};

	direct.prototype.stop = function() {
		var selector = this.watch.el;
		if (listening[selector]) {
			$(selector).unbind('mousemove', moving);
			listening[selector] = 0;
		}
		return this;
	};

	direct.prototype.listen = function(options) {
		options = core.extend({
			direct: 'left',
			offsetX: 5,
			offsetY: 5,
			movein: null,
			moveout: null
		}, options || {});
		options.inplace = false;
		this.area[options.direct] = options;
		return this;
	};

	proto.status = function() {
		return {
			listening: listening
		}
	};

	var moving = function(event) {
		var rel = event.data.rel, op = null, 
		area = rel.watch.area, inArea = false, data = {
			x: event.pageX,
			y: event.pageY
		};

		core.each(rel.area, function(v, k) {
			op = v, data.options = v;
			switch(k) {
			case 'left':
				inArea = (data.x >= area.left && data.x <= (area.left + op.offsetX))
					&& (data.y >= (area.top + op.offsetY) && data.y <= (area.top + area.h - op.offsetY));
				break;
			case 'right':
				inArea = (data.x >= (area.left + area.w - op.offsetX) && data.x <= (area.left + area.w))
					&& (data.y >= (area.top + op.offsetY) && data.y <= (area.top + area.h - op.offsetY));
				break;
			case 'top':
				inArea = (data.x >= (area.left + op.offsetX) && data.x <= (area.left + area.w - op.offsetX))
					&& (data.y >= area.top && data.y <= (area.top + op.offsetY));
				break;
			case 'bottom':
				inArea = (data.x >= (area.left + op.offsetX) && data.x <= (area.left + area.w - op.offsetX))
					&& (data.y >= (area.top + area.h - op.offsetY) && data.y <= (area.top + area.h));
				break;
			case 'leftTop':
				inArea = (data.x >= area.left && data.x <= (area.left + op.offsetX))
					&& (data.y >= area.top && data.y <= (area.top + op.offsetY));
				break;
			case 'rightTop':
				inArea = (data.x >= (area.left + area.w - op.offsetX) && data.x <= (area.left + area.w))
					&& (data.y >= area.top && data.y <= (area.top + op.offsetY));
				break;
			case 'leftBottom':
				inArea = (data.x >= area.left && data.x <= (area.left + op.offsetX))
					&& (data.y >= (area.top + area.h - op.offsetY) && (data.y <= (area.top + area.h)));
				break;
			case 'rightBottom':
				inArea = (data.x >= (area.left + area.w - op.offsetX) && data.x <= (area.left + area.w))
					&& (data.y >= (area.top + area.h - op.offsetY) && (data.y <= (area.top + area.h)));
				break;
			}

			if (inArea) {
				if (!op.inplace) {
					op.inplace = true;
					core.isFunc(op.movein) && op.movein(data);
				}
			} else {
				if (op.inplace) {
					op.inplace = false;
					core.isFunc(op.moveout) && op.moveout(data);
				}
			}
		});
	};

	core.register(component, proto);

})(this, this.kiwi, 'mousepos');