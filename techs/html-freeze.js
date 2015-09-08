/**
 * @class HtmlFreezeTech
 * @augments {BaseTech}
 * @classdesc
 *
 * Builds static resources from a HTML file. <br/><br/>
 *
 * @param {Object}    [options]                                           Options
 * @param {String}    [options.target='?.freeze.html']                    Path to compiled file.
 * @param {String}    [options.source='?.html']                           Path to a target with HTML content
 * @param {String}    [options.staticDir='_']                             Path to a freezing directory
 * @param {String}    [options.algorithm='md5']                           Algorithm for calculate a hash-sum
 * @param {String}    [options.tag='img']                                 HTML Tag
 * @param {String}    [options.attr='src']                                Attribute in HTML tag
 * @param {Number}    [options.parallelLimit=50]                          Parallel limit for resources saving
 *
 * @example
 * // Code in a file system before build:
 * // bundle/
 * // └── bundle.html
 * //
 * // After build:
 * // bundle/
 * // ├── bundle.html
 * // └── bundle.freeze.html
 *
 * var HtmlFreezeTech = require('enb-html-freeze'),
 *     FileProvideTech = require('enb/techs/file-provider');
 *
 * module.exports = function(config) {
 *     config.node('bundle', function(node) {
 *         node.addTechs([
 *             [FileProvideTech, { target: '?.html' }],
 *             [HtmlFreezeTech]
 *         ]);
 *
 *         node.addTarget('?.freeze.html');
 *     });
 * };
 */

module.exports = require('enb/lib/build-flow').create()
    .name('html-freeze')
    .target('target', '?.freeze.html')
    .defineOption('source', '?.html')
    .defineOption('parallelLimit', 50)
    .defineOption('staticDir', '_')
    .defineOption('algorithm', 'md5')
    .defineOption('attr', 'src')
    .defineOption('tag', 'img')
    .useSourceText('source', '?.html')
    .builder(function(html) {
        return require('../lib/freeze').freeze({
            nodePath: this.node.getPath(),
            html: html,
            tag: this._tag,
            attr: this._attr,
            algorithm: this._algorithm,
            parallelLimit: this._parallelLimit,
            staticDir: this._staticDir,
        });
    })
    .createTech();
