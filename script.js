const container = document.getElementById("fighters");
const search = document.getElementById("search");

let fighters = [];

fetch("data/brawlers.json")
.then(response => response.json())
.then(data => {

    fighters = data;
    render(fighters);

});


function render(list){

    container.innerHTML = ""; 

    list.forEach(f => {

        container.innerHTML += `
        <a href="brawler.html?name=${encodeURIComponent(f.name)}" class="card">

            <img src="${f.image}" alt="${f.displayName}">

            <h2>${f.displayName}</h2>

            <p>Скинов: ${f.skins.length}</p>

        </a>
        `;

    });

}


search.addEventListener("input", () => {

    const value = search.value.toLowerCase();

    render(
        fighters.filter(f =>
            f.displayName.toLowerCase().includes(value)
        )
    );

});
