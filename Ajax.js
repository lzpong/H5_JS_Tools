/*
auth: lzpong  2016/03/05 night
mdf: 2017/08/01 am
*/
/*-----关于跨域访问------
// 指定允许其他域名访问
setHead('Access-Control-Allow-Origin','*');//不能单独设置这个,否则出错
// 响应类型
setHead('Access-Control-Allow-Methods','POST, GET, OPTIONS, HEAD');
// 响应头设置
SetHead('Access-Control-Allow-Headers','x-requested-with,content-type');
//一次设置:
setHead([{"Access-Control-Allow-Origin":"*"},{"Access-Control-Allow-Methods":"POST, GET, OPTIONS, HEAD"},{"Access-Control-Allow-Headers":"x-requested-with,content-type"}]);
//不用设置也能能访问其他域名
*/
var Ajax = function () {
    var g_async=null;
    var heads = [{"Access-Control-Allow-Origin":"*"},{"Access-Control-Allow-Methods":"POST, GET, OPTIONS, HEAD"},{"Access-Control-Allow-Headers":"x-requested-with,content-type"}];
    function getajaxHttp(){var xmlHttp;try{xmlHttp=new XMLHttpRequest()}catch(e){try{xmlHttp=new ActiveXObject("Msxml2.XMLHTTP")}catch(e){try{xmlHttp=new ActiveXObject("Microsoft.XMLHTTP")}catch(e){return false}}}return xmlHttp};
    var xmlHttp = getajaxHttp();
    function doAjax(type, url, data, fun, dataType, async) {
        if (!xmlHttp)
            return alert("您的浏览器不支持AJAX！");
        xmlHttp.onreadystatechange = function () {
            //HTTP响应已经完全接收才调用
            if (xmlHttp.readyState == 4 && typeof(fun) == "function") {
                var str1 = null, str2 = null, obj = null;
                if (xmlHttp.status == 200) {
                    obj = xmlHttp.response;
                }
                else {
                    var tt = xmlHttp.response;
                    if(tt.indexOf("<title>")>1)
                        obj = tt.substring(tt.indexOf("<title>") + 7, tt.indexOf("</title>"));
                    else obj=xmlHttp.response;
                }
                fun(obj, xmlHttp.status, xmlHttp);
            }
        };
        xmlHttp.open(type, url, g_async==null?((async == false || async == "sync") ? false : true):g_async);
        dataType=(dataType||"").trim().toLowerCase();
        //检查设置数据类型(必须要的),默认为表单数据
        if (dataType == "") {
            if (typeof (data) == "string") {
                switch (data.trim().substr(0, 1)) {
                    case "<": dataType = "xml"; break
                    case "[":
                    case "{": dataType = "json"; break
                    default: dataType = "text"; break
                }
            }
            else if (typeof (data) == "object") dataType = "json";
            else dataType = "text";
        }
        switch(dataType)
        {
            case "json": SetHead("Content-Type", "application/json;charset=UTF-8");if(typeof(data)=="object")data=JSON.stringify(data); break;//json
            case "xml": SetHead("Content-Type", "application/xml; charset=UTF-8"); break;//xml
            case "text": SetHead("Content-Type", "text/plain;charset=UTF-8"); break;//一般文本
            case "file": SetHead("Content-Type", "multipart/form-data;charset=UTF-8"); break;//上传文件
            default: SetHead("Content-Type", "application/x-www-form-urlencoded"); break;//一般表单
        }
        for (var p in heads) {
            p = heads[p];
            if (p.value != "" && p.name != "")
                xmlHttp.setRequestHeader(p.name, p.value);
        }
        xmlHttp.send(data);
    }
    function SetHead(nam, val) {
        var b = true;
        for (var p in heads) {
            p = heads[p];
            if (p.name == nam)
                p.value = val, b = false;
        }
        if (b) heads.push(({ name: nam, value: val }));
    }
    function callBack(ret, code, xhr) {
        var isJson={"application/json":true,"text/json":true,"application/javascript":true,};
        if(typeof(fun)=="function") {
            var tp=xhr.getResponseHeader("Content-Type");
            if(tp)
                tp=tp.split(';')[0];
            if (isJson[tp]){
                try { ret = JSON.parse(obj); }//obj.replace(/[\t\r\n]/g,"")
                catch (e){}
            }
            fun(ret, code, xhr);
        }
    }
    return {
        setHead: function (hName, hValue) {
            if (typeof (hName) == "object")
                for (var n in hName)
                    SetHead(n, hName[n]);
            else
                SetHead(hName, hValue);
            return this;
        },
        getHead: function(){return heads;},
        setAsync:function(async){g_async=async;},
        post: function (url, data, fun, dataType, async) {
            if(typeof(data)=="function" && typeof(fun)!="function") {
              async=dataType;dataType=fun;fun=data;data="";
            }
            doAjax("POST", url, data, fun, dataType, async);
        },
        postEx: function (url, data, fun, dataType, async) {
            if(typeof(data)=="function" && typeof(fun)!="function") {
              async=dataType;dataType=fun;fun=data;data="";
            }
            doAjax("POST", url, data, callBack, dataType, async);
        },
        get: function (url, data, fun, dataType, async) {
            if(typeof(data)=="function" && typeof(fun)!="function") {
              async=dataType;dataType=fun;fun=data;data="";
            }
            doAjax("GET", url, data, fun, dataType, async);
        },
        getEx: function (url, data, fun, dataType, async) {
            if(typeof(data)=="function" && typeof(fun)!="function") {
              async=dataType;dataType=fun;fun=data;data="";
            }
            doAjax("GET", url, data, callBack, dataType, async);
        }
    };
};
var ajax=new Ajax();
