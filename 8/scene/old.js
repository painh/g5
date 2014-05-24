var TILE_WIDTH  = 24;
var TILE_HEIGHT = 24;
var MEMBER_MAX_NUM = 5;

var CHAR_WARRIOR		= 0;
var CHAR_MAGE			= 1;
var CHAR_THEIF			= 2;
var CHAR_GOBLIN			= 3;
var CHAR_COIN			= 4;
var CHAR_PUB			= 5;
var CHAR_INN			= 6;
var CHAR_GOBLIN_MAGE	= 7;

var IMG_WARRIOR			= 0;
var IMG_MAGE			= 1;
var IMG_THEIF			= 2;
var IMG_GOBLIN			= 3;
var IMG_COIN			= 4;
var IMG_PUB				= 5;
var IMG_FIRE_BALL		= 6;
var IMG_INN				= 7;
var IMG_GOBLIN_MAGE		= 8;
var IMG_MAX				= 9;

var g_imgs = [];
for(var i = 0; i < IMG_MAX; ++i)
	g_imgs[i] = ImageManager.Register( "./img/char_"+i+".png", "img_"+i);

var g_statTable = [ 
					[	CHAR_WARRIOR,		IMG_WARRIOR,		'전사',			50,	50,	10,	8,	1.5,	1,		2,	0,	0,	0,	1, [],	0,		0	, 100,	0,	0, ],
					[	CHAR_MAGE,			IMG_MAGE,			'마법사',		20,	20,	1,	8,	1,		3,		0,	5,	0,	0,	1, [],	100,	100	, 100,	2,	2, ],
					[	CHAR_THEIF,			IMG_THEIF,			'도적',			40,	40,	5,	8,	2,		1,		1,	5,	0,	0,	1, [],	0,		0	, 100,	0,	0, ],
					[	CHAR_GOBLIN,		IMG_GOBLIN,			'고블린',		20,	20,	10,	8,	3,		1,		1,	1,	1,	0,	1, [],	0,		0	, 0,	0,	0, ],
					[	CHAR_COIN	,		IMG_COIN,			'황금',			0,	0,	0,	0,	0,		0,		0,	1,	0,	0,	0, [],	0,		0	, 0,	0,	0, ],
					[	CHAR_PUB,			IMG_PUB,			'선술집',		0,	0,	0,	0,	0,		0,		0,	0,	0,	0,	0, [],	0,		0	, 0,	0,	0, ],
					[	CHAR_INN,			IMG_INN,			'여관',			0,	0,	0,	0,	0,		0,		0,	0,	0,	0,	0, [],	0,		0	, 0,	0,	0, ],
					[	CHAR_GOBLIN_MAGE,	IMG_GOBLIN_MAGE,	'고마법사',		10,	10,	10,	8,	2,		3,		1,	1,	1,	0,	1, [],	20,		20	, 0,	3,	3, ],
				];

var STAT_CHAR_NO			= 0;
var STAT_CHAR_IMG			= 1;
var STAT_CHAR_TYPE_TEXT		= 2;
var STAT_HP					= 3;
var STAT_MAX_HP				= 4;
var STAT_STR				= 5;
var STAT_DEX				= 6;
var STAT_MOVE				= 7;
var STAT_RANGE				= 8;
var STAT_DEF				= 9;
var STAT_HAVE_COIN			= 10;
var STAT_GIVE_EXP			= 11;
var STAT_EXP				= 12;
var STAT_LEVEL				= 13;
var STAT_BASE_COMPONENT		= 14;
var STAT_MP					= 15;
var STAT_MAX_MP				= 16;
var STAT_CONTRACT_PRICE		= 17;
var STAT_ATTACK_DELAY		= 18;
var STAT_ATTACK_DELAY_MAX	= 19;

var FOWARD_LIMIT = 2;
var g_cameraX = -FOWARD_LIMIT;

var BLOCK_DISTANCE = 33;

var COMPONENT_STACK_ABLE		= 0;
var COMPONENT_SHOP				= 1;
var COMPONENT_COIN				= 2;
var COMPONENT_MOVE_LEFT			= 3;
var COMPONENT_STACK_DIE			= 4;
var COMPONENT_DEAD_REMOVE		= 5;
var COMPONENT_INVINCIBLE		= 6;
var COMPONENT_PUB				= 7;
var COMPONENT_SWIPE				= 8;
var COMPONENT_ATTACK_FORWARD	= 9;
var COMPONENT_ATTACK_BACK		= 10;
var COMPONENT_MANA_USER			= 11;
var COMPONENT_FIRE_BALL			= 12;
var COMPONENT_INN				= 13;

var g_componentType = [
						[COMPONENT_STACK_ABLE, '통과 가능','통과 가능함.'],
						[COMPONENT_SHOP, '상점','상점을 염'],
						[COMPONENT_COIN, '황금','골드가 증가함'],
						[COMPONENT_MOVE_LEFT, '전진(왼쪽)','왼쪽으로 전진함'],
						[COMPONENT_STACK_DIE, '통과시 사망','통과시 사망함'],
						[COMPONENT_DEAD_REMOVE, '사망시 삭제','사망시 삭제'],
						[COMPONENT_INVINCIBLE, '무적','타겟팅 되지 않음'],
						[COMPONENT_PUB, '선술집','선술집을 염'],
						[COMPONENT_SWIPE, '후려치기','좌우의 적을 공격합니다.'],
						[COMPONENT_ATTACK_FORWARD, '전방공격','전방의 적을 공격합니다.'], 
						[COMPONENT_ATTACK_BACK, '후방공격','후방의 적을 공격합니다.'],
						[COMPONENT_MANA_USER, '마나 사용자','마력을 사용합니다.'],
						[COMPONENT_FIRE_BALL, '화염구','불덩이를 날립니다.', {mp : 10}] ,
						[COMPONENT_INN, '여관','휴식을 취한다.'],
					];


