String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
}

window.printCSC = function()
{
    
    var curricula;
    
    var fs = require('fs');  
    
    var txt = "";
    
    curricula = JSON.parse(fs.readFileSync('CSC-content.json').toString());
    
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
            unitId = areaName + "_" + unitName.replaceAll(" ", "_"); 
            unitName_woB = unitId.replaceAll("_", " "); 
            txt += "<tr>\n"; 
            txt += "<th valign=\"top\" align=\"left\">\n"; 
            txt += "<div class=\"unittitle\" id=\"" + unitId + "\">\n";
            txt += unitName_woB + "<br>\n";
            txt += "</div>\n";
            txt += "<div class=\"unitcontent\" id=\"contentof" + unitId + "\">\n";
            var nb = 0;
            txt += "<table>\n";
            txt += "<th valign=\"top\" align=\"left\">\n"; 
            txt += "<p class=\"indent\"></p>";
            txt += "</th>\n"; 
            txt += "<th valign=\"top\" align=\"left\" class=\"topics\">\n"; 
            // txt += "<div class=\"topics\">\n";        
            txt += "<table>\n";
            for (var topic in curricula[area].units[unit].topics) {
                var topicContent = curricula[area].units[unit].topics[topic].topic_content;
                txt += "<tr>\n"; 
                txt += "<th valign=\"top\" align=\"left\">\n"; 
                txt += "<div class=\"topic\">\n";
                txt += handleTopicContent(topicContent) + "\n";
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
                        var levelAppearance;
                        if (level == "Not")
                            levelAppearance = "No";
                        else
                            levelAppearance = "Yes";
                        txt += "<option";
                        var level_read = curricula[area].units[unit].topics[topic].subtopics[subtopic].addressed;
                        if (level_read.search(level) >= 0) {
                            txt += " selected";
                        }
                        txt += " class=\"" + level.toLowerCase() + "sub\">";
                        txt += levelAppearance;
                        txt += "</option>";
                        txt += level_read.search(level);
                    }
                    txt += "</select>";
                    txt += "</th>\n";
                }
                txt += "</table>\n";
                txt += "</th>\n"; 
                txt += "<th align=\"left\" valign=\"top\">\n"; 
                txt += "<select class=\"topicselect\" onchange=\"this.className=this.options[this.selectedIndex].className\">";
                var levels = ["Not", "Addressed"];
                for (var i = 0 ; i < levels.length ; i++) {
                    var level = levels[i];
                    var levelAppearance;
                    if (level == "Not")
                        levelAppearance = "No";
                    else
                        levelAppearance = "Yes";
                    txt += "<option";
                    if (curricula[area].units[unit].topics[topic].addressed.search(level) >= 0) {
                        txt += " selected";
                    }
                    txt += " class=\"" + level.toLowerCase() + "\">";
                    txt += levelAppearance;
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
                txt += "<select class=\"skillselect\" onchange=\"this.className=this.options[this.selectedIndex].className\">";
                var levels = ["Familiarity", "Usage", "Assessment"];
                for (var i = 0 ; i < levels.length ; i++) {
                    var level = levels[i];
                    txt += "<option";
                    if (curricula[area].units[unit].topics[topic].addressed.search(level) >= 0) {
                        txt += " selected";
                    }
                    txt += " class=\"" + level.toLowerCase() + "\">";
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
    
    document.getElementById("theCSCPage").innerHTML = txt;
    
    var allSelects = document.getElementsByTagName("select");
    for (var i=0; i < allSelects.length; i++)
    {
        allSelects[i].className = allSelects[i].options[allSelects[i].selectedIndex].className;
    }
    
    for (var area in curricula) {
        var areaName = curricula[area].area_name;
        
        document.getElementById(areaName).addEventListener("click", function(){displayArea(this.id)});
        for (var unit in curricula[area].units) {
            unitName = curricula[area].units[unit].unit_name;
            document.getElementById(areaName + "_" + unitName).addEventListener("click", function(){displayUnit(this.id)});
        }
    }
}

window.displayArea = function(areaName) {
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

function handleXrefs(theRefs)
{
    var regexList = /([^]*),(\s.{2,4}\/[^]*)/i;
    var regexEnd = /([^]{2,3})\/([^]*)/i;
    var match;
    var theRef;
    var area;
    var topic;
    var res = "";
    var refs = theRefs.trim();
    
    while (regexList.test(refs)) {
        match = regexList.exec(refs);
        theRef = match[1].trim();
        refs = match[2].trim();
        match = regexEnd.exec(theRef)
        area = match[1].trim();
        topic = match[2].trim();
        res += "<a href=\"\#" + area + "_" + topic.replaceAll(" ", "_") + "\">" + area + "/" + topic + "</a>" + " and ";
    }
    match = regexEnd.exec(refs);
    if (match != null) {
        area = match[1].trim();
        topic = match[2].trim();
        res += "<a href=\"\#" + area + "_" + topic.replaceAll(" ", "_") + "\">" + area + "/" + topic + "</a>";
    } else {
        res += "BUG!!!" + refs + "!!!";
    }
    return res;
}

function handleTopicContent(topicContent)
{
    var regex = /(.*)\(cross[-\s]reference(.*)\)(.*)/i;
    var match = regex.exec(topicContent);
    if (match != null) {
        var res = "";
        var i;
        res += match[1] + " <pre class=crossref>(cross-ref ";
        res += handleXrefs(match[2]);
        res += ")</pre>";
        return res;
    } else {
        return topicContent;
    }
}

// TODO:
// - bug: tout est indiqué "non addressed"
// - Modification du json
//       fs.writeFile('people.json', JSON.stringify(m));
// - Ajouter support pour nombre d'heures ??
// - Support pour :Xref:
// - Un joli format json:
//   - indenter
//   - compléter la recopie depuis le pdf(arg...)
//       - essayer de copier directement dans le .json
//       - si c'est trop compliqué => passer par du csv
//   - les cross-ref sont un peu pénibles à gérer quand il y a des 'and' dans le topic cross-referencé. M'enfin ça se fait.
