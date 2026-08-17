![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js](http://senecajs.org) plugin

# @seneca/trello-provider

[![npm version](https://img.shields.io/npm/v/@seneca/trello-provider.svg)](https://npmjs.com/package/@seneca/trello-provider)
[![build](https://github.com/senecajs/seneca-trello-provider/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-trello-provider/actions/workflows/build.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/senecajs/seneca-trello-provider/badge.svg)](https://snyk.io/test/github/senecajs/seneca-trello-provider)
[![Coverage Status](https://coveralls.io/repos/github/senecajs/seneca-trello-provider/badge.svg?branch=main)](https://coveralls.io/github/senecajs/seneca-trello-provider?branch=main)
[![DeepScan grade](https://deepscan.io/api/teams/5016/projects/19462/branches/505954/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=5016&pid=19462&bid=505954)
[![Maintainability](https://api.codeclimate.com/v1/badges/f76e83896b731bb5d609/maintainability)](https://codeclimate.com/github/senecajs/seneca-trello-provider/maintainability)

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

## Install

```sh
$ npm install @seneca/trello-provider @seneca/env
```



<!--START:options-->

## Quick Example

```js

// Setup - get the key value (<SECRET>) separately from a vault or
// environment variable.
Seneca()
  // Get API keys using the seneca-env plugin
  .use('env', {
    var: {
      $TRELLO_APIKEY: String,
      $TRELLO_USERTOKEN: String,
    }
  })
  .use('provider', {
    provider: {
      trello: {
        keys: {
          apikey: { value: '$TRELLO_APIKEY' },
          usertoken: { value: '$TRELLO_USERTOKEN' },
        }
      }
    }
  })
  .use('trello-provider')

let board = await seneca.entity('provider/trello/board')
  .load$('<trello-board-id>')

Console.log('BOARD', board)

board.desc = 'New description'
board = await board.save$()

Console.log('UPDATED BOARD', board)

```

## More Examples

See [test/](test/) for more usage examples.

## Motivation

A [Seneca.js](http://senecajs.org) plugin.

## Support

If you're using this module and need help, you can:

- Post a [github issue](https://github.com/senecajs/seneca-trello-provider/issues)
- Tweet to [@senecajs](http://twitter.com/senecajs)
- Ask on the [Gitter](https://gitter.im/senecajs/seneca)

## API

### Options

*None.*


<!--END:options-->

<!--START:action-list-->

### Action Patterns

* ["role":"entity","base":"trello","cmd":"list","name":"board","zone":"provider"](#-roleentitybasetrellocmdlistnameboardzoneprovider-)
* ["role":"entity","base":"trello","cmd":"load","name":"board","zone":"provider"](#-roleentitybasetrellocmdloadnameboardzoneprovider-)
* ["role":"entity","base":"trello","cmd":"save","name":"board","zone":"provider"](#-roleentitybasetrellocmdsavenameboardzoneprovider-)
* ["sys":"provider","get":"info","provider":"trello"](#-sysprovidergetinfoprovidertrello-)


<!--END:action-list-->

<!--START:action-desc-->

### Action Descriptions

### &laquo; `"role":"entity","base":"trello","cmd":"list","name":"board","zone":"provider"` &raquo;

No description provided.



----------
### &laquo; `"role":"entity","base":"trello","cmd":"load","name":"board","zone":"provider"` &raquo;

No description provided.



----------
### &laquo; `"role":"entity","base":"trello","cmd":"save","name":"board","zone":"provider"` &raquo;

No description provided.



----------
### &laquo; `"sys":"provider","get":"info","provider":"trello"` &raquo;

Get information about the Trello SDK.



----------


<!--END:action-desc-->

## Contributing

The [Senecajs org](https://github.com/senecajs/) encourages open participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

The [SenecaJS org](http://senecajs.org/) encourages participation. If you feel you can help in any way, be
it with bug reporting, documentation, examples, extra testing, or new features, feel free
to [create an issue](https://github.com/senecajs/seneca-maintain/issues/new), or better yet - [submit a Pull Request](https://github.com/senecajs/seneca-maintain/pulls). For more
information on contribution, please see our [Contributing Guide](http://senecajs.org/contribute).

## Background

Check out the SenecaJS roadmap [here](https://senecajs.org/roadmap/)!
