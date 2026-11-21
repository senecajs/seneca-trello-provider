/* Copyright © 2022 Seneca Project Contributors, MIT License. */

import * as Fs from 'fs'
import * as Http from 'http'



const Seneca = require('seneca')
const { Maintain } = require('@seneca/maintain')
const SenecaMsgTest = require('seneca-msg-test')

import TrelloProvider from '../src/trello-provider'
import TrelloProviderDoc from '../src/TrelloProvider-doc'

const BasicMessages = require('./basic.messages.js')


// Live tests call the Trello API. They need a Trello key, user token and
// board: test/local-config.js (see local-config-template.js) with the keys
// in test/local-env.js, or the environment variables TRELLO_APIKEY,
// TRELLO_USERTOKEN and TRELLO_BOARD0_ID (the id of a board whose name
// contains 'Welcome Board'). Without them the same tests run against a
// local mock of the Trello API, and the env plugin gets dummy values.
let Config: any = undefined
if (Fs.existsSync(__dirname + '/local-config.js')) {
  Config = require('./local-config')
}
else if (process.env.TRELLO_APIKEY && process.env.TRELLO_USERTOKEN &&
  process.env.TRELLO_BOARD0_ID) {
  Config = { board0: { id: process.env.TRELLO_BOARD0_ID } }
}

const LIVE = null != Config

const MOCK_BOARD0_ID = '5f0c0ffee0000000000000b0'

if (!LIVE) {
  process.env.TRELLO_APIKEY ??= 'test-apikey'
  process.env.TRELLO_USERTOKEN ??= 'test-usertoken'
  Config = { board0: { id: MOCK_BOARD0_ID } }
}


let mock: MockTrelloApi | null = null

beforeAll(async () => {
  if (!LIVE) {
    mock = await makeMockTrelloApi()
  }
})

afterAll(async () => {
  if (mock) {
    await mock.close()
  }
})


describe('trello-provider', () => {

  test('happy', async () => {
    expect(TrelloProvider).toBeDefined()
    expect(TrelloProviderDoc).toBeDefined()

    const seneca = await makeSeneca()
    let sdk = seneca.export('TrelloProvider/sdk')()
    expect(sdk).toBeDefined()

    expect(await seneca.post('sys:provider,provider:trello,get:info'))
      .toMatchObject({
        ok: true,
        name: 'trello',
      })

    await seneca.close()
  })


  test('maintain', async () => {
    const exclude = []

    // check_default proves the default branch is main by looking for
    // [branch "main"] in .git/config. Only a branch checkout records that
    // section: a pull_request build checks out the merge ref, and the
    // publish build checks out a tag as a detached HEAD. Neither says
    // anything about what the default branch is, so skip rather than fail.
    if ('pull_request' === process.env.GITHUB_EVENT_NAME ||
      'tag' === process.env.GITHUB_REF_TYPE) {
      exclude.push('check_default')
    }

    // url_pkgjson locates package.json by comparing process.cwd() + '/package.json'
    // against a path found with Filehound. On Windows those are the same file
    // spelt with different separators, so the url is never read.
    if ('win32' === process.platform) {
      exclude.push('url_pkgjson')
    }

    await Maintain({ exclude })
  })


  test('messages', async () => {
    const seneca = await makeSeneca()
    await (SenecaMsgTest(seneca, BasicMessages)())
    await seneca.close()
  })


  test('board-basic', async () => {
    const seneca = await makeSeneca()

    const list = await seneca.entity("provider/trello/board").list$()
    expect(list.length > 0).toBeTruthy()

    const board0 = await seneca.entity("provider/trello/board")
      .load$(Config.board0.id)
    expect(board0.name).toContain('Welcome Board')

    board0.desc = 'DESC:' + Math.random()
    let board0r = await board0.save$()
    expect(board0r.id).toEqual(board0.id)
    expect(board0r.desc).toEqual(board0.desc)

    const board0u = await seneca.entity("provider/trello/board")
      .load$(Config.board0.id)
    expect(board0u.name).toContain('Welcome Board')
    expect(board0u.desc).toEqual(board0r.desc)

    if (mock) {
      // Trello answers a malformed board id with 400 'invalid id', which
      // the plugin turns into a null load.
      expect(await seneca.entity("provider/trello/board")
        .load$('not-a-board-id')).toBeNull()

      expect(mock.calls.map((c) => c.method + ' ' + c.path)).toEqual([
        'GET /1/members/me/boards',
        'GET /1/boards/' + MOCK_BOARD0_ID,
        'PUT /1/boards/' + MOCK_BOARD0_ID,
        'GET /1/boards/' + MOCK_BOARD0_ID,
        'GET /1/boards/not-a-board-id',
      ])
      expect(mock.calls[2].query.desc).toEqual(board0.desc)
    }

    await seneca.close()
  })
})


