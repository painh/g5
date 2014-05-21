var TILE_WIDTH  = 50;
var TILE_HEIGHT = 50;

var g_cameraX = 0;
var g_cameraY = 0;

var BLOCK_DISTANCE = 33;


var g_distance = 0;
var g_myTeamMinPos = 11;

var g_effectManager = new EffectManager();
var g_gameUI = new BtnManager();
var g_merchant = new BtnManager();

var g_box = 5;
var g_fever = 0;
var g_feverMax = 60;
var g_feverTurnMax = 4;
var g_feverLeft = 4;
var g_killMonCnt = 0;
//-----------------------------------------------------------------------------------------------------
//
//



var OBJECT_TYLE_BLOCK = 1;
var stages = [
{ map : 
[
"xxxxxxx",
"x.....x",
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
"x.........x",
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
var g_goldAll = 10;
var g_prevMerchantSpawnGoldAll = 10;
var g_turn = 1;

var g_price_hp = 10;
var g_price_maxHP = 20;
var g_price_ap = 10;
var g_price_hpRegen = 10;
var g_prevDate;;
var g_leftSec = 60;
var g_leftTurnMax = 30;
var g_leftTurn = g_leftTurnMax;
var g_feverMode = false;

function AddExp(val)
{
	g_player.exp += val;

	var maxExp = g_player.level * 2;
	if(g_player.exp >= maxExp)
	{
		g_player.level++;
		g_player.exp = 0;
		g_player.maxHP += 10;
		g_player.hp = g_player.maxHP;
		g_player.ap += 10;
		//g_objList.AddMerchant();
		g_objList.RandomGen('up_fever');
		g_objList.RandomGen('up_ap');
		g_objList.RandomGen('up_exp');
		g_effectManager.Add(g_player.x - g_cameraX, g_player.y - g_cameraY, '#ffffff', 'level up!');
		console.log('level up!');
	}
}

function ChangeFever(val)
{
	if(g_feverMode && val > 0)
		return;

	g_fever += val;

	if(g_fever >= g_feverMax)
	{
		g_fever = g_feverMax;
		g_feverMode = true;
		g_feverLeft = g_feverTurnMax;
	}
	
	if(g_fever <= 0)
	{
		g_fever = 0;
		g_feverMode = false;
	}

}

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


//		for(var i = 0; i < 3; ++i)
//			g_objList.RandomGen('heart');

		for(var i = 0; i < 3; ++i)
			g_objList.RandomGen('box2');

		for(var i = 0; i < 3; ++i)
			g_objList.RandomGen('mon');

		for(var i = 0; i < 3; ++i)
			g_objList.RandomGen('gold');

		console.log('start!');
		
		$.growl("<a href='viewall.php'>view record</a>");

	}
	this.LoadImg = function(name, img, width, height)
	{
		g_imgs[name] = {};
		g_imgs[name].img = ImageManager.Register( "assets/"+img, name);
		g_imgs[name].width = width;
		g_imgs[name].height = height;
	}
	this.Start = function()
	{ 
		this.LoadImg('mon', 'mon.png', 128, 128);
		this.LoadImg('block', 'block.gif',  30, 30);
		this.LoadImg('dark', 'dark.gif',  30, 30);
		this.LoadImg('heart', 'heart.gif',  30, 30);
		this.LoadImg('player', 'player.png',  128, 128);
		this.LoadImg('mon_green', 'mon.png', 128, 128);
		this.LoadImg('gold', 'gold.png', 64, 64);
		this.LoadImg('box', 'box.gif', 30, 30);
		this.LoadImg('box2', 'box.png', 120, 120);
		this.LoadImg('merchant', 'npc.png', 240, 240);
		this.LoadImg('turn', 'turn.gif', 30, 30);
		this.LoadImg('mon_onetunekill', 'mon_green.png', 128, 128);


//		this.state = 'title';

		if(!CheckTouchable())
		{ 
			var ui_width = 50;
			g_gameUI.Add(ui_width, 50, Renderer.width - 100, ui_width, 'up', this, 'pressUp');
			g_gameUI.Add(Renderer.width - ui_width, ui_width, ui_width, Renderer.height - 100, 'right', this, 'pressRight');
			g_gameUI.Add(ui_width, Renderer.height - ui_width - 50, Renderer.width - 100, ui_width, 'down', this, 'pressDown');
			g_gameUI.Add(0, ui_width, ui_width, Renderer.height - 100, 'left', this, 'pressLeft');
		}

		var ui_y = 100;
		ui_width = 50;
		g_btnShopHP = g_merchant.Add(0, ui_y, 150, ui_width, 'HP 회복 10 / '+g_price_hp+' gold', g_ingame, 'pressRecoverHP');
		ui_y += 60;
		g_btnShopMaxHP = g_merchant.Add(0, ui_y, 150, ui_width, 'maxHP 증가 10 / '+g_price_maxHP+' gold', this, 'pressIncrMaxHP');
		ui_y += 60;
		g_btnShopAp = g_merchant.Add(0, ui_y, 150, ui_width, '공격 증가 10 / '+g_price_ap+' gold', this, 'pressIncrAp');
		ui_y += 60;
		g_btnShopHPRegen = g_merchant.Add(0, ui_y, 150, ui_width, 'hp 리젠 증가 5 / '+g_price_hpRegen+' gold', this, 'pressIncrHPRegen');
		ui_y += 60;
		g_btnShopExit = g_merchant.Add(0, ui_y, 150, ui_width, '돌아가기', this, 'pressExit');
		g_prevDate = new Date();
		AddTouchSwipe(function(dir)
		{
			switch(dir)
			{
				case 'left':
					g_ingame.pressLeft();
					break;

				case 'up':
					g_ingame.pressUp();
					break;

				case 'down':
					g_ingame.pressDown();
					break;

				case 'right':
					g_ingame.pressRight();
					break;
			}	
		});


		this.LoadStage(g_stageIDX);

	}

	this.pressUp = function()
	{
		if(g_objList.CheckMoving())
			return;
		if(g_feverMode)
			g_objList.GetAllGold();
		g_objList.Move(0, -1);
		this.turnFlag = true;
	}
	
	this.pressDown = function()
	{
		if(g_objList.CheckMoving())
			return;
		if(g_feverMode)
			g_objList.GetAllGold();
		g_objList.Move(0, 1);
		this.turnFlag = true;
	}
	
	this.pressRight = function()
	{
		if(g_objList.CheckMoving())
			return;
		if(g_feverMode)
			g_objList.GetAllGold();
		g_objList.Move(1, 0);
		this.turnFlag = true;
	}
	
	this.pressLeft = function()
	{
		if(g_objList.CheckMoving())
			return;
		if(g_feverMode)
			g_objList.GetAllGold();
		g_objList.Move(-1, 0);
		this.turnFlag = true;
	} 

	this.pressRecoverHP = function()
	{
		if(g_gold >= g_price_hp && g_player.hp < g_player.maxHP )
		{
			g_gold -= g_price_hp; 
			g_price_hp++;
			g_player.hp += 10;
			if(g_player.hp > g_player.maxHP)
				g_player.hp = g_player.maxHP;
		}

		this.OpenShop();
	}
	
	this.pressIncrMaxHP = function()
	{
		if(g_gold >= g_price_maxHP )
		{
			g_gold -= g_price_maxHP;
			g_price_maxHP++;
			g_player.maxHP += 10;
		}

		this.OpenShop();
	}

	this.pressIncrHPRegen = function()
	{
		if(g_gold >= g_price_hpRegen )
		{
			g_gold -= g_price_hpRegen; 
			g_price_hpRegen++;
			g_player.hpRegen += 2.5;
		}

		this.OpenShop();
	}

	this.pressIncrAp = function()
	{
		if(g_gold >= g_price_ap)
		{
			g_gold -= g_price_ap; 
			g_price_ap++;
			g_player.ap += 10;
		}

		this.OpenShop();
	}

	this.pressIncrBox = function()
	{
		if(g_gold >= 5 )
		{
			g_gold -= 5 
			g_box++;
		}

		this.OpenShop();
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
		if(this.state =='gameOver')
			return;

		if(this.state == 'merchant')
		{
			g_merchant.Update();	
			return;
		}

		var cur = new Date();
		if(cur.getTime() - g_prevDate.getTime() > 1000)
		{
			g_prevDate = cur;
//			g_leftSec--;
			if(g_leftSec < 0)
				this.state = 'gameOver'; 
		}

		if(KeyManager.IsKeyPress(KEY_UP))
			this.pressUp();

		if(KeyManager.IsKeyPress(KEY_DOWN))
			this.pressDown();

		if(KeyManager.IsKeyPress(KEY_LEFT))
			this.pressLeft();

		if(KeyManager.IsKeyPress(KEY_RIGHT))
			this.pressRight();


//		if(g_turn <= 0)
//			this.state = 'gameOver';


//		if(g_player.hp <= 0)
//		{
//			ajaxReq('record.php', { 'maxHp' : g_player.maxHP,
//									'ap' : g_player.ap,
//									'hpRegen' : g_player.hpRegen,
//									'gold' : g_gold,
//									'goldAll' : g_goldAll,
//									'exp' : g_player.exp,
//									'level' : g_player.level,
//									'turn' : g_turn
//									}, function()
//			{
//				
//			});
//			this.state = 'gameOver';
//		}

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


		if(g_objList.CheckMoving() == false && this.turnFlag)
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
		g_turn++;
		g_leftTurn--;
		if(g_leftTurn <= 0)
		{
			g_leftTurn = 0;
			this.state = 'gameOver';
		}
		g_objList.DoTurn();
		for(var i = 0; i < 3; ++i)
			g_objList.RandomGen();

		g_objList.RandomGen('box2'); 
		g_objList.RandomGen('mon');
		if(g_feverMode)
			for(var i = 0; i < 25; ++i)
				g_objList.RandomGen('gold');
		if(g_feverMode)
		{
			g_feverLeft--;
			ChangeFever(- g_feverMax / g_feverTurnMax); 
		}
	}
	
	this.Render = function()
	{
		Renderer.SetAlpha(1.0); 
		Renderer.SetColor("#ffffff"); 

		Renderer.SetAlpha(1.0); 
		Renderer.SetColor("#ffffff"); 
		g_objList.Render(); 
		Renderer.SetAlpha(1.0); 
		Renderer.SetColor("#ffffff"); 
		g_gameUI.Render(); 
		Renderer.SetAlpha(1.0); 
		Renderer.SetColor("#ffffff"); 

//		Renderer.Text(0, 0, g_cameraX + "," + g_cameraY + "," + this.world_moving);

		Renderer.SetColor("#ffffff"); 
		var maxExp = g_player.level * 2;
		var text = 'gold : ' + g_gold;
		var textWidth = Renderer.GetTextWidth(text);
		y = Renderer.height - 20;
		Renderer.SetAlpha(0.5);
		Renderer.SetColor("#000"); 
		Renderer.Rect(0, y, textWidth, Renderer.GetFontSize());
		var maxHP = g_player.maxHP;
		Renderer.SetAlpha(1);
		Renderer.SetColor("#ffffff"); 
		Renderer.Text(0, y, text); 


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

			Renderer.SetColor("#fff"); 
			Renderer.SetFont('16pt Arial');
			var y = 150;
			Renderer.Text(24, 150, "게임 종료!"); 
			y+=25; 
			Renderer.Text(24, y, "얻은 금화 수 " + g_goldAll); 
			y+=25; 
			Renderer.Text(24, y, "처치한 몬스터의 수 " + g_killMonCnt); 
			y+=25; 
			Renderer.Text(24, y, "레벨" + g_player.level); 
			y+=25; 
			Renderer.Text(24, y, "최종 점수" + (g_player.level * 5 + g_killMonCnt * 10 + g_goldAll)); 
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
			Renderer.Text(0, 60, 'hp리젠 : ' + g_player.hpRegen);
			Renderer.Text(0, 80, 'gold : ' + g_gold);

			g_merchant.Render();	
		}

		Renderer.SetFont('8pt Arial');
		// time left
		Renderer.SetColor('#00ff00');
		Renderer.Rect(0, Renderer.height - 50, Renderer.width, 20);
		if(g_leftTurn < 10)
			Renderer.SetColor('#ff0000'); 
		else
			Renderer.SetColor('#0000ff'); 
		Renderer.Rect(0, Renderer.height - 50, g_leftTurn / g_leftTurnMax * Renderer.width, 20); 
		Renderer.SetColor('#fff'); 
		Renderer.Text(0, Renderer.height - 50, 'turn  ' + g_leftTurn + ' left');

		// fever
		Renderer.SetColor('#0000ff');
		Renderer.Rect(0, 30, Renderer.width, 20);
		if(g_feverMode)
			Renderer.SetColor('#ff0000');
		else
			Renderer.SetColor('#00ff00');
		Renderer.Rect(0, 30, g_fever / g_feverMax * Renderer.width, 20);
		Renderer.SetColor('#fff'); 
		if(g_feverMode)
			Renderer.Text(0, 30, 'fever mode!: ' +(g_feverLeft)+ ' turn left');
		else
			Renderer.Text(0, 30, 'fever : ' + g_fever);
		//
		// exp
		Renderer.SetColor('#0000ff');
		Renderer.Rect(0, 5, Renderer.width, 20);
		Renderer.SetColor('#00ff00');
		var maxExp = g_player.level * 2;
		Renderer.Rect(0, 5, g_player.exp / maxExp * Renderer.width, 20);
		Renderer.SetColor('#fff'); 
		Renderer.Text(0, 5, 'level : ' + g_player.level + " exp : " + g_player.exp + " / " + maxExp);

		g_effectManager.Render(); 
		Renderer.SetAlpha(1.0); 
		Renderer.SetColor("#ffffff"); 
	} 

	this.OpenShop = function()
	{ 
		this.state = 'merchant';

		var targetBtn = g_btnShopHP;
		if(g_gold >= g_price_hp) targetBtn.captionColor = '#fff';
		else targetBtn.captionColor = '#f00';
		targetBtn.caption			= 'HP 회복 10 / '+g_price_hp+' gold';


		var targetBtn = g_btnShopMaxHP;
		if(g_gold >= g_price_maxHP) targetBtn.captionColor = '#fff';
		else targetBtn.captionColor = '#f00';
		targetBtn.caption		= 'maxHP 증가 10 / '+g_price_maxHP+' gold';
		
		var targetBtn = g_btnShopAp;
		if(g_gold >= g_price_ap) targetBtn.captionColor = '#fff';
		else targetBtn.captionColor = '#f00';
		targetBtn.caption			= '공격 증가 10 / '+g_price_ap+' gold';

		var targetBtn = g_btnShopHPRegen;
		if(g_gold >= g_price_hpRegen) targetBtn.captionColor = '#fff';
		else targetBtn.captionColor = '#f00';
		targetBtn.caption	= 'hp 리젠 증가 5 / '+g_price_hpRegen+' gold'; 

		g_btnShopExit.caption		= '돌아가기';
	}
};
