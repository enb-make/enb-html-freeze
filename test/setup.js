global.chai = require('chai');
global.expect = global.chai.expect;
global.sinon = require('sinon');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('sinon-chai'));
