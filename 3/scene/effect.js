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


