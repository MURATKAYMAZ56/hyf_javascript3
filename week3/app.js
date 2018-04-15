'use strict';
{
    const hyfUrl = 'https://api.github.com';
    const hyfReposUrl = hyfUrl + '/orgs/HackYourFuture/repos?per_page=100';

    class Repository {
        constructor(data) {
            this._data = data;
        }

        render(parent) {
            const repoDetailHtml = "<table>"
                + "<tr>"
                + "<td>Repository:</td>"
                + "<td>" + this.name() + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>Description:</td>"
                + "<td>" + (this._data.description == null ? "" : this._data.description) + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>Forks:</td>"
                + "<td>" + this._data.forks + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>Updated:</td>"
                + "<td>" + this._data.updated_at + "</td>"
                + "</tr>"
                + "</table>";

            parent.innerHTML = repoDetailHtml;
        }

        fetchContributors() {
            return fetchJSON('get', this._data.contributors_url);
        }

        name() {
            return this._data.name;
        }
    }

    class Contributor {
        constructor(data) {
            this._data = data;
        }

        render(parent) {

            const html = "<td><img src='" + this._data.avatar_url + "'/></td>"
                + "<td>" + this._data.login + "</td>"
                + "<td>" + this._data.contributions + "</td>";

            const row = document.createElement('tr');
            row.innerHTML = html;

            parent.appendChild(row);
        }
    }

    class View {
        constructor() {
            this.initialize();
        }

        /**
         * View initialization
         */
        async initialize() {
            const root = document.getElementById('root');
            const header = createAndAppend('header', root);
            const title = createAndAppend('span', header);
            title.innerHTML = "HYF Repositories";
            const select = createAndAppend('select', header);

            const main = createAndAppend('main', root);
            main.innerHTML = "<div id='left-sidebar'></div><div id='right-sidebar'><table id='contributors'></table></div>";

            try {

                let repositories = await this.fetchJSON(hyfReposUrl);

                repositories = repositories.map(repo => new Repository(repo));

                repositories.forEach((repo, index) => {
                    const option = createAndAppend('option', select);
                    option.setAttribute('value', index);
                    option.innerHTML = repo.name();
                });

                select.addEventListener('change', () => this.fetchAndRender(repositories[select.value]));

            } catch (error) {
                console.log(error);
            }

        }

        async fetchAndRender(repo) {

            const leftSidebar = document.getElementById("left-sidebar");
            const contributorList = document.getElementById("contributors");

            contributorList.innerHTML = "";

            try {

                const contributors = await repo.fetchContributors();

                repo.render(leftSidebar);

                contributors
                    .map(contributor => new Contributor(contributor))
                    .forEach(contributor => contributor.render(contributorList));
            }
            catch (error) {
                console.log(error);
            }
        }

        fetchJSON(url) {
            return fetchJSON('get', url);
        }
    }

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

    function createAndAppend(tagName, parent) {
        const elem = document.createElement(tagName);
        parent.appendChild(elem);
        return elem;
    }

    window.onload = new View();
}