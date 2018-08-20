/**
 * Created by md98 on 17. 7. 26.
 */

// urls
let ict_url = 'http://ict.cau.ac.kr/20150610/sub05/sub05_01_list.php';
let cse_url = 'http://cse.cau.ac.kr/20141201/sub05/sub0501.php';
let sw_url="http://sw.cau.ac.kr/board_list.php?part=board01";
let sw_origin_url="http://sw.cau.ac.kr/";

let request = require('request');
let cheerio = require('cheerio');
let moment = require('moment');
let fs = require('fs');
let winston = require('winston');

let data = {
    ict:[],
    cse:[],
    sw:[]
};
let old_data = require('./data/old_data.json');
let today = moment().format('YYYY.MM.DD');
let logger = require('./logger.js').logger('log/'+today+'.log');
let recent_days=[];
// Read ICT Page

function requestIct(){
    return new Promise(function(resolve,reject) {
        request(ict_url, function (error, response, body) {
            if (error) {
                logger.log('error', error);
                reject(error);
            }
            resolve(body);
        });
    });
}
function parseIct(body){
    let postarray=[];
    return new Promise(function(resolve, reject){
        let $ = cheerio.load(body, {
            normalizeWhitespace: true
        });
        let postElements = $('table.board_list_type01 tbody tr');
        postElements.each(function () {
            let children = $(this).children();
            let row = {
                'url': ict_url+'?cmd=view&idx='+$(children[0]).find('a').attr('href').replace(/[^0-9]/g,''),
                'title': $(children[1]).text().replace(/[\n\t\r]/g, ''),
                'last_update' : $(children[2]).text()
            };
            if(row['title'].substr(row['title'].length-2, 2)=='새글'){
                row['title']=row['title'].substr(0, row['title'].length-2);
            }
            postarray.push(row);
        });
        resolve(postarray);
    });
}
function pushIct(postarray){
    return new Promise(function(resolve, reject) {
        data['ict'] = postarray;
        resolve();
    });
}
function requestCse(){
    return new Promise(function(resolve, reject){
        request(cse_url, function(error, response, body){
            if (error){
                logger.log('error', error);
                reject(error);
            }
            resolve(body);
        });
    });
}
function parseCse(body){
    let postarray=[];
    return new Promise(function(resolve, reject){
        let $ = cheerio.load(body, {
            normalizeWhitespace: true
        });
        let postElements = $('table.nlist tbody tr');
        postElements.each(function (){
            let children = $(this).children();
            let row = {
                'url' : cse_url + $(children[2]).find('a').attr('href'),
                'title': $(children[2]).text().replace(/[\n\t\r]/g,''),
                'last_update' : $(children[4]).text()
            };
            if(row['title'].substr(row['title'].length-2, 2)=='새글'){
                row['title']=row['title'].substr(0, row['title'].length-2);
            }
            postarray.push(row);
        });
        resolve(postarray);
    });
}
function pushCse(postarray){
    return new Promise(function(resolve, reject) {
        data['cse'] = postarray;
        resolve();
    });
}
function requestSw(){
    return new Promise(function(resolve, reject){
        request(sw_url, function (error, response, body){
            if(error){
                logger.log('error', error);
                reject(error);
            }
            resolve(body);
        });
    });
}
function parseSw(body){
    let postarray=[];
    return new Promise(function(resolve, reject){
        let $ = cheerio.load(body, {
            normalizeWhitespace: true
        });
        let postElements = $('table tbody tr');
        postElements.each(function (){
            let children = $(this).children();
            let row = {
                'url': sw_origin_url+$(children[1]).find('a').attr('href'),
                'title': $(children[1]).text().replace(/[\n\t\r]/g, ''),
                'last_update' : $(children[4]).text().replace(/[-]/g,'.')
            };
            postarray.push(row);
        });
        resolve(postarray);
    });
}
function pushSw(postarray){
    return new Promise(function(resolve, reject) {
        data['sw'] = postarray;
        resolve();
    });
}
function filter_date(){
    today = moment().format('YYYY.MM.DD');
    data['ict'] = data['ict'].filter(function(item){return item['last_update']==today;})
    data['cse'] = data['cse'].filter(function(item){return item['last_update']==today;})
    data['sw'] = data['sw'].filter(function(item){return item['last_update']==today;})
}

function filter_old(){
    data['ict'] = data['ict'].filter(function(item){return !old_data['ict'].some(function(obj){return obj.title==item.title;})});
    data['cse'] = data['cse'].filter(function(item){return !old_data['cse'].some(function(obj){return obj.title==item.title;})});
    data['sw'] = data['sw'].filter(function(item){return !old_data['sw'].some(function(obj){return obj.title==item.title;})});
}
function update_old(){
    old_data['ict'] = old_data['ict'].concat(data['ict']);
    old_data['cse'] = old_data['cse'].concat(data['cse']);
    old_data['sw'] = old_data['sw'].concat(data['sw']);
}


function _update() {
    let ict = new Promise(function(resolve, reject){
        requestIct()
            .then(parseIct)
            .then(pushIct)
            .then(function(){
                resolve();
            })
            .catch(function(error){
                logger.log('error', error);
            });
    });
    let cse = new Promise(function(resolve, reject){
        requestCse()
            .then(parseCse)
            .then(pushCse)
            .then(function(){
                resolve();
            })
            .catch(function(error){
                logger.log('error', error);
            });
    });
    let accord = new Promise(function(resolve, reject){
        requestSw()
            .then(parseSw)
            .then(pushSw)
            .then(function(){
                resolve();
            })
            .catch(function(error){
                logger.log('error', error);
            });
    })
    Promise.all([ict, cse, accord]).then(function(){
        filter_date();
        filter_old();
        fs.writeFileSync('data/data.json', JSON.stringify(data),'utf8');
        logger.log('info', data);
        update_old();
        fs.writeFileSync('data/old_data.json', JSON.stringify(old_data), 'utf8');
    }).catch(function(error){
        filter_date();
        filter_old();
        fs.writeFileSync('data/data.json', JSON.stringify(data),'utf8');
        logger.log('info', data);
        update_old();
        fs.writeFileSync('data/old_data.json', JSON.stringify(old_data), 'utf8');
    });
}

exports.update=_update;
let schedule = require('node-schedule');
let scrapping_rule = new schedule.RecurrenceRule();
scrapping_rule.minute = new schedule.Range(0,59,5);
schedule.scheduleJob(scrapping_rule, function() {
    logger.log('info', 'cronjob start update');
    _update();
});
let log_rule = new schedule.RecurrenceRule();
log_rule.hour = 21;
schedule.scheduleJob(log_rule, function(){
    for(let i=0;i<8;i++){
        recent_days[i]=moment().subtract(i,'days').format('YYYY.MM.DD');
    }
    logger=require('./logger.js').logger('log/'+today+'.log');
    fs.unlink('log/'+recent_days[7]+'.log', function(err){
        logger.log('info', recent_days[7]+'.log file delete');
    });
});
