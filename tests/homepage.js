module.exports = {
  'Demo test Google' : function (client) {
    client
      .url('http://www.google.com')
      .assert.title('Google')
      .assert.visible('input[type=text]')
      .setValue('input[type=text]', 'rembrandt van rijn')
      .click('button[name=btnG]')
      .pause(1000)
      .end()
  }
}
