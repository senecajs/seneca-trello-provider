"use strict";
/* Copyright © 2022-2023 Seneca Project Contributors, MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
const Pkg = require('../package.json');
const Trello = require('trello');
function TrelloProvider(_options) {
    const seneca = this;
    const entityBuilder = this.export('provider/entityBuilder');
    seneca
        .message('sys:provider,provider:trello,get:info', get_info);
    async function get_info(_msg) {
        return {
            ok: true,
            name: 'trello',
            version: Pkg.version,
            sdk: {
                name: 'trello',
                version: Pkg.dependencies['trello'],
            }
        };
    }
    entityBuilder(this, {
        provider: {
            name: 'trello'
        },
        entity: {
            board: {
                cmd: {
                    list: {
                        action: async function (entize, msg) {
                            let q = msg.q || {};
                            let member = q.member || 'me';
                            let res = await this.shared.sdk.getBoards(member);
                            let list = res.map((data) => entize(data));
                            return list;
                        }
                    },
                    load: {
                        action: async function (entize, msg) {
                            let q = msg.q || {};
                            let id = q.id;
                            try {
                                let res = await this.shared.sdk.getBoard(id);
                                return entize(res);
                            }
                            catch (e) {
                                if (e.message.includes('invalid id')) {
                                    return null;
                                }
                                else {
                                    throw e;
                                }
                            }
                        }
                    },
                    save: {
                        action: async function (entize, msg) {
                            let ent = msg.ent;
                            try {
                                let res;
                                if (ent.id) {
                                    // TODO: util to handle more fields
                                    res = await this.shared.sdk.updateBoard(ent.id, {
                                        desc: ent.desc
                                    });
                                }
                                else {
                                    // TODO: util to handle more fields
                                    let fields = {
                                        name: ent.name,
                                        desc: ent.desc,
                                    };
                                    res = await this.shared.sdk.addBoard(fields);
                                }
                                return entize(res);
                            }
                            catch (e) {
                                if (e.message.includes('invalid id')) {
                                    return null;
                                }
                                else {
                                    throw e;
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    seneca.prepare(async function () {
        // TODO: define sys:provider,get:keys to get all the keys?
        let apikey = await this.post('sys:provider,get:key,provider:trello,key:apikey');
        let usertoken = await this.post('sys:provider,get:key,provider:trello,key:usertoken');
        this.shared.sdk = new Trello(apikey.value, usertoken.value);
    });
    return {
        exports: {
            sdk: () => this.shared.sdk
        }
    };
}
// Default options.
const defaults = {
    // TODO: Enable debug logging
    debug: false
};
Object.assign(TrelloProvider, { defaults });
exports.default = TrelloProvider;
if ('undefined' !== typeof (module)) {
    module.exports = TrelloProvider;
}
//# sourceMappingURL=trello-provider.js.map