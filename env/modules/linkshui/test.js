define(['link'], function(Link) {
    var Module = function() {
    };

    Module.prototype.routes = [
        Link.route('respond', { uri:"^/?$" }),
        Link.route('links', { uri:"^/?$" })
    ];

    Module.prototype.respond = function(request) {
        if (/obj/.test(request.accept)) {
            var obj = { a:'1', b:'2', c:'3' };
            Object.defineProperty(obj, 'toString', { value:__objToString });
            return Link.response(200, obj, 'obj/test');
        }
        if (/html/.test(request.accept)) {
            return Link.response(200, '<h1>Test Response!!</h1><h3>(generated by a server in the browser)</h3>', 'text/html');
        }
        return Link.response(200, 'ok', 'text/plain');
    };

    Module.prototype.links = function(request, match, response) {
        response.link = [{ uri:'#', rel:'test' }];
        return response;
    };

    function __objToString() {
        return JSON.stringify(this);
    }

    return Module;
});