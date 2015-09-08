enb-html-freeze
==============

[![NPM version](https://img.shields.io/npm/v/enb-html-freeze.svg?style=flat)](https://www.npmjs.org/package/enb-html-freeze)
[![Build Status](https://img.shields.io/travis/enb-make/enb-html-freeze/master.svg?style=flat&label=tests)](https://travis-ci.org/enb-make/enb-html-freeze)
[![Coverage Status](https://img.shields.io/coveralls/enb-make/enb-html-freeze.svg?style=flat)](https://coveralls.io/r/enb-make/enb-html-freeze?branch=master)
[![Dependency Status](https://img.shields.io/david/enb-make/enb-html-freeze.svg?style=flat)](https://david-dm.org/enb-make/enb-html-freeze)

Технологии для [фризинга](https://ru.bem.info/tools/optimizers/borschik/freeze/) статических ресурсов из **HTML**.

Установка:
---------
```sh
$ npm install --D enb-html-freeze
```

Запуск тестов
-------------
```sh
$ npm test
```

API
---

**Опции**

* *String* **target** — Результирующий таргет. По умолчанию — `?.freeze.html`.
* *String* **source** — Исходный `html` таргет. По умолчанию — `?.html`.
* *String* **staticDir** — Путь к директории для фризинга. По умолчанию — `_`.
* *String* **algorithm** — Алгоритм вычисления hash-суммы. По умолчанию — `md5`.
* *String* **tag** — HTML тэг. По умолчанию — `img`.
* *String* **attr** — Атрибут HTML тэга. По умолчанию — `src`.
* *Number* **parallelLimit** — Количество одновременно сохраняемых файлов. По умолчанию — `50`.

**Пример**

```js
var htmlFreeze = require('enb-freeze/techs/html');
//..
nodeConfig.addTechs([
    //...
    [htmlFreeze, {
        source: '?.source.html',
        target: '?.frz.html',
        staticDir: 'statics/imgs',
        parallelLimit: 100,
        algorithm: 'sha1',
        tag: 'div',
        attr: 'data-img'
    }],
    //...
]);
```

Разработка
----------
Руководство на [отдельной странице](/CONTRIBUTION.md).
