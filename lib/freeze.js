var cheerio = require('cheerio'),
    _ = require('lodash'),
    vow = require('vow'),
    vfs = require('vow-fs'),
    vowNode = require('vow-node'),
    path = require('path'),
    hasha = require('hasha'),
    mkdirp = require('mkdirp'),

    File = require('./file'),

    RE_ATTR_FILTER = /^(\/|[^:/]+\:)/;

exports.freeze = function(opts) {
    var parser = cheerio.load(opts.html);

    return _(parser(opts.tag))
        .filter(_filterTag)
        .chunk(opts.parallelLimit)
        .map(_createCopyChunk)
        .reduce(vow.when, vow.resolve())
        .then(function() {
            return parser.html();
        });

    function _filterTag(item) {
        return !RE_ATTR_FILTER.test(item.attribs[opts.attr]);
    }

    function _createCopyChunk(chunk) {
        return function() {
             return _(chunk)
                .map(function(item) {
                    var wrappedItem = parser(item);

                    return _createStaticFile(item.attribs[opts.attr])
                        .then(wrappedItem.attr.bind(wrappedItem, opts.attr));
                })
                .thru(vow.all)
                .value();
        };
    }

    function _createStaticFile(src) {
        var file = new File(src),
            filePath = path.resolve(opts.nodePath, file.path);

        return vowNode
            .invoke(mkdirp, opts.staticDir)
            .then(_createStaticPath)
            .then(_copy);

        function _createStaticPath() {
            return hasha
                .fromFile(filePath, {algorithm: opts.algorithm})
                .then(function(hash) {
                    return path.resolve(opts.staticDir, hash + file.extension);
                });
        }

        function _copy(staticPath) {
            return vfs
                .copy(filePath, staticPath)
                .then(function() {
                    return path.relative(opts.nodePath, staticPath) + file.query;
                });
        }
    }
};
