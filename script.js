const TEAM_SIZE = 6;
const DROPDOWN_DEFAULT = "Type";

const NO_EFFECT = "0";
const NVE = "1/2";
const SUPER_NVE = "1/4";
const SE = "2";
const SUPER_SE = "4";

//-- POPULATING THE PAGE
const url_Types = "https://pokeapi.co/api/v2/type/";
fetch(url_Types)
  .then(function(response) {
    return response.json();
  })
  .then(function(json) {
    var types = json;
    delete types.results[--types.count];  // remove Shadow type
    delete types.results[--types.count];  // remove Unknow type

    var form = document.getElementsByClassName("input-area")[0].outerHTML;
    document.getElementsByClassName("input-area")[0].remove();

    // Populating the main table
    var table = "";
    table += "<colgroup>";
    table += "<col>";
    table += "<col span='" + TEAM_SIZE + "'>";
    table += "<col class='weak-total'>";
    table += "<col class='resist-total'>";
    table += "</colgroup>";

    table += "<thead>";
    table += "<tr>";
    table += "<th></th>";
    for (i = 0; i < TEAM_SIZE; i++) {
      table += "<th id='" + i + "-header'>" + form + "</th>";
    }
    table += "<th>weak</th>";
    table += "<th>resist</th>";
    table += "</tr>";
    table += "</thead>";

    table += "<tbody>";
    for (i = 0; i < types.count; i++) {
      table += "<tr>";
      table += "<th scope='col' class='row-header'>" + types.results[i].name + "</th>";
      for (j = 0; j < TEAM_SIZE; j++) {
        table += "<td id='" + types.results[i].name + "-" + j + "'></td>";
      }
      table += "<th id='" + types.results[i].name + "-weak-total'>0</th>";
      table += "<th id='" + types.results[i].name + "-resist-total'>0</th>";
      table += "</tr>";
    }
    table += "</tbody>";

    document.getElementById("table").innerHTML = table;

    // Populating the drop-down lists
    var dropdownContents = "<option>Type</option>";
    for (i = 0; i < types.count; i++) {
      dropdownContents += "<option>" + types.results[i].name + "</option>";
    }
    var dropdownElements = document.getElementsByClassName("type");
    for (i = 0; i < dropdownElements.length; i++) {
      dropdownElements.item(i).innerHTML = dropdownContents;
    }


    //-- UPDATING THE TABLE: Pokemon names
    var pokemonTeam = document.getElementsByClassName("name");
    for (i = 0; i < pokemonTeam.length; i++) {
      pokemonTeam[i].addEventListener("change", function(event) {
        event.preventDefault();
        var column = event.target.parentNode.parentNode.id.substr(0,1);

        // set defaults
        var effectiveness = [];
        for (i = 0; i < types.count; i++) {
          effectiveness[i] = { name: types.results[i].name, effectiveness: 1 };
        }

        const url_pokemon = "https://pokeapi.co/api/v2/pokemon/" + event.target.value.toLowerCase() + "/";
        fetch(url_pokemon)
          .then(function(response) {
            if (!response.ok) { throw new Error("Network response not OK"); }
            return response.json();
          })
          .then(function(json) {
            // calculate changes
            calculateEffectiveness(0);
            if (json.types.length > 1) { calculateEffectiveness(1); }

            //helper function
            function calculateEffectiveness(iter) {
              fetch(json.types[iter].type.url)
                .then(function(response) {
                  return response.json();
                })
                .then(function(json) {
                  update(effectiveness, column, json);
                })
            }
          })
          .catch(error => {
            console.error(error);
            update(effectiveness, column);
          });
      })
    }

    //-- UPDATING THE TABLE: Arbitrary types
    for (i = 0; i < dropdownElements.length; i++) {
      dropdownElements[i].addEventListener("change", function(event) {
        // FIXME
      });
    }

    function update(effectiveness, column, json = "") {
      if (json != "") {
        var noEffect = json.damage_relations.no_damage_from;
        for (i = 0; i < noEffect.length; i++) {
          var name = noEffect[i].name;
          for (j = 0; j < effectiveness.length; j++) {
            if (effectiveness[j].name == name) {
              effectiveness[j].effectiveness *= 0;
              break;
            }
          }
        }
        var double = json.damage_relations.double_damage_from;
        for (i = 0; i < double.length; i++) {
          var name = double[i].name;
          for (j = 0; j < effectiveness.length; j++) {
            if (effectiveness[j].name == name) {
              effectiveness[j].effectiveness *= 2;
              break;
            }
          }
        }
        var half = json.damage_relations.half_damage_from;
        for (i = 0; i < half.length; i++) {
          var name = half[i].name;
          for (j = 0; j < effectiveness.length; j++) {
            if (effectiveness[j].name == name) {
              effectiveness[j].effectiveness *= 0.5;
              break;
            }
          }
        }
      }

      // display changes
      for (i = 0; i < types.count; i++) {
        var id = types.results[i].name + "-" + column;
        var element = document.getElementById(id);

        // update contents
        switch(effectiveness[i].effectiveness) {
          case 0:
            element.innerText = NO_EFFECT;
            element.className = "no-effect";
            break;
          case 0.25:
            element.innerText = SUPER_NVE;
            element.className = "super-resist";
            break;
          case 0.5:
            element.innerText = NVE;
            element.className = "resist";
            break;
          case 2:
            element.innerText = SE;
            element.className = "weak";
            break;
          case 4:
            element.innerText = SUPER_SE;
            element.className = "super-weak";
            break;
          default:
            element.innerText = "";
            element.className = "";
            break;
        }

        // update totals
        var weakTotal = 0;
        var resistTotal = 0;
        for (j = 0; j < TEAM_SIZE; j++) {

          var element_id = types.results[i].name + "-" + j;
          var element = document.getElementById(element_id);

          if ((element.innerText == NO_EFFECT) ||
              (element.innerText == SUPER_NVE) ||
              (element.innerText == NVE)) { resistTotal++; }
          else if ((element.innerText == SE) ||
                  (element.innerText == SUPER_SE)) { weakTotal++; }

          var weakTotal_id = types.results[i].name + "-weak-total";
          var resistTotal_id = types.results[i].name + "-resist-total";
          var weakTotal_element = document.getElementById(weakTotal_id);
          var resistTotal_element = document.getElementById(resistTotal_id);

          weakTotal_element.innerText = weakTotal;
          resistTotal_element.innerText = resistTotal;
        }
      }
    }
  });
