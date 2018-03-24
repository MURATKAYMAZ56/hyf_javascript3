
const API = {

    endpoints: {

        repos: 'https://api.github.com/orgs/HackYourFuture/repos?per_page=100'


    }

};


function fetchJSON(url, callback) {

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {

            if (xhr.status < 400) {

                callback(null, xhr.response);

            } else {

                callback(new Error(xhr.statusText), null);
            }


        }
    };
    xhr.send();
}

function getRepos() {

    fetchJSON(API.endpoints.repos, (err, response) => {

        if (err) {
            console.log(err);
            return;
        }

        const repositories = response.map((repo) => {
            return {
                name: repo.name,
                description: repo.description,
                forks: repo.forks,
                updated_at: repo.updated_at,
                contributors_url: repo.contributors_url
            };
        });

        const root = document.getElementById('root');

        const header = append('header', root);

        const title = append('span', header);
        title.innerHTML = "HYF Repositories";

        const select = append('select', header);

        repositories.forEach(repo => {
            const option = append('option', select);
            option.setAttribute('value', JSON.stringify(repo));
            option.innerHTML = repo.name;
        });

        select.addEventListener('change', onSelectChanged);

        const main = append('main', root);
        main.innerHTML = "<div id='left-sidebar'></div><div id='right-sidebar'></div>";

    });

}

function append(tagName, parent) {
    const elem = document.createElement(tagName);
    parent.appendChild(elem);
    return elem;
}

function onSelectChanged(event) {

    const repo = JSON.parse(event.target.value);

    const repoDetailHtml = "<table>"
        + "<tr>"
        + "<td>Repository:</td>"
        + "<td>" + repo.name + "</td>"
        + "</tr>"
        + "<tr>"
        + "<td>Description:</td>"
        + "<td>" + (repo.description == null ? "" : repo.description) + "</td>"
        + "</tr>"
        + "<tr>"
        + "<td>Forks:</td>"
        + "<td>" + repo.forks + "</td>"
        + "</tr>"
        + "<tr>"
        + "<td>Updated:</td>"
        + "<td>" + repo.updated_at + "</td>"
        + "</tr>"
        + "</table>";

    const leftSidebar = document.getElementById("left-sidebar");
    leftSidebar.innerHTML = repoDetailHtml;

    const rightSidebar = document.getElementById("right-sidebar");
    rightSidebar.innerHTML = "Loading...";

    fetchJSON(repo.contributors_url, (err, response) => {

        if (err) {
            console.log(err);
            return;
        }

        const contributors = response.map((contributor) => {
            return {
                name: contributor.login,
                avatar: contributor.avatar_url,
                contributions: contributor.contributions
            };
        });

        var contributorsHtml = "<table>";

        contributors.forEach(contributor => {
            contributorsHtml += "<tr>"
                + "<td><img src='" + contributor.avatar + "'/></td>"
                + "<td>" + contributor.name + "</td>"
                + "<td>" + contributor.contributions + "</td>"
                + "</tr>";
        });

        contributorsHtml += "</table>";

        rightSidebar.innerHTML = contributorsHtml;

    })
}


getRepos();