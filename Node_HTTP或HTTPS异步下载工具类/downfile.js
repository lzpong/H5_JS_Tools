const Lib=require("./libdownload");

//获取参数
var args = process.argv.splice(2)
var dir=args[0];
var proxy=args[1];
var hrefs=args[2];
var timeoutRetry=3;

function help(){
    console.log("use like:\n`node downfile.js save-dir [proxy] [paths-json-array]`\n");
    console.log("save-dir          the file save dir  MUST\n                  or url's json-array data in the file: save-dir/data.json`\nproxy             proxy addres,like: `http://127.0.0.1:2356`\npaths-json-array  url's json-array data`");
}

function setproxy(p){
    if(p){
      proxy=p;
      Lib.setProxy(proxy);
    }else{
        proxy=null;
        if(Lib.exists(dir) && Lib.exists(dir+'/proxy')){
            proxy=Lib.getFile(dir+'/proxy');
            Lib.setProxy(proxy);
        }
    }
}

function sethrefs(p){
    if(p)
      hrefs=JSON.parse(p);
    else{
      if(Lib.exists(dir) && Lib.exists(dir+'/data.json'))
          hrefs=Lib.getJson(dir+'/data.json');
      else
          console.error('file not exists: '+dir+'/data.json');
    }
}

debugger

if(args.length<1){
    help();
    return;
}

Lib.mkdir(dir);

if(args.length==1){ //args: dir
    setproxy(null);
    sethrefs(null);
    if(hrefs==null){
        help();
        return;
    }
}
else if(args.length==2){ //args dir xxx
    if(args[1][0]=='['){ //args: dir proxy
        setproxy(null);
        sethrefs(args[1]);
    }else{ //args: dir hrefs
        setproxy(args[1]);
        sethrefs(null);
    }
}
else if(args.length==3){ //args dir xxx yyy
    if(args[1][0]=='['){
        help();
        return;
    }
    setproxy(args[1]);
    sethrefs(args[2]);
}


//console.log(args);
//console.log("hrefs:",hrefs);
if(proxy)
    console.info("Has Proxy",proxy)
console.log(args,'count: '+hrefs.length);


Lib.setGetHeaders({
"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36",
});


var i=-1,j=0,count=0;
var iEnd=hrefs.length-1;
var startTime=new Date();
makeDown(true);

function makeDown(stat){
    if(stat && i<hrefs.length-1){//是否已下载成功
       i++,j++, count++;
    }else{//遇到下载失败了
        if(i>=iEnd) {//下载完了  ,`j==1` ==>> 第一个就下载失败了
            //i++;
            var d=new Date()-startTime;//计算耗时
            return console.log("======downFile End  "+(i+1)+"/"+j+"    down Count: "+count+"    Use Time: "+d/1000+"s");
        }else{//下一个
          i++, j=1;
        }
    }
    console.log('i=',i);
debugger
    //下一个
    var a=hrefs[i].lastIndexOf('/');
    var path=dir+hrefs[i].substr(a);
    Lib.downToFile(hrefs[i], Lib.unescape(path), makeDown, timeoutRetry);
}

