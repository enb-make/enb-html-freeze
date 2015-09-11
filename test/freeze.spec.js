var vow = require('vow'),
    vfs = require('vow-fs'),
    hasha = require('hasha'),
    path = require('path'),
    proxyquire =  require('proxyquire'),
    cheerio = require('cheerio'),
    freeze;

proxyquire('../lib/freeze', {
    mkdirp: function(file, cb) {
        cb();
    }
});

freeze = require('../lib/freeze').freeze;

describe('html-freeze', function() {
    var sandbox = sinon.sandbox.create(),
        opts,
        copy,
        hash;

    beforeEach(function() {
        copy = sandbox.stub(vfs, 'copy');
        hash = sandbox.stub(hasha, 'fromFile');

        copy.returns(vow.resolve());

        opts = {
            nodePath: './',
            tag: 'img',
            attr: 'src',
            staticDir: 'static'
        };
    });

    afterEach(function() {
        sandbox.restore();
    });

    function freezeHtml(opts) {
        return freeze(opts).then(function(res) {
            return cheerio.load(res)(opts.tag);
        });
    }

    describe('should correctly perform path replacing for', function() {
        it('a single tag', function() {
            hash.withArgs(path.resolve('imgs/image.png')).returns(vow.resolve('0fc3'));

            opts.staticDir = 'static';
            opts.tag = 'img';
            opts.attr = 'src';
            opts.html = '<img src="imgs/image.png">';

            return freezeHtml(opts)
                .then(function(img) {
                    expect(img.attr('src')).to.equal('static/0fc3.png');
                });
        });
        it('multiple tags with different paths', function() {
            hash
                .withArgs(path.resolve('imgs/image.png')).returns(vow.resolve('0fc3'))
                .withArgs(path.resolve('../../../imgs/image1.png')).returns(vow.resolve('3a1f'));

            opts.staticDir = 'static';
            opts.tag = 'img';
            opts.attr = 'src';
            opts.html = [
                '<img src="imgs/image.png">',
                '<img src="../../../imgs/image1.png">'
            ].join('');

            return freezeHtml(opts)
                .then(function(imgs) {
                    expect(imgs.eq(0).attr('src')).to.equal('static/0fc3.png');
                    expect(imgs.eq(1).attr('src')).to.equal('static/3a1f.png');
                });
        });
    });

    it('should correctly perform resolving of a static path relative `nodePath`', function() {
        hash.returns(vow.resolve('0fc3'));

        opts.nodePath = 'bundle/node';
        opts.staticDir = 'static';
        opts.tag = 'img';
        opts.attr = 'src';
        opts.html = '<img src="imgs/image.png">';

        return freezeHtml(opts)
            .then(function(img) {
                expect(img.attr('src')).to.equal('../../static/0fc3.png');
            });
    });

    it('should save static files', function() {
        hash
            .withArgs(path.resolve('imgs/image.png')).returns(vow.resolve('0fc3'))
            .withArgs(path.resolve('another-imgs/image.png')).returns(vow.resolve('3a1f'));

            opts.staticDir = 'static';
            opts.html = [
                '<img src="imgs/image.png">',
                '<img src="another-imgs/image.png">'
            ].join('');

        return freezeHtml(opts)
            .then(function() {
                expect(copy).to.have.been.calledTwice;

                expect(copy.getCall(0)).to.have.been.calledWithExactly(
                    path.resolve('imgs/image.png'),
                    path.resolve('static/0fc3.png')
                );

                expect(copy.getCall(1)).to.have.been.calledWithExactly(
                    path.resolve('another-imgs/image.png'),
                    path.resolve('static/3a1f.png')
                );
            });
    });

    it('should calculate hash-sum', function() {
        hash.withArgs(path.resolve('imgs/image.png')).returns(vow.resolve());

        opts.html = '<img src="imgs/image.png">';
        opts.algorithm = 'md5';

        return freeze(opts)
            .then(function() {
                expect(hash).to.have.been.calledWithExactly(
                    path.resolve('imgs/image.png'),
                    {algorithm: 'md5'}
                );
            });
    });

    it('should process a custom tag', function() {
        hash.returns(vow.resolve('0fc3'));

        opts.staticDir = 'static';
        opts.tag = 'script';
        opts.attr = 'src';
        opts.html = '<script src="some.js"></script>';

        return freezeHtml(opts)
            .then(function(script) {
                expect(script.attr('src')).to.equal('static/0fc3.js');
            });
    });

    it('should process a custom attribute', function() {
        hash.withArgs(path.resolve('imgs/image.png')).returns(vow.resolve('0fc3'));

        opts.staticDir = 'static';
        opts.tag = 'div';
        opts.attr = 'data-img';
        opts.html = '<div data-img="imgs/image.png">';

        return freezeHtml(opts)
            .then(function(img) {
                expect(img.attr('data-img')).to.equal('static/0fc3.png');
            });
    });

    it('should freeze resource with query string', function() {
        hash.returns(vow.resolve('0fc3'));

        opts.staticDir = 'static';
        opts.tag = 'param';
        opts.attr = 'value';
        opts.html = '<param value="res/flash.swf?width=100&height=200">';

        return freezeHtml(opts)
            .then(function(param) {
                expect(param.attr('value')).to.equal('static/0fc3.swf?width=100&height=200');
                expect(hash).to.have.been.calledWith(
                    path.resolve('res/flash.swf')
                );
                expect(copy).to.have.been.calledWith(
                    path.resolve('res/flash.swf'),
                    path.resolve('static/0fc3.swf')
                );
            });
    });

    it('should freeze SVG with fragment identifiers', function() {
        hash.returns(vow.resolve('0fc3'));

        opts.staticDir = 'static';
        opts.tag = 'img';
        opts.attr = 'src';
        opts.html = '<img src="imgs/image.svg#some_id">';

        return freezeHtml(opts)
            .then(function(img) {
                expect(img.attr('src')).to.equal('static/0fc3.svg#some_id');
                expect(hash).to.have.been.calledWith(
                    path.resolve('imgs/image.svg')
                );
                expect(copy).to.have.been.calledWith(
                    path.resolve('imgs/image.svg'),
                    path.resolve('static/0fc3.svg')
                );
            });
    });

    describe('should filter URL', function() {
        it('absolute', function() {
            hash.returns(vow.resolve());

            opts.html = '<img src="/imgs/image.png">';

            return freezeHtml(opts)
                .then(function() {
                    expect(hash).to.have.been.not.called;
                    expect(copy).to.have.been.not.called;
                });
        });
        it('protocol', function() {
            hash.returns(vow.resolve());

            opts.html = '<img src="http://imgs.com/image.png">';

            return freezeHtml(opts)
                .then(function() {
                    expect(hash).to.have.been.not.called;
                    expect(copy).to.have.been.not.called;
                });
        });
        it('relative protocol', function() {
            hash.returns(vow.resolve());

            opts.html = '<img src="//imgs.com/image.png">';

            return freezeHtml(opts)
                .then(function() {
                    expect(hash).to.have.been.not.called;
                    expect(copy).to.have.been.not.called;
                });
        });
    });

    it('shound not filter tag if an URL there is in query string', function() {
        hash.returns(vow.resolve('0fc3'));

        opts.staticDir = 'static';
        opts.tag = 'param';
        opts.attr = 'value';
        opts.html = '<param value="res/flash.swf?width=100&height=200&q=http://somedomen.com">';

        return freezeHtml(opts)
            .then(function(param) {
                expect(param.attr('value')).to.equal('static/0fc3.swf?width=100&height=200&q=http://somedomen.com');
            });
    });
});
