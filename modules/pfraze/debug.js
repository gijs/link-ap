// server
var server = {
	routes:[
		HttpRouter.route('hello', { uri:'^/?$', method:'get', accept:'text/html' }),
		HttpRouter.route('subhello', { uri:'^/sub$', method:'get', accept:'text/html' })
	],
	hello:function() {
		return HttpRouter.response(200, '<p>paragraph</p><a href="#/debug/sub">link</a>', 'text/html');
	},
	subhello:function() {
		return HttpRouter.response(200, 'link clicked!',/*<script class="program" src="/modules/pfraze/debug.js"></script>',*/ 'text/html');
	}
};
Agent.addServer('#/', server);

// client
addEventMsgListener('dom:request', function(e) {
	Agent.follow(e.request);
});
addEventMsgListener('dom:response', function(e) {
	Agent.dom.put(e.response.body);
	Agent.dom.listen('click');
	Agent.dom.listen('click', 'p');
	Agent.dom.listen('click', 'a');
});
addEventMsgListener('dom:click', function(e) {
	Agent.dom.appendChild('<p>body click!</p>');
});
addEventMsgListener('dom:click p', function(e) {
	Agent.dom.appendChild('<p>paragraph click!</p>');
});
addEventMsgListener('dom:click a', function(e) {
	Agent.dom.appendChild('<p>link click!</p>');
});

postEventMsg('ready');