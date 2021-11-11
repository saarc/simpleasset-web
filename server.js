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
    res.sendFile(__dirname+'/views/index.html');
})
// create.html
app.get('/create', (req, res)=>{
    res.sendFile(__dirname+'/views/create.html');
})
// query.html
app.get('/query', (req, res)=>{
    res.sendFile(__dirname+'/views/query.html');
})

// 5. REST API routing
// /asset POST key value -> simpleasset -> submitTransaction('set',key,value)
//      client result {"result":"tx has been submitted"}
app.post('/asset', async(req, res)=>{
    // 요청문서에서 params꺼내기 key, value
    const key = req.body.key;
    const value = req.body.value;

    // 지갑불러오기 user1
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`wallet path: ${walletPath}`);

    const userExists = await wallet.exists('user1');
    if(!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    // 게이트웨이 연결하기
    const gateway = new Gateway();
    await gateway.connect(ccp, {wallet, identity: 'user1', discovery: {enabled: false}});
    // 채널연결하기
    const network = await gateway.getNetwork('mychannel');
    // 체인코드연결하기
    const contract = network.getContract('simpleasset');
    // tx제출하기 "set", key, value
    await contract.submitTransaction('set', key, value);
    await gateway.disconnect();

    // client에게 결과를 반환 - 문자열
    res.status(200).send('Transaction has been submitted');
})

// /asset GET key -> simpleasset -> evaluateTransaction('get', key) -> result(JSON)
//      client result {'key':'xxxxx','value':'xxxxx'}
app.get('/asset', async(req, res)=>{
    // 요청문서에서 params꺼내기 key, value
    const key = req.query.key;

    // 지갑불러오기 user1
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`wallet path: ${walletPath}`);

    const userExists = await wallet.exists('user1');
    if(!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    // 게이트웨이 연결하기
    const gateway = new Gateway();
    await gateway.connect(ccp, {wallet, identity: 'user1', discovery: {enabled: false}});
    // 채널연결하기
    const network = await gateway.getNetwork('mychannel');
    // 체인코드연결하기
    const contract = network.getContract('simpleasset');
    // tx제출하기 "get", key
    const result = await contract.evaluateTransaction('get', key);
    await gateway.disconnect();

    var obj = JSON.parse(result)
    // client에게 결과를 반환 - json -> html ( rendering - ejs, vue, anguler, react )
    res.status(200).json(obj);
})

// 6. 서버시작
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`)