async function makeSeneca() {
  const seneca = Seneca({ legacy: false })
    .test()
    .use('@seneca/entity')
    .use('@seneca/env', {
      // debug: true,
      file: [__dirname + '/local-env.js;?'],
      var: {
        $TRELLO_APIKEY: String,
        $TRELLO_USERTOKEN: String,
      }
    })
    .use('@seneca/provider', {
      provider: {
        trello: {
          keys: {
            apikey: { value: '$TRELLO_APIKEY' },
            usertoken: { value: '$TRELLO_USERTOKEN' },
          }
        }
      }
    })
    .use(TrelloProvider)

  await seneca.ready()

  // The plugin has no option for the API host, so point the SDK client at
  // the mock: the trello package builds every request URL from its uri
  // property.
  if (mock) {
    seneca.export('TrelloProvider/sdk')().uri = mock.url
  }

  return seneca
}


type MockCall = {
  method?: string
  path: string
  query: Record<string, string>
}

type MockTrelloApi = {
  url: string
  calls: MockCall[]
  close: () => Promise<void>
}


// A local stand-in for the Trello REST API (v1) calls that the tests make:
// GET /1/members/{id}/boards, GET /1/boards/{id} and PUT /1/boards/{id}.
// It needs the key and token query parameters, as Trello does. The board
// objects have the shape of the Trello API reference, with a few fields.
async function makeMockTrelloApi(): Promise<MockTrelloApi> {
  const calls: MockCall[] = []

  const boards: Record<string, any> = {
    [MOCK_BOARD0_ID]: {
      id: MOCK_BOARD0_ID,
      name: 'Welcome Board',
      desc: '',
      closed: false,
      idOrganization: null,
      url: 'https://trello.com/b/mock0000/welcome-board',
    }
  }

  const server = Http.createServer((req, res) => {
    req.resume()
    req.on('end', () => {
      const url = new URL(req.url || '/', 'http://127.0.0.1')
      const query = Object.fromEntries(url.searchParams.entries())
      const path = url.pathname

      // The key and token never reach the record of calls.
      const { key, token, ...fields } = query
      calls.push({ method: req.method, path, query: fields })

      const send = (status: number, out: any) => {
        const json = 'string' !== typeof out
        res.writeHead(status, {
          'Content-Type': json ? 'application/json' : 'text/plain'
        })
        res.end(json ? JSON.stringify(out) : out)
      }

      if (!key || !token) {
        return send(401, 'invalid key')
      }

      if ('GET' === req.method && /^\/1\/members\/[^/]+\/boards$/.test(path)) {
        return send(200, Object.values(boards))
      }

      const boardPath = path.match(/^\/1\/boards\/([^/]+)$/)
      if (boardPath) {
        const id = boardPath[1]
        if (!/^[0-9a-f]{24}$/.test(id)) {
          return send(400, 'invalid id')
        }

        const board = boards[id]
        if (null == board) {
          return send(404, 'The requested resource was not found.')
        }

        if ('GET' === req.method) {
          return send(200, board)
        }

        if ('PUT' === req.method) {
          for (const f of ['name', 'desc']) {
            if (null != fields[f]) {
              board[f] = fields[f]
            }
          }
          return send(200, board)
        }
      }

      send(404, 'Cannot ' + req.method + ' ' + path)
    })
  })

  await new Promise<void>((resolve) =>
    server.listen(0, '127.0.0.1', () => resolve()))

  const port = (server.address() as { port: number }).port

  return {
    url: `http://127.0.0.1:${port}`,
    calls,
    close: () => new Promise<void>((resolve) => {
      server.closeAllConnections()
      server.close(() => resolve())
    })
  }
}
