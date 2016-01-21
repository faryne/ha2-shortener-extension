var domains     = ["0w0.cc", "maid.tw", "goo.gl", "is.gd", "faryne.at"];
var shortUrl    = "";
var rows        = new db().read_keys();

function shortener_onclick (info, tab) {
  var url = info.pageUrl;
  var domain  = info.menuItemId;
  
  doRequest(domain, url);
}

function copy_to_clipboard (url)
{
  // 複製到剪貼簿
  bg = chrome.extension.getBackgroundPage();
  clipboardholder= bg.document.getElementById("clipboardholder");
  clipboardholder.style.display = "block";
  clipboardholder.value = url;
  clipboardholder.select();
  bg.document.execCommand("Copy");
  clipboardholder.style.display = "none";
}
function cb_notification ($id)
{
}

function webshot_onclick (info, tab)
{
  chrome.notifications.create('StartWebShot', {"title":"截圖中", "type":"basic", "message":"請稍候並且不要重新整理頁面", "iconUrl":"small1.png"}, cb_notification);
  $.ajax({
    'type':     'post',
    'url':      'http://lab.ha2.tw/webshot/api/capture.json',
    'dataType': 'json',
    'data':     {url: info.pageUrl},
    success:    function(obj) {
      chrome.notifications.clear('StartWebShot', cb_notification);
      
      if (typeof obj.error !== 'undefined')
      {
        chrome.notifications.create('FailWebShot', {"title":"截圖失敗", "type":"basic", "message":obj.error, "iconUrl":"small1.png"}, cb_notification);
        setTimeout(function(){
          chrome.notifications.clear('FailWebShot', cb_notification);
        }, 2000);
        return;
      }
      chrome.notifications.create('EndWebShot', {"title": "截圖完成", "type":"basic", "message":"截圖網址："+obj.img_url+"; 並且複製到剪貼簿了！", "iconUrl":"small1.png"}, cb_notification);     
      copy_to_clipboard(obj.img_url);
      
      
      setTimeout(function(){
        chrome.notifications.clear('EndWebShot', cb_notification);
      }, 2000);
    },
    error:      function(req, e, t) {
      var message = e + (t == "" ? "" : ("("+t+")"));
      
      chrome.notifications.create('ErrorWebShot', {"title":"發生錯誤了", "type":"basic", "message":message, "iconUrl":"small1.png"}, cb_notification);
    }
  });
}

function doRequest (domain, url) {
  if (domains.indexOf(domain) >= 0)
  {
    request_url     =   'http://ha2.tw/shortener?format=api';
    request_params  =   {domain:domain, url:url};
  } else 
  {
    request_url     =   'https://api-ssl.bitly.com/v3/shorten';
    request_params  =   {}
  }
  $.ajax({
    'type':     'post',
    'url':      'http://ha2.tw/shortener?format=api',
    'dataType': 'json',
    'data':     {domain:domain, url:url},
    success:    function(e) {
      shortUrl = e.result.shortUrl;
      chrome.notifications.create('StartShortUrl', {"title":"縮好了！", "type":"basic", "message":"短網址："+shortUrl+"; 並且複製到剪貼簿了！", "iconUrl":"small1.png"}, cb_notification);
      chrome.notifications.onClicked.addListener(function(id){
        if (id == "StartShortUrl")
        {
          window.open(shortUrl);
          chrome.notifications.clear('StartShortUrl', cb_notification);
        }
        return;
      });
      
      copy_to_clipboard(shortUrl);
      
    },
    error:      function(req, e, t) {
      var message = e + (t == "" ? "" : ("("+t+")"));
      
      chrome.notifications.create('ErrorShortUrl', {"title":"發生錯誤了", "type":"basic", "message":message, "iconUrl":"small1.png"}, cb_notification);

    }
  });
}

function trackShortUrl (info, tab) {
  var url = info.selectionText !== undefined ? info.selectionText : info.linkUrl;
  if (url.search("http://") === false && url.search("http://") === false) {
    var url = "http://"+url;
  }
  
  $.ajax({
    type: 'get',
    
    url:  'http://ha2.tw/rest/webheader/parse.json?url='+encodeURIComponent(url),
    success: function(response) {
      var redirect_url = false;
      for (var i in response.header) {
        if (response.header[i]['type'] === 'Location') {
          redirect_url = response.header[i].value;
          break;
        }
      }
      if (redirect_url !== false) {
        var notification = webkitNotifications.createNotification(
          'small1.png',
          '查到了短網址導向的目標了',
          redirect_url
        );
      } else {
        var notification = webkitNotifications.createNotification(
          'small1.png',
          '查到你妹啊了',
          "你所選取的文字不是個短網址吧 (｡･ω･)ﾉﾞ ｺﾝﾁｬ"
        );
      }
      notification.onclick = function(e) {
        e.currentTarget.cancel();
      };
      notification.show();
    }
  });
  
}

var parent  = chrome.contextMenus.create({
  "title": "縮網址啦～",
  "contexts": ["all"]
});


for (var i in domains) {
  chrome.contextMenus.create({
    "parentId": parent,
    "id": domains[i],
    "title": "使用 "+domains[i],
    "contexts": ["all"],
    "onclick":  shortener_onclick
  });
}
// 自訂網域部分
chrome.contextMenus.create({
  "parentId":     parent,
  "type":         "separator"
});
  
if (rows.length > 0)
{
  for (var i in rows)
  {
    chrome.contextMenus.create({
      "parentId":   parent,
      "id":         rows[i].api_key,
      "title":      "[自定網域] " + rows[i].id,
      "contexts":   ["all"],
      "onclick":    shortener_onclick
    });
  }
}

chrome.contextMenus.create({
  "type":     "separator" 
});

chrome.contextMenus.create({
  "title":    "網站截圖",
  "contexts": ["all"],
  "id":       "webshot",
  "onclick":   webshot_onclick
});