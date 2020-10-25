const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const should = chai.should();
const expect = chai.expect;
chai.use(chaiHttp);
const Promise = require("bluebird");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const {Builder, By, Key, until} = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome');
var driver;
var request = require("request");
const options = new chrome.Options();
options.addArguments(
    'headless'
);

var rgbToHex = function (rgb) {
    let hex = Number(rgb).toString(16);
    if (hex.length < 2) {
        hex = "0" + hex;
    }
    return hex;
};

describe('city search test', function() {
    this.timeout(100000);

    before(function(done){
        driver = new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
        driver.get('http://localhost:8001')
            .then(()=>{
                console.log("Got page");
                done();
            });
    });

    after(function(){
        driver.quit();
    });
    

    beforeEach(async function() {
        driver.navigate().refresh();
    });

    it('Valid input should be provided in the input box - no space no numbers allowed', async function(){
        //input nothing
        let input = await driver.findElement(By.id("input"));
        input.sendKeys("");

        let button = await driver.findElement(By.id("button"));
        await button.click();

        let alertText = await driver.switchTo().alert().getText();
        await driver.switchTo().alert().dismiss();
        expect(alertText).to.equal('Please provide the valid input');

        let rowCount = await driver.findElements(By.tagName("tr"));
        expect(rowCount.length).to.equal(0);

        //input space
        input.sendKeys(" ");

        button = await driver.findElement(By.id("button"));
        await button.click();

        let alertText1 = await driver.switchTo().alert().getText();
        await driver.switchTo().alert().dismiss();
        expect(alertText1).to.equal('Please provide the valid input');

        rowCount = await driver.findElements(By.tagName("tr"));
        expect(rowCount.length).to.equal(0);

        //input number
        input.sendKeys(2);

        button = await driver.findElement(By.id("button"));
        await button.click();

        alertText1 = await driver.switchTo().alert().getText();
        await driver.switchTo().alert().dismiss();
        expect(alertText1).to.equal('Please provide the valid input');
        
        rowCount = await driver.findElements(By.tagName("tr"));
        expect(rowCount.length).to.equal(0);

        driver.takeScreenshot().then(
            function(image, err) {
                require('fs').writeFile('invalid-input.png', image, 'base64', function(err) {});
            }
        );
    });

    it('After typing invalid input, it should be reset', async function(){
        let input = await driver.findElement(By.id("input"));
        input.sendKeys("");

        let button = await driver.findElement(By.id("button"));
        button.click();
        await driver.switchTo().alert().dismiss();

        let val = await input.getAttribute('value');
        expect(val).to.equal('');

        driver.takeScreenshot().then(
            function(image, err) {
                require('fs').writeFile('invalid-input.png', image, 'base64', function(err) {});
            }
        );

    });

    it('Should search cities and render table on valid input by making sure api is hit', async function(){
        let input = await driver.findElement(By.id("input"));
        input.sendKeys("a");

        let totalCount = await driver.findElement(By.className("totalCount"));
        let value = await totalCount.getText();
        expect(value).to.equal('');

        let button = await driver.findElement(By.id("button"));
        button.click();

        let loader = await driver.findElements(By.className("loader"));
        expect(loader.length).to.equal(1);

        const responsePromise = new Promise((resolve, reject) => {
            request.get( "https://jsonmock.hackerrank.com/api/cities/?city=a",
                (err, response, body) => {
                    resolve(body);
                }
            );
        });

        let response = await responsePromise;
        
        let data = JSON.parse(response).data;

        let finalData = {};
        data && data.forEach(pair => {
            finalData[pair.state] = finalData[pair.state] || [];
            finalData[pair.state].push(pair.city);
        });

        driver.takeScreenshot().then(
            function(image, err) {
                require('fs').writeFile('valid-input.png', image, 'base64', function(err) {});
            }
        );

        totalCount = await driver.findElement(By.className("totalCount"));
        value = await totalCount.getText();
        expect(value).to.equal(`Total cities found: ${data.length}`);
        
        let rowCount = await driver.findElements(By.tagName("tr"));
        expect(rowCount.length).to.equal(Object.keys(finalData).length);

        let colCount = await driver.findElements(By.tagName("td"));
        let expectedColoumnLength = data.length + Object.keys(finalData).length;
        expect(colCount.length).to.equal(data.length + Object.keys(finalData).length);
    });

    it('Should give correct result when no data is returned by the api', async function(){
        let input = await driver.findElement(By.id("input"));
        input.sendKeys("abcd");

        let totalCount = await driver.findElement(By.className("totalCount"));
        let value = await totalCount.getText();
        expect(value).to.equal('');

        let button = await driver.findElement(By.id("button"));
        button.click();

        let loader = await driver.findElements(By.className("loader"));
        expect(loader.length).to.equal(1);

        const responsePromise = new Promise((resolve, reject) => {
            request.get( "https://jsonmock.hackerrank.com/api/cities/?city=abcd",
                (err, response, body) => {
                    resolve(body);
                }
            );
        });

        let response = await responsePromise;
        
        let data = JSON.parse(response).data;

        let finalData = {};
        data && data.forEach(pair => {
            finalData[pair.state] = finalData[pair.state] || [];
            finalData[pair.state].push(pair.city);
        });

        driver.takeScreenshot().then(
            function(image, err) {
                require('fs').writeFile('valid-input.png', image, 'base64', function(err) {});
            }
        );

        totalCount = await driver.findElement(By.className("totalCount"));
        value = await totalCount.getText();
        expect(value).to.equal(`Total cities found: ${data.length}`);

        let rowCount = await driver.findElements(By.tagName("tr"));
        expect(rowCount.length).to.equal(Object.keys(finalData).length);

        let colCount = await driver.findElements(By.tagName("td"));
        let expectedColoumnLength = data.length + Object.keys(finalData).length;
        expect(colCount.length).to.equal(data.length + Object.keys(finalData).length);
    });

    it('Should give correct result when data is returned by the api - test 1', async function(){
        let randomString = makeid(1);
        let input = await driver.findElement(By.id("input"));
        input.sendKeys(randomString);

        let totalCount = await driver.findElement(By.className("totalCount"));
        let value = await totalCount.getText();
        expect(value).to.equal('');

        let button = await driver.findElement(By.id("button"));
        button.click();

        let loader = await driver.findElements(By.className("loader"));
        expect(loader.length).to.equal(1);

        const responsePromise = new Promise((resolve, reject) => {
            request.get(`https://jsonmock.hackerrank.com/api/cities/?city=${randomString}`,
                (err, response, body) => {
                    resolve(body);
                }
            );
        });

        let response = await responsePromise;
        
        let data = JSON.parse(response).data;

        let finalData = {};
        data && data.forEach(pair => {
            finalData[pair.state] = finalData[pair.state] || [];
            finalData[pair.state].push(pair.city);
        });

        driver.takeScreenshot().then(
            function(image, err) {
                require('fs').writeFile('valid-input.png', image, 'base64', function(err) {});
            }
        );

        totalCount = await driver.findElement(By.className("totalCount"));
        value = await totalCount.getText();
        expect(value).to.equal(`Total cities found: ${data.length}`);

        let rowCount = await driver.findElements(By.tagName("tr"));
        expect(rowCount.length).to.equal(Object.keys(finalData).length);

        let colCount = await driver.findElements(By.tagName("td"));
        let expectedColoumnLength = data.length + Object.keys(finalData).length;
        expect(colCount.length).to.equal(data.length + Object.keys(finalData).length);
    });

    it('Should give correct result when data is returned by the api - test 2', async function(){
        let randomString = makeid(1);
        let input = await driver.findElement(By.id("input"));
        input.sendKeys(randomString);
        
        let totalCount = await driver.findElement(By.className("totalCount"));
        let value = await totalCount.getText();
        expect(value).to.equal('');

        let button = await driver.findElement(By.id("button"));
        button.click();

        let loader = await driver.findElements(By.className("loader"));
        expect(loader.length).to.equal(1);

        const responsePromise = new Promise((resolve, reject) => {
            request.get(`https://jsonmock.hackerrank.com/api/cities/?city=${randomString}`,
                (err, response, body) => {
                    resolve(body);
                }
            );
        });

        let response = await responsePromise;
        
        let data = JSON.parse(response).data;

        let finalData = {};
        data && data.forEach(pair => {
            finalData[pair.state] = finalData[pair.state] || [];
            finalData[pair.state].push(pair.city);
        });

        driver.takeScreenshot().then(
            function(image, err) {
                require('fs').writeFile('valid-input.png', image, 'base64', function(err) {});
            }
        );

        totalCount = await driver.findElement(By.className("totalCount"));
        value = await totalCount.getText();
        expect(value).to.equal(`Total cities found: ${data.length}`);

        let rowCount = await driver.findElements(By.tagName("tr"));
        expect(rowCount.length).to.equal(Object.keys(finalData).length);

        let colCount = await driver.findElements(By.tagName("td"));
        let expectedColoumnLength = data.length + Object.keys(finalData).length;
        expect(colCount.length).to.equal(data.length + Object.keys(finalData).length);
    });

    it('Should give correct result when data is returned by the api - test 3', async function(){
        let randomString = makeid(2);
        let input = await driver.findElement(By.id("input"));
        input.sendKeys(randomString);
        
        let totalCount = await driver.findElement(By.className("totalCount"));
        let value = await totalCount.getText();
        expect(value).to.equal('');

        let button = await driver.findElement(By.id("button"));
        button.click();

        let loader = await driver.findElements(By.className("loader"));
        expect(loader.length).to.equal(1);

        const responsePromise = new Promise((resolve, reject) => {
            request.get(`https://jsonmock.hackerrank.com/api/cities/?city=${randomString}`,
                (err, response, body) => {
                    resolve(body);
                }
            );
        });

        let response = await responsePromise;
        
        let data = JSON.parse(response).data;

        let finalData = {};
        data && data.forEach(pair => {
            finalData[pair.state] = finalData[pair.state] || [];
            finalData[pair.state].push(pair.city);
        });

        driver.takeScreenshot().then(
            function(image, err) {
                require('fs').writeFile('valid-input.png', image, 'base64', function(err) {});
            }
        );

        totalCount = await driver.findElement(By.className("totalCount"));
        value = await totalCount.getText();
        expect(value).to.equal(`Total cities found: ${data.length}`);

        let rowCount = await driver.findElements(By.tagName("tr"));
        expect(rowCount.length).to.equal(Object.keys(finalData).length);

        let colCount = await driver.findElements(By.tagName("td"));
        let expectedColoumnLength = data.length + Object.keys(finalData).length;
        expect(colCount.length).to.equal(data.length + Object.keys(finalData).length);
    });

    it('Should give correct result when data is returned by the api - test 4', async function(){
        let randomString = makeid(2);
        let input = await driver.findElement(By.id("input"));
        input.sendKeys(randomString);
        
        let totalCount = await driver.findElement(By.className("totalCount"));
        let value = await totalCount.getText();
        expect(value).to.equal('');

        let button = await driver.findElement(By.id("button"));
        button.click();

        let loader = await driver.findElements(By.className("loader"));
        expect(loader.length).to.equal(1);

        const responsePromise = new Promise((resolve, reject) => {
            request.get(`https://jsonmock.hackerrank.com/api/cities/?city=${randomString}`,
                (err, response, body) => {
                    resolve(body);
                }
            );
        });

        let response = await responsePromise;
        
        let data = JSON.parse(response).data;

        let finalData = {};
        data && data.forEach(pair => {
            finalData[pair.state] = finalData[pair.state] || [];
            finalData[pair.state].push(pair.city);
        });

        driver.takeScreenshot().then(
            function(image, err) {
                require('fs').writeFile('valid-input.png', image, 'base64', function(err) {});
            }
        );

        totalCount = await driver.findElement(By.className("totalCount"));
        value = await totalCount.getText();
        expect(value).to.equal(`Total cities found: ${data.length}`);

        let rowCount = await driver.findElements(By.tagName("tr"));
        expect(rowCount.length).to.equal(Object.keys(finalData).length);

        let colCount = await driver.findElements(By.tagName("td"));
        let expectedColoumnLength = data.length + Object.keys(finalData).length;
        expect(colCount.length).to.equal(data.length + Object.keys(finalData).length);
    });

    function makeid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
     }
});
