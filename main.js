Util.logMode('errors', true);
Util.logMode('traffic', true);
Util.logMode('sessions', true);
//Util.logMode('routing', true);
//Util.logMode('err_types', true);
Env.init({
	getContainerElem:function() { return document.getElementById('linkshell'); },
	init:function() {
		var b = Env.makeAgent('otherguy');
		b.loadProgram('/usr/pfraze/debug.js');
		var a = Env.makeAgent('inbox', { noclose:true });
		a.loadProgram('/usr/pfraze/inbox.js', {
			services:[{ name:'@linkshui', uri:'http://linkshui.com:8600' }]
		});
	},
	requestSession:function(agent, uri, cb) {
		if (uri.host == agent.getDomain()) {
			cb(true, ['control']);
		} else if (/\.env$/.test(uri.host)) {
			cb(true);
		} else {
			if (uri.host == 'linkshui.com') {
				cb(true);
			}
			if (agent.getId() == 'otherguy' && uri.host == 'inbox.ui') {
				cb(true);
			}
		}
	},
	requestAuth:function(auth, cb) {
		switch (auth.challenge.scheme) {
			case 'LSHSession':
				auth.session.addPerms(auth.challenge.perms); // :DEBUG: just give them what they ask
				cb(true);
				break;
			case 'Basic':
				cb(false);
				break;
			default:
				throw "unsupported auth scheme '"+auth.challenge.scheme+"'";
		}
	}
});