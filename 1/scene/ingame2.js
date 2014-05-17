var TILE_WIDTH  = 30;
var TILE_HEIGHT = 30;

var g_cameraX = 0;
var g_cameraY = 0;

var BLOCK_DISTANCE = 33;


var g_coin = 10;
var g_distance = 0;
var g_myTeamMinPos = 11;

var g_effectManager = new EffectManager();
var g_gameUI = new BtnManager();
//-----------------------------------------------------------------------------------------------------
//
//



var OBJECT_TYLE_BLOCK = 1;
var stages = [{ map : 
[
"............",
"............",
"............",
"............",
"............",
"....xxx.....",
"....xhx.....",
"....x1x.....",
"....xhx.....",
"....xhx.....",
"....xpx.....",
"....xhx.....",
"....xxx.....",
"............",
"............",
"............",
"............",
"............",
]},
{map :[
"............",
"............",
"............",
"............",
"............",
".....xx.....",
"....xhhx....",
"...x1hhhx...",
"...xhhhhx...",
"...xxxhhx...",
"...xhhphx...",
"....xhhx....",
".....xx.....",
"............",
"............",
"............",
"............",
"............",
]},
{map :[
"............",
"............",
"...xxxxxx...",
"...x1...x...",
"...x.xxxx...",
"...x....x...",
"...xxxx.x...",
"...x1...x...",
"...xhh.hx...",
"...x..hhx...",
"...xh.phx...",
"....xhhx....",
".....xx.....",
"............",
"............",
"............",
"............",
"............",
]},
{map :[
"............",
"............",
"...xxxxxx...",
"...x....x...",
"..x......x..",
".x.....p..x.",
".xhhh.....x.",
".x........x.",
".xxxxxxxx.x.",
".x.1....1.x.",
"..xx....xx..",
"....x..x....",
".....xx.....",
"............",
"............",
"............",
"............",
"............",
]},
				];

