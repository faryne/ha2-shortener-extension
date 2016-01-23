// options operation
function load_credentials ()
{
	function display_credential(tx, result)
	{
		var output = [],
			header = [
				'<table class="my_credentials">',
				'<thead><tr><th></th><th>名稱</th><th>client id</th><th>client secret</th><th>access token</th></tr></thead>',
				'<tbody>'
			].join(""),
			footer = [
				'</tbody>',
				'</table>'
			].join("");

		for (var i = 0; i < result.rows.length; i++)
		{

			output.push([
				'<tr>',
					'<td><input type="checkbox" value="'+result.rows.item(i).id+'" class="choose_credential"></td>',
					'<td>'+result.rows.item(i).id+'</td>',
					'<td>'+result.rows.item(i).client_id+'</td>',
					'<td>'+result.rows.item(i).client_secret+'</td>',
					'<td>'+result.rows.item(i).access_token+'</td>',
				'</tr>'
			].join(""));
		}
		if (output.length > 0)
		{
			$('#delete_credential').removeAttr('disabled');	
		} else 
		{
			$('#delete_credential').attr('disabled', 'disabled');
			output.push('<tr><td colspan="5" align="center">目前沒有新增任何認證資訊</td>');
		}
		$('#my_credentials').empty().append(header + output.join("\n") + footer);
	}
	var d 		= new db();
	d.read_keys(display_credential);
}

function save_credential (e)
{
	// e.preventDefault();

	var d 		= new db();
	var id = $('#identifier').val(), client_id = $('#client_id').val(), client_secret = $('#client_secret').val();
	var auth_url = 'https://bitly.com/oauth/authorize?client_id=' + client_id + '&redirect_uri=' + 'https://'+chrome.runtime.id+'.chromiumapp.org/auth';
	chrome.identity.launchWebAuthFlow(
		{"url": auth_url, "interactive": true},
		function(redirect_url){
			var ele = redirect_url.split('=');
			$.ajax({
				'type': 		'post',
				'url': 			"https://api-ssl.bitly.com/oauth/access_token", 
				"data": 		{"client_id":client_id, "client_secret":client_secret, "code":ele[1], "redirect_uri":'https://'+chrome.runtime.id+'.chromiumapp.org/auth'},
				"success": 		function (str)
				{
					var qs = str.split('&'), params = {};
					for (var i in qs)
					{
						var tmp = qs[i].split('=');
						params[tmp[0]] = tmp[1]
					}
					d.create_key(id, client_id, client_secret, params.access_token);
					load_credentials();
					alert("執行成功，將重新啟動擴充套件以套用設定！");
					chrome.runtime.reload()
				}
			});
		}
	);
}
function delete_key (e)
{
	e.preventDefault();

	if ($('.choose_credential:checked').length > 0)
	{
		var c = confirm("確定要刪除已設定的認證資訊？");
		if (c)
		{
			var d = new db();
			$('.choose_credential:checked').each(function(){
				d.delete_key($(this).val());
			});
			load_credentials();
			alert("執行成功，將重新啟動擴充套件以套用設定！");
			chrome.runtime.reload();
		}
	}
}
$(function(){

	load_credentials();

	$('#save_credential').on('click', save_credential);
	$('.chrome_ext_id').html(chrome.runtime.id);
	$('#delete_credential').on('click', delete_key);
});