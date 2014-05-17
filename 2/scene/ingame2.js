var TILE_WIDTH  = 30;
var TILE_HEIGHT = 30;

var g_cameraX = 0;
var g_cameraY = 0;

var BLOCK_DISTANCE = 33;


var g_distance = 0;
var g_myTeamMinPos = 11;

var g_effectManager = new EffectManager();
var g_gameUI = new BtnManager();

var g_box = 5;
//-----------------------------------------------------------------------------------------------------
//
//



var OBJECT_TYLE_BLOCK = 1;
var stages = [
{ map : 
[
"xxxxxxxxxxx",
"x.........x",
"x.........x",
"x.........x",
"x.........x",
"x.........x",
"x.........x",
"x...p.....x",
"x.........x",
"x.........x",
"x.........x",
"x.........x",
"x.........x",
"x.........x",
"x.........x",
"x.........x",
"xxxxxxxxxxx",
]},
{ map : 
[
"     x     ",
"    x.x    ",
"   x...x   ",
"  x.....x  ",
" x.......x ",
"x.........x",
"x...g.....x",
" x..p....x ",
"  x.....x  ",
"   x...x   ",
"    x.x    ",
"     x     ",
]},
				];

var g_objList = new ObjManager(); 
var g_imgs = [];
var g_map_height = 0;
var g_map_width = 0;
var g_exp = 0;
var g_player; 
var g_stageIDX = 0;
var g_gold = 10;
var g_turn = 10;

