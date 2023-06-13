/* Copyright © 2022 Seneca Project Contributors, MIT License. */


const messages = {

  get_info: {
    desc: 'Get information about the Trello SDK.',
  },

  save_board: {
    desc: 'Save/Update Trello data into an entity',
  },
  load_board: {
    desc: 'Load Trello data into an entity',
  },
  list_board: {
    desc: 'List Trello data into an entity',
  },

}

const sections = {}

export default {
  messages,
  sections
}

if ('undefined' !== typeof (module)) {
  module.exports = {
    messages,
    sections
  }
}