var g_coin = 10;
var g_distance = 0;
var g_gameOver = false;

g_statTable[CHAR_WARRIOR][STAT_BASE_COMPONENT]		= [COMPONENT_ATTACK_FORWARD, COMPONENT_SWIPE];
g_statTable[CHAR_MAGE][STAT_BASE_COMPONENT]			= [COMPONENT_MANA_USER, COMPONENT_FIRE_BALL];
g_statTable[CHAR_THEIF][STAT_BASE_COMPONENT]		= [COMPONENT_ATTACK_FORWARD, COMPONENT_ATTACK_BACK];
g_statTable[CHAR_GOBLIN][STAT_BASE_COMPONENT]		= [COMPONENT_MOVE_LEFT, COMPONENT_ATTACK_BACK];
g_statTable[CHAR_COIN][STAT_BASE_COMPONENT]			= [COMPONENT_STACK_ABLE, COMPONENT_STACK_DIE, COMPONENT_DEAD_REMOVE, COMPONENT_INVINCIBLE];
g_statTable[CHAR_PUB][STAT_BASE_COMPONENT]			= [COMPONENT_STACK_ABLE, COMPONENT_STACK_DIE, COMPONENT_DEAD_REMOVE, COMPONENT_INVINCIBLE, COMPONENT_PUB];
g_statTable[CHAR_INN][STAT_BASE_COMPONENT]			= [COMPONENT_STACK_ABLE, COMPONENT_STACK_DIE, COMPONENT_DEAD_REMOVE, COMPONENT_INVINCIBLE, COMPONENT_INN];
g_statTable[CHAR_GOBLIN_MAGE][STAT_BASE_COMPONENT]	= [COMPONENT_MANA_USER, COMPONENT_FIRE_BALL];
function removeFromList(list, obj)
{
	var idx = list.indexOf(obj);
	list.splice(idx, 1); 
}
function coinChange(change)
{
	g_coin += change;
	var eff;

	eff = g_effectManager.Add(6, 25, "#ffffff", "+ "+change+" coin");
	eff.font = '16pt Arial';
	eff.world = false;

	if(change > 0)
	{
		PlaySound('coinGet');
		eff = g_effectManager.Add(5, 24, "#ffff00", "+ "+change+" coin");
	}
	else 
	{
		PlaySound('coinOut');
		eff = g_effectManager.Add(5, 24, "#ff0000", ""+change+" coin");
	}
	eff.font = '16pt Arial';
	eff.world = false;
}

var Effect = function()
{
	var LIFE_TIME = 2000;

	this.Init = function(x, y, color, str, img)
	{
		this.x = x;
		this.y = y;
		this.str = str;
		this.img = img;
		this.color = color;
		this.alpha = 1.0;
		this.bornTime = Renderer.currentTime;
		this.font = '8pt Arial';
		this.world = true;
	}

	this.Update = function()
	{
		if(Renderer.currentTime - this.bornTime > LIFE_TIME)
			return;

		this.alpha = 1.0 - ((Renderer.currentTime - this.bornTime) / LIFE_TIME);
	}

	this.Render = function()
	{
		if(Renderer.currentTime - this.bornTime > LIFE_TIME)
			return;

		Renderer.SetAlpha(this.alpha);

		var x = this.x;
		if(this.world)
			x -= g_cameraX * TILE_WIDTH;

		if(this.img)
			Renderer.Img(x , this.y, this.img);

		if(this.str)
		{
			Renderer.SetFont(this.font);
			Renderer.SetColor(this.color);
			Renderer.Text(x , this.y, this.str);
		}
	}
}


var EffectManager = function()
{
	this.list = [];
	this.effectIndex = 0;
	this.list.length = 50;

	for(var i = 0; i < this.list.length; ++i)
		this.list[i] = new Effect();

	this.Add = function(x, y, color, str, img)
	{
		this.effectIndex++;
		if(this.effectIndex >= this.list.length)
			this.effectIndex = 0; 

		this.list[this.effectIndex].Init(x, y, color, str, img);
		return this.list[this.effectIndex];
	} 

	this.Update = function()
	{
		for(var i = 0; i < this.list.length; ++i)
			this.list[i].Update();
	}

	this.Render = function()
	{
		for(var i = 0; i < this.list.length; ++i)
			this.list[i].Render();
	}

}

var g_effectManager = new EffectManager();

