const http = require("http")
const fetch = require('node-fetch');
// only for deb
const md5 = require('js-md5');

const pageUrl = "http://localhost:8000"

/**
 *  Demo Server to run preprocessHTML()
 */
const server = http.createServer((request, response) => {
    if(request.url !== '/'){
        fetch(pageUrl + request.url).then(response => response.text()).then((result)=>{
            response.setHeader('cache-control','public, max-age=2592000')
            response.write(result)
            response.end();
        })
        return;
    }
    fetch(pageUrl).then(response => response.text()).then(result => preprocessHTML(result)).then((result)=>{
        response.setHeader('x-version', headerVersion)
        response.write(result)
        response.end();
    })
})
server.listen((3000), () => {
    console.log("Server is Running");
})


/**
 * @type {{string:string}}
 */
const cacheMap = {};
/**
 * to show the real version as header
 * @type {{string:string}}
 */
let headerVersion

/**
 * @param htmlAsString {string}
 * @returns {Promise<*>}
 */
async function preprocessHTML(htmlAsString) {

    const matches = [];
    getStyleFiles(htmlAsString, matches);
    getScriptFiles(htmlAsString, matches);
    const hash = await createHashFromCombinedFileString(matches);
    const currentVersion = getQueryParameter('v', matches[0]);
    headerVersion = currentVersion

    if (cacheMap.hasOwnProperty(hash)) {
        return htmlAsString.split(currentVersion).join(cacheMap[hash]);
    }

    cacheMap[hash] = currentVersion;

    return htmlAsString
}

/**
 * @param htmlAsString {string}
 * @param matches {[string:string]}
 */
function getStyleFiles(htmlAsString, matches) {
    const expression = /<link rel=[\"']?stylesheet[\"']? href=[\"'](.*)[\"'].*>/ig;
    while (expression.exec(htmlAsString)) {
        matches.push(RegExp.$1);
    }
}

/**
 * @param htmlAsString {string}
 * @param matches {[string:string]}
 */
function getScriptFiles(htmlAsString, matches) {
    const expression = /<script src=[\"'](.*)[\"'].*>/ig;
    while (expression.exec(htmlAsString)) {
        matches.push(RegExp.$1);
    }
}

/**
 * @param parameter {string}
 * @param url {string}
 * @returns {string}
 */
function getQueryParameter(parameter , url) {
    const expression = new RegExp( '[?&]' + parameter + '=([^&#]*)', 'i' );
    const string = expression.exec(url);
    return string ? string[1] : '';
}

/**
 * @param matches {[string:string]}
 * @returns {Promise<*>}
 */
async function createHashFromCombinedFileString(matches) {
    const promises = matches.map(url => {
        return fetch(pageUrl + url).then(response => response.text())
    })

    let combinedAssetsAsString = '';
    await Promise.all(promises).then(responses => {
        responses.map(response => {
            combinedAssetsAsString += response.replace(/\s+/g, '')
        })
    })

    return  md5(combinedAssetsAsString);
}

