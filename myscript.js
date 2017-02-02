var fs = require('fs');  

var txt = "";

var curricula = JSON.parse(fs.readFileSync('essai.json').toString());

txt += "<table>\n";
for (var area in curricula) {
    areaName = curricula[area].area_name;
    txt += "<tr>\n"; 
    txt += "<th valign=\"top\" align=\"left\">\n"; 
    txt += "<div class=\"areatitle\" id=\"" + areaName + "\">\n";
    txt += areaName + "<br>\n";
    txt += "</div>";
    txt += "</th>\n"; 
    txt += "<th valign=\"top\" align=\"left\">\n"; 
    txt += "<div class=\"areacontent\" id=\"contentof" + areaName + "\">\n";
    txt += "<table>\n";
    for (var unit in curricula[area].units) {
        unitName = curricula[area].units[unit].unit_name;
        txt += "<tr>\n"; 
        txt += "<th valign=\"top\" align=\"left\">\n"; 
        txt += "<div class=\"unittitle\" id=\"" + unitName + "\">\n";
        txt += unitName + "<br>\n";
        txt += "</div>\n";
        txt += "<div class=\"unitcontent\" id=\"contentof" + unitName + "\">\n";
        var nb = 0;
        txt += "<table>\n";
        txt += "<th valign=\"top\" align=\"left\">\n"; 
        txt += "<p class=\"indent\"></p>";
        txt += "</th>\n"; 
        txt += "<th valign=\"top\" align=\"left\" class=\"topics\">\n"; 
        // txt += "<div class=\"topics\">\n";        
        txt += "<table>\n";
        for (var topic in curricula[area].units[unit].topics) {
            txt += "<tr>\n"; 
            txt += "<th valign=\"top\" align=\"left\">\n"; 
            txt += "<div class=\"topic\">\n";
            txt += curricula[area].units[unit].topics[topic].topic_content + "\n";
            txt += "</div>";
            txt += "<table>\n";
            txt += "<th valign=\"top\" align=\"left\">\n";
            for (var subtopic in curricula[area].units[unit].topics[topic].subtopics) {
                txt += "<tr>\n"; 
                txt += "<th valign=\"top\" align=\"left\">\n"; 
                txt += "<div class=\"subtopic\"\>\n";            
                txt += curricula[area].units[unit].topics[topic].subtopics[subtopic].topic_content;
                txt += "</div>\n";                
                txt += "</th>\n"; 
                txt += "<th align=\"left\">\n"; 
                txt += "<select class=\"subtopicselect\" onchange=\"this.className=this.options[this.selectedIndex].className\">";
                var levels = ["Not", "Addressed"];
                for (var i = 0 ; i < levels.length ; i++) {
                    var level = levels[i];
                    txt += "<option";
                    var level_read = curricula[area].units[unit].topics[topic].subtopics[subtopic].addressed;
                    if (level_read.search(level) >= 0) {
                        txt += " selected";
                    }
                    txt += " value=\"" + level + "\" class=\"" + level.toLowerCase() + "sub\">";
                    txt += level;
                    txt += "</option>";
                    txt += level_read.search(level);
                }
                txt += "</select>";
                txt += "</th>\n";
            }
            txt += "</table>\n";
            txt += "</th>\n"; 
            txt += "<th align=\"left\" valign=\"top\">\n"; 
            txt += "<select onchange=\"this.className=this.options[this.selectedIndex].className\">";
            var levels = ["Not", "Addressed"];
            for (var i = 0 ; i < levels.length ; i++) {
                var level = levels[i];
                txt += "<option";
                if (curricula[area].units[unit].topics[topic].addressed.search(level) >= 0) {
                    txt += " selected";
                }
                txt += " value=\"" + level + "\" class=\"" + level.toLowerCase() + "\">";
                txt += level;
                txt += "</option>";
            }
            txt += "</select>";
            txt += "</th>\n"; 
        }
        txt += "</table>\n";
        // txt += "</div>";
        txt += "</th>\n"; 
        txt += "<th class=\"skills\" align=\"left\" valign=\"top\">\n"; 
        // txt += "<div class=\"skills\">\n";      
        txt += "<table>\n";
        for (var skill in curricula[area].units[unit].skills) {
            txt += "<tr>\n"; 
            txt += "<th valign=\"top\" align=\"left\">\n"; 
            txt += "<div class=\"skill\">\n";
            txt += curricula[area].units[unit].skills[skill].skill + "\n";
            txt += "</div>";
            txt += "</th>\n"; 
            txt += "<th align=\"left\" valign=\"top\">\n"; 
            txt += "<select onchange=\"this.className=this.options[this.selectedIndex].className\">";
            var levels = ["Familiarity", "Usage", "Assessment"];
            for (var i = 0 ; i < levels.length ; i++) {
                var level = levels[i];
                txt += "<option";
                if (curricula[area].units[unit].topics[topic].addressed.search(level) == 0) {
                    txt += " selected";
                }
                txt += " value=\"" + level + "\" class=\"" + level.toLowerCase() + "\">";
                txt += level;
                txt += "</option>";
            }
            txt += "</select>";
            txt += "</th>\n"; 
        }
        txt += "</table>\n";
        // txt += "</div>";
        txt += "</th>\n"; 
        txt += "</table>\n";
        txt += "</div>";
        
        // txt += "</th>\n"; 
    }
    txt += "</table>\n";
    txt += "</div>";
    txt += "</th>\n"; 
}
txt += "</table>\n";

