const http = require("http")
const fetch = require('node-fetch');
// only for deb
const md5 = require('js-md5');

const pageUrl = "http://localhost:8000"

/**
 *  Demo Server to run preprocessHTML()
 */
const server = http.createServer((request, response) => {
    if (request.url !== '/') {
        const assetVersion = getQueryParameter('v', request.url);
        fetch(pageUrl + request.url).then(response => response.text()).then((result) => {
            response.setHeader('eTag', assetVersion);
            response.setHeader('cache-control', 'public, max-age=2592000');
            response.write(result);
            response.end();
        })
        return;
    }
    fetch(pageUrl).then(response => response.text()).then(result => preprocessHTML(result)).then((result) => {
        response.setHeader('x-version', headerVersion)
        response.setHeader('x-assetLength', loadedAssetLength)
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
 * @type {{string:string}}
 */
const versionMap = {};

/**
 * to show the real version as header
 * @type {{string:string}}
 */
let headerVersion
/**
 * to debug the loaded size of assets to hash
 * @type {number}
 */
let loadedAssetLength = 0

/**
 * @param htmlAsString {string}
 * @returns {Promise<*>}
 */
async function preprocessHTML(htmlAsString) {

    const matches = [];
    getStyleFiles(htmlAsString, matches);
    getScriptFiles(htmlAsString, matches);
    const currentVersion = getQueryParameter('v', matches[0]);

    const hash = await getHash(currentVersion, matches);
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
function getQueryParameter(parameter, url) {
    const expression = new RegExp('[?&]' + parameter + '=([^&#]*)', 'i');
    const string = expression.exec(url);
    return string ? string[1] : '';
}

/**
 * load cached hash if possible
 *
 * @param currentVersion
 * @param matches
 * @returns {Promise<*>}
 */
async function getHash(currentVersion, matches) {
    if (versionMap.hasOwnProperty(currentVersion)) {
        loadedAssetLength = 0;

        return versionMap[currentVersion];
    }
    const hash = await createHashFromCombinedFileString(matches);
    versionMap[currentVersion] = hash;

    return hash;
}

/**
 * assets could be loaded in a different order. To be save here,
 * they should be added to a map with url as key and be keySorted before joining together
 *
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
    loadedAssetLength = combinedAssetsAsString.length;
    return md5(combinedAssetsAsString);
}