var SceneIngame = function()
{ 
	this.LoadStage = function(idx)
	{
		var d = new Date();
		var n = d.getTime(); 


		this.turnFlag = false;
		this.state = 'game';
		this.title_cnt = 5; 
		this.title_timer = n;
		this.world_moving = false;
		this.world_moving_prev_x = 0;
		this.world_moving_prev_y = 0;
		this.world_moving_enable = false; 
		this.score = 0;
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
				var type ='';
				if(tile == 'x') type = 'block';
				if(tile == '.') type = 'dark';
				if(tile == 'h') type = 'heart';
				if(tile == 'p') type = 'player';
				if(tile == '1') type = 'mon';
				if(tile == 'b') type = 'box';
				if(tile == 't') type = 'turn';
				if(tile == 'g') type = 'gold';

				switch(type)
				{
					case 'player':
					case 'mon':
					case 'box':
					case 'turn':
					case 'gold':
						objList.push([j * TILE_WIDTH , i * TILE_HEIGHT, type]);
						g_objList.Add(j * TILE_WIDTH , i * TILE_HEIGHT, 'dark'); 
						continue;
				}

				if(type == '')
					continue;

				g_objList.Add(j * TILE_WIDTH , i * TILE_HEIGHT, type); 
			} 
		}

		for(var i in objList)
		{
			var obj = g_objList.Add(objList[i][0],objList[i][1],objList[i][2]); 
			if(objList[i][2] == 'player')
				g_player = obj;
		}


		for(var i = 0; i < 10; ++i)
			g_objList.RandomGen('heart');

		for(var i = 0; i < 5; ++i)
			g_objList.RandomGen('box2');

		for(var i = 0; i < 3; ++i)
			g_objList.RandomGen('mon');

		console.log('start!');
	}
	this.LoadImg = function(name)
	{
		g_imgs[name] = ImageManager.Register( "assets/"+name+".gif", name);
	}
	this.Start = function()
	{ 
		g_imgs['block'] = ImageManager.Register( "assets/block.gif", 'block');
		g_imgs['dark'] = ImageManager.Register( "assets/dark.gif", 'dark');
		g_imgs['heart'] = ImageManager.Register( "assets/heart.gif", 'heart');
		g_imgs['player'] = ImageManager.Register( "assets/player.gif", 'player');

		this.LoadImg('mon');
		this.LoadImg('gold');
		this.LoadImg('box');
		this.LoadImg('box2');
		this.LoadImg('merchant');
		this.LoadImg('turn');


//		this.state = 'title';

		var ui_width = 30;
		g_gameUI.Add(ui_width, 0, Renderer.width- 100, ui_width, 'up', this, 'pressUp');
		g_gameUI.Add(Renderer.width - ui_width, ui_width, ui_width, Renderer.height - 100, 'right', this, 'pressRight');
		g_gameUI.Add(ui_width, Renderer.height - ui_width, Renderer.width - 100, ui_width, 'down', this, 'pressDown');
		g_gameUI.Add(0, ui_width, ui_width, Renderer.height - 100, 'left', this, 'pressLeft');

		this.LoadStage(g_stageIDX);
	}

	this.pressUp = function()
	{
		if(g_objList.CheckMoving())
			return;
		g_objList.Move(0, -1);
		this.turnFlag = true;
	}
	
	this.pressDown = function()
	{
		if(g_objList.CheckMoving())
			return;
		g_objList.Move(0, 1);
		this.turnFlag = true;
	}
	
	this.pressRight = function()
	{
		if(g_objList.CheckMoving())
			return;
		g_objList.Move(1, 0);
		this.turnFlag = true;
	}
	
	this.pressLeft = function()
	{
		if(g_objList.CheckMoving())
			return;
		g_objList.Move(-1, 0);
		this.turnFlag = true;
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

		if(g_player.hp <= 0)
			this.state = 'gameOver';

		if(g_turn <= 0)
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


		if(g_objList.CheckMoving() == 0 && this.turnFlag)
		{
			this.turnFlag = false;
			this.Turn();
		}


		if(g_objList.GetEnemyCnt() == 0)
		{
//			g_stageIDX++;
//			this.LoadStage(g_stageIDX);
		}

		if(MouseManager.Clicked)
		{
			var x = Math.round(MouseManager.x / TILE_WIDTH ) * TILE_WIDTH;
			var y = Math.round(MouseManager.y / TILE_HEIGHT) * TILE_HEIGHT;

			var list = g_objList.GetChrByPos(x, y);

			if(list.length == 1 && list[0].type == 'dark' && g_box > 0)
			{
				g_box--;
				var obj = g_objList.Add(x, y, 'box'); 
			}
		}

	}

	this.Turn = function()
	{
		this.combo = 0;
		g_turn--;
		g_objList.RandomGen();
		g_objList.RandomGen('box2');

		for(var i = 0; i < 1; ++i)
			g_objList.RandomGen('mon');
	}
	
	this.Render = function()
	{
		Renderer.SetAlpha(1.0); 
		Renderer.SetColor("#bbbbbb"); 


		g_objList.Render(); 
		g_gameUI.Render();


		g_effectManager.Render();
		Renderer.SetAlpha(1.0); 
		Renderer.SetColor("#ffffff"); 
//		Renderer.Text(0, 0, g_cameraX + "," + g_cameraY + "," + this.world_moving);
		var maxHP = g_player.level * 10;
		if(g_player.hp <= 0)
			Renderer.SetColor("#ff0000"); 
		else
			Renderer.SetColor("#ffffff"); 
		Renderer.Text(50, 50, 'hp : ' + g_player.hp + " / "+ maxHP);

		if(g_turn < 3)
			Renderer.SetColor("#ff0000"); 
		else
			Renderer.SetColor("#ffffff"); 
		Renderer.Text(50, 70, 'left turn : ' + g_turn);

		Renderer.SetColor("#ffffff"); 
		var maxExp = g_player.level * 2;
		Renderer.Text(50, 90, 'gold : ' + g_gold + ' / exp  : ' + g_player.exp + " / " + maxExp );
		Renderer.Text(50, 110, 'box : ' + g_box );
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
			Renderer.SetAlpha(0.5); 
			Renderer.SetColor("#000000"); 
			Renderer.Rect(0, 0, Renderer.width, Renderer.height);
			Renderer.SetAlpha(1); 

			Renderer.SetColor("#ff0000"); 
			Renderer.SetFont('16pt Arial');
			Renderer.Text(24, 150, "Game Over"); 
		} 
	} 
};