var Obj = function()
{
	this.x = 0;
	this.y = 0;
	this.width = 1;
	this.height = 1;
	this.stats = [];

	this.type = 0;
	this.portrait = 0;
	this.component = [];
	this.targets = [];

	this.isPlayer = false;
	this.flip = true;
	this.isDead = false;
	this.isRemoved = false;

	this.Update = function()
	{
		if(this.isRemoved)
			return;
	}

	this.Render = function()
	{ 
		if(this.isRemoved)
			return;

		var img = g_imgs[this.stats[STAT_CHAR_IMG]];

		if(img)
		{
			Renderer.SetAlpha(1);
			if(this.flip == false) 
				Renderer.Img((this.x - g_cameraX) * TILE_WIDTH, this.y * TILE_HEIGHT, img);
			else
				Renderer.ImgFlipH((this.x - g_cameraX) * TILE_WIDTH, this.y * TILE_HEIGHT, img);
		}

		if(this.isDead)
		{ 
			Renderer.SetAlpha(0.8);
			Renderer.SetColor("#000000"); 
			Renderer.Rect((this.x - g_cameraX) * TILE_WIDTH, this.y * TILE_HEIGHT , TILE_WIDTH, TILE_HEIGHT);
			return;
		}


		if(this.stats[STAT_HP] > 0)
		{
			Renderer.SetColor("#ffff00");
			Renderer.Rect((this.x - g_cameraX) * TILE_WIDTH, this.y * TILE_HEIGHT + TILE_HEIGHT - 3, TILE_WIDTH, 3);

			Renderer.SetColor("#ff0000"); 
			var width = this.stats[STAT_HP] / this.stats[STAT_MAX_HP] * TILE_WIDTH;
			Renderer.Rect((this.x - g_cameraX) * TILE_WIDTH, this.y * TILE_HEIGHT + TILE_HEIGHT - 2, width, 1); 
		}


		if(this.stats[STAT_ATTACK_DELAY_MAX] > 0)
		{
			Renderer.SetFont('8pt Arial');

			Renderer.SetAlpha(1);
			Renderer.SetColor("#ffffff"); 
			Renderer.Rect((this.x - g_cameraX) * TILE_WIDTH, this.y * TILE_HEIGHT, TILE_WIDTH, 5) ;

			if(this.stats[STAT_ATTACK_DELAY] <= 0)
				Renderer.SetColor("#ff0000"); 
			else
				Renderer.SetColor("#0000ff"); 

			Renderer.Rect((this.x - g_cameraX) * TILE_WIDTH, this.y * TILE_HEIGHT, TILE_WIDTH * ((this.stats[STAT_ATTACK_DELAY]+1)/(this.stats[STAT_ATTACK_DELAY_MAX]+1)), 5) ;
		}
	}

	this.RenderTargets = function()
	{
		if(this.isDead)
			return;
		
		Renderer.SetAlpha(0.5); 
		if(this.isPlayer)
			Renderer.SetColor("#000000");
		else
			Renderer.SetColor("#ff0000");

		var center = this.GetCenter();
		
		for(var i = 0; i < this.targets.length; ++i)
		{
			if(i >= 1)
				break;

			var target = this.targets[i];
			var tcenter = target.GetCenter();
			if(this.isPlayer)
				Renderer.Line(center.x - g_cameraX * TILE_WIDTH, center.y - 5, tcenter.x - g_cameraX * TILE_WIDTH, tcenter.y - 5); 
			else
				Renderer.Line(center.x - g_cameraX * TILE_WIDTH, center.y, tcenter.x - g_cameraX * TILE_WIDTH, tcenter.y); 
		}
	}
		
	this.GetCenter = function()
	{
		var x = this.x * TILE_WIDTH + this.width * TILE_WIDTH/ 2;
		var y = this.y * TILE_HEIGHT + this.height * TILE_HEIGHT / 2;

		return {x : x, y : y};
	}

	this.PlayerNextStepAble = function(x, y, objList)
	{ 
		if(this.isDead)
			return true;

		var newX = this.x + x;
		var newY = this.y + y;

		if(newY < 1 || newY >= Renderer.height / TILE_HEIGHT)
			return false; 

		for(var i in objList)
		{
			var item = objList[i];
			if(item == this)
				continue;

			if(item.isDead)
				continue;

			if(item.checkCompo(COMPONENT_STACK_ABLE))
				continue;
			
			if(item.y == newY && item.x == newX)
				return false;
		}

		return true;
	}

	this.PlayerNextStep = function(x, y)
	{
		if(this.isDead)
			return;

		this.x += x;
		this.y += y;
	}

	this.GetDistance = function(obj)
	{
		var myCenter = this.GetCenter();
		var otherCenter = obj.GetCenter();


		return Math.sqrt( Math.pow(myCenter.x - otherCenter.x, 2) + Math.pow(myCenter.y - otherCenter.y, 2)) / BLOCK_DISTANCE;
	}

	this.getTargets = function(list, range)
	{
		var myCenter = this.GetCenter();
		var retList = [];

		for(var i in list)
		{
			var item = list[i];

			if(item.isRemoved)
				continue;
			
			if(item.isDead)
				continue;

			if(item.checkCompo(COMPONENT_INVINCIBLE))
				continue;
			
			if(this.GetDistance(item) < range)
				retList.push(item);
			
		}

		var chr = this;
		retList.sort(function(a, b)
		{
			return chr.GetDistance(a) - chr.GetDistance(b);
		});
		return retList;
	}

	this.checkCompo = function(type)
	{
		for(var i in this.component)
		{
			var item = this.component[i];
			if(item.type == type)
				return item;
		}

		return null;
	}

	this.AddCompo = function(type, op)
	{
		this.component.push({type:type, op : op});
	}
	

	this.AIMove = function(myTeamList, otherTeamList)
	{
		var newX = this.x;
		var newY = this.y;

		if(this.checkCompo(COMPONENT_MOVE_LEFT))
		{
			newX -= 1;
			newY += 0;
		}


		if(newY < 1 || newY >= Renderer.height / TILE_HEIGHT)
			return false;

		var teamList = [myTeamList, otherTeamList];
		for( j = 0; j < 2; j++)
		{
			var list = teamList[j];
			for(var i in list)
			{
				var item = list[i];
				if(item == this)
					continue;

				if(item.checkCompo(COMPONENT_STACK_ABLE))
					continue;

				if(item.isDead)
					continue;

				if(item.y == newY && item.x == newX)
					return false;
			}
		}

		this.x = newX;
		this.y = newY; 
	}

	this.Dead = function(myTeamList, otherTeamList)
	{
		if(this.isDead == true)
			return;

		if(this.stats[STAT_HAVE_COIN] != 0)
			coinChange(this.stats[STAT_HAVE_COIN]);
		
		this.isDead = true;

		if(!this.checkCompo(COMPONENT_INVINCIBLE))
			PlaySound('die');

		if(this.checkCompo(COMPONENT_DEAD_REMOVE))
			this.isRemoved = true;

		if(this.isPlayer)
		{
			var deadCnt = 0;
			for(var i in myTeamList)
				if(myTeamList[i].isDead)
					deadCnt++;

			if(deadCnt == myTeamList.length)
			{
				g_gameOver = true;
			}
			
		}

	}

	this.DoTurn = function(myTeamList, otherTeamList, playerMoved)
	{ 
		if(g_cameraX - this.x + 1 >= FOWARD_LIMIT)
			this.isRemoved = true;

		if(this.isRemoved)
			return;

		if(this.isDead)
			return; 

		for(var i in otherTeamList)
		{ 
			var item = otherTeamList[i];
			if(item == this)
				continue;

			if(item.isDead)
				continue;

			if(item.y == this.y && item.x == this.x)
			{
				if(this.checkCompo(COMPONENT_STACK_DIE))
				{
					this.Dead(myTeamList, otherTeamList);
				}

				if(this.checkCompo(COMPONENT_PUB))
					g_pub.Show();

				if(this.checkCompo(COMPONENT_INN))
					g_inn.Show();
			} 
		}

		if(this.isDead)
			return; 

		var m = this.stats;
		
		if(this.isPlayer == false && playerMoved == false)
			this.AIMove(myTeamList, otherTeamList);

		this.targets = this.getTargets(otherTeamList, this.stats[STAT_RANGE]);

		if(this.targets.length <= 0)
			return;
		
		var target = this.targets[0];

		if(!target.checkCompo(COMPONENT_INVINCIBLE))
		{
			var damage = 0;
			if( (this.checkCompo(COMPONENT_ATTACK_FORWARD) && this.x < target.x) ||
				(this.checkCompo(COMPONENT_ATTACK_BACK) && this.x > target.x) ||
				(this.checkCompo(COMPONENT_SWIPE) && this.x == target.x) ||
				(this.checkCompo(COMPONENT_FIRE_BALL)
				)
			)
			{
				if(this.stats[STAT_ATTACK_DELAY_MAX] >= 0)
					this.stats[STAT_ATTACK_DELAY]--;

				if(this.stats[STAT_ATTACK_DELAY] < 0)
				{
					this.stats[STAT_ATTACK_DELAY] = this.stats[STAT_ATTACK_DELAY_MAX];
					var t = target.stats;
					var byWhat = 'normal_attack';
					var compo;
					if(this.checkCompo(COMPONENT_FIRE_BALL))
					{
						var compo = g_componentType[COMPONENT_FIRE_BALL][3];

						if(this.stats[STAT_MP] >= compo.mp) 
						{
							damage = -10;
							this.stats[STAT_MP] -= 10;
							byWhat = 'fire_ball';
							g_effectManager.Add(target.x * TILE_WIDTH, target.y * TILE_HEIGHT, "", "", g_imgs[IMG_FIRE_BALL]);
							
						}
					}
					else
						damage = t[STAT_DEF] - m[STAT_STR];

					t[STAT_HP] = t[STAT_HP] + damage;

					if(t[STAT_HP] <= 0)
						target.Dead(otherTeamList, myTeamList);

					if(damage < 0) 
					{
						g_effectManager.Add(target.x * TILE_WIDTH , target.y * TILE_HEIGHT, "#ff0000", damage);
						PlaySound(byWhat);
					}
				}
			}
		}

	} 
};

