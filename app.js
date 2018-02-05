var express=require("express"),
	app=express(),
	BodyParser=require("body-parser"),
	request=require("request");

app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
app.use(BodyParser.urlencoded({extended:true}));
app.get("/",function (req,res) {
	res.render("index",{isHome:1});
});

app.get("/search",function (req,res) {
	if(req.query.selector=="Player")
	res.redirect("/player/"+req.query.player_tag);
else if(req.query.selector=="Clan (by Tag)")
	res.redirect("/clan/"+req.query.player_tag);
else if(req.query.selector=="Clan (by Name)"){
	res.redirect("/clan/search/name="+req.query.player_tag+"&minMembers="+req.query.min_mem+"&minMembers="+req.query.max_mem+"&score="+req.query.min_score);
}
});

app.get("/player/:player_id",function (req,res) {
	request( { url:'http://api.cr-api.com/player/'+req.params.player_id ,headers: {auth:process.argv[2]}},function (error,response,body) {
		var data=JSON.parse(body);
		// res.send(data);
		var card_req=[0,0,2,6,16,36,86,186,386,786,1586,2586,4586,9586];
		var gold_req_com=[0,0,5,25,75,225,625,1625,3625,7625,15625,35625,85625,185625];
		var gold_req_rare=[0,0,50,200,600,1600,3600,7600,15600,35600,85600,185600];
		var gold_req_epic=[0,0,400,2400,6400,14400,34400,84400,184400];
		var gold_req_leg=[0,0,5000,25000,75000,175000];
		var card_stat={
		 leg:{card:0,card_max:36,gold:0,count:0,count_max:14},
		 epic:{card:0,card_max:386,gold:0,count:0,count_max:23},
		 rare:{card:0,gold:0,card_max:2586,count:0,count_max:23},
		 com:{card:0,card_max:9586,gold:0,count:0,count_max:21}}
		 var t=0;
		data.cards.forEach(function(card,i) {
			if(card.rarity=="Legendary"){
				t=card_req[card.maxLevel]-card_req[card.level]-(card.requiredForUpgrade=="Maxed" ? 0 : card.count);
				if(t<0)
					t=0;
				card_stat.leg.card+=t;
				card_stat.leg.gold+=gold_req_leg[card.maxLevel]-gold_req_leg[card.level];
				card_stat.leg.count+=1;
			}else if(card.rarity=="Epic"){
				t=card_req[card.maxLevel]-card_req[card.level]-(card.requiredForUpgrade=="Maxed" ? 0 : card.count);
				if(t<0)
					t=0;
				card_stat.epic.card+=t;
				card_stat.epic.gold+=gold_req_epic[card.maxLevel]-gold_req_epic[card.level];
				card_stat.epic.count+=1;
			}else if(card.rarity=="Rare"){
				t=card_req[card.maxLevel]-card_req[card.level]-(card.requiredForUpgrade=="Maxed" ? 0 : card.count);
				if(t<0)
					t=0;
				card_stat.rare.card+=t;
				card_stat.rare.gold+=gold_req_rare[card.maxLevel]-gold_req_rare[card.level];
				card_stat.rare.count+=1;
			}else if(card.rarity=="Common"){
				t=card_req[card.maxLevel]-card_req[card.level]-(card.requiredForUpgrade=="Maxed" ? 0 : card.count);
				if(t<0)
					t=0;
				card_stat.com.card+=t;
				card_stat.com.gold+=gold_req_com[card.maxLevel]-gold_req_com[card.level];
				card_stat.com.count+=1;
			}
		});
		// console.log(card_stat);
		res.render("player",{data:data,card_stat:card_stat});
	});
});

app.get("/player/:player_id/deck",function (req,res) {
	request( { url:'http://api.cr-api.com/player/'+req.params.player_id ,headers: {auth:process.argv[2]}},function (error,response,body) {
		var data=JSON.parse(body);
		// res.send(data);
		res.render("deck",{data:data});
	});
});

app.get("/player/:player_id/cards",function (req,res) {
	request( { url:'http://api.cr-api.com/player/'+req.params.player_id ,headers: {auth:process.argv[2]}},function (error,response,body) {
		var data=JSON.parse(body);
		// res.send(data);
		res.render("cards",{data:data});
	});
});

app.get("/player/:player_id/battles",function (req,res) {
	request( { url:'http://api.cr-api.com/player/'+req.params.player_id ,headers: {auth:process.argv[2]}},function (error,response,body) {
		var data=JSON.parse(body);
		// res.send(data);
		res.render("battles",{data:data});
	});
});

app.get("/clan/:clan_id",function (req,res) {
	request( { url:'http://api.cr-api.com/clan/'+req.params.clan_id ,headers: {auth:process.argv[2]}},function (error,response,body) {
		var data=JSON.parse(body);
		// res.send(data);
		res.render("clan",{data:data});
	});
});

app.get("/clan/search/:clan_name",function (req,res) {
	request( { url:'http://api.cr-api.com/clan/search?'+req.params.clan_name ,headers: {auth:process.argv[2]}},function (error,response,body) {
		var data=JSON.parse(body);
		// res.send(data);
		res.render("clan_search",{data:data});
	});
});

app.get("/top/players/:reg",function (req,res) {
	if(req.params.reg=="GLO"){
		req.params.reg="";
	}
	request( { url:'http://api.cr-api.com/top/players/'+req.params.reg ,headers: {auth:process.argv[2]}},function (error,response,body) {
		var data=JSON.parse(body);
		// res.send(data);
		request('https://raw.githubusercontent.com/cr-api/cr-api-data/master/json/regions.json',function (err,resp,bod) {
			var region=JSON.parse(bod);
			res.render("top_players",{data:data,region:region});
		});
	});
});

app.get("/top/clans/:reg",function (req,res) {
	if(req.params.reg=="GLO"){
		req.params.reg="";
	}
	request( { url:'http://api.cr-api.com/top/clans/'+req.params.reg ,headers: {auth:process.argv[2]}},function (error,response,body) {
		var data=JSON.parse(body);
		// res.send(data);
		request('https://raw.githubusercontent.com/cr-api/cr-api-data/master/json/regions.json',function (err,resp,bod) {
			var region=JSON.parse(bod);
			res.render("top_clans",{data:data,region:region});
		});
	});
});

app.listen(3000);