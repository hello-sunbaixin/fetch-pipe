# fetch-pipe 
利用promise改造的ajax请求 可以跨域请求 也可以xml请求

## Installation

You can install with `npm`.

```
npm install fetch-pipe
```

## Promise Polyfill for IE

IE8/9/10/11 does not support [ES6 Promise](https://tc39.github.io/ecma262/#sec-promise-constructor), run this to polyfill the global environment at the beginning of your application.

```js
require('es6-promise').polyfill();
```

## Usage
```
const fetchPipe=require('fetch-pipe');
fetchPipe({
    url:'/users.jsonp', //Set type name, default is 'GET'；
    data:{key:1},
    type:'post'
  })
  .then(function(response) {
    return response.json()
  }).then(function(json) {
  //接收成功数据
    console.log('parsed json', json)
  }).catch(function(ex) {
  //捕获异常
    console.log('parsing failed', ex)
  })
  
```
note：fetchPipe内的参数以对象的形式传进去，所传的参数规则同ajax一致

### 跨域请求
跨域请求一定要设定dataType:'jsonp' ;   
Set JSONP callback name, default is 'callback';  
Set JSONP request timeout, default is 5000ms. 
```javascript
fetchPipe({
    url:'/users.jsonp', 
    dataType:'jsonp',
    data:{key:1},
    timeout:3000,
    jsonpCallback: 'custom_callback',
    jsonpCallbackFunction: '<name of your callback function>'
  })
  .then(function(response) {
    return response.json()
  }).then(function(json) {
    console.log('parsed json', json)
  }).catch(function(ex) {
    console.log('parsing failed', ex)
  })
```

### 非跨域请求
非跨域请求 是按照dataType不是jsonp来判断的 则按照XMLHttpRequest进行请求
```javascript
fetchPipe({
    url:'/xml.json',
    data:'key=1&value=3'
    
  })
  .then(function(response) {
    return response.json()
  }).then(function(json) {
    console.log('parsed json', json)
  }).catch(function(ex) {
    console.log('parsing failed', ex)
  })
```

### Caveats

You need to call `.then(function(response) { return response.json(); })` in order
to keep consistent with Fetch API.

## Browser Support

![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/src/archive/internet-explorer_7-8/internet-explorer_7-8_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png)
--- | --- | --- | --- | --- |
Latest ✔ | Latest ✔ | 8+ ✔ | Latest ✔ | 6.1+ ✔ |

# License

MIT

# Acknowledgement

Thanks to [eastlee](https://github.com/EastLee)
