(function(core, module) {
	
	var proto = {};
	
	proto.toggle = function(toggleObj, checkboxName){
		$("input[name='" + checkboxName + "']:enabled").attr("checked", toggleObj.checked);
	};
	
	proto.hasChecked = function(checkboxName, msg){
		if(parseInt(proto.checkedSize(checkboxName)) <= 0) {
			if (msg) { core.alert(msg); } return false;
		} return true;
	};
	
	proto.checkedVal = function(checkboxName, separator, msg){
		if(!proto.hasChecked(checkboxName, msg)) { return; }
			
		return $("input:checked[name='" + checkboxName + "']").map(function(){
			return $(this).val();
		}).get().join((separator ? separator : ","));
	};
	
	proto.checkedSize = function(checkboxName){
		return $("input:checked[name='" + checkboxName + "']").size();
	};
	
	core.register(module, core.delegate(proto));
	
})(this.kiwi, 'chkbox');