// document.getElementById("demo").innerText = txt;
document.getElementById("demo").innerHTML = txt;

var allSelects = document.getElementsByTagName("select");
for (var i=0; i < allSelects.length; i++)
{
    allSelects[i].className = allSelects[i].options[allSelects[i].selectedIndex].className;
}

for (var area in curricula) {
    var areaName = curricula[area].area_name;
    
    document.getElementById(areaName).addEventListener("click", function(){displayArea(this.id)});
//    document.getElementById("demo").innerHTML += areaName + "<br>";
    for (var unit in curricula[area].units) {
        unitName = curricula[area].units[unit].unit_name;
//        document.getElementById("demo").innerHTML += "   " + unitName + " ";
        document.getElementById(unitName).addEventListener("click", function(){displayUnit(this.id)});
    }
//    document.getElementById("demo").innerHTML += "<br>";    
}

function displayArea(areaName) {
    var element = document.getElementById("contentof" + areaName);
    var eStyle = element.currentStyle ?
        element.currentStyle.display :
        getComputedStyle(element, null).display;

    if (eStyle === 'none')
        document.getElementById("contentof" + areaName).style.display = 'inline';
    else
        document.getElementById("contentof" + areaName).style.display = "none";
}

function displayUnit(unitName) {
    var element = document.getElementById("contentof" + unitName);
    var eStyle = element.currentStyle ?
        element.currentStyle.display :
        getComputedStyle(element, null).display;

    if (eStyle === 'none')
        document.getElementById("contentof" + unitName).style.display = 'block';
    else
        document.getElementById("contentof" + unitName).style.display = "none";
}

function displayConcept(unitName) {
    
    if (document.getElementById(conceptId).style.display == 'none')
        document.getElementById(conceptId).style.display = 'block';
    else
        document.getElementById(conceptId).style.display = 'none';
}

    // TODO:
// - Noms d'unités -> supprimer les '_'
// - Ajouter les skills
// - Ajouter les niveaux de connaissance
// - Support pour la modification des niveaux de connaissances :
//     - Menus déroulants
//     - Modification du json
//       fs.writeFile('people.json', JSON.stringify(m));
// - Rendre ça joli
// - Ajouter support pour nombre d'heures ??
// - Ajouter support pour nouveaux topics/skills
// - Support pour :Xref:
// - refermer sur 2e clic
