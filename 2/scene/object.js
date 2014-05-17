var Obj = function()
{
	this.x = 0;
	this.y = 0;
	this.ax = 0;
	this.ay = 0;
	this.hp = 10;
	this.exp = 0;

	this.type = 0;
	this.level = 0;

	this.isPlayer = false;
	this.isDead = false;

	this.Update = function()
	{
		switch(this.type)
		{
			case 'heart':
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
		var flag = false;
		for(var i in ret)
		{
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
					if(this.type != 'player')
						flag = true;
					break;

				case 'mon':
					if(this.type == 'gold' ||
						(this.type == 'turn'))
						flag = true;
					break;
			} 

			if(ret[i].type == 'mon' && this.type == 'mon')
			{
//				if(this.level == ret[i].level)
				{
					ret[i].isDead = true;
					this.level += ret[i].level;
					this.hp = this.level * 10;
				}
//				else
//					flag = true;
			}

			if(ret[i].type == 'turn' && this.type == 'turn')
			{
//				if(this.level == ret[i].level)
				{
					ret[i].isDead = true;
					this.level += ret[i].level;
				}
//				else
//					flag = true;
			}

			if(ret[i].type == 'gold' && this.type == 'gold')
			{
//				if(this.level == ret[i].level)
				{
					ret[i].isDead = true;
					this.level += ret[i].level;
				}
//				else
//					flag = true;
			}

			if((this.type == 'player' && ret[i].type == 'gold') ||
				(this.type == 'gold' && ret[i].type == 'player'))
			{
				var gold = ret[i];
				if(this.type != 'player')
					gold = this;

				g_gold += ret[i].level;
				gold.isDead = true;
			}

			if((this.type == 'player' && ret[i].type == 'turn') ||
				(this.type == 'turn' && ret[i].type == 'player'))
			{
				var turn = ret[i];
				if(this.type != 'player')
					turn = this;

				g_turn += ret[i].level;
				turn.isDead = true;
			}

			if((this.type == 'player' || this.type == 'mon' )&& ret[i].type == 'box2')
				ret[i].isDead = true;

			if((this.type == 'player' || this.type == 'mon') && ret[i].type == 'box')
				ret[i].type = 'box2';

			if(this.type == 'player' && ret[i].type == 'heart')
			{ 
				g_player.hp++;	
				var maxHP = g_player.level * 10;
				if(g_player.hp >= maxHP)
					g_player.hp = maxHP;
				ret[i].isDead = true;
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

				enemy.hp -= player.level * 10;
				g_player.hp -= enemy.level * 3; 

				if(enemy.hp <= 0)
				{
					enemy.isDead = true;
					for(var i = 0; i < 3; ++i)
					{
						g_objList.RandomGen('turn');
						g_objList.RandomGen('gold');
					}

					g_player.exp += enemy.level;
					
					var maxExp = g_player.level * 2;
					if(g_player.exp >= maxExp)
					{
						g_player.level++;
						g_player.exp = 0;
						var maxHP = g_player.level * 10;
						g_player.hp = maxHP;
					}
				}
				else
				{
					flag = true;
				}

			}
		}

		if(flag == false)
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

		Renderer.Img(x, y, g_imgs[this.type]);

		if(this.level > 0)
		{
			Renderer.SetFont('5pt Arial');
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
				var maxHP = this.level * 10;
				Renderer.Rect(x, y + TILE_HEIGHT - hpHeight , TILE_WIDTH, hpHeight);
				var hp = this.hp;
				if(this.type == 'player')
					hp = g_player.hp;
				var width = hp / maxHP * TILE_WIDTH;
				Renderer.SetColor('#0f0');
				Renderer.Rect(x, y + TILE_HEIGHT - hpHeight , width, hpHeight);
			}
		}

//		Renderer.Text(x + TILE_WIDTH / 2 - textWidth / 2, 
//						y + TILE_HEIGHT / 2 - Renderer.GetFontSize() / 2 , this.hp);
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
		var genList = ['gold', 'heart'];
		var rand = randomRange(0, genList.length - 1);	
		var rand2 = randomRange(0, this.m_darkList.length - 1);	
		if(!type)
			type = genList[rand];


		var ret = false;
		var max = 1;

		if(type == 'box')
			max = 3;

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
					obj.level = g_player.level + (randomRange(0, 2) - 1);
					obj.level = Math.max(1, obj.level);
					obj.hp = obj.level * 10; 
				}
				ret = true;
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

	this.Add = function(x, y, type)
	{
		var obj = new Obj();
		
		obj.x = x;
		obj.y = y;
		obj.type = type;

		this.m_list.push(obj); 
		if(type == 'player' || type == 'mon' || type =='gold' || type=='turn')
			obj.level = 1;

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

}; 
