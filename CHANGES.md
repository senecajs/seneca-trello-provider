# Changes

## 0.4.0 2026-11-21

First entry of this change log. Earlier versions are on npm and in the git
history. 0.3.0 and 0.3.1 were never published.

* Seneca 4: the peer dependency is `seneca` `^4.0.0` (was `>=3`). Seneca 3
  users stay on `@seneca/trello-provider@0.2`.
* The entity peer is `@seneca/entity` `^29.0.0` instead of `seneca-entity`.
  The other peers are `@seneca/provider` `^5.0.0` and `@seneca/env` `^0.6.0`,
  which is now optional: the plugin itself does not use it.
* The `seneca-promisify` peer dependency is removed. Seneca 4 has promises
  built in; do not call `use('promisify')` (D4).
* Node.js 24 or later (`engines.node` `>=24`, was `>=14`).
* Since 0.2.0 (unreleased until now): the provider keys come from the
  `sys:provider,get:keymap` message of `@seneca/provider`.
* Tests load plugins by full name (`@seneca/entity`, `@seneca/env`,
  `@seneca/provider`). Without credentials the board test runs against a
  local mock of the Trello API, with dummy `TRELLO_APIKEY` and
  `TRELLO_USERTOKEN` values; with `test/local-config.js`, or the
  environment variables `TRELLO_APIKEY`, `TRELLO_USERTOKEN` and
  `TRELLO_BOARD0_ID`, it calls the Trello API. Live calls were not tested
  on Seneca 4.
* The `maintain` test uses `@seneca/maintain` `^0.1.0` (was `0.0.28`) and
  skips `check_default` in a pull request or tag build and `url_pkgjson` on
  Windows.
* devDependencies: `seneca` `^4.0.0`, `@seneca/entity` `^29.0.0`,
  `@seneca/env` `^0.6.0`, `@seneca/provider` `^5.0.0`, `seneca-msg-test`
  `^5.0.0`, `@seneca/doc` `^9.0.0` and `@types/node` `^24`.
* README: Seneca 4 install line, plugins loaded by full name.
* `repository.url` uses `git+https`, `publishConfig` sets public access, and
  the package includes `CHANGES.md`.
