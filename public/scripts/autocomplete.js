const moviesSearch = document.querySelector('.search-movies');
const autoComplete = document.querySelector('.search-autocomplete');

moviesSearch.addEventListener('keyup', displayAutocomplete)
moviesSearch.addEventListener('change', displayAutocomplete)
autoComplete.addEventListener('click', (event) => {
    moviesSearch.value = event.target.innerText
    autoComplete.innerHTML = ''
})

function displayAutocomplete() {
    autoComplete.innerHTML = ''
    autoComplete.style.width = '100%'
    autoComplete.style.background = '#ffffff'
    let url = `https://www.omdbapi.com/?apikey=thewdb&s=${moviesSearch.value}`
    fetch(url)
        .then(res => res.json())
        .then(data => {
            let movies = data.Search;
            if (movies.length !== 0) {
                for (let i = 0; i < 5; i++) {
                    let list = document.createElement('li');
                    list.innerText = movies[i].Title
                    autoComplete.append(list)
                }
            }
        })
        .catch(err => console.log(err))
}