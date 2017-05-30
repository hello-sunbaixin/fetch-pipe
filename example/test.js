const fetchAll = require('../build/fetch-all.js');
var expect = require('chai').expect;
describe('fetchAll测试', function() {
    it('fetchAll异步请求实例结果是', function() {
    	
    	expect(fetchAll({
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
