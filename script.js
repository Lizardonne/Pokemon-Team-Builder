var types = ""; // format: json

var formLine = document.getElementById("team").innerHTML;
var formContent = "";
for (i = 0; i < 6; i++) {
  formContent += formLine;
}
document.getElementById("team").innerHTML = formContent;

// FIXME: clean up code (arrange everything into one table?)
const url_Types = "https://pokeapi.co/api/v2/type/";
fetch(url_Types)
  .then(function(response) {
    return response.json();
  })
  .then(function(json) {
    console.log(json);
    types = json;

    var dropdownList = "<option>Type</option>";
    var resultsTableHeader = "<tr>";
    for (i = 0; i < types.count; i++) {
      dropdownList += "<option>" + types.results[i].name + "</option>";
      resultsTableHeader += "<th>" + types.results[i].name + "</th>";
    }
    resultsTableHeader += "</tr>";

    var dropdowns = document.getElementsByClassName("dropdown-type");
    for (i = 0; i < dropdowns.length; i++) {
      dropdowns.item(i).innerHTML = dropdownList;
    }

    var resultsTableRows = "";
    for (i = 0; i < 6; i++) {
      resultsTableRows += "<tr><td>text</td></tr>";
    }
    var resultsTable = resultsTableHeader + resultsTableRows;
    document.getElementById("results").innerHTML = resultsTableHeader;
  });

var pokemonTeam = document.getElementsByClassName("pokemon-name");
for (i = 0; i < pokemonTeam.length; i++) {
  pokemonTeam[i].addEventListener("change", function(event) {
    event.preventDefault();
    console.log(event.target.value);

    // FIXME: make call to API
  })
}
