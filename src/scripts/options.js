// options operation
function load_credentials ()
{
	function display_credential(tx, result)
	{
		var output = [],
			header = [
				'<table class="my_credentials">',
				'<thead><tr><th></th><th>名稱</th><th>client id</th><th>client secret</th></tr></thead>',
				'<tbody>'
			].join(""),
			footer = [
				'</tbody>',
				'</table>'
			].join("");

		for (var i in result.rows)
		{
			output.push([
				'<tr>',
					'<td><input type="checkbox" value="'+result.rows.item(i).id+'" class="choose_credential"></td>',
					'<td>'+result.rows.item(i).id+'</td>',
					'<td>'+result.rows.item(i).client_id+'</td>',
					'<td>'+result.rows.item(i).client_secret+'</td>',
				'</tr>'
			].join(""));
		}
		if (output.length > 0)
		{
			$('#delete_credential').removeAttr('disabled');	
		} else 
		{
			$('#delete_credential').attr('disabled', 'disabled');
			output.push('<tr><td colspan="4" align="center">目前沒有新增任何認證資訊</td>');
		}
		$('#my_credentials').empty().append(output.join("\n"));
	}
	var d 		= new db();
	var rows 	= d.read_keys(display_credential);
}

function save_credential (e)
{
	e.preventDefault();

	var d 		= new db();
	var id = $('#identifier').val(), client_id = $('#client_id').val(), client_secret = $('#client_secret').val();
	console.log("id: "+id+"; client_id: "+client_id+";client_secret: "+client_secret);
	d.create_key(id, client_id, client_secret);
	load_credentials();
}
$(function(){

	load_credentials();

	$('#save_credential').on('click', save_credential);
});