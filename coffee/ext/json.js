//json format plugin see https://github.com/phoboslab/json-format
(function(kiwi, component) {
	var chk, fmt, pop, proto, tabs, trims, unfmt;
	proto = function(json) {
		return fmt(json);
	};

	proto.reverse = function(json) {
		return unfmt(json);
	};

	proto.highlight = function(json) {
		return syntax(json);
	};

	pop = function(m, i) {
		return p[i - 1];
	};

	tabs = function(count) {
		return new Array(count + 1).join('\t');
	};

	trims = function(fragment, split, isJoinEmpty) {
		var afterTrim, arrEl, out, tmp;
		out = "";
		afterTrim = kiwi.trim(fragment);
		arrEl = afterTrim.split(split);
		if (arrEl.length > 0) {
			tmp = [];
			kiwi.each(arrEl, function(v, k) {
				tmp.push(kiwi.trim(v));
			});
			out = tmp.join(isJoinEmpty ? '' : split);
		} else {
			out = afterTrim;
		}
		return out;
	};

	chk = function(target) {
		if (kiwi.isBlank(target)) {
			return '{}';
		}
		if (kiwi.isString(target)) {
			return target;
		}
		if (JSON && kiwi.isJson(target)) {
			return JSON.stringify(target);
		} else {
			throw new Error("This browser JSON.stringify is unsupported.");
		}
	};

	unfmt = function(json) {
		var out;
		out = trims(chk(json), '\n');
		out = trims(out, '[');
		out = trims(out, ']');
		out = trims(out, '{');
		out = trims(out, '}');
		out = trims(out, ',');
		out = trims(out, ':');
		return out;
	};

	proto.style = {
		'.string' : {
			color : 'green'
		},
		'.number' : {
			color : 'blue'
		},
		'.boolean' : {
			color : 'darkorange'
		},
		'.null' : {
			color : 'magenta'
		},
		'.key' : {
			color : 'gray'
		}
	};

	proto.toCSS = function(target) {
		var styleStr = '';
		for ( var i in target) {
			styleStr += i + " {\n"
			for ( var j in target[i]) {
				if (j == "CSS-INHERIT-SELECTOR") {
					for ( var k in target[target[i][j]]) {
						styleStr += "\t" + k + ":" + target[target[i][j]][k]
								+ ";\n"
					}
				} else {
					styleStr += "\t" + j + ":" + target[i][j] + ";\n"
				}
			}
			styleStr += "}\n"
		}
		return styleStr
	};

	proto.addStyle = function(style, syntaxId) {
		var doc;
		syntaxId = syntaxId || 'json_syntax';
		kiwi.removeEl('#' + syntaxId);
		doc = document;
		style = doc.createElement('style');
		style.type = 'text/css';
		style.id = syntaxId;
		style.innerHTML = kiwi.isString(style) ? style : proto
				.toCSS(proto.style);
		kiwi.query('head').appendChild(style);
	};

	var syntax = function(json) {
		proto.addStyle();
		json = fmt(json).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(
				/>/g, '&gt;');
		return json
				.replace(
						/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
						function(match) {
							var cls = 'number';
							if (/^"/.test(match)) {
								cls = /:$/.test(match) ? 'key' : 'string';
							} else if (/true|false/.test(match)) {
								cls = 'boolean';
							} else if (/null/.test(match)) {
								cls = 'null';
							}
							return '<span class="' + cls + '">' + match
									+ '</span>';
						});
	};

	fmt = function(json) {
		var c, i, indent, out, q, ref;
		if (JSON) {
			return JSON.stringify(JSON.parse(chk(json)), undefined, 4);
		}
		out = "";
		indent = 0;
		json = unfmt(chk(json));
		for (i = q = 0, ref = json.length; 0 <= ref ? q < ref : q > ref; i = 0 <= ref ? ++q
				: --q) {
			switch (c = json.charAt(i)) {
			case '{':
			case '[':
				out += c + "\n" + tabs(++indent);
				break;
			case '}':
			case ']':
				out += "\n" + tabs(--indent) + c;
				break;
			case ',':
				out += ",\n" + tabs(indent);
				break;
			case ':':
				out += ": ";
				break;
			default:
				out += c;
			}
		}

		out = out.replace(/\[[\d,\s]+?\]/g, function(m) {
			return m.replace(/\s/g, '');
		}).replace(/\\(\d+)\\/g, pop).replace(/\\(\d+)\\/g, pop);
		return out;
	};

	kiwi.register(component, proto);
})(this.kiwi, 'json');