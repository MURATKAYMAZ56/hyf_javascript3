'use strict';

const hyfUrl = 'https://api.github.com/orgs/HackYourFuture/repos?per_page=100';

function fetchJSON(method, url) {
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.responseType = 'json';
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status < 400) {
                    resolve(xhr.response);
                } else {
                    reject(new Error(xhr.statusText));
                }
            }
        };
        xhr.send();
    });
}

function main() {
    const root = document.getElementById('root');
    const header = append('header', root);
    const title = append('span', header);
    title.innerHTML = "HYF Repositories";
    const select = append('select', header);

    fetchJSON('GET', hyfUrl)
        .then(repositories => {

            repositories.forEach((repo, index) => {
                const option = append('option', select);
                option.setAttribute('value', index);
                option.innerHTML = repo.name;
            });

            select.addEventListener('change', () => onSelectChanged(repositories[select.value]));

            const main = append('main', root);
            main.innerHTML = "<div id='left-sidebar'></div><div id='right-sidebar'></div>";

            onSelectChanged(repositories[0]);
        })
        .catch(error => {
            console.log(error);
        });
}


function append(tagName, parent) {
    const elem = document.createElement(tagName);
    parent.appendChild(elem);
    return elem;
}

function onSelectChanged(repo) {

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

    fetchJSON('GET', repo.contributors_url)
        .then(contributors => {
            let contributorsHtml = "<table>";
            contributors.forEach(contributor => {
                contributorsHtml += "<tr>"
                    + "<td><img src='" + contributor.avatar_url + "'/></td>"
                    + "<td>" + contributor.login + "</td>"
                    + "<td>" + contributor.contributions + "</td>"
                    + "</tr>";
            });
            contributorsHtml += "</table>";
            rightSidebar.innerHTML = contributorsHtml;
        })
        .catch((err) => {
            console.log(err);
        });
}

window.onload = main;