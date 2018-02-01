/*****************************************************************************************
*	API MashUp User Flow
*
*	1) Wait for search click button
*	2) Call executeSearch
*		2.a) Create async call to Flickr
*		2.b) Create async call to BigHugeLab
*	3) Wait for responses
*	4.a) On Flickr callback - Parse response - Create list of clickable words
*	4.b) On BigHugeLab callback - Parse response - Display images
*****************************************************************************************/

$(document).ready(function() {
	const searchButton = $('button');
	const searchField = $('input');
	const content = $('.content');
	const wordList = $("#wordList");

	const flickerUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.search"
	const flickerApiKey = "2e0240e78ddd71b7a1fb75ec2a28b41c";

	const bigHugeUrl = "http://words.bighugelabs.com/api/2/";
	const bigHugeApiKey = "0403fe8c70ae7355ab0e2b709d165f44";

	let results;

	// BigHugeLab callback function - Accepts a blob of JSON data from BigHugeLab
	const parseHuge = (jsonResponse) => {

		// Helper function to parse a sub-category of words
		// Pass in an array of words, i.e. jsonResponse.noun.syn
		function printWordType(activeWordType) {
			// Get the total number of jsonResponse.verb.rel
			var actualLimit = activeWordType.length;

			// Limit the number of results to a maximum of 10.
			if(actualLimit > 10) {
				actualLimit = 10;
			}

			// Print each value in activeWordType
			for(var i = 0; i < actualLimit; i++) {

				// Create special link for each word.
				// When user clicks link:
				// call JS-function: executeSearch, with clicked word
				var linkText = $('<a>')
				.attr('href', "#")
				.on('click', {searchWord: activeWordType[i]}, function(event) {
					executeSearch(event.data.searchWord);
				})
				.text(activeWordType[i]);

				// Create list item for link
				var list = $('<li></li>')
				.append(linkText)
				.addClass("list-group-item");

				// Append li-element to ul-element
				list.appendTo(wordList);
			}
		}

		// Write out Nouns
		if(jsonResponse.noun) {
			printWordType(jsonResponse.noun.syn);
		}
		
		// Write out Verbs
		if(jsonResponse.verb) {
			printWordType(jsonResponse.verb.syn);
		}
	}

	// Flickr callback function - Accepts a blob of JSON data from Flickr
	const parseFlickr = (jsonResponse) => {
		results = jsonResponse.photos.photo;

		// Loop through all photos and display them
		for (let i = 0; i < results.length; i++) {
			let figure = $('<figure></figure>');
			let img = $('<img>');

			// Create relevant variables
			let flickerFarm = results[i].farm;
			let flickerServer = results[i].server;
			let flickerPhotoId = results[i].id;
			let flickerSecret = results[i].secret;

			// Generate url to Flickr image
			img.attr('src', `https://farm${flickerFarm}.staticflickr.com/${flickerServer}/${flickerPhotoId}_${flickerSecret}.jpg`);
			img.addClass("img-responsive");

			// Append img-element to DOM
			figure.append(img);
			content.append(figure);
		}
	};
	

	// Executes a remote call to 'remoteUrl'.
	// When server responds it calls 'parseFunction' with the returned JSON data.
	const fetchAndParseRemoteAPI = (remoteUrl, parseFunction) => {
		fetch(remoteUrl)
		.then(response => response.json())
		.then(response => {

			// Call callback-function for either Flickr or BigHugeLab
			parseFunction(response);

		}).catch(error => {
			//console.log(error);
		});
	};

	// Called with a string to execute a flickr and bighugelab search
	const executeSearch = (searchWord) => {
		// Clear html-elements from previous images and words
		wordList.empty();
		content.empty();

		// Create remote URLS
		let flickrUrl = `${flickerUrl}&api_key=${flickerApiKey}&text=${searchWord}&safe_search=1&format=json&nojsoncallback=1`;
		let hugeUrl = `${bigHugeUrl}${bigHugeApiKey}/${searchWord}/json`;

		// Start async calls to flickr and bighugelab
		fetchAndParseRemoteAPI(flickrUrl, parseFlickr);
		fetchAndParseRemoteAPI(hugeUrl, parseHuge);

		// Set search field text to currently searched word
		searchField.val(searchWord);
	}

	// Callback when clicking search button
	const onSearchListener = (event) => {
		event.preventDefault();

		// Execute search with text entered in searchField
		executeSearch(searchField.val());
	};

	// Add onClick-listener to search button
	searchButton.on('click', onSearchListener);
});