const anchor = document.querySelectorAll('a');
var title;

	for(let i=0; i<anchor.length; i++){
		anchor[i].addEventListener('click', function(){
			title = anchor[i].textContent;
			module.exports = title;
		})
	}