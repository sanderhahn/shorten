var test_url = 'http://google.com/'

var Shorten = require('../lib/shorten')
var shorten = new Shorten('test.db')

exports.testRandom = function(test) {
  test.expect(1)
  var random = Shorten.random()
  test.ok(random.length == 6, "random is 6 length")
  test.done()
}

exports.testLevelPath = function(test) {
  test.expect(1)
  var path = Shorten.level_path('test1\0','t\0est2')
  test.ok(path.split('\0').length == 2, "path should properly escape null chars")
  test.done()
}

var g = 'http://google.com/'

exports.testLookupShort = function(test) {
  shorten.store('g', g, function() {
    shorten.lookup_short('g', function(full) {
      test.ok(full == g)
      shorten.lookup_full(g, function(short) {
        test.ok(short == 'g')
        test.done()
      })
    })
  })
}

exports.testLookupShort = function(test) {
  shorten.store('g', g, function() {
    shorten.lookup_short('g', function(full) {
      test.ok(full == g)
      shorten.lookup_full(g, function(short) {
        test.ok(short == 'g')
        test.done()
      })
    })
  })
}

exports.testShorten = function(test) {
  shorten.shorten(g, function(short1) {
    shorten.shorten(g, function(short2) {
      test.ok(short1 == short2)
      test.done()
    })
  })
}