var ObjManager = function()
{ 
	this.m_list = [];

	this.Add = function(type, x, y)
	{

		var obj = new Obj();
		
		for(var i in g_statTable)
		{
			var item = g_statTable[i];
			if(item[0] != type)
				continue;	

			obj.stats = item.slice(); //deep copy
			for(var i in obj.stats[STAT_BASE_COMPONENT])
				obj.AddCompo(obj.stats[STAT_BASE_COMPONENT][i]);
		}

		obj.x = x;
		obj.y = y;
		this.m_list.push(obj);

		return obj;
	}

	this.Update = function()
	{
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			item.Update();
		}
	}

	this.Render = function()
	{
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			item.Render();
		}

		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			item.RenderTargets();
		}
	}

	this.DoTurn = function(otherManager, playerMoved)
	{ 
		var removedList = [];
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			item.DoTurn(this.m_list, otherManager.m_list, playerMoved);
			if(item.isRemoved)
				removedList.push(item);
		}

		for(var i in removedList)
		{
			var item = removedList[i];
			removeFromList(this.m_list, item);
		} 
	}

	this.PlayerNextStepAble = function(x, y, otherManager)
	{
		var flag = false;
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			if(!item.PlayerNextStepAble(x, y, otherManager.m_list))
				return false;
		}

		return true;
	}

	this.PlayerNextStep = function(x, y)
	{
		var list = this.m_list;		

		for(var i in list)
		{
			var item = list[i];
			item.PlayerNextStep(x, y);
		}
	}

	this.GetChrFromScreenPos = function(_x, _y)
	{
		var x = parseInt(_x / TILE_WIDTH) + g_cameraX;
		var y = parseInt(_y / TILE_HEIGHT);

		return this.GetChrByPos(x, y);
	}

	this.GetChrByPos = function(x,y)
	{ 
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			if(item.x == x && item.y == y)
				return item;
		}
		return null;
	}

};

