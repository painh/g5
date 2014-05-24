function GetPlayer(obj1, obj2)
{
	var ret = { player : null, other : null};

	if(obj1.isDead || obj2.isDead)
		return false;

	if(obj1.type == 'player')
	{
		ret.player = obj1;
		ret.other = obj2;
		return ret;
	} 

	if(obj2.type == 'player')
	{
		ret.player = obj2;
		ret.other = obj1;
		return ret;
	}

	return false;
}
var Obj = function()
{
	this.x = 0;
	this.y = 0;
	this.ax = 0;
	this.ay = 0;
	this.hp = 1;
	this.maxHP = 1;
	this.ap = 1;
	this.exp = 0;
	this.turnLife = -1;
	this.hpRegen = 0.0;
	this.forceStop = false;
	this.scaleDefalt = 1.0;
//	this.turnLife = 3;

	this.scale = 1.0;
	this.type = 0;
	this.level = 0;

	this.isPlayer = false;
	this.isDead = false;

	this.CalcMonStat = function()
	{
		this.hp = this.level * 3;
		console.log('calc monstat ' + this.hp);
		this.ap = this.level;
//		this.def = def;
		this.turnLife = 8;
	}

	this.Update = function()
	{
		this.scale -= 0.05;
		if(this.scale < 1.0)
			this.scale = 1.0;

	}

	this.Move = function()
	{ 
		switch(this.type)
		{
			case 'block':
			case 'merchant':
			case 'dark':
			case 'npc':
			case 'ddong':
				return; 

			case 'gold':
				if(this.level >= 3)
					return;
				break;
		}


		if(g_objList.ax == 0 && g_objList.ay == 0)
			return;
		if(this.forceStop)
			return;
		var x = this.x + g_objList.ax;
		var y = this.y + g_objList.ay;

		var ret = g_objList.CheckCollision(x, y, this);
		var finalFlag = false;
		for(var i in ret)
		{
			if(this.isDead)
				continue;

			var stopFlag = true;
			var target = ret[i];

			if(target.isDead)
				continue;

			if(target.type == 'block')
				stopFlag = true;

			if(target.type == 'dark')
				stopFlag = false;

			if(target.type == 'mon' && this.type == 'mon')
			{
				var level = Math.max(this.level, target.level) + 1;
				if(level <= 5)
				{
					console.log('mon level up');
					console.log([target.isDead, target.level]);
					console.log([this.isDead, this.level]);
					target.level = level;
					target.CalcMonStat();
					target.scale = 1.5;
					this.isDead = true;
				}
			}

			if(target.type == 'box' && this.type == 'box')
			{
				var level = Math.max(this.level, target.level) + 1;
				if(level <= 5)
				{
					this.isDead = true;
					target.level = level;
					target.scale = 1.5;
					stopFlag = true;
				} 
			}

			if(target.type == 'gold' && this.type == 'gold')
			{
				var level = Math.max(this.level, target.level) + 1;
				if(level <= 6)
				{
					this.isDead = true;
					target.level = level;
					stopFlag = true;
					target.scale = 2.0;
				} 
			}

			if(this.type == 'mon' && target.type == 'merchant')
			{
				target.hp -= 1;
				if(target.hp <= 0)
					target.isDead = true;

				this.forceStop = true; 
			}

			if(this.type == 'mon' && target.type == 'npc')
			{
				target.hp -= 1;
				if(target.hp <= 0)
				{
					$.growl('npc가 죽었습니다.');
					$.growl('퀘스트를 실패하였습니다!'); 
					g_objList.ClearObjectType('ddong');
					g_questCntMax = 0;
					g_questCnt = 0;
					g_questType = '';
					target.isDead = true;
				}
				else
					$.growl('npc가 공격 받고 있습니다.');

				this.forceStop = true; 
			}

			var obj =  GetPlayer(this, target);

			if(this.type == 'player' && target.type == 'box')
			{
				target.isDead = true;

				if(player == this) 
					stopFlag = false;
				else
					stopFlag = true;
			}

			if(obj)
			{ 
				var player = obj.player;
				var other = obj.other;
				var effectX = other.x - g_cameraX;
				var effectY = other.y - g_cameraY;

				if(other.type == 'merchant')
				{
					g_ingame.OpenShop();
				}

				if(other.type == 'npc')
				{
					g_player.forceStop = true;
					if(g_questCnt >= g_questCntMax)
					{
						other.isDead = true; 
						g_questCntMax = 0;
						$.growl('퀘스트를 완료하였습니다. + 10골드');
						AddGold(10);
						g_questType = '';
						g_objList.ClearObjectType('ddong');
						g_questCompleteCnt++;
					}
					else
						$.growl('아직 퀘스트를 완료하지 못하였습니다.'); 

					if(player == this) 
						stopFlag = true;
					else
						stopFlag = true;
				}

				if(other.type == 'ddong')
				{ 
					g_questCnt++; 
					other.isDead = true;
					stopFlag = false;
				}

				if(other.type == 'gold')
				{
					AddGold(other.level * 4);
					g_effectManager.Add(effectX, effectY, '#ffffff', 'gold + ' + other.level * 4);

					other.isDead = true;

					if(player == this) 
					{
						if(other.level >= 3)
						{
							stopFlag = true;
							g_player.forceStop = true;
						}
						else
							stopFlag = false;
					}
					else
						stopFlag = false;
				}

				if(other.type == 'box')
				{
					switch(other.level)
					{
						case 0:
						case 1:
							g_effectManager.Add(effectX, effectY, '#ffffff', 'get gold');
							AddGold(other.level);
							break;

						case 2:
						case 3:
							g_effectManager.Add(effectX, effectY, '#ffffff', 'get fever');
							ChangeFever(other.level);
							break;

						case 5:
							g_effectManager.Add(effectX, effectY, '#ffffff', 'get hp');
							AddHP(other.level);
							break;
					}

					if(player == this) 
					{
						stopFlag = true;
						g_player.forceStop = true;
					}
					else
						stopFlag = true;

					other.isDead = true; 
				}

				if(other.type == 'mon')
				{ 
					var playerDmg =  - player.ap;
					if(playerDmg < 0)
						other.hp += playerDmg; 

					if((other.hp <= 0 && player.hp > 0) || g_feverMode)
					{
						other.isDead = true;
						g_killMonCnt++; 

						if(g_questCntMax > 0 && g_questType == 'mon')
						{
							g_questCnt++;
							g_questCnt = Math.min(g_questCntMax, g_questCnt);
						}

						var levelUp = AddExp(other.level);
						if(levelUp)
							ChangeFever(3);// 
					}
					else
					{
						if(player == this) 
							stopFlag = true;
						else
							stopFlag = true;
					} 

					if(g_feverMode != true && other.isDead == false)
					{
						var dmg = - other.ap;
						if(dmg < 0) 
							AddHP(dmg);
						else 
							g_effectManager.Add(effectX, effectY, '#0f0', 'no damage!');
					}

				}

			}

			if(stopFlag)
				finalFlag = true;
		}

		if(finalFlag == false)
		{
			this.x = x;
			this.y = y;
			g_objList.moveCnt++;
		} 
	}

	this.Render = function()
	{ 
		Renderer.SetAlpha(1);

//			if(this.flip == false) 
//				Renderer.Img(x, y, img);
//			else
//				Renderer.ImgFlipH(x, y, img);

	
		var x = this.x - g_cameraX;
		var y = this.y - g_cameraY;
		var img = g_imgs[this.type];

		if(this.type == 'gold' || this.type == 'box' || this.type == 'mon')
			img = g_imgs[this.type+'_'+this.level];

//		if(this.type == 'mon')
//		{
//			var enemyAp = this.ap;
//			var enemyExp = this.level; 
//
//			if(g_player.def >= enemyAp)
//			{
//				if(this.hp + this.def <= g_player.ap) 
//					img = g_imgs['mon_onetunekill'];
//				else
//					img = g_imgs['mon_green'];
//			}
//			if(g_feverMode)
//				img = g_imgs['mon_onetunekill'];
//		}

		if(img)
			Renderer.ImgBlt(x - (TILE_WIDTH * this.scale - TILE_WIDTH ) / 2, 
						y - (TILE_HEIGHT * this.scale - TILE_HEIGHT) / 2, 
					img.img, 
					0, 0, img.width, img.height,	
					TILE_WIDTH * this.scale, TILE_HEIGHT * this.scale);
		else
		{
			Renderer.SetColor('#000');
			Renderer.Rect(x, y, TILE_WIDTH, TILE_HEIGHT); 
		}

		if(this.turnLife == 0 && this.type == 'mon')
		{
			Renderer.SetFont('8pt Arial');
			var text = 'range attack!';
			var textWidth = Renderer.GetTextWidth(text); 
			Renderer.SetColor('#000');
			Renderer.Rect(x, y + Renderer.GetFontSize() , textWidth, Renderer.GetFontSize());
			Renderer.SetColor('#f00');
			Renderer.Text(x, y + Renderer.GetFontSize() , text);
		}

		Renderer.SetFont('8pt Arial');
		var text = '';
		
		if(this.type == 'npc' || this.type == 'merchant')
			text = 'hp : ' + this.hp;

		if(this.type == 'player')
			text = this.hp + " / " + this.ap;
		
		if(this.type == 'mon')
			text = this.hp + " / " + this.ap + " / " + this.turnLife;
		
		if(this.type == 'box')
		{
			switch(this.level)
			{ 
				case 1:
				case 2:
					text = 'gold';
					break;

				case 3:
				case 4:
					text = 'fever';
					break;
					
				case 5:
					text = 'hp recover';
					break;
			}
		}

		if(this.type == 'gold')
			text = (this.level * 4) + ' gold';

		if(text != '')
		{
			var textWidth = Renderer.GetTextWidth(text); 
			Renderer.SetColor('#000');
			Renderer.Rect(x, y + TILE_HEIGHT - Renderer.GetFontSize() , textWidth, Renderer.GetFontSize());
			Renderer.SetColor('#0f0');
			Renderer.Text(x, y + TILE_HEIGHT - Renderer.GetFontSize() , text);
		}

//		Renderer.Text(x + TILE_WIDTH / 2 - textWidth / 2, 
//						y + TILE_HEIGHT / 2 - Renderer.GetFontSize() / 2 , this.hp);
	}

	this.DoTurn = function()
	{
		if(this.isDead)
			return;

		if(this.type == 'player')
		{
			this.hp += this.hpRegen;
			if(this.hp >= this.maxHP)
				this.hp = this.maxHP; 
		}

		var rangeAttack = false;
		if(this.turnLife >= 0)
		{
			this.turnLife--;
			if(this.turnLife < 0)
				this.turnLife = 0;

			if(this.turnLife == 0)
			{ 
				if(this.type == 'merchant')
					this.isDead = true; 

				if(this.type != 'mon')
					this.isDead = true; 

				if(this.type == 'mon' && !g_feverMode)
					rangeAttack = true;

			}
		}

		if(this.type == 'mon' && this.level >= 5)
			rangeAttack = true;

		if(rangeAttack)
		{ 
			var dmg =  - this.ap;
			if(dmg < 0) 
				AddHp(dmg);
			else 
				g_effectManager.Add(this.x, this.y, '#0f0', 'no damage!');
			this.scale = 2.0;
		}
	}
};