var g_objList = new ObjManager(); 
var g_pickedObj = null;
var g_imgs = [];
var g_map_height = 0;
var g_map_width = 0;
var g_playerHP = 10;
var g_stageIDX = 0;
var SceneIngame = function()
{ 
	this.LoadStage = function(idx)
	{
		var d = new Date();
		var n = d.getTime(); 

		g_playerHP = 5;

		this.state = 'game';
		this.title_cnt = 5; 
		this.title_timer = n;
		this.world_moving = false;
		this.world_moving_prev_x = 0;
		this.world_moving_prev_y = 0;
		this.world_moving_enable = false; 
		this.score = 0;
		this.turn = 5;
		this.combo = 0;
	
		g_stageIDX = idx;
		g_objList.Clear();

		var map = stages[g_stageIDX].map;
		g_map_height = map.length;
		g_map_width = map[0].length;
		g_cameraX = -(Renderer.width - (g_map_width * TILE_WIDTH)) / 2;
		g_cameraY = -(Renderer.height - (g_map_height * TILE_HEIGHT)) / 2;
		var objList = [];
		for(var i = 0; i < map.length;++i)
		{
			var line = map[i];

			for(var j = 0; j < line.length; ++j)
			{
				var tile = line.charAt(j);
				var tyle = 'dark';
				if(tile == 'x') type = 'block';
				if(tile == '.') type = 'dark';
				if(tile == 'h') type = 'heart';
				if(tile == 'p') type = 'player';
				if(tile == '1') type = 'lv1';

				switch(type)
				{
					case 'player':
					case 'lv1':
						objList.push([j * TILE_WIDTH , i * TILE_HEIGHT, type]);
						continue;
				}

				g_objList.Add(j * TILE_WIDTH , i * TILE_HEIGHT, type); 
			} 
		}

		for(var i in objList)
				g_objList.Add(objList[i][0],objList[i][1],objList[i][2]); 

		console.log('start!');
	}
	this.Start = function()
	{ 
		g_imgs['block'] = ImageManager.Register( "assets/block.gif", 'block');
		g_imgs['dark'] = ImageManager.Register( "assets/dark.gif", 'dark');
		g_imgs['heart'] = ImageManager.Register( "assets/heart.gif", 'heart');
		g_imgs['player'] = ImageManager.Register( "assets/player.gif", 'player');
		g_imgs['lv1'] = ImageManager.Register( "assets/lv1.gif", 'lv1');
		g_imgs['lv2'] = ImageManager.Register( "assets/lv2.gif", 'lv2');


//		this.state = 'title';

		g_gameUI.Add(50, 0, Renderer.width- 100, 50, 'up', this, 'pressUp');
		g_gameUI.Add(Renderer.width - 50, 50, 50, Renderer.height - 100, 'right', this, 'pressRight');
		g_gameUI.Add(50, Renderer.height - 50, Renderer.width - 100, 50, 'down', this, 'pressDown');
		g_gameUI.Add(0, 50, 50, Renderer.height - 100, 'left', this, 'pressLeft');

		this.LoadStage(g_stageIDX);
	}

	this.pressUp = function()
	{
		if(g_objList.CheckMoving())
			return;
		g_objList.Move(0, -1);
		this.Turn();
	}
	
	this.pressDown = function()
	{
		if(g_objList.CheckMoving())
			return;
		g_objList.Move(0, 1);
		this.Turn();
	}
	
	this.pressRight = function()
	{
		if(g_objList.CheckMoving())
			return;
		g_objList.Move(1, 0);
		this.Turn();
	}
	
	this.pressLeft = function()
	{
		if(g_objList.CheckMoving())
			return;
		g_objList.Move(-1, 0);
		this.Turn();
	}
	
	
	this.End = function()
	{
	} 
	
	this.Update = function()
	{ 
		if(KeyManager.IsKeyPress(KEY_UP))
			this.pressUp();

		if(KeyManager.IsKeyPress(KEY_DOWN))
			this.pressDown();

		if(KeyManager.IsKeyPress(KEY_LEFT))
			this.pressLeft();

		if(KeyManager.IsKeyPress(KEY_RIGHT))
			this.pressRight();

		if(g_playerHP < 0)
			this.state = 'gameOver';

		if(this.turn < 0)
			this.state = 'gameOver';

		if(this.state =='gameOver')
			return;

		if(this.state == 'title')
		{
			var d = new Date();
			var n = d.getTime(); 

			if(n - this.title_timer > 1000)
			{
				this.title_timer = n;
				this.title_cnt--;

				if(this.title_cnt == 0)
					this.state = 'game';
			}

			return;
		}

		g_objList.Update(); 
		g_effectManager.Update(); 
		g_gameUI.Update();

		if(this.world_moving_enable && this.world_moving)
		{
			var diff_x = MouseManager.x - this.world_moving_prev_x;
			var diff_y = MouseManager.y - this.world_moving_prev_y;
			this.world_moving_prev_x = MouseManager.x;
			this.world_moving_prev_y = MouseManager.y;

			g_cameraX -= diff_x;
			g_cameraY -= diff_y;
		}

		if(g_objList.GetEnemyCnt() == 0)
		{
			g_stageIDX++;
			this.LoadStage(g_stageIDX);
		}

	}

	this.Turn = function()
	{
		this.combo = 0;
		g_pickedObj = null;
		g_objList.ClearPickedObj();
		this.turn--;
	}
	
	this.Render = function()
	{
		Renderer.SetAlpha(1.0); 
		Renderer.SetColor("#bbbbbb"); 

		for(var i =  -(g_cameraX % TILE_WIDTH) - TILE_WIDTH; i < parseInt(Renderer.width) + TILE_WIDTH; i += TILE_WIDTH)
		{
			for(var j =  -(g_cameraY % TILE_HEIGHT) - TILE_HEIGHT; j < parseInt(Renderer.height) + TILE_HEIGHT; j += TILE_HEIGHT)
			{
				if(Math.abs(parseInt((i+g_cameraX) / TILE_WIDTH) % 2) != Math.abs(parseInt((j+g_cameraY) / TILE_HEIGHT) % 2))
					Renderer.Rect( i, j, TILE_WIDTH, TILE_HEIGHT);
			}
		}	

		g_objList.Render(); 
		g_gameUI.Render();

		if(g_pickedObj)
		{ 
			Renderer.SetAlpha(0.5); 
			Renderer.SetColor('#000000');
			g_pickedObj.Render();
		}

		g_effectManager.Render();
		Renderer.SetAlpha(1.0); 
		Renderer.SetColor("#ffffff"); 
//		Renderer.Text(0, 0, g_cameraX + "," + g_cameraY + "," + this.world_moving);
		Renderer.Text(50, 50, 'hp : ' + g_playerHP + " / 10 left turn " + this.turn );
		Renderer.Text(50, 70, 'stage : ' + g_stageIDX );
		if(this.combo >= 2)
//		Renderer.Text(0, Renderer.height - 20, 'combom : ' + this.combo);
		if(this.state == 'title')
		{
			Renderer.SetAlpha(0.5); 
			Renderer.SetColor("#000000"); 
			Renderer.Rect(0, 0, Renderer.width, Renderer.height);

			Renderer.SetAlpha(1.0); 
			Renderer.SetColor("#ffffff"); 
			Renderer.SetFont('16pt Arial');
			Renderer.Text(100, 200, this.title_cnt + " left"); 
		}

		if(this.state == 'gameOver')
		{
			Renderer.SetAlpha(1); 
			Renderer.SetColor("#ff0000"); 
			Renderer.SetFont('16pt Arial');
			Renderer.Text(24, 150, "Game Over"); 
		} 
	} 
};
