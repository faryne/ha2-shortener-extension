// websql.js


function db () 
{
	this.db 	=	openDatabase('ha2-shortener', '1.0', 'DB For ha2 shortener', 2097152);	// 2MB 限定
	this.table 	=	"apikeys";
	this.t_sql	=	"CREATE TABLE IF NOT EXISTS " + this.table +" (id TEXT PRIMARY KEY unique, client_id TEXT unique, client_secret TEXT unique)";
	this.result =	[];
}

db.prototype.create_key = function (id, client_id, client_secret)
{
	var self = this;
	this.db.transaction(function(tx){
		tx.executeSql(self.t_sql);
		tx.executeSql('INSERT INTO ' + self.table + ' (id, client_id, client_secret) VALUES (?, ?, ?)', [id, client_id, client_secret], this.onSuccessExecuteSql, this.onError);
	}, this.onError);
};

db.prototype.read_keys = function(callback)
{
	var rows	=	[], self = this;
	this.db.transaction(function(tx){
		tx.executeSql(self.t_sql);
		tx.executeSql("SELECT id, client_id, client_secret FROM " + self.table, [], callback);
	}, this.onError);
	return this.result;
};

db.prototype.delete_key	= function(id, client_id, client_secret)
{
	var self = this;
	this.db.transaction(function(tx){
		tx.executeSql(self.t_sql);
		tx.executeSql('DELETE FROM ' + self.table + ' (id, client_id, client_secret) WHERE id = ? AND client_id = ? AND client_secret = ?', [id, client_id, client_secret]);
	});
};

db.prototype.onTransactionFinished = function ()
{
	console.log( 'Transaction completed' );
}

db.prototype.onSuccessExecuteSql = function (tx, result)
{
	console.log('Execute Finished');
}

db.prototype.onError = function (err)
{
	console.log(err);
}