var Btn = function()
{
	this.x = 0;
	this.y = 0;
	this.width = 50;
	this.height = 50; 
	this.clickFunc;
	this.clicked = false;
	this.caption = 'button';
	this.eventReceiver;

	this.Render = function()
	{
		Renderer.SetColor("#000000"); 
		Renderer.SetAlpha(0.8);
		Renderer.Rect(this.x, this.y, this.width, this.height);
		Renderer.SetColor("#ffffff"); 
		Renderer.SetAlpha(1);
		Renderer.Text(this.x, this.y, this.caption);
	}
	
	this.Update = function()
	{
		if( (MouseManager.x < this.x) ||
			(MouseManager.x >= this.x + this.width) ||
			(MouseManager.y < this.y) ||
			(MouseManager.y >= this.y + this.height) )
		{
			return;
		} 

		if(MouseManager.Clicked == true)
		{
			this.eventReceiver[this.clickFunc].call(this.eventReceiver, this);
			MouseManager.Clicked = false;
		}
	}
}

var BtnManager = function()
{
	this.list = [];
	this.visible = true;

	this.Add = function(x, y, width, height, caption, obj, clickFunc)
	{
		var btn = new Btn();
		btn.x = x;
		btn.y = y;
		btn.width = width;
		btn.height = height;
		btn.caption = caption;
		btn.eventReceiver = obj;
		btn.clickFunc = clickFunc; 

		this.list.push(btn);
	}

	this.Update = function()
	{
		if(this.visible == false)
			return;

		for(var i in this.list)
		{
			var item = this.list[i];
			item.Update();
		}
	}

	this.Render = function()
	{
		if(this.visible == false)
			return;

		for(var i in this.list)
		{
			var item = this.list[i];
			item.Render();
		}
	}
} 
var g_gameUI = new BtnManager();
//-----------------------------------------------------------------------------------------------------

//-----------------------------------------------------------------------------------------------------
var Pub = function()
{
	this.m_ui = new BtnManager();
	this.btns = [];
	this.m_ui.Add(0, 50, 64, 32, '영웅1', this, 'hero');
	this.m_ui.Add(0, 85, 64, 32, '영웅2', this, 'hero');
	this.m_ui.Add(0, 125, 64, 32, '영웅3', this, 'hero');
	this.m_ui.Add(140, 200, 96, 32, '계약', this, 'contract');
	this.m_ui.Add(240, 200, 64, 32, '취소', this, 'close');

	this.m_heroList = [];
	this.m_selectedHero = 0;

	this.visible = false;

	this.Show = function()
	{
		g_gameUI.visible = false;
		this.visible = true;
		this.m_selectedHero = 0; 
		this.m_heroList = [0, 1, 2]; 
	}

	this.Update = function()
	{
		if(this.visible == false)
			return;

		this.m_ui.Update();
	}
	
	this.Render = function()
	{ 
		if(this.visible == false)
			return;

		Renderer.SetColor("#ffffff");
		Renderer.SetAlpha(0.9);
		Renderer.Rect(0, 25, Renderer.width, Renderer.height - 25);

		Renderer.SetColor("#000000");
		Renderer.SetAlpha(1); 
		Renderer.SetFont("10pt Arial");
		var line = 30;
		var lineTerm = 17;
		var x = 67;
		var heroType = this.m_heroList[this.m_selectedHero];
		Renderer.Text(2 , 25, "영웅 고용 ");
		Renderer.Text(x , line, "영웅 " + (this.m_selectedHero+1)); line += lineTerm; 
		Renderer.Img(x, line, g_imgs[heroType]); 
		Renderer.Img(x + 100, line, g_imgs[CHAR_COIN]); 
		Renderer.Text(x + 130, line, "x " + g_statTable[heroType][STAT_CONTRACT_PRICE]); 
		Renderer.Text(x + 30, line, g_statTable[heroType][STAT_CHAR_TYPE_TEXT]); line += lineTerm; 

		line += lineTerm; 
		Renderer.Text(x, line, "특기 "); line += lineTerm; 

		for(var i in g_statTable[heroType][STAT_BASE_COMPONENT])
		{
			var compo = g_statTable[heroType][STAT_BASE_COMPONENT][i];
			var name = g_componentType[compo][1];
			var desc = g_componentType[compo][2];
			Renderer.Text(x, line, name + " : "+ desc); line += lineTerm; 
		}

		this.m_ui.Render();
	}

	this.hero = function(btn)
	{ 
		var idx = parseInt(btn.caption.split("영웅")[1]) - 1;
		this.m_selectedHero = idx;
	}

	this.close = function()
	{
		this.visible = false; 
		g_gameUI.visible = true;
	}

	this.contract = function()
	{
		var heroType = this.m_heroList[this.m_selectedHero];
		var contractPrice = g_statTable[heroType][STAT_CONTRACT_PRICE];
		if(g_coin < contractPrice)
		{
			var eff = g_effectManager.Add(0, 200, "#ff0000", "돈이 부족합니다.");
			eff.world = false;
			return;
		}
		if(g_playerManager.m_list.length >= MEMBER_MAX_NUM)
		{
			var eff = g_effectManager.Add(0, 200, "#ff0000", "파티 정원은 " + MEMBER_MAX_NUM + "명 입니다.");
			eff.world = false;
			return;
		}


		var p1 = g_playerManager.m_list[0];
		var posTable = [ [0, 1], [0, -1], [0, 2], [0, -2], [0, -3], [0, 3]];

		for(var i in posTable)
		{
			var newX = p1.x + posTable[i][0];
			var newY = p1.y + posTable[i][1];

			var flag = false;
			for(var j in g_playerManager.m_list)
			{
				var item = g_playerManager.m_list[j];
				if(item.x == newX && item.y == newY)
					flag = true;
			}

		
			if(flag == false)
			{
				coinChange(-contractPrice);
				var chr = g_playerManager.Add(heroType, newX, newY);
				chr.flip = false;
				chr.isPlayer = true;
				this.close();
				return;
			}
		}

		var eff = g_effectManager.Add(0, 200, "#ff0000", "오류로 인해 계약할 수 업슷ㅂ니다.");
		eff.world = false; 
		this.close();
	}
}
var g_pub = new Pub();
//----------------------------------------------------------------------------------------------------- 

