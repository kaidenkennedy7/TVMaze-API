const Missing_Img_URL = 'http://tinyurl.com/missing-tv';

/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */
async function searchShows (query) {
	let res = await axios.get(`http://api.tvmaze.com/search/shows?q=${query}`);
	let shows = res.data.map((result) => {
		let show = result.show;
		return {
			id      : show.id,
			name    : show.name,
			summary : show.summary,
			image   : show.image ? show.image.medium : Missing_Img_URL
		};
	});
	return shows;
}
// Populate shows list //
function populateShows (shows) {
	const $showsList = $('#shows-list');
	$showsList.empty();

	for (let show of shows) {
		let $item = $(
			`<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
           <img class="card-img-top" src="${show.image}">
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary}</p>
             <button class="btn btn-primary get-episodes">Episodes</button>
           </div>
         </div>  
       </div>
      `
		);
		$showsList.append($item);
	}
}

// Search for msubmission: //
$('#search-form').on('submit', async function handleSearch (e) {
	e.preventDefault();
	let query = $('#search-query').val();
	if (!query) return;

	$('#episodes-area').hide();

	let shows = await searchShows(query);

	populateShows(shows);
});

// When given a show ID, return the episodes //
async function getEpisodes (id) {
	let res = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
	let episodes = res.data.map((episode) => ({
		id     : episode.id,
		name   : episode.name,
		season : episode.season,
		number : episode.number
	}));
	return episodes;
}

// Make episodes list, adds to DOM //
function populateEpisodes (episodes) {
	const $episodesList = $('#episodes-list');
	$episodesList.empty();

	for (let episode of episodes) {
		let $item = $(
			`<li>
         ${episode.name}
         (season ${episode.season}, episode ${episode.number})
       </li>
      `
		);
		$episodesList.append($item);
	}
	$('#episodes-area').show();
}

// click on show name //
$('#shows-list').on('click', '.get-episodes', async function handleEpisodeClick (e) {
	let showId = $(e.target).closest('.Show').data('show-id');
	let episodes = await getEpisodes(showId);
	populateEpisodes(episodes);
});
