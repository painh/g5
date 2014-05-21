var Obj = function()
{
	this.x = 0;
	this.y = 0;
	this.ax = 0;
	this.ay = 0;
	this.hp = 10;
	this.maxHP = 10;
	this.ap = 10;
	this.exp = 0;
	this.turnLife = 0;
	this.hpRegen = 0.5;
//	this.turnLife = 3;

	this.scale = 1.0;
	this.type = 0;
	this.level = 0;

	this.isPlayer = false;
	this.isDead = false;

	this.Update = function()
	{
		this.scale -= 0.1;
		if(this.scale < 1.0)
			this.scale = 1.0;


		switch(this.type)
		{
			case 'block':
			case 'box':
			case 'box2':
			case 'merchant':
			case 'dark':
				this.ax = 0;
				this.ay = 0;
				return;

		}

		if(this.ax == 0 && this.ay == 0)
			return;
		var x = this.x + this.ax;
		var y = this.y + this.ay;

		var ret = g_objList.CheckCollision(x, y, this);
		var finalFlag = false;
		for(var i in ret)
		{
			var flag = false;
			switch(ret[i].type)
			{
				case 'block':
				case 'box':
				case 'box2':
				case 'merchant':
					flag = true;
					break;

				case 'gold':
				case 'turn':
				case 'heart':
					if(this.type != 'player')
						flag = true;
					break;

				case 'mon':
					if(this.type == 'gold' ||
						(this.type == 'turn') ||
						(this.type == 'heart') )
						flag = true;
					break;
			} 

			if(ret[i].type == 'mon' && this.type == 'mon')
			{
					ret[i].isDead = true;
					var level = this.level;
					if(level < ret[i].level)
						level = ret[i].level;
					this.level = level + 1;
					this.maxHP = this.level * 10;
					this.hp = this.maxHP;
					this.turnLife = 8;
					flag = false;
			}

			if(ret[i].type == 'turn' && this.type == 'turn')
			{
					ret[i].isDead = true;
					this.level += ret[i].level;
					flag = false;
			}

			if(ret[i].type == 'heart' && this.type == 'heart')
			{
					ret[i].isDead = true;
					this.level += ret[i].level;
					flag = false;
			}

			if(ret[i].type == 'gold' && this.type == 'gold')
			{
					ret[i].isDead = true;
					this.level += ret[i].level;
					flag = false;
			}

			if((this.type == 'player' && ret[i].type == 'merchant') ||
				(this.type == 'merchant' && ret[i].type == 'player'))
			{
				var target = ret[i];
				if(this.type != 'player')
					target = this;

				target.isDead = true;

				g_ingame.OpenShop();
			}

			if((this.type == 'player' && ret[i].type == 'gold') ||
				(this.type == 'gold' && ret[i].type == 'player'))
			{
				var gold = ret[i];
				if(this.type != 'player')
					gold = this;

				g_gold += ret[i].level;
				g_goldAll += ret[i].level;

				if(g_prevMerchantSpawnGoldAll - g_goldAll > 10)
				{
					g_objList.AddMerchant();
					g_prevMerchantSpawnGoldAll = g_goldAll;
				}

				gold.isDead = true;
				flag = false;
			}

			if((this.type == 'player' && ret[i].type == 'turn') ||
				(this.type == 'turn' && ret[i].type == 'player'))
			{
				var turn = ret[i];
				if(this.type != 'player')
					turn = this;

				g_turn += ret[i].level;
				turn.isDead = true;
				flag = false;
			}

			if((this.type == 'player' || this.type == 'mon' )&& ret[i].type == 'box2')
				ret[i].isDead = true;

			if((this.type == 'player' || this.type == 'mon') && ret[i].type == 'box')
				ret[i].type = 'box2';

			if((this.type == 'player' && ret[i].type == 'heart') ||
				(this.type == 'heart' && ret[i].type == 'player'))
			{ 
				var heart = ret[i];
				if(this.type != 'player')
					heart = this;

				g_player.hp += heart.level;
				if(g_player.hp >= g_player.maxHP)
					g_player.hp = g_player.maxHP;
				heart.isDead = true;
				flag = false;
			} 

			if((this.type == 'player' && ret[i].type == 'mon') || 
				(this.type == 'mon'  && ret[i].type == 'player'))
			{
				var player = this;
				var enemy = ret[i];
				if(this.type != 'player')
				{
					player = ret[i];
					enemy = this;
				}

				enemy.hp -= player.ap; 
				if(enemy.hp <= 0 && g_player.hp > 0)
				{
					enemy.isDead = true;

					g_player.exp += enemy.level;
					
					var maxExp = g_player.level * 2;
					if(g_player.exp >= maxExp)
					{
						g_player.level++;
						g_player.exp = 0;
						g_player.maxHP += 10;
						g_player.hp = g_player.maxHP;
						g_player.ap += 10;

						g_objList.AddMerchant();
					}

					for(var i = 0; i < 3; ++i)
					{
//						g_objList.RandomGen('turn');
						g_objList.RandomGen('gold');
					}
				}
				else
				{
					flag = true;
				} 
				g_player.hp -= enemy.level * 3; 
				if(g_player.hp < 0)
					g_player.isDead = true;
			}

			if(flag)
				finalFlag = true;
		}

		if(finalFlag == false)
		{
			this.x = x;
			this.y = y;
		} 
		else
		{
			this.ax = 0;
			this.ay = 0;
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

		if(this.type == 'mon' && g_player.hp > 0)
		{
			var enemyAp = this.level * 3;
			var enemyExp = this.level; 
			var maxExp = g_player.level * 2;

			if((g_player.exp + enemyExp >= g_player.level * 2)  && g_player.ap >= this.hp)
				img = g_imgs['mon_green'];

			if(g_player.hp > enemyAp)
				img = g_imgs['mon_green']
		}

		Renderer.ImgBlt(x - (TILE_WIDTH * this.scale - TILE_WIDTH ) / 2, 
					y - (TILE_HEIGHT * this.scale - TILE_HEIGHT) / 2, 
				img.img, 
				0, 0, img.width, img.height,	
				TILE_WIDTH * this.scale, TILE_HEIGHT * this.scale);

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

		if(this.turnLife > 0)
		{
			Renderer.SetFont('8pt Arial');
			var text = 'turn.'+this.turnLife;
			var textWidth = Renderer.GetTextWidth(text); 
			Renderer.SetColor('#000');
			Renderer.Rect(x, y + Renderer.GetFontSize() , textWidth, Renderer.GetFontSize());
			Renderer.SetColor('#0f0');
			Renderer.Text(x, y + Renderer.GetFontSize() , text);
		}

		if(this.level > 0)
		{
			Renderer.SetFont('8pt Arial');
			var text = 'lv.'+this.level;
			var textWidth = Renderer.GetTextWidth(text); 
			Renderer.SetColor('#000');
			Renderer.Rect(x, y , textWidth, Renderer.GetFontSize());
			Renderer.SetColor('#0f0');
			Renderer.Text(x, y , text);


			if(this.type != 'gold' && this.type != 'turn')
			{
				var hpHeight = 5;
				Renderer.SetColor('#f00');
				Renderer.Rect(x, y + TILE_HEIGHT - hpHeight , TILE_WIDTH, hpHeight);
				var width = this.hp / this.maxHP * TILE_WIDTH;
				if(width > 0)
				{
					Renderer.SetColor('#0f0');
					Renderer.Rect(x, y + TILE_HEIGHT - hpHeight , width, hpHeight);
				}
			}
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

		if(this.turnLife >= 0)
		{
			this.turnLife--;
			if(this.turnLife < 0)
				this.turnLife = 0;

			if(this.turnLife == 0)
			{ 
				if(this.type == 'merchant')
					this.isDead = true; 

				if(this.type == 'mon')
				{
					g_player.hp -= (this.level * 3) / 3;
					this.scale = 2.0;
				}
			}
		}
	}
};

var ObjManager = function()
{ 
	this.total_point = 0;
	this.m_darkList = [];
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
			var list = this.GetChrByPos(x, y);
			if(list.length == 1 && list[0].type == 'dark')
			{ 
				var obj = this.Add(x, y, type); 
				
				if(type == 'mon')
				{
					obj.level = g_player.level + Math.round(g_player.level / 3);
					if(obj.level <= 0)
						obj.level = 1;
					obj.maxHP = obj.level * 10; 
					obj.hp = obj.maxHP; 
				}
				ret = true;
				break;
			}
		}

		return ret;
	}

	this.RandomGen = function(type)
	{
		for(var i = 0; i < 10; ++i)
			if(this.tryRandomGen(type))
				return;
	}

	this.Generate = function(x, y, type)
	{
		var obj = new Obj();
		
		obj.x = x;
		obj.y = y;
		obj.type = type; 

		if(type == 'player' || type == 'mon' || type =='gold' || type=='turn' || type=='heart')
			obj.level = 1; 

		switch(type)
		{
			case 'dark':
			case 'block':
			case 'player':
			case 'box':
			case 'box2':
			case 'turn': 
				obj.turnLife = 0;
				break;

			case 'merchant':
				obj.turnLife = 4;
				break;

			case 'mon':
				obj.turnLife = 8;
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

	this.Update = function(minPos)
	{
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

		return minPos; 
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
		if(obj.isDead)
			return;
		var list = [];
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
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			item.ax = ax * step;
			item.ay = ay * step; 
		}
	}

	this.CheckMoving = function()
	{
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			if(item.ax != 0 || item.ay != 0)
				return true;
		} 
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

	this.AddMerchant = function()
	{ 
		var merchant = g_objList.GetObjByType('merchant');
		if(merchant.length == 0)
			g_objList.RandomGen('merchant');
		else
			merchant.turnLife = 4;
	}

}; 
