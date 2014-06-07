var domains = ["633.xxx", "0w0.cc", "maid.tw", "goo.gl", "is.gd", "faryne.at"];
var shortUrl = "";

function shortener_onclick (info, tab) {
  var url = info.pageUrl;
  var domain  = info.menuItemId;
  
  doRequest(domain, url);
}

var notification1;

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
function webshot_onclick (info, tab)
{
  notification1 = webkitNotifications.createNotification(
    'small1.png',
    '截圖中',
    "請稍候並且不要重新整理頁面"
  );
  notification1.show();
  $.ajax({
    'type':     'post',
    'url':      'http://lab.ha2.tw/webshot/api/capture.json',
    'dataType': 'json',
    'data':     {url: info.pageUrl},
    success:    function(obj) {
      notification1.cancel();
      notification = webkitNotifications.createNotification(
        'small1.png',
        '截圖完成',
        "截圖網址："+obj.img_url+"; 並且複製到剪貼簿了！"
      );
      copy_to_clipboard(obj.img_url);
      
      notification.show();
      setTimeout(function(){
        notification.cancel();
      }, 2000);
    },
    error:      function(req, e, t) {
      var message = e + (t == "" ? "" : ("("+t+")"));
      notification = webkitNotifications.createNotification(
        'small1.png', 
        '發生錯誤了',
        message
      );
      notification.show();
      setTimeout(function(){
        notification.cancel();
      }, 2000);
      console.log("發生錯誤了......" + message);
    }
  });
}

var notification;
function doRequest (domain, url) {
  $.ajax({
    'type':     'post',
    'url':      'http://lab.ha2.tw/shortener?format=api',
    'dataType': 'json',
    'data':     {domain:domain, url:url},
    success:    function(e) {
      shortUrl = e.result.shortUrl;
      notification = webkitNotifications.createNotification(
        'small1.png',
        '縮好了！',
        "短網址："+shortUrl+"; 並且複製到剪貼簿了！"
      );
      
      console.log("短網址："+shortUrl+"; 並且複製到剪貼簿了！");
      notification.onclick = function (e) {
        window.open(shortUrl);
        e.currentTarget.cancel();
      };
      
      copy_to_clipboard(shortUrl);

      //
      notification.show();
      setTimeout(function(){
        notification.cancel();
      }, 2000);
      
    },
    error:      function(req, e, t) {
      var message = e + (t == "" ? "" : ("("+t+")"));
      notification = webkitNotifications.createNotification(
        'small1.png', 
        '發生錯誤了',
        message
      );
      notification.show();
      setTimeout(function(){
        notification.cancel();
      }, 2000);
      console.log("發生錯誤了......" + message);
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

chrome.contextMenus.create({
  "title":    "網站截圖",
  "contexts": ["all"],
  "id":       "webshot",
  "onclick":   webshot_onclick
});