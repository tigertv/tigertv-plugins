function HDBatkaPlugin() {
	MediaSite.call(this);
	var _this = this;
	_this._name = 'HDBatkaPlugin';
	_this._url = 'http://hdbatka.me';
}

HDBatkaPlugin.prototype = {

	getFullMediaItem : function (item) {
		var _this = this;
		var content = Helper.getURL(item.url);
		
		var i = {};
		i.description = {};
		i.description.rating = {};
		i.description.rating.kinopoisk = {};
		i.description.rating.imdb = {};
		i.description.title = item.title;
		
		var re = /<img itemprop=\"image\" src=\"(.*?)\".*? alt=\"(.*?)\"[\s\S]*?<div itemprop=\"description\">([\s\S]*?)<\/div>[\s\S]*?<ul class=\"kino-lines\">([\s\S]*?)<\/ul>/m;
		var found = content.match(re);
		
		var content2 = '';
		
		if (found != null) {
			i.description.plot = Helper.clearTags( found[3] );
			content2 = found[4];
		}
		
		re = /<li><b>(.*?)\:<\/b>([\s\S]*?)<\/li>/g;
		var myArray = [];
		while ((myArray = re.exec(content2)) !== null) {

			switch ( myArray[1] ) {
			case 'Год выпуска':
				i.description.year = Helper.clearTags( myArray[2] );
				break;
				
			case 'Страна':
				i.description.countries = Helper.clearTags( myArray[2] );
				break;
				
			case 'Режиссер':
				i.description.directors = Helper.clearTags( myArray[2] );
				break;
			
			case 'Жанр':
				i.description.genres = Helper.clearTags( myArray[2] );
				break;
				
			case 'В ролях':
				i.description.actors = Helper.clearTags( myArray[2] );
				break;
				
			case 'Название (оригинальное)':
				i.description.original = Helper.clearTags( myArray[2] );
				break;
			}
			
		}
		
		// get seasons 
		var seasons = new Playlist("seasons", 'Сезоны');
		
		///////////////////////
		var pl = new Playlist();
		pl.title = 'нет';
		
		var items = _this.getPlaylist(item, content);
		pl.setItems(items);
		pl.isLoaded = true;

		seasons.addItem(pl);
		seasons.setLastIndex();
		///////////////////////
		
		seasons.isLoaded = true;
		i.playlist = seasons;
		
		return i;
		
	},	
		
	getPlaylist : function (item, content2) {
		var playlist = [];
		var url = '';
		var re = /<iframe width="640" height="400" src=\"(http:\/\/hdgo\.cc.*?)\"/m;
		var found = content2.match(re);
		if (!found) return '';
		
		url = found[1];
		var content = Helper.getURL(url);
		
		re = /<iframe src=\"(.*?)\"/m;
		found = content.match(re);
		if (!found) return '';
		url = 'http:' + found[1];
		
		content = Helper.getURL(url);
		
		re = /url: \'(.*?)\'/g;
		var myArray = [];
		
		while ((myArray = re.exec(content)) !== null) {
			var item2 = new Item();
			item2.url = myArray[1];
			item2.title = 'Ссылка';
			item2.ad = '';
			playlist.push(item2);
		}
		
		return playlist;
    },
    
    getPlaylistA : function (item, callback) {
    	var pl = this.getPlaylist(item);
    	callback(pl);
    },

    getItems : function (params, firstPage, pageCount) {
    	var _this = this;
    	var isSearch  = false;
    	var url = _this._url;
    	
    	if (params[0].action === 'search') {
    		isSearch = true;
    		url += '/index.php?do=search'; 
    	} else {
        	var category = params[0].value;
        	if (category == 'all') {
        		url += '/';
        	} else {
        		url += '/'+category;
        	}
    		
    	}
    	
		var items = [];
		
		for (var page=firstPage;page<firstPage+pageCount;page++) {
			var link = url;
			var content = '';
			
    		if (isSearch) {
    			//link += params[0].value + '&page=' + page;
    			var data3 = {
    				'do' : 'search'
    				,'subaction' : 'search'
    				,'story' : params[0].value
    				,'search_start': page
    				,'full_search': 0
    				,'result_from': (page-1)*15+1
    			};
    			
    			content  = Helper.postURL2(link, data3);
    			
    		} else {
    			link += '/page/' + page + '/';
    			content = Helper.getURL(link);
    		}

			var re = /<b class=\"zagolovki\"><a href=\"(.*?)\".*?>(.*?)<[\s\S]*?<img src=\"(.*?)\"[\s\S]*?>([\s\S]*?)<ul/gm;
			var myArray = [];

			while ((myArray = re.exec(content)) !== null) {
				var item = new Item();
				item.id = '';
				item.url = myArray[1];
				item.image = myArray[3];
				item.title = myArray[2];
				item.source = _this._name;
				item.shortDescription = Helper.clearTags(myArray[4]);
				
				if (item.image.charAt(0) === '/') item.image = _this._url + item.image;
				
				items.push(item);
			}
		
		}

		return items;
    },
    
    parseDescription : function (content) {
    	var re = /<div class=\"b-post__des.ription_text\">([\s\S]*?)<\/div>/m;
		var found = content.match(re);
		var plot = undefined;
		if (found != null) {
			plot = Helper.clearTags(found[1]);
		}
		return plot;
    },
    
    getSeasons : function (item) {
    	//*
		var seasons = [];
		var noitem = {
			"url" : '',
			"title" : 'нет',
			"id" : "",
			"source" : this._name
		};
		seasons.push(noitem);
		return seasons;
		//*/
    },
    
    getItemImages : function (item) {
    	return {
    		small : item.image, 
    		big : item.image
    	};
    },
    
    getCategories : function () {
		return [
			{
				"name":"genres",
				"title":"Категории",
				"values": [
					{"value":"all","title":"Все"}
					,{"value":"anime","title":"Аниме"}
					,{"value":"biografiya","title":"Биография"}
					,{"value":"boeviki","title":"Боевики"}
					,{"value":"vesterny","title":"Вестерны"}
					,{"value":"voennye","title":"Военные"}
					,{"value":"detektivy","title":"Детективы"}
					,{"value":"detskie","title":"Детские"}
					,{"value":"dokumentalnye","title":"Документальные"}
					,{"value":"dramy","title":"Драмы"}
					,{"value":"istoricheskie","title":"Исторические"}
					,{"value":"komedii","title":"Комедии"}
					,{"value":"kriminalnye","title":"Криминал"}
					,{"value":"melodramy","title":"Мелодрамы"}
					,{"value":"muzykalnye","title":"Музыкальные"}
					,{"value":"multfilmy","title":"Мультфильмы"}
					,{"value":"priklyucheniya","title":"Приключения"}
					,{"value":"semeynye","title":"Семейные"}
					,{"value":"sportivnye","title":"Спортивные"}
					,{"value":"tok-shou","title":"Ток-шоу"}
					,{"value":"trillery","title":"Триллеры"}
					,{"value":"uzhasy","title":"Ужасы"}
					,{"value":"fantastika","title":"Фантастика"}
					,{"value":"fentezi","title":"Фентези"}
					
				]
			},
		];
    },
    
    getDefaultParams : function () {
    	var params = [];
    	params.push({"name":"genres", "value":"all"});
    	return params;
    },
    
    getSearchParams : function (search) {
    	var params = [];
    	params.push({"action": "search", "name": "q", "value": search});
    	return params;
    },
    
    getLanguages : function (item) {
    	var items = [];
    	var i = new Item();
		
		i.id = 'rus';
		i.title = 'rus';
		i.image = './templates/default/img/languages/';
		i.image += 'rus.png';
		items.push(i);
		
		return items;
    },
    
    getTranslations : function (item) {
    	var items = [];
    	var i = new Item();
		
		i.id = 'rus';
		i.title = 'Стандарт';
		items.push(i);
		
		return items;
    },
    
    getQualities : function (item) {
    	var items = [];
    	var i = new Item();
		
		i.id = 'rus';
		i.title = 'Стандарт';
		items.push(i);
		
		return items;
    },
    
};