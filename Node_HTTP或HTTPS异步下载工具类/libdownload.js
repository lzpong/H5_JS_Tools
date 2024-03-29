const http=require("http");
const https=require("https");
const {URL}=require("url");
const {statSync,existsSync,mkdirSync,appendFile,writeFile,readFileSync}=require('fs');
/*
HTTP或HTTPS异步下载工具类
支持匿名代理; 或用户名加密码代理
回调函数: callback(data<ArrayBuffer>,statusCode,headers,spen)
回调函数: downcallback(bool,url)
*/
module.exports={
    downToFile:downToFile, //异步下载文件(默认尝试3次,如果 savePath 存在且不小于 1KB 则跳过): 调用: `downToFile(url,savePath,downcallback,tryCount)`
    tryDown:tryDown,  //异步下载文件(默认尝试3次): 调用: `downToFile(url,savePath,downcallback,tryCount)`
    setPostHeaders:setPostHeaders,
    setGetHeaders:setGetHeaders,
    setResponsTimeout:setResponsTimeout,//服务器响应超时
    request:request, //异步http/https请求 调用: `request(method,url,data,headers,fun)`
    post:post, //异步POST请求 调用: `post(url,data,callback)`
    get:get,   //异步POST请求 调用: `get(url,data,callback)`
    setProxy:setProxy, //全局设置代理: 调用 `setProxy("http://127.0.0.1:2356",user,pswd)`
    getJson:getJson,   //同步读取文件为 JSON  调用: `getJson(path)`
    getFile:getFile,   //同步读取文件 调用: `getFile(path)`
    unescape:unescape, //解码 `%xx` 格式
    exists:exists,     //同步判断文件是否存在 调用: `exists(path)`
    mkdir:mkdir,       //同步建立文件夹(递归创建)  调用: `mkdir("p1/p3/p4")`
    logFileChange:logFileChange,  //切换日志文件
    log:log,           //输出日志到文件 调用: `log(str)`
    sleep:sleep        //异步延迟毫秒 调用: `await sleep(2000)`
};

/*
TLS_method      允许使用TLSv1.3以下的任何TLS协议版本
TLSv1_method
TLSv1_1_method
TLSv1_2_method
TLSv1_3_method
SSLv3_method
*/
//https.globalAgent.options.secureProtocol = 'TLS_method'
https.globalAgent.options.rejectUnauthorized=false;//忽略证书验证

var defaultHeaders={"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36"};
var postHeaders=defaultHeaders;
var getHeaders=defaultHeaders;
var proxy=null,auth=null;
var responsTimeout=2*60*1000;//服务器响应超时,默认2分钟

function setPostHeaders(hd) {postHeaders=hd}
function setGetHeaders(hd) {getHeaders=hd}
function setResponsTimeout(ms){responsTimeout=ms}

function getCli(url){
    if(proxy)
        return (proxy.startsWith("https")?https:http);
    else
        return (url.startsWith("https")?https:http);
}

function setProxy(url,user,pswd){
    proxy=url;
    if(user!=null && user!=""){
        if(pswd!=null && pswd!="")
            auth="Basic "+new Buffer(user+':'+pswd).toString('base64');
        else
            auth=user;
    }
}

//http请求 callback(data<ArrayBuffer>,statusCode,headers)
function request(method,url,data,headers,fun) {
    var ops={
      method: method,
      headers: headers||{}
    };
    if(proxy){
        let u2=new URL(proxy);
        ops.hostname=u2.hostname;
        ops.port=u2.port||(proxy.startsWith("https")?443:80);
        ops.path=url;
        if(auth)
            ops.headers["Proxy-Authorization"]=auth;
    }else{
        let u1=new URL(url);
        ops.hostname=u1.hostname;
        ops.port=u1.port||(url.startsWith("https")?443:80);
        ops.path=u1.pathname+u1.search;
    }
    if(method=="POST"){
        ops.headers["Content-Length"]= data.length;
        if(ops.headers["Content-Type"]==null || ops["Content-Type"]=="")
            ops.headers["Content-Type"]= "application/x-www-form-urlencoded; charset=UTF-8";
    }
    // 请求1分钟超时
    request_timer = setTimeout(function() {
        console.error(getTime()+"=>"+method+" "+url+" Request Timeout  spen:"+(new Date().getTime()-startTime)/1000+"s");
        req.destroy(new Error("Request Timeout"));
    }, 60000);
    var startTime=new Date().getTime();
    var httpcli=getCli(url);
    var req=httpcli.request(ops,(res)=>{
      var st=res.statusCode;
      var hd=res.headers;
      var list=[];
      var size=0;
      clearTimeout(request_timer);
      // 响应超时
      response_timer = setTimeout(function() {
          console.error(getTime()+"=>"+method+" "+url+" Response Timeout  spen:"+(new Date().getTime()-startTime)/1000+"s");
          req.destroy(new Error("Response Timeout"));
      }, responsTimeout);
      res.on('data', (d) => {
          list.push(d);
          size+=d.length;
      }).on('end',()=> {
          clearTimeout(response_timer);
          fun&&fun(Buffer.concat(list,size),st,hd,new Date().getTime()-startTime);
      });
    });
    req.on('error', (e) => {
        let sp=new Date().getTime()-startTime;
        console.error(getTime()+"=>"+method+" "+url+" "+e+" spen:"+(sp/1000)+"s\n");
        fun&&fun(e,null,null,sp);
    });
    //设置个超时 60s
    req.socket&&req.socket.setTimeout(60000);
    req.connection&&req.connection.setTimeout(60000);
    if(method=="POST"&&data!=null)
        req.write(data);
    req.end();
}

