var RequestEvents = (function() {
	// Request Events
	// ==============
	// converts DOM events into linkjs request events
	var RequestEvents = {
		init:RequestEvents__init
	};

	// setup
	function RequestEvents__init(container) {
		container.addEventListener('click', RequestEvents__clickHandler);
		container.addEventListener('submit', RequestEvents__submitHandler);
		container.addEventListener('dragstart', RequestEvents__dragstartHandler);
		container.addEventListener('drop', RequestEvents__dropHandler);
	}

	function RequestEvents__clickHandler(e) {
		if (e.button !== 0) { return; } // handle left-click only
		RequestEvents__trackFormSubmitter(e.target);
		var request = RequestEvents__extractLinkFromAnchor(e.target);
		if (request) {
			e.preventDefault();
			e.stopPropagation();
			var re = new CustomEvent('request', { bubbles:true, cancelable:true, detail:{ request:request }});
			e.target.dispatchEvent(re);
			return false;
		}
	}

	function RequestEvents__submitHandler(e) {
		var request = RequestEvents__extractLinkFromForm(e.target);
		if (request) {
			e.preventDefault();
			e.stopPropagation();
			var re = new CustomEvent('request', { bubbles:true, cancelable:true, detail:{ request:request }});
			e.target.dispatchEvent(re);
			return false;
		}
	}

	function RequestEvents__dragstartHandler(e) {
		e.dataTransfer.effectAllowed = 'none'; // allow nothing unless there's a valid link
		var link = null, elem = e.target;
		RequestEvents__trackFormSubmitter(elem);
		if (elem.tagName == 'A') {
			link = RequestEvents__extractLinkFromAnchor(elem);
		} else if (elem.form) {
			link = RequestEvents__extractLinkFromForm(elem.form);
		}
		if (link) {
			e.dataTransfer.effectAllowed = 'link';
			e.dataTransfer.setData('application/link+json', JSON.stringify(link));
		}
	}

	function RequestEvents__dropHandler(evt) {
		evt.stopPropagation();
		evt.preventDefault();

		var target = RequestEvents__findDropTarget(evt.target);
		if (!target) { return false; }

		// try to parse known data formats
		var request = null;
		var data = evt.dataTransfer.getData('application/link+json');
		if (data) {
			request = JSON.parse(data);
		} else {
			data = evt.dataTransfer.getData('text/uri-list');
			if (data) {
				request = { method:'get', uri:data, accept:'text/html' };
			}
		}

		if (!request) {
			console.log('Bad data provided on RequestEvents drop handler', except, evt);
			return false;
		}

		var re = new CustomEvent('request', { bubbles:true, cancelable:true, detail:{ request:request }});
		target.dispatchEvent(re);
		return false;
	}

	function RequestEvents__trackFormSubmitter(node) {
		while (node && node.classList && node.classList.contains('agent') === false) {
			if (node.form) {
				for (var i=0; i < node.form.length; i++) {
					node.form[i].setAttribute('submitter', null); // clear the others out, to be safe
				}
				node.setAttribute('submitter', '1');
				break;
			}
			node = node.parentNode;
		}
	}
    
    function RequestEvents__findDropTarget(node) {
		while (node) {
            if (node.classList && (node.classList.contains('agent') || node.classList.contains('agent-body') ||  node.classList.contains('droptarget'))) {
                return node;
            }
			node = node.parentNode;
		}
	}

	function RequestEvents__extractLinkFromAnchor(node) {
		while (node && node.classList && node.classList.contains('agent') === false) {
			// filter to the link in this element stack
			if (node.tagName != 'A') {
				node = node.parentNode;
				continue;
			}

			var uri = node.attributes.href.value;
			var accept = node.getAttribute('type');
			var target = node.getAttribute('target');

			if (uri.indexOf('://') == -1) {
				if (uri.charAt(0) == '/' && /\/$/.test(window.location) === true) {
					uri = uri.substr(1);
				}
				uri = window.location + uri;
			}

			if (uri === null || uri === '') { uri = '/'; }
			if (!target) { target = '_self'; }

			if (target == '_top' || target == '_blank') { return null; } // default behavior

			return { method:'get', uri:uri, accept:accept/*, target:target :TODO: needed? */ };
		}
		return null;
	}

	function RequestEvents__extractLinkFromForm(form) {
		var target_uri, enctype, method, target;

		// :NOTE: a lot of default browser behaviour has to (i think) be emulated here

		// Serialize the data
		var data = {};
		for (var i=0; i < form.length; i++) {
			var elem = form[i];
			// Pull value if it has one
			if (elem.value) {
				// don't pull from buttons unless recently clicked
				if (elem.tagName.toLowerCase() == 'button' || (elem.tagName.toLowerCase() == 'input' && (elem.type.toLowerCase() == 'button' || elem.type.toLowerCase() == 'submit')) ){
					if (elem.getAttribute('submitter') == '1') {
						data[elem.name] = elem.value;
					}
				} else {
					data[elem.name] = elem.value;
				}
			}
			// If was recently clicked, pull its request attributes-- it's our submitter
			if (elem.getAttribute('submitter') == '1') {
				target_uri = elem.getAttribute('formaction');
				enctype = elem.getAttribute('formenctype');
				method = elem.getAttribute('formmethod');
				target = elem.getAttribute('formtarget');
				elem.setAttribute('submitter', '0');
			}
		}

		// If no element gave request attributes, pull them from the form
		if (!target_uri) { target_uri = form.getAttribute('action'); }
		if (!enctype) { enctype = form.enctype; }
		if (!method) { method = form.getAttribute('method'); }
		if (!target) { target = form.getAttribute('target'); }

		// Strip the base URI
		var base_uri = window.location.href.split('#')[0];
		if (target_uri.indexOf(base_uri) != -1) {
			target_uri = target_uri.substring(base_uri.length);
			if (target_uri.charAt(0) != '/') { target_uri = '/' + target_uri; }
		}

		var request = {
			method:method,
			uri:target_uri//,
			/*target:target :TODO: needed? */
		};
		if (form.acceptCharset) { request.accept = form.acceptCharset; }

		// Build request body
		if (method == 'get') {
			var qparams = [];
			for (var k in data) {
				qparams.push(k + '=' + data[k]);
			}
			if (qparams.length) {
				target_uri += '?' + qparams.join('&');
				request.uri = target_uri;
			}
		} else {
			request.body = data;
			request['content-type'] = enctype;
		}

		return request;
	}

	return RequestEvents;
})();
