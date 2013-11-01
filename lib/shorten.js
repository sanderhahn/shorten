"use strict"

var level = require('level')

var table = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
// skip chars that have the same shape
table = table.replace(/[1lI0O]/g, '')

// Construct easy to read random short code

var random = function() {
  var r = []
  for(var i = 0; i < 6; i++) {
    r.push(table.charAt(table.length*Math.random()))
  }
  return r.join('')
}

var escape_nullchars = function(s) {
  return s.replace(/\0/g, '\\0')
}

// Level - Escape null chars from path strings

var level_path = function() {
  var args = Array.prototype.slice.call(arguments)
  return args.map(escape_nullchars).join('\0')
}

// Lookup the short code for a full url

var lookup_full = function(full, callback) {
  this.db.get(level_path('full', full), function(err, short) {
    if(err) {
      if(err.notFound) {
        callback(null)
      } else {
        throw err
      }
    } else {
      callback(short)
    }
  })
}

// Lookup the full url for a short url code

var lookup_short = function(short, callback) {
  this.db.get(level_path('short', short), function(err, full) {
    if(err) {
      if(err.notFound) {
        callback(null)
      } else {
        throw err
      }
    } else {
      callback(full)
    }
  })
}

// Store short and full url

var store = function(short, full, callback) {
  this.db.batch([
    {type: 'put', key: level_path('short', short), value: full},
    {type: 'put', key: level_path('full', full), value: short},
  ], function(err) {
    if(err) {
      throw err
    } else {
      callback(short)
    }
  })
}

// Find an unused random

var unique_random = function(callback) {
  var short = random()
  this.lookup_short(short, function(full) {
    if(full == null) {
      callback(short)
    } else {
      this.unique_random(callback)
    }
  })
}

// Shorten api method
// TODO: how to do this without recursion?

var shorten = function(full, callback) {
  var self = this
  this.lookup_full(full, function(short) {
    if(short) {
      callback(short)
    } else {
      self.unique_random(function(short) {
        self.store(short, full, function(short) {
          callback(short)
        })
      })
    }
  })
}

var Shorten = function(db) {
  this.db = level(db)
}

// private

Shorten.random = random
Shorten.level_path = level_path

Shorten.prototype.store = store
Shorten.prototype.lookup_short = lookup_short
Shorten.prototype.lookup_full = lookup_full
Shorten.prototype.unique_random = unique_random

// public

Shorten.prototype.shorten = shorten

module.exports = exports = Shorten
