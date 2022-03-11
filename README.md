# multi-server-cache
Proof of concept multiserver-cache

## Assumptions
* Asset files in a deployment are always the same, no dynamic additional stuff.
---
## How to cache multiple endpoints with variable versions-stamps
1. Check document for all given style and script assets
3. Get version from versionParameter inside link or script-tags
4. Fetch assets
5. Combine assets to a single string
6. Hash them for readability or use the string as key, for a version mapping
7. If hash is already existent, replace versions in document with the one from the mapping
8. If not save current version with hash as key in mapping
9. Browsers now should always get the document that they already saved :check:
---
## How to start
* Go to folder [php-app](./php-app)
* Run ```composer install```
* Start phpServer on port 8000 ```symfony server:start```
* Open on [localhost:8000](http://localhost:8000)
* Go to folder [node-proxy](./node-proxy)
* Run ```npm install```
* Start node server with ```npm run dev```
* Open on [localhost:3000](http://localhost:3000) 
---
## How to check
The php-server will send a random number   
between 1646807089201 and 1646807089240 as version.
Everything dividable by two will send a different background.  
The node-proxy knows nothing about this and also don's uses the version-number send in the body.  
The node proxy will send a header x-version.  
This will show the original version that was send by the php-server.
