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
let logger = winston.createLogger({
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'log/error.log', level:'error'})
    ]
});

let data = {
    ict:[],
    cse:[]
};
let oldData = require('./data/old_data.json');
let today = moment().format('YYYY.MM.DD');

function requestIct(){
    return new Promise((resolve,reject)=>{
        request(ict_url, function (error, response, body) {
            if (error) {
                logger.log('error', error);
                reject(error);
            }
            resolve(body);
        });
    });
}
function requestSw(){
    return new Promise((resolve,reject)=>{
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
    return new Promise((resolve, reject)=>{
        let $ = cheerio.load(body, {
            normalizeWhitespace: true
        });
        let postElements = $('table tbody tr');
        postElements.each(function(){
            let children = $(this).children();
            let row ={
                'url' : sw_origin_url+$(children[1]).find('a').attr('href'),
                'title' : $(children[1]).text().replace(/[\n\t\r]/g, ''),
                'last_update' : $(children[4]).text().replace(/[-]/g,'.')
            };
            postarray.push(row);
        });
        resolve(postarray);
    });
}
function parseIct(body){
    let postarray=[];
    return new Promise((resolve, reject)=>{
        let $ = cheerio.load(body, {
            normalizeWhitespace: true
        });
        let postElements = $('table.board_list_type01 tbody tr');
        postElements.each(function(){
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
function requestCse(){
    return new Promise((resolve, reject)=>{
        request(cse_url, (error, response, body)=>{
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
    return new Promise((resolve, reject)=>{
        let $ = cheerio.load(body, {
            normalizeWhitespace: true
        });
        let postElements = $('table.nlist tbody tr');
        postElements.each(function(){
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
function filterDate(container){
    return container.filter(function(item){return item['last_update']==today;})
}

function filterOld(container, oldContainer){
    return container.filter(function(item){return !oldContainer.some(function(obj){return obj.title==item.title;})});
}

function _update() {
    let ict = new Promise((resolve, reject)=>{
        requestIct(data['ict'])
            .then(parseIct)
            .then((container)=> {
                data['ict'] = container;
                resolve();
            }).catch((error)=>{logger.log('error', error);});
    });
    let cse = new Promise((resolve, reject)=>{
        requestCse()
            .then(parseCse)
            .then((container)=> {
                data['cse'] = container;
                resolve();
            }).catch((error)=>{logger.log('error', error);});
    });
    let sw = new Promise((resolve, reject)=>{
        requestSw()
            .then(parseSw)
            .then((container)=> {
                data['sw'] = container;
                resolve();
            }).catch((error)=>{logger.log('error', error);});
    });
    Promise.all([ict, cse, sw]).then(() => {
        data['ict'] = filterDate(data['ict']);
        data['cse'] = filterDate(data['cse']);
        data['sw'] = filterDate(data['sw']);
        data['ict'] = filterOld(data['ict'], oldData['ict']);
        data['cse'] = filterOld(data['cse'], oldData['cse']);
        data['sw'] = filterOld(data['sw'], oldData['sw']);
        oldData['ict'] = oldData['ict'].concat(data['ict']);
        oldData['cse'] = oldData['cse'].concat(data['cse']);
        oldData['sw'] = oldData['cse'].concat(data['sw']);
        fs.writeFileSync('data/data.json', JSON.stringify(data),'utf8');
        fs.writeFileSync('data/old_data.json', JSON.stringify(oldData), 'utf8');
    }).catch((error)=>{console.log(error)});
}

let schedule = require('node-schedule');
let scrappingRule = new schedule.RecurrenceRule();
scrappingRule.minute = new schedule.Range(0, 59, 5);
schedule.scheduleJob(scrappingRule, () =>{
    _update();
});
