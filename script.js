const fighters = [
{
name:"Shelly",
image:"https://cdn.brawlify.com/brawlers/shelly.png"
},
{
name:"Colt",
image:"https://cdn.brawlify.com/brawlers/colt.png"
},
{
name:"Spike",
image:"https://cdn.brawlify.com/brawlers/spike.png"
},
{
name:"Leon",
image:"https://cdn.brawlify.com/brawlers/leon.png"
},
{
name:"Crow",
image:"https://cdn.brawlify.com/brawlers/crow.png"
},
{
name:"Mortis",
image:"https://cdn.brawlify.com/brawlers/mortis.png"
}
];

const container = document.getElementById("fighters");
const search = document.getElementById("search");

function render(list){

container.innerHTML="";

list.forEach(f=>{

container.innerHTML += `
<div class="card">
<img src="${f.image}">
<h2>${f.name}</h2>
</div>
`;

});

}

render(fighters);

search.addEventListener("input",()=>{

const value=search.value.toLowerCase();

render(
fighters.filter(f=>f.name.toLowerCase().includes(value))
);

});