//http Post请求 callback(data<ArrayBuffer>,statusCode,headers)
function post(url,data,fun){
    request("POST",url,data,postHeaders,fun);
}

//http Get请求 callback(data<ArrayBuffer>,statusCode,headers)
function get(url,fun){
    request("GET",url,null,getHeaders,fun);
}

//下载尝试
function tryDown(url,path,fun,timeoutRetry){
    if(url==null || url==''){
      console.error(getTime()+"=>`url` param is Empty");
      fun&&fun(true,url);
    }
    get(url,(data,st,hd,sp)=>{
        sp=sp/1000+'s';
        hd=hd||{"content-type":"<content-error>","content-length":0,"location":""};
        if(st!=200){
            if(st==404) data="Not Found";
            console.error(getTime()+"=>DOWN "+url+" Error.  "+st+" "+" spen:"+sp+"\n",data);
            log("=>DOWN "+url+" "+data+" "+st+"  spen:"+sp+"\n");
            if(st!=404){
                if(st==301 || st==302)
                  if(hd["location"].startsWith("http"))
                    url=hd["location"];
            }
            if(--timeoutRetry>0 && (data.code=="ETIMEDOUT"||data.code=="ECONNRESET"))
                tryDown(url,path,fun,timeoutRetry);
            else
                fun&&fun(false,url);
        }
        else{
            let len=hd['content-length']||-1;
            console.info(getTime()+"=>DOWN "+url+" OK  "+path+"  "+hd['content-type']+"  len: "+len+"  spen:"+sp);
            //console.log(data);
            //log("\n"+data+"\n");
            log("=>DOWN "+url+" OK  "+path+"   "+hd['content-type']+"  len: "+len+" spen:"+sp+"\n");
            if(len<0)
                return fun&&fun(true,url);
            let l=path.lastIndexOf('/');
            if(l<0) l=path.lastIndexOf('\\');
            if(l>1) mkdir(path.substr(0,l));

            writeFile(path,data,(err)=>{
                if(err){
                    log("=>DOWN "+url+" Error: writeFile "+path+"   "+err+"\n\n");
                    console.error(getTime()+"=>DOWN "+url+" Error: writeFile "+path,url,err);
                }
            });
            fun&&fun(true,url);
        }
    });
}
function downToFile(url,path,fun,tryCount){
    let st={size:0};
    if(url==null || url==''){
      console.error(getTime()+"=>`url` param is Empty");
      fun&&fun(true,url);
    }
    if(existsSync(path))
        st=statSync(path);
    if(st.size<1024){//大小小于1KB
        tryDown(url,path,fun,tryCount||3);//默认尝试3次
    }
    else
        fun&&fun(true,url);
}

function unescape(path){
    if(path.indexOf('%')>-1){
        const querystring = require('querystring');
        do{
            path=querystring.unescape(path)
        }while(path.indexOf('%')>-1)
    }
    return path;
}

function getJson(path, encoding){
    if(!existsSync(path))
        return null;
    if(encoding==null || encoding=='')
        encoding='utf-8';
    var data=readFileSync(path,encoding);
    return JSON.parse(data);
}

function getFile(path, encoding){
    if(!existsSync(path))
        return null;
    if(encoding==null || encoding=='')
        encoding='utf-8';
    return readFileSync(path,encoding);
}

function mkdir(dir){
  if(!existsSync(dir))
    mkdirSync(dir,{recursive:true});
}

function exists(path){
    return existsSync(path);
}

var logfile;
function logFileChange(){mkdir("log");logfile="log/log_"+(new Date()).toISOString().replace(/[\:\-\/Z]/g,'').replace(/[ T]/g,'_')+".log"}
logFileChange();
function log(data){
    if(data=="\n")
        appendFile(logfile,data);
    else{
        let t=getTime()
        appendFile(logfile,t+data,(err)=>{if(err)appendFileSync(logfile,t+data)});
    }
}
function getTime(){ return new Date().toTimeString().substr(0,9);}

/**
* 异步延迟
* @param {number} time 延迟的时间,单位毫秒
* 示例: await sleep(2000);
*/
function sleep(time = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  })
}