var ObjManager = function()
{ 
	this.total_point = 0;
	this.m_darkList = [];
	this.ax = 0;
	this.ay = 0;
	this.Clear = function()
	{
		this.m_list = [];
		this.m_darkList = [];
	}

	this.tryRandomGen = function(type)
	{
		var genList = ['gold'];
		var rand = randomRange(0, genList.length - 1);	
		var rand2 = randomRange(0, this.m_darkList.length - 1);	
		if(!type)
			type = genList[rand]; 

		var ret = false;
		var max = 1;

		if(type == 'box')
			max = 2;

		for(var i = 0; i < max; ++i)
		{
			var x = this.m_darkList[rand2].x + (randomRange(0, 2) - 1) * TILE_WIDTH;
			var y = this.m_darkList[rand2].y + (randomRange(0, 2) - 1) * TILE_HEIGHT;
			var list = this.CheckCollision(x, y);
			if(list.length == 1 && list[0].type == 'dark')
			{ 
				var obj = this.Add(x, y, type); 
				return true;
			}
		}

		return false;
	}

	this.RandomGen = function(type)
	{
		for(var i = 0; i < 10; ++i)
		{
			var ret = this.tryRandomGen(type);
			if(ret)
				return;
		}
	}

	this.Generate = function(x, y, type)
	{
		var obj = new Obj();
		
		obj.x = x;
		obj.y = y;
		obj.type = type; 

		if(type == 'player' || type =='gold' || type=='box')
			obj.level = 1; 

		switch(type)
		{
			case 'mon':
				obj.turnLife = 8;
//				obj.level = Math.min(Math.round(g_turn / 20), 5) + 1;
				obj.level = 1;
				obj.CalcMonStat();
				break;

			case 'merchant':
				obj.hp = 4;
				break;

			case 'npc':
				obj.hp = 2;
				break;

			default:
				obj.turnLife = -1; 
				break; 
		}

		return obj;
	}

	this.Add = function(x, y, type)
	{
		var obj = this.Generate(x, y, type);
		this.m_list.push(obj); 

		if(type == 'dark')
			this.m_darkList.push(obj);

		return obj;
	}

	this.Update = function()
	{
		var prevCnt = this.moveCnt;
		this.moveCnt = 0;

		var deadList = [];
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			item.Update();
			if(item.isDead)
				deadList.push(item);
		}

		for(var i in deadList)
			removeFromList(this.m_list, deadList[i]);

		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			if(item.isDead)
				console.log('dead alive');
		} 

		this.MoveObjects();

		if(prevCnt > 0 && this.moveCnt == 0)
		{ 
			this.ax = 0;
			this.ay = 0;

			for(var i in this.m_list)
			{
				var item = this.m_list[i];
				item.forceStop = false;
			} 
		} 
	}

	this.MoveObjects = function()
	{
		if(this.ax == 0 && this.ay == 0)
			return;

		var start, end, step, attr;
		if(this.ax > 0)
		{
			start = TILE_WIDTH * 7;
			end = 0;
			step = -this.ax;
			attr = 'x';
		}

		if(this.ax < 0)
		{
			start = 0;
			end = TILE_WIDTH * 7;
			step = -this.ax;
			attr = 'x';
		}

		if(this.ay > 0)
		{
			start = TILE_HEIGHT * 7;
			end = 0;
			step = -this.ay;
			attr = 'y';
		}

		if(this.ay < 0)
		{
			start = 0;
			end = TILE_HEIGHT * 7;
			step = -this.ay;
			attr = 'y';
		}

//		console.log([start, end, step, attr]);

		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			if(item.isDead)
				continue;
			item.moveCheck = false;
		} 
		
		for(var j = start; j != end; j+= step)
		{
			for(var i in this.m_list)
			{
				var item = this.m_list[i];
				if(item.isDead)
					continue;
				if(item.moveCheck)
					continue;

				if(step > 0 && item[attr] <= j)
				{
					item.Move();
					item.moveCheck = true;
				}

				if(step < 0 && item[attr] >= j)
				{
					item.Move();
					item.moveCheck = true;
				} 
			} 
		}
	}	

	this.Render = function()
	{
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			item.Render();
		} 
	}

	this.CheckCollision = function(x, y, obj)
	{ 
		var list = [];

		if(obj && obj.isDead)
			return list;

		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			if(item == obj)
				continue; 

			if(item.isDead)
				continue;
			
			if(!(x >= item.x + TILE_WIDTH || 
				x + TILE_WIDTH <= item.x || 
				y >= item.y + TILE_HEIGHT ||
				y + TILE_HEIGHT <= item.y))
				list.push(item); 
		}
		return list; 
	}

	this.GetChrByPos = function(x,y)
	{ 
		var list = [];
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			if((item.x == x) && (item.y == y))
				list.push(item);
		}

		return list;
	}

	this.Move = function(ax, ay)
	{
		var step  = 5;
		this.ax = ax * step;
		this.ay = ay * step; 
		console.log('move start');
	}

	this.CheckMoving = function()
	{
		if(this.moveCnt > 0)
			return true;

		return false;
	}

	this.GetObjByType = function(type)
	{
		var list = []
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			if(item.type == type)
				list.push(item);
		} 
		return list;
	}

	this.GetEnemyCnt = function()
	{
		var cnt = 0;
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			if(item.type.indexOf('lv') == 0)
				cnt++;
		} 
		return cnt;
	}

	this.DoTurn = function()
	{
		var cnt = 0;
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			item.DoTurn();
		} 
	}

	this.GetMerchantCnt = function()
	{ 
		var list = g_objList.GetObjByType('merchant');
		return list.length;
	}

	this.GetNPCCnt = function()
	{ 
		var list = g_objList.GetObjByType('npc');
		return list.length;
	}

	this.GetAllGold = function()
	{ 
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			if(item.type != 'gold')
				continue;
				
			AddGold(item.level * 4);
			g_effectManager.Add(item.x - g_cameraX, item.y - g_cameraY, '#ffffff', 'gold + ' + item.level);
		} 

		this.ClearObjectType('gold'); 
	} 

	this.ClearObjectType = function(type)
	{
		var deadList = [];
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			if(item.type != type)
				continue;
				
			item.isDead = true;
			deadList.push(item);
		} 

		for(var i in deadList)
			removeFromList(this.m_list, deadList[i]);

		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			if(item.isDead)
				console.log('dead alive');
		} 
	}
}; 
