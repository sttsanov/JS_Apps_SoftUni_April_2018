function loadRepos() {
    let username = document.getElementById('username').value;
    let repos = $.get(`https://api.github.com/users/${username}/repos`);
    let output = document.getElementById('repos');
    if (repos.status === 404){
        output.innerHTML = '<li>Error</li>';
    }
    else{
        repos.then(display);
    }
    function display(repos){
        output.innerHTML = "";
        for (let repo of repos) {
            output.innerHTML += `<li><a href="${repo.html_url}">${repo.full_name}/${repo.name}</a></li>`;
        }
    }
}