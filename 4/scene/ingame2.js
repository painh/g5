var TILE_WIDTH  = 30;
var TILE_HEIGHT = 30;

var g_cameraX = 0;
var g_cameraY = 0;

var BLOCK_DISTANCE = 33;


var g_distance = 0;
var g_myTeamMinPos = 11;

var g_effectManager = new EffectManager();
var g_gameUI = new BtnManager();
var g_merchant = new BtnManager();

var g_box = 5;
//-----------------------------------------------------------------------------------------------------
//
//



var OBJECT_TYLE_BLOCK = 1;
var stages = [
{ map : 
[
"xxxxxxx",
"x.M...x",
"x.p...x",
"x.....x",
"x.....x",
"x.....x",
"xxxxxxx",
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
				if(tile == 'M') type = 'merchant';

				switch(type)
				{
					case 'player':
					case 'mon':
					case 'box':
					case 'turn':
					case 'gold':
					case 'merchant':
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
			{
				g_player = obj;
				g_player.maxHP = 15;
				g_player.hp = g_player.maxHP;
				g_player.ap = 15;
			}
		}


		for(var i = 0; i < 3; ++i)
			g_objList.RandomGen('gold');

		for(var i = 0; i < 3; ++i)
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

		var ui_width = 50;
		g_gameUI.Add(ui_width, 0, Renderer.width - 100, ui_width, 'up', this, 'pressUp');
		g_gameUI.Add(Renderer.width - ui_width, ui_width, ui_width, Renderer.height - 100, 'right', this, 'pressRight');
		g_gameUI.Add(ui_width, Renderer.height - ui_width, Renderer.width - 100, ui_width, 'down', this, 'pressDown');
		g_gameUI.Add(0, ui_width, ui_width, Renderer.height - 100, 'left', this, 'pressLeft');

		this.LoadStage(g_stageIDX);

		ui_width = 50;
		var ui_y = 100;
		g_merchant.Add(0, ui_y, 200, ui_width, 'HP 회복 1gold', this, 'pressRecoverHP');
		ui_y += 60;
		g_merchant.Add(0, ui_y, 200, ui_width, 'maxHP 증가 1gold', this, 'pressIncrMaxHP');
		ui_y += 60;
		g_merchant.Add(0, ui_y, 200, ui_width, '공격 증가 1gold', this, 'pressIncrAp');
		ui_y += 60;
		g_merchant.Add(0, ui_y, 200, ui_width, '턴 구입 1gold = 2turn', this, 'pressIncrTurn');
		ui_y += 60;
//		g_merchant.Add(0, ui_y, 200, ui_width, 'box 구입 5gold', this, 'pressIncrBox');
//		ui_y += 60;
		g_merchant.Add(0, ui_y, 200, ui_width, '돌아가기', this, 'pressExit');
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

	this.pressRecoverHP = function()
	{
		if(g_gold >= 1 && g_player.hp < g_player.maxHP )
		{
			g_gold--; 
			g_player.hp++;
		}
	}
	
	this.pressIncrMaxHP = function()
	{
		if(g_gold >= 1 )
		{
			g_gold--; 
			g_player.maxHP++;
		}
	}

	this.pressIncrAp = function()
	{
		if(g_gold >= 1 )
		{
			g_gold--; 
			g_player.ap++;
		}
	}

	this.pressIncrBox = function()
	{
		if(g_gold >= 5 )
		{
			g_gold -= 5 
			g_box++;
		}
	}

	this.pressIncrTurn = function()
	{
		if(g_gold >= 1 )
		{
			g_gold -= 1;
			g_turn += 2;
		}
	} 

	this.pressExit = function()
	{
		g_ingame.state = 'game';
	}

	this.End = function()
	{
	} 
	
	this.Update = function()
	{ 
		if(this.state == 'merchant')
		{
			g_merchant.Update();	
			return;
		}

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
			this.DoTurn();
		}


		if(g_objList.GetEnemyCnt() == 0)
		{
//			g_stageIDX++;
//			this.LoadStage(g_stageIDX);
		}

//		if(MouseManager.Clicked)
//		{
//			var x = Math.round(MouseManager.x / TILE_WIDTH ) * TILE_WIDTH;
//			var y = Math.round(MouseManager.y / TILE_HEIGHT) * TILE_HEIGHT;
//
//			var list = g_objList.GetChrByPos(x, y);
//
//			if(list.length == 1 && list[0].type == 'dark' && g_box > 0)
//			{
//				g_box--;
//				var obj = g_objList.Add(x, y, 'box'); 
//			}
//		}

	}

	this.DoTurn = function()
	{
		this.combo = 0;
		g_turn--;
		g_objList.DoTurn();
		for(var i = 0; i < 3; ++i)
			g_objList.RandomGen();

		g_objList.RandomGen('box2'); 
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

		var text ='hp : ' + g_player.hp + " / "+ g_player.maxHP;
		var textWidth = Renderer.GetTextWidth(text);
		var y = 50;
		Renderer.SetAlpha(0.5);
		Renderer.SetColor("#000"); 
		Renderer.Rect(50, y, textWidth, Renderer.GetFontSize());
		var maxHP = g_player.maxHP;
		Renderer.SetAlpha(1);
		if(g_player.hp <= 0)
			Renderer.SetColor("#ff0000"); 
		else
			Renderer.SetColor("#ffffff"); 
		Renderer.Text(50, y, text);

		var text ='left turn : ' + g_turn;
		var textWidth = Renderer.GetTextWidth(text);
		y = 70;
		Renderer.SetAlpha(0.5);
		Renderer.SetColor("#000"); 
		Renderer.Rect(50, y, textWidth, Renderer.GetFontSize());
		var maxHP = g_player.maxHP;
		Renderer.SetAlpha(1);
		if(g_turn < 3)
			Renderer.SetColor("#ff0000"); 
		else
			Renderer.SetColor("#ffffff"); 
		Renderer.Text(50, y, text);

		Renderer.SetColor("#ffffff"); 
		var maxExp = g_player.level * 2;
		var text = 'gold : ' + g_gold + ' / exp  : ' + g_player.exp + " / " + maxExp;
		var textWidth = Renderer.GetTextWidth(text);
		y = 90;
		Renderer.SetAlpha(0.5);
		Renderer.SetColor("#000"); 
		Renderer.Rect(50, y, textWidth, Renderer.GetFontSize());
		var maxHP = g_player.maxHP;
		Renderer.SetAlpha(1);
		Renderer.SetColor("#ffffff"); 
		Renderer.Text(50, y, text);

		Renderer.SetColor("#ffffff"); 
		var maxExp = g_player.level * 2;
		var text = 'box : ' + g_box;
		var textWidth = Renderer.GetTextWidth(text);
		y = 110;
		Renderer.SetAlpha(0.5);
		Renderer.SetColor("#000"); 
		Renderer.Rect(50, y, textWidth, Renderer.GetFontSize());
		var maxHP = g_player.maxHP;
		Renderer.SetAlpha(1);
		Renderer.SetColor("#ffffff"); 
		Renderer.Text(50, y, text);


//		if(this.combo >= 2)
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

		if(this.state == 'merchant')
		{
			Renderer.SetAlpha(0.9); 
			Renderer.SetColor("#000000"); 
			Renderer.Rect(0, 0, Renderer.width, Renderer.height);
			Renderer.SetAlpha(1); 

			Renderer.SetColor("#ffffff"); 
			Renderer.Text(0, 0, 'Player HP : ' + g_player.hp);
			Renderer.Text(0, 20, 'Player MaxHP : ' + g_player.maxHP);
			Renderer.Text(0, 40, 'Player 공격력 : ' + g_player.ap);
			Renderer.Text(0, 60, 'gold : ' + g_gold);
			Renderer.Text(0, 80, 'turn : ' + g_turn);

			g_merchant.Render();	
		}
	} 
};
