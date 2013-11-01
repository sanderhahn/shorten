//Selenium-Webdriver self test:
//mocha -R list --recursive node_modules/selenium-webdriver/test

//WebDriverJS API:
//https://code.google.com/p/selenium/wiki/WebDriverJs

//Hosted Solution:
//https://saucelabs.com/

var assert = require('assert'),
    fs = require('fs');

var webdriver = require('selenium-webdriver'),
    test = require('selenium-webdriver/testing'),
    remote = require('selenium-webdriver/remote');

require('../server')

test.describe('Shorten', function() {
  var driver;

  test.before(function() {
    driver = new webdriver.Builder().
        withCapabilities(webdriver.Capabilities.chrome()).
        build();
  });

  var short_url

  test.it('should generate a short url', function() {
    driver.get('http://localhost:3000');
    driver.findElement(webdriver.By.id('url')).sendKeys('news.ycombinator.com');
    driver.findElement(webdriver.By.tagName('button')).click();
    driver.wait(function() {
      return driver.findElement(webdriver.By.id('short')).getAttribute('value').then(function(short) {
        short_url = short;
        assert.notEqual(short, '');
        return short;
      });
    }, 1000);
  });

  test.it('should navigate short to full', function() {
    driver.get(short_url);
    driver.executeScript("return document.location.href;").then(function(href) {
      assert.ok(href.match(/^https:\/\/news.ycombinator.com\//))
    })
  })

  test.after(function() { driver.quit(); });
});
