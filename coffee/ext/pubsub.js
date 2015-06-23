//pubsub plugin see https://github.com/cowboy/jquery-tiny-pubsub
(function(root, core, component) {
	
	var o = $({});

	core.listen = core.subscribe = function() {
		o.on.apply(o, arguments);
	};
	core.listenOnce = core.subscribeOnce = function() {
		o.one.apply(o, arguments);
	};
	core.unlisten = core.unsubscribe = function() {
		o.off.apply(o, arguments);
	};
	core.publish = function() {
		o.trigger.apply(o, arguments);
	};
	
})(this, this.kiwi);
