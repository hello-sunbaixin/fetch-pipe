const fetchPipe = require('../build/fetch-pipe.js');
var expect = require('chai').expect;
describe('fetchPipe测试', function() {
    it('fetchPipe异步请求实例结果是', function() {
    	
    	expect(fetchPipe({
                url: '接口地址',
                dataType:'jsonp'

            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
              console.log(data);
            })).to.be.ok;
        
    });
});
