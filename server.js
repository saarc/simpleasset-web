// 1. 외부모듈 포함
const express = require('express');
const app = express();
var bodyParser = require('body-parser');
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');

// 2. 하이퍼레저 connection.json 읽어오기-> 객체화 시키기
const ccpPath = path.resolve(__dirname, "connection.json");
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

// 3. 서버 설정
const PORT = 3000;
const HOST = '0.0.0.0';
app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 4. page routing
// index.html
app.get('/', (req, res)=>{
    res.sendFile(__dirname+'index.html');
})
// create.html
// query.html

// 5. REST API routing
// /asset POST key value -> simpleasset -> submitTransaction('set',key,value)
//      client result {"result":"tx has been submitted"}
// /asset GET key -> simpleasset -> evaluateTransaction('get', key) -> result(JSON)
//      client result {'key':'xxxxx','value':'xxxxx'}

// 6. 서버시작``
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`)
