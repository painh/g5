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

function AddGold(x, y) {
	var obj = g_objList.Add(x, y, 'coin');	
	if(randomRange(0, 1) == 0)
		obj.ax = -1;
	else
		obj.ax = 1;

	obj.ay = -5;
	obj.default_ay = 0.3;
	obj.max_ay = 5;
	obj.hp = 0;
	obj.max_ay = 10;
}
var Obj = function()
{
	this.x = 0;
	this.y = 0;
	this.ax = 0;
	this.ay = 0;
	this.default_ay = 0;
	this.hp = 1;
	this.maxHP = 1;

	this.width = TILE_WIDTH;
	this.height = TILE_HEIGHT;

	this.col_x = 0;
	this.col_y = 0;
	this.col_width = TILE_WIDTH;
	this.col_height = TILE_HEIGHT;

	this.scaleDefalt = 1.0;
	this.renderX = this.x;
	this.renderY = this.y;
	this.scale = 1.0;
	this.type = 0;
	this.level = 0;
	this.state = 'unknown';
	this.stateChangeDate = new Date();

	this.isPlayer = false;
	this.isDead = false;
	this.visible = false;

	this.firstFrame = true;

	this.SetState = function(state) {
		this.state = state;
		this.stateChangeDate = new Date(); 
	}

	this.DustEffect = function() {
		effect = g_effectManager.Add( this.x + this.width / 2 + 5 - randomRange(0, 10),
							this.y + this.height / 2 + 5 - randomRange(0, 10),
							'#000', '', g_imgs['dust'], this.width * 2, this.height * 2);
		effect.world = true; 
	}

	this.Damaged = function(dmg) {
		if(this.isDead)
			return;

		this.SetState('damaged');
		this.hp -= dmg;
		var effect = g_effectManager.Add(this.x + this.width / 2 + 5 - randomRange(0, 10), 
											this.y, "#ff0000", "-"+dmg);
		effect.world = true;

		console.log('dmaged!' + dmg);

		if(this.hp <= 0) {
			this.isDead = true; 
			this.DustEffect();
			AddGold(this.x, this.y);

			if(this.type == 'cragon') {
				g_cragonTime = g_now.getTime() + CRAGON_TIME;
				for(var i = 0; i < 30; ++i)
					AddGold(randomRange(0, this.width), randomRange(this.y, this.y + this.height));
			}
		}
	}

	this.Update = function()
	{ 
		if(this.visibleDelay < totalFPS) {
			this.visible = true;
		}
		else
			return;

		if(this.firstFrame) {
			this.firstFrame = false;
			this.SetState('normal');
			if(this.type == "meteo") {
				g_effectManager.Add( this.x + this.width / 2, Renderer.height / 2 , '#000', '', g_imgs['warn'], this.width / 2, this.height / 2);
				g_effectManager.Add( this.x + this.width / 2 - g_imgs['redline'].width / 2, 0, '#000', '', g_imgs['redline']);
			}
		}

		if(this.isDead)
			return;

		if(!this.visible)
			return;

		if(this.type == 'coin' && this.state == 'idle' && g_now - this.stateChangeDate > 5000) {
			this.isDead = true;
			return;
		}

		
		if(this.type == 'meteo' && this.state == 'normal' && this.stateChangeDate - g_now > 1000) {
			this.y = g_player.y - 500;
			this.SetState('down');
		}


		this.scale -= 0.05;
		if(this.scale < 1.0)
			this.scale = 1.0;

		this.ay += this.default_ay;
		this.ay = Math.min(this.max_ay, this.ay);

		var prevX = this.x;
		var prevY = this.y;

		if(this.state == 'normal' || this.state == 'down') {
			this.x += this.ax;
			this.y += this.ay;

			this.x = Math.max(0, this.x);
			this.x = Math.min(Renderer.width - this.width, this.x);
		}

		if(this.type == "player") {
			var list = g_objList.CheckCollision(this.x, this.y, this);
			if(list.length > 0) {
				for(var i = 0; i < list.length; ++i) {
					var obj = list[0];

					if(obj.type == 'coin' ) {
						var eatable = true;
						if(obj.state == 'normal') 
							if(g_now - obj.stateChangeDate < 1000)
								eatable = false;

						if(eatable) {
							obj.isDead = true;
							g_coin++;
							var eff = g_effectManager.Add(g_player.x, g_player.y, '#ff0', '+ 1');
							eff.world = true;
							eff.font='20pt Arial';
						}
					} else if(obj.type == 'meteo') {
						obj.isDead = true;
						this.DustEffect();
//						this.Damaged(1);
						this.ay = 10;
					}
					else {
						if(this.ay < 0) { 
							this.y = obj.y + obj.height;
//							this.ay = 10;
						}
//						else
//							if(obj.type.indexOf("mon_") == 0)
//								this.ay = -5;
//							else {
//								this.y = obj.y + obj.height;
////								this.ay = 10;
//							}
					}
				}

			}
		}

		if(this.y >= PLAYER_MAX_Y) {
			if(this.type == "coin") {
				this.ay = 0;
				this.y = PLAYER_MAX_Y;
				if(this.state == 'normal') {
					this.SetState('idle');
				}
			}

			if(this.type == "player") {
				this.ay = 0;
				this.y = PLAYER_MAX_Y;
			}

			if(this.type.indexOf("mon_") == 0) {
				this.ay = 0;
				this.y = PLAYER_MAX_Y;
				this.isDead = true;
				g_player.Damaged(1);
				this.DustEffect();
			}

			if(this.type == "cragon") {
				this.ay = 0;
				this.y = PLAYER_MAX_Y;
				this.isDead = true;
				g_player.Damaged(999);
				this.DustEffect();
			}
		}

		if(this.y >= PLAYER_MAX_Y + 10) {
			if(this.type == "meteo") {
				this.DustEffect();
				this.isDead = true;
			} 
		} 

		this.renderX = this.x - g_cameraX;
		this.renderY = this.y - g_cameraY;
		var cur = new Date;

		switch(this.state)
		{
			case 'normal':
				break;

			case 'damaged':
				if(cur.getTime() - this.stateChangeDate.getTime() > 100)
					this.SetState('normal');
				else {
					this.renderX += randomRange(0, 10) - 5; 
					this.renderY += randomRange(0, 10) - 5; 
				}
				break;

		} 
	}

	this.Render = function()
	{ 
		if(this.isDead)
			return;

		if(!this.visible)
			return;

		Renderer.SetAlpha(1);
	
		var x = this.renderX;
		var y = this.renderY;
		var img = g_imgs[this.type];


		if(img)
			Renderer.ImgBlt(x - (this.width * this.scale - this.width ) / 2, 
						y - (this.height * this.scale - this.height) / 2, 
					img.img, 
					0, 0, img.width, img.height,	
					this.width * this.scale, this.height * this.scale);
		else
		{
			Renderer.SetColor('#000');
			Renderer.Rect(x, y, this.width, this.height); 
		}

		Renderer.SetColor('#0f0');
		Renderer.Text(x + this.width / 2, y + this.height - 20, this.hp); 

	}

};

var ObjManager = function()
{ 
	this.ax = 0;
	this.ay = 0;
	this.m_list = [];

	this.Clear = function()
	{
		this.m_list = [];
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
				obj.level = g_genMonLevel;
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

		obj.visibleDelay = 0;

		return obj;
	}

	this.Add = function(x, y, type)
	{
		var obj = this.Generate(x, y, type);
		this.m_list.push(obj); 

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

			if(item.state == 'unknown')
				continue;
			
			if(!(x >= item.x + item.col_x + item.col_width || 
				x + obj.col_x + obj.col_width <= item.x || 
				y >= item.y + item.col_y + item.col_height ||
				y + obj.col_y + obj.col_height <= item.y))
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
