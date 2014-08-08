var TILE_WIDTH = 60;
var TILE_HEIGHT = 60;

var g_cameraX = 0;
var g_cameraY = 500;

var g_effectManager = new EffectManager();
var g_gameUI = new BtnManager();

var g_objList = new ObjManager(); 
var g_imgs = [];
var g_map_height = 0;
var g_map_width = 0;

var g_coin = 0;
var g_player; 

var PLAYER_MAX_Y = 500 + 390;
var gauge_dec = 30;
var CRAGON_TIME = 15 * 1000; 
//CRAGON_TIME = 1; 

var g_cragonTime = 0; 
var g_cragonLevel = 1; 
var g_mon_level = 1; 
var g_mon_level_time;

var SceneIngame = function()
{ 
	this.jumpGauge = 100;
	this.jumpGaugeMax = 100;

	this.LoadStage = function(idx)
	{
		this.state = 'game';
	
		g_objList.Clear();
		console.log('start!');
		Renderer.defaultColor = "#000"; 
	}

	this.LoadImg = function(name, img, width, height)
	{
		g_imgs[name] = {};
		g_imgs[name].img = ImageManager.Register( "assets/"+img, name);
		g_imgs[name].width = width;
		g_imgs[name].height = height;

		return g_imgs[name];
	}

	this.Start = function()
	{ 
		this.LoadImg('bg', 'bg.png',  320, 500); 
		this.LoadImg('player', 'player.png',  128, 128); 

		this.LoadImg('cragon', 'cragon.png', 320, 291);

		this.LoadImg('mon_1', '01001.png', 128, 128);
		this.LoadImg('mon_2', '01003.png', 128, 128);
		this.LoadImg('mon_3', '01005.png', 128, 128);
		this.LoadImg('mon_4', '01006.png', 128, 128);
		this.LoadImg('mon_5', '01007.png', 128, 128);

		this.LoadImg('sword_effect', 'sword_effect.png', 60, 60);

		this.LoadImg('hp', 'heart.gif', 50, 50);

		this.LoadImg('coin', 'gold.png', 64, 64);


		this.LoadImg('dust', 'dust.png', 208, 208);
		this.LoadImg('meteo', 'meteo.png', 128, 128);
		this.LoadImg('warn', 'ability_08.png', 128, 128); 
		this.LoadImg('redline', 'redline.png', 1, 500); 

		g_player = g_objList.Add(Renderer.width / 2 - TILE_WIDTH / 2,
								PLAYER_MAX_Y, "player");
		g_player.default_ay = 0.3;
		g_player.hp = 3;
		g_player.max_ay = 10;

		AddGold(g_player.x, g_player.y - 200);

		this.Generate();
		var now = new Date();
		g_cragonTime = now.getTime() + CRAGON_TIME; 
		g_mon_level_time = now;
	}

	this.End = function()
	{
	} 

	this.Generate = function() {
		var num = randomRange(1, 5);
		this.lastGenTime = new Date();

		if(g_objList.GetObjByType('cragon').length == 0) {
			for(var i = 0; i < num + g_mon_level; ++i) {
				var x = randomRange(0 , 4) * TILE_WIDTH;
				var y = g_player.y - randomRange(PLAYER_MAX_Y - 500, PLAYER_MAX_Y - 300);
				var obj = g_objList.Add(x, y, "mon_" + g_mon_level);

				obj.ay = randomRange(1, 5) / 10 + g_mon_level / 5;
				obj.max_ay = 10;
				obj.hp = randomRange(1, 2) * g_mon_level / 2;
			} 
		}

		if(g_now - g_mon_level_time > 1000 * 20 * g_mon_level) {
			g_mon_level = Math.min(5, g_mon_level + 1);
			g_mon_level_time = g_now;
		}



		for(var i = 0; i < num; ++i) {
			var x = randomRange(50, Renderer.width - 50);
			var y = g_cameraY - 500;
			var obj = g_objList.Add(x, y, "meteo");

			obj.ay = 10;
			obj.hp = randomRange(1, 2); 
			var sec = randomRange(10, 30) / 10 * config['fps'];
			obj.visibleDelay = totalFPS + sec;

			obj.visibleDelay = totalFPS + sec; 
			obj.visible = false;
			obj.col_x = 20;
			obj.col_width = 20;
			obj.max_ay = 100;
			obj.ay = 10;
		} 
	}

	this.GenerateCragon = function(){
		if(g_objList.GetObjByType('cragon').length > 0)
			return;

		var x = randomRange(0 , 4) * TILE_WIDTH;
		var y = g_player.y - 800;
		var obj = g_objList.Add(x, y, "cragon");

		obj.width = g_imgs['cragon'].width;
		obj.height = g_imgs['cragon'].height;

		obj.col_width = g_imgs['cragon'].width;
		obj.col_height = g_imgs['cragon'].height;

		obj.ay = 2;
		obj.max_ay = 10;
		obj.hp = 15 * g_cragonLevel / 2; 
		g_cragonLevel++; 
	}
	
	this.Update = function()
	{ 
		if(this.state !='gameOver') {
			if(MouseManager.Clicked || KeyManager.IsKeyPress(KeyManager.arrowUp)) {
				if(this.jumpGauge >= gauge_dec && (KeyManager.IsKeyPress(KeyManager.arrowUp) || MouseManager.y < g_player.y - g_cameraY)) {
	//			if(this.jumpGauge >= gauge_dec && MouseManager.x > Renderer.width / 3  && MouseManager.x < Renderer.width / 3 * 2) {
					g_player.ay = -10;
					this.jumpGauge -= gauge_dec;
				}

				var colList = g_objList.CheckCollision(g_player.x, g_player.y, g_player);
				//var colList = g_objList.CheckCollision(MouseManager.x + g_cameraX, MouseManager.y + g_cameraY, g_player);
				if(colList.length > 0) {
					for(var i in colList) {
						var obj = colList[i];
						if(Math.abs(obj.y - g_player.y) > obj.width * 1.1 ||
							Math.abs(obj.x - g_player.x) >  obj.height * 1.1 )
							continue;

						if(obj.type.indexOf("mon_") != 0 && obj.type != 'cragon')
							continue;

						var effect = g_effectManager.Add(obj.x + obj.col_width / 2 - TILE_WIDTH / 2 + randomRange(-15 , 15) ,
														obj.y + obj.col_height / 2 - TILE_HEIGHT / 2 + randomRange(-15 , 15) , '#fff', '',
											g_imgs['sword_effect']);

						effect.world = true;
						obj.Damaged(1); 

						g_player.ay = Math.min(-10, g_player.ay);
						break;
					}
				} 
			} 

			var now = new Date();
			if(now - this.lastGenTime > 7 * 1000) { 
				this.Generate();
			}

			if(now.getTime() > g_cragonTime)  { 
				this.GenerateCragon();
			}


			if(g_player.ay > 0)
				this.jumpGauge += 0.01;

			if(g_player.ay == 0)
				this.jumpGauge += 3;

			this.jumpGauge = Math.min(this.jumpGauge, this.jumpGaugeMax);

			g_player.ax = 0;
		
			if(KeyManager.IsKeyDown(KeyManager.arrowLeft))
					g_player.ax = -2;

			if(KeyManager.IsKeyDown(KeyManager.arrowRight))
					g_player.ax = 2;

			if(MouseManager.LDown) { 
				if(MouseManager.x < g_player.x + TILE_WIDTH / 2)
					g_player.ax = -2;
				else
					g_player.ax = 2; 
			}
		}

		g_cameraY = g_player.y - 390;

		g_effectManager.Update(); 
		g_gameUI.Update(); 
		g_objList.Update(); 

		if(g_player.hp <= 0)
			this.state = "gameOver";

		g_player.x = Math.max(0, g_player.x);
		g_player.x = Math.min(g_player.x, Renderer.width - TILE_WIDTH);
	}

	this.Render = function()
	{
		Renderer.SetAlpha(1.0); 
		Renderer.SetColor("#000");
		Renderer.Rect(0,0,Renderer.width, Renderer.height);
		
		var bg = g_imgs['bg'];
		Renderer.Img(0,bg.height - g_cameraY, bg.img);

		g_objList.Render(); 
		g_effectManager.Render(); 

		Renderer.SetAlpha(1.0); 
		Renderer.SetFont('8pt Arial'); 
		Renderer.SetColor("#fff");
		Renderer.Text(0, 0, "coin : " + g_coin);
//		Renderer.Text(0, 0, "hp : " + g_player.hp + " jump " + this.jumpGauge + " / " + this.jumpGaugeMax);

		var cragon_left = (g_cragonTime) - g_now.getTime();
		cragon_left = parseInt(cragon_left / 1000);
		Renderer.Text(0, 20, "cragon :  lv."+g_cragonLevel+" "+ cragon_left + " sec left");

		if(this.jumpGauge < gauge_dec)
			Renderer.SetColor("#f00");
		else
			Renderer.SetColor("#00f");
		var max = 400;
		var height = this.jumpGauge / this.jumpGaugeMax * max;
		Renderer.Rect(10, 50 + max - height, 20, height);

		for(var i = 0; i < g_player.hp; ++i)
			Renderer.Img(20 + i * (g_imgs['hp'].width + 10), 
					Renderer.height - g_imgs['hp'].height, g_imgs['hp'].img);

		if(this.state == "gameOver") {
			Renderer.SetAlpha(0.5); 
			Renderer.SetColor("#000");
			Renderer.Rect(0,0,Renderer.width, Renderer.height);
			Renderer.SetFont('15pt Arial'); 
			Renderer.SetColor("#fff");
			Renderer.Text(0,300,"game over!");
		}

//		g_objList.Render();
//		g_effectManager.Render(); 
//		Renderer.SetAlpha(1.0); 
//		Renderer.SetColor("#ffffff"); 
	} 
};
