var g_sizeTable = [ {r : 0, c : '#FF50CF'},
					{r : 1, c : '#79FFCE'},
					{r : 2, c : '#AACDFF'},
					{r : 3, c : '#FFCD00'},
					{r : 4, c : '#CCBB88'},
					{r : 5, c : '#8844BB'},
					{r : 6, c : '#FF22AA'},
					{r : 7, c : '#88CC77'},
					{r : 8, c : '#111111'},
					{r : 9, c : '#44FF99'},
					{r : 10, c : '#88DD88'},
					{r : 11, c : '#44BBFF'}, 
					{r : 12, c : '#7799AA'}, 
					{r : 12, c : '#FF33AA'}
				];

var size = 15;
for(var i  in g_sizeTable)
{
	g_sizeTable[i].r = size;
	size += 2;
}
var Obj = function()
{
	this.screenPos = 0;
	this.x = 0;
	this.y = 0;
	this.ax = 0;
	this.ay = 0;
	this.r = 0;
	this.width = 1;
	this.height = 1;
	this.hp = 3;

	this.type = 0;

	this.isPlayer = false;
	this.isDead = false;
	this.scaleSize = 0;
	this.scaleState = 'normal';

	this.Picked = function()
	{
		this.picked = true;
		this.scaleSize = 0;
		this.scaleState = 'picked';
	}

	this.Unpicked = function()
	{
		if(this.scaleState != 'picked')
			return;

		this.picked = false;
		this.scaleState = 'unpicked';
	}

	this.Update = function()
	{
		var scaleUnit = 1.8;


		switch(this.scaleState)
		{
			case 'normal':
				if(this.scaleSize > 0)
				{
					this.scaleSize -= scaleUnit;
					if(this.scaleSize < 0) this.scaleSize = 0;
				} 
				else
				{
					this.scaleSize += scaleUnit;
					if(this.scaleSize > 0) this.scaleSize = 0;
				}

				break;

			case 'unpicked':
//				this.scaleSize -= scaleUnit;
//				if(this.scaleSize < 0)
//				{
//					this.scaleSize = 0;
					this.scaleState = 'normal';
//				}
				break;

			case 'picked':
//				this.scaleSize += scaleUnit;
//				if(this.scaleSize > 10)
//					this.scaleSize = 10; 
				break;

			case 'tie':
				this.scaleSize -= scaleUnit;
				if(this.scaleSize < -10)
				{
					this.scaleState = 'normal';
					if(this.hp <= 0)
						this.isDead = true;
				}
				break;

			case 'win':
				this.scaleSize += scaleUnit;
				if(this.scaleSize > 10)
					this.scaleState = 'normal';
				break;

			case 'dead':
				this.scaleSize -= scaleUnit;
				if(this.scaleSize < -10)
				{
					this.scaleState = 'normal';
					this.isDead = true;
				}
				break;
		}

		switch(this.type)
		{
			case 'heart':
			case 'block':
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
					flag = true;
					break;
			}
			

			if(ret[i].type.indexOf('lv') == 0 && this.type.indexOf('lv') == 0)
			{
				if(this.type == ret[i].type)
				{
					ret[i].isDead = true;
					this.type = 'lv2';
					this.hp = 15;
				}
				else
					flag = true;
			}

			if(this.type == 'player' && ret[i].type == 'heart')
			{ 
				g_playerHP++;	
				if(g_playerHP >= 10)
					g_playerHP = 10;
				ret[i].isDead = true;
			} 

			if((this.type == 'player' && ret[i].type.indexOf('lv') == 0) || 
				(this.type.indexOf('lv') == 0 && ret[i].type == 'player'))
			{
				var player = this;
				var enemy = ret[i];
				if(this.type != 'player')
				{
					player = ret[i];
					enemy = this;
				}

				enemy.hp -= 5;

				if(enemy.hp < 0)
					enemy.isDead = true;
				else
					flag = true;

				g_playerHP -= 3; 
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

	
		Renderer.SetColor(this.color);
		var x = this.x - g_cameraX;
		var y = this.y - g_cameraY;

		Renderer.Circle(x, y , this.r * (10 + this.scaleSize) / 10);

		var textWidth = Renderer.GetTextWidth(this.screenPos);
		Renderer.SetColor('#ffffff');
		Renderer.Text(x, y , this.r);
		Renderer.Img(x, y, g_imgs[this.type]);
//		Renderer.Text(x + TILE_WIDTH / 2 - textWidth / 2, 
//						y + TILE_HEIGHT / 2 - Renderer.GetFontSize() / 2 , this.hp);
	}

	this.Combine = function(obj)
	{
		obj.isDead = true;
		this.grade++;
		if(this.grade >= g_sizeTable.length)
			this.grade = g_sizeTable.length - 1;
		this.r = g_sizeTable[this.grade].r;
		this.color = g_sizeTable[this.grade].c; 
	}
};

var ObjManager = function()
{ 
	this.total_point = 0;
	this.Clear = function()
	{
		this.m_list = [];
	}

	this.Add = function(x, y, type)
	{
		var obj = new Obj();
		
		obj.x = x;
		obj.y = y;
		obj.type = type;

		this.m_list.push(obj); 
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

	this.GetChrFromScreenPos = function(_x, _y)
	{
		var x = parseInt(_x) + g_cameraX;
		var y = parseInt(_y) + g_cameraY;

		return this.GetChrByPos(x, y);
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
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			if((item.x == x) && (item.y == y))
				return item;
		}

		return null;
	}

	this.PickChar = function(chr)
	{
		if(chr.picked == true)
			return;

		for(var i in this.m_list)
		{
			if(this.m_list[i] == chr)
				this.m_list[i].Picked();
			else
				this.m_list[i].Unpicked();
				//chr.picked = false;
		}

		removeFromList(this.m_list, chr);
		this.m_list.push(chr);

		console.log('chr picked');
		console.log(chr);
		return chr;
	} 

	this.ClearPickedObj = function()
	{ 
		for(var i in this.m_list)
			this.m_list[i].Unpicked();
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
			{
				console.log(item);
				return true;
			}
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