var CharacterStatus = function()
{
	this.m_ui = new BtnManager();
	this.btns = [];
	this.m_ui.Add(240, 200, 64, 32, '닫기', this, 'close');

	this.m_selectedHero;

	this.visible = false;

	this.Show = function(chr)
	{
		g_gameUI.visible = false;
		this.visible = true;
		this.m_selectedHero = chr;
	}

	this.Update = function()
	{
		if(this.visible == false)
			return;

		this.m_ui.Update();

		if(MouseManager.Clicked != true)
			return;

		var chr = g_playerManager.GetChrFromScreenPos(MouseManager.x, MouseManager.y);
		if(chr)
		{
			this.m_selectedHero = chr;
			return;
		}

		var x = parseInt(MouseManager.x / TILE_WIDTH) + g_cameraX;
		var y = parseInt(MouseManager.y / TILE_HEIGHT);

		var chr = this.m_selectedHero;
		var stats = chr.stats;
		var height = Renderer.height / TILE_HEIGHT;
		var moveRange = stats[STAT_MOVE];

		var dis = Math.sqrt(Math.pow(chr.x - x, 2) + Math.pow(chr.y - y, 2));
		
//		console.log([x, chr.x, g_cameraX, chr.x + g_cameraX - x]);
		if(dis > moveRange)
			return;

		if(x > g_cameraX + FOWARD_LIMIT)
			return;

		console.log([g_cameraX - chr.x]);
		console.log([y, chr.y]);
		var dx = x - chr.x, dy = y - chr.y;
		if(chr.PlayerNextStepAble(dx, dy, g_otherManager.m_list))
		{
			NextTurn(false);
			chr.PlayerNextStep(dx, dy);	
		}
	}
	
	this.Render = function()
	{ 
		if(this.visible == false)
			return;

		var line = 30;
		var lineTerm = 17;
		var x = 110;
		var chr = this.m_selectedHero;
		var stats = chr.stats;
		var height = Renderer.height / TILE_HEIGHT;
		var width = Renderer.width / TILE_WIDTH;
		var moveRange = stats[STAT_MOVE];


		for(i = 0; i < width; ++i)
		{
			for(j = 1; j < height; ++j)
			{
				var newX = i + g_cameraX; 
				var newY = j;

				if(i < 4)
				{
					if(newX <= g_cameraX + FOWARD_LIMIT)
					{ 
						var dis = Math.sqrt(Math.pow(chr.x - newX, 2) + Math.pow(chr.y - newY, 2));
						
						if(dis <= moveRange)
							Renderer.SetColor("#0000ff"); 
						else
							Renderer.SetColor("#ff0000");
					}
					else
						Renderer.SetColor("#ff0000");

					Renderer.SetAlpha(0.5); 
					Renderer.Rect(i * TILE_WIDTH, j * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
				}

				var dis = Math.sqrt(Math.pow(chr.x - newX, 2) + Math.pow(chr.y - newY, 2));
				if(dis <= stats[STAT_RANGE])
				{

					Renderer.SetAlpha(1); 
					Renderer.SetColor("#ffffff");
					Renderer.Text(i * TILE_WIDTH + 1, j *TILE_HEIGHT + 1, "X");
					Renderer.SetColor("#ff0000");
					Renderer.Text(i * TILE_WIDTH, j *TILE_HEIGHT, "X");
				} 
			}
		}

		
		Renderer.SetColor("#ffffff");
		Renderer.SetAlpha(0.5);
		Renderer.Rect(100, 25, Renderer.width, Renderer.height - 25);

		Renderer.SetColor("#000000");
		Renderer.SetAlpha(1); 
		Renderer.SetFont("10pt Arial");

		Renderer.Img(x, line, g_imgs[stats[STAT_CHAR_IMG]]); 
		Renderer.Text(x + 30, line, stats[STAT_CHAR_TYPE_TEXT]); line += lineTerm; 
		line += lineTerm; 

		Renderer.Text(x, line, "체력 : " + stats[STAT_HP] + "/" + stats[STAT_MAX_HP] ); line += lineTerm; 
		if(chr.checkCompo(COMPONENT_MANA_USER))
		{
			Renderer.Text(x, line, "마력 : " + stats[STAT_MP] + "/" + stats[STAT_MAX_MP] ); line += lineTerm; 
		}

		Renderer.SetColor("#0000ff");
		Renderer.Text(x, line, "이동거리 : " + stats[STAT_MOVE]); line += lineTerm; 
		Renderer.SetColor("#ff0000");
		Renderer.Text(x, line, "공격거리 : " + stats[STAT_RANGE]); line += lineTerm; 

		Renderer.SetColor("#000000");
		line += lineTerm; 
		Renderer.Text(x, line, "특기 "); line += lineTerm; 

		for(var i in chr.component)
		{
			var compo = chr.component[i];
			var name = g_componentType[compo.type][1];
			var desc = g_componentType[compo.type][2];
			Renderer.Text(x, line, name + " : "+ desc); line += lineTerm; 
		} 

		this.m_ui.Render();
	}

	this.close = function()
	{
		this.visible = false; 
		g_gameUI.visible = true;
	}
}
var g_charStatus = new CharacterStatus();
//----------------------------------------------------------------------------------------------------- 
var INN = function()
{
	this.m_ui = new BtnManager();
	this.btns = [];
	this.m_ui.Add(80, 200, 140, 32, '휴식을 취한다', this, 'rest');
	this.m_ui.Add(240, 200, 64, 32, '닫기', this, 'close');

	this.visible = false;

	this.Show = function()
	{
		g_gameUI.visible = false;
		this.visible = true;
		this.restPrice = 0;

		for(var i in g_playerManager.m_list)
		{
			var item = g_playerManager.m_list[i];
			this.restPrice += 10;
		}
	}

	this.Update = function()
	{
		if(this.visible == false)
			return;

		this.m_ui.Update(); 
	}
	
	this.Render = function()
	{ 
		if(this.visible == false)
			return;

		Renderer.SetColor("#000000");
		Renderer.SetAlpha(0.9);
		Renderer.Rect(0, 25, Renderer.width, Renderer.height);

		Renderer.SetColor("#ffffff");
		Renderer.SetFont('10pt Arial');

		var x = 80;
		var y = 60;
		var line = 26;
		Renderer.Text(x, y, "휴식 금액 : "+this.restPrice  ); y += line; 
		for(var i in g_playerManager.m_list)
		{
			var item = g_playerManager.m_list[i]; 
			var stats = item.stats;

			Renderer.Img(x, y, g_imgs[stats[STAT_CHAR_IMG]]); 
			Renderer.Text(x + 30, y, stats[STAT_CHAR_TYPE_TEXT] + " 체력 " + stats[STAT_HP] + "/"+stats[STAT_MAX_HP]  ); y += line; 

		}

		this.m_ui.Render();
	}

	this.close = function()
	{
		this.visible = false; 
		g_gameUI.visible = true;
	}

	this.rest = function()
	{
		if(g_coin < this.restPrice)
		{
			var eff = g_effectManager.Add(0, 200, "#ff0000", "돈이 부족합니다.");
			eff.world = false;
			return;
		}
		
		for(var i in g_playerManager.m_list)
		{
			var item = g_playerManager.m_list[i]; 
			var stats = item.stats;

			stats[STAT_HP] = stats[STAT_MAX_HP];
			stats[STAT_MP] = stats[STAT_MAX_MP]; 
		}

		this.close();
	}
} 
var g_inn = new INN();
//----------------------------------------------------------------------------------------------------- 

g_playerManager = new ObjManager();
g_otherManager = new ObjManager();

doTurn = function(playerMoved)
{
	if(playerMoved)
		g_distance++;
	g_playerManager.DoTurn(g_otherManager, playerMoved);
	g_otherManager.DoTurn(g_playerManager, playerMoved);
}

generate = function()
{
	var maxCnt = randomRange(1, 5);
	var x = parseInt(g_cameraX + Renderer.width / TILE_WIDTH);

	if((g_distance % 80) == 0 && randomRange(1, 5) <= 4)
	{
		var ranY = parseInt(randomRange(1, Renderer.height / TILE_HEIGHT - 1));
		if(g_otherManager.GetChrByPos(x, ranY) == null)
		{
			chr = g_otherManager.Add(CHAR_INN, x, ranY);
			chr.flip = false;
		}
	}
	
	if((g_distance % 100) == 0 && randomRange(1, 5) <= 4)
	{
		var ranY = parseInt(randomRange(1, Renderer.height / TILE_HEIGHT - 1));
		if(g_otherManager.GetChrByPos(x, ranY) == null)
		{
			chr = g_otherManager.Add(CHAR_PUB, x, ranY);
			chr.flip = false;
		}
	}

	for(var i = 0; i < maxCnt;++i)
	{

		var ran = randomRange(0, 100);

		if(ran < 10)
		{ 
			var ranY = parseInt(randomRange(1, Renderer.height / TILE_HEIGHT - 1));
			if(g_otherManager.GetChrByPos(x, ranY) != null)
				continue;
			chr = g_otherManager.Add(CHAR_COIN, x, ranY);
			chr.flip = false;
		}
		else if(ran < 15)
		{
			var ranY = parseInt(randomRange(1, Renderer.height / TILE_HEIGHT - 1));
			if(g_otherManager.GetChrByPos(x, ranY) != null)
				continue;
			chr = g_otherManager.Add(CHAR_GOBLIN, x, ranY);
		}
		else if(ran < 17)
		{
			var ranY = parseInt(randomRange(1, Renderer.height / TILE_HEIGHT - 1));
			if(g_otherManager.GetChrByPos(x, ranY) != null)
				continue;
			chr = g_otherManager.Add(CHAR_GOBLIN_MAGE, x, ranY);
		}
	}
}

function NextTurn(playerMoved)
{
	PlaySound('footstep');
	generate();
	doTurn(playerMoved);
}

var SceneIngame = function()
{ 
	this.Start = function()
	{

		g_gameUI.Add(240, 30, 64, 32, '위로', this, "goUp");
		g_gameUI.Add(240, 70, 64, 32, '아래로', this, "goDown");
		g_gameUI.Add(240, 200, 64, 32, '앞으로', this, "goNext");

		var chr = g_playerManager.Add(CHAR_WARRIOR, 0, 5);
		chr.flip = false;
		chr.isPlayer = true;
		chr = g_playerManager.Add(CHAR_MAGE, 0, 6);
		chr.flip = false;
		chr.isPlayer = true;
		chr = g_playerManager.Add(CHAR_THEIF, 0, 4);
		chr.flip = false;
		chr.isPlayer = true;
	}
	
	this.End = function()
	{
	} 
	
	this.Update = function()
	{ 
		if(g_gameOver)
			return;

		g_playerManager.Update();
		g_otherManager.Update();

		g_effectManager.Update();
		g_pub.Update();
		g_inn.Update();
		g_charStatus.Update();

		g_gameUI.Update();
		if(MouseManager.Clicked != true)
			return;

		var chr = g_playerManager.GetChrFromScreenPos(MouseManager.x, MouseManager.y);
		if(!chr)
			return;

		g_charStatus.Show(chr);
	}
	
	this.Render = function()
	{
		Renderer.SetAlpha(1.0); 
		Renderer.SetColor("#bbbbbb"); 

		var ycnt = Math.abs(g_cameraX) % 2;
		for(var i = 0; i < Renderer.width; i += TILE_WIDTH)
		{
			var cnt = (ycnt%2);
			for(var j = 0; j < Renderer.height; j += TILE_HEIGHT)
			{
				if(cnt % 2)
					Renderer.Rect( i, j, TILE_WIDTH, TILE_HEIGHT);

				++cnt;
			}

			ycnt++;
		}	

		g_otherManager.Render();
		g_playerManager.Render();

		
		Renderer.SetAlpha(0.8); 
		Renderer.SetColor("#000000"); 
		Renderer.Rect(0, 0, Renderer.width, TILE_HEIGHT);

		Renderer.SetAlpha(1.0); 
		Renderer.Img(0, 0, g_imgs[IMG_COIN]);
		Renderer.SetColor("#ffffff"); 
		Renderer.SetFont('16pt Arial');
		Renderer.Text(24, 3, "x " + g_coin + "  거리 : "+g_distance); 
		g_gameUI.Render();
		g_pub.Render();
		g_inn.Render();
		g_charStatus.Render();

		g_effectManager.Render();
		Renderer.SetAlpha(1.0); 

		if(!g_gameOver)
			return; 

		Renderer.SetAlpha(0.8); 
		Renderer.SetColor("#000000"); 
		Renderer.Rect(0, 0, Renderer.width, Renderer.height);

		Renderer.SetAlpha(1); 
		Renderer.SetColor("#ff0000"); 
		Renderer.SetFont('16pt Arial');
		Renderer.Text(24, 150, "Game Over"); 
	} 


	this.goUp = function()
	{
		if(g_playerManager.PlayerNextStepAble(0, -1, g_otherManager))
			g_playerManager.PlayerNextStep(0, -1);

		NextTurn(false);
	}

	this.goDown = function()
	{
		if(g_playerManager.PlayerNextStepAble(0, 1, g_otherManager))
			g_playerManager.PlayerNextStep(0, 1);

		NextTurn(false);
	}

	this.goNext = function()
	{ 
		if(g_playerManager.PlayerNextStepAble(1, 0, g_otherManager))
		{
			g_cameraX++;
			g_playerManager.PlayerNextStep(1, 0); 
		}

		NextTurn(true); 
	}
};
