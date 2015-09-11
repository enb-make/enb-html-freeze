var url = require('url'),
    path = require('path');

module.exports = File;

function File(src) {
    this._src = src;
    this._parsed = url.parse(src);
}

File.prototype = {
    get path() {
        return this._parsed.pathname;
    },
    get extension() {
        return path.extname(this.path);
    },
    get query() {
        if(this._parsed.search) {
            return this._parsed.search;
        }
        if(this._parsed.hash) {
            return this._parsed.hash;
        }
        return '';
    }
};
