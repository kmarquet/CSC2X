var curricula = null;

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
}

function getTopic(areaName, unitName, topicObj)
{
    var topicNum = topicObj.topic_num;
    txt += "<div class=\"topic\">\n";
    txt += handleTopicContent(topicContent) + "\n";
    txt += "</div>";
    txt += "<table>\n";
    txt += "<th class=\"subtopicscol\">\n";
    for (var subtopic in curricula[area].units[unit].topics[topic].subtopics) {
        var subtopicNum = curricula[area].units[unit].topics[topic].subtopics[subtopic].topic_num;
        txt += "<tr>\n"; 
        txt += "<th class=\"subtopicpad\"></th>\n"; 
        txt += "<th class=\"subtopiccol\">\n"; 
        txt += "<div class=\"subtopic\">\n";            
        txt += curricula[area].units[unit].topics[topic].subtopics[subtopic].topic_content;
        txt += "</div>\n";                
        txt += "</th>\n"; 
        txt += "<th class=\"subtopicselectcol\" align=\"left\">\n"; 
        txt += "<select id=\"subtopic__" + unitId + "__" + topicNum + "__" + subtopicNum + "\">";
        var levels = ["No", "Yes"];
        for (var i = 0 ; i < levels.length ; i++) {
            var level = levels[i];
            var levelAppearance = level;
            txt += "<option";
            var level_read = curricula[area].units[unit].topics[topic].subtopics[subtopic].addressed;
            if (level_read.search(level) >= 0) {
                txt += " selected";
            }
            txt += " class=\"subtopic" + level.toLowerCase() + "\">";
            txt += level;
            // txt += level_read.search(level);
            txt += "</option>";
        }
        txt += "</select>";
        txt += "</th>\n";
    }
    txt += "</table>\n";
    txt += "</th>\n";
    txt += "<th class=\"topicselectcol\">\n"; 
    txt += "<select id=\"topic__"  + unitId + "__" + topicNum + "\">";
    var levels = ["No", "Yes"];
    for (var i = 0 ; i < levels.length ; i++) {
        var level = levels[i];
        txt += "<option";
        var level_read = curricula[area].units[unit].topics[topic].addressed;
        if (level_read.search(level) >= 0) {
            txt += " selected";
        }
        txt += " class=\"topic" + level.toLowerCase() + "\">";
        txt += level;
        // txt += level_read.search(level);
        txt += "</option>";
    }
    txt += "</select>";
    txt += "</th>\n"; 
}

function getUnit(areaName, unitObj)
{
    unitName = unitObj.unit_name;
    unitId = areaName + "__" + unitName.replaceAll(" ", "_"); 
    unitName_wB = unitId.replaceAll("_", " "); 
    txt += "<th class=\"unittitlecol\">\n"; 
    txt += "<div class=\"unittitle\" id=\"" + unitId + "\">\n";
    txt += unitName_wB + "<br>\n";
    txt += "</div>\n";
    txt += "<div class=\"unitcontent\" id=\"contentof" + unitId + "\">\n";
    var nb = 0;
    txt += "<table>\n";
    txt += "<th class=\"indent\">\n"; 
    txt += "</th>\n"; 
    txt += "<th class=\"topicscol\">\n"; 
    txt += "<table>\n";
    for (var topic in unitObj.topics) {
        var topicObj = unitObj.topics[topic];
        var topicContent = topicObj.topic_content;
        if (topicObj.addressed == "Yes") {
            txt += "<th class=\"topiccol\">\n"; 
            txt += getUnit();
            txt += "</th>\n"; 
        }
        
        txt += "<th class=\"paddingtopskill\"></th>\n"; 
        txt += "<th class=\"skillscol\">\n"; 
        txt += "<table>\n";
        for (var skill in curricula[area].units[unit].skills) {
            var skillNum = curricula[area].units[unit].skills[skill].skill_num;
            txt += "<tr>\n"; 
            txt += "<th class=\"skillcol\">\n"; 
            txt += "<div class=\"skill\">\n";
            txt += curricula[area].units[unit].skills[skill].skill + "\n";
            txt += "</div>";
            txt += "</th>\n"; 
            txt += "<th class=\"skillselectcol \">\n";
            txt += "<select align=\"right\" class=\"skillselect\" id=\"skill__" + unitId + "__" + skillNum + "\">";
            var levels = ["No", "Familiarity", "Usage", "Assessment"];
            for (var i = 0 ; i < levels.length ; i++) {
                var level = levels[i];
                txt += "<option";
                if (curricula[area].units[unit].topics[topic].addressed.search("/"+level+"/i") >= 0) {
                    txt += " selected";
                }
                txt += " class=\"skill" + level.toLowerCase() + "\">";
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
}
txt += "</table>\n";
}

function getArea(areaObj)
{
    var areaName = areaObj.area_name;
 
    txt += "<th class=\"areatitlecol\">\n"; 
    txt += "<div class=\"areatitle\" id=\"" + areaName + "\">\n";
    txt += areaName + "<br>\n";
    txt += "</div>";
    txt += "</th>\n"; 
    txt += "<th class=\"areacontentcol\">\n"; 
    txt += "<div id=\"contentof" + areaName + "\">\n";
    txt += "<table>\n";
    for (var unit in curricula[area].units) {
        unitObj = areaObj.units[unit];
        if (isUnitConcerned(unitObj)) {
            txt += "<tr>\n"; 
            txt += getUnit(areaName, unitObj);
            txt += "</th>\n"; 
        }
    }
    return txt;
}

window.printCSC = function(printNotAdressed = true)
{    
    var fs = require('fs');
    var txt = "";

    if (curricula == null)
        curricula = JSON.parse(fs.readFileSync('CSC-content.json').toString());
    
    txt += "<table>\n";
    for (var area in curricula) {
        var areaObj = curricula[area];
        if (isUseful(areaObj)) {
            txt += "<tr>\n";
            txt += getArea(areaObj);
            txt += "</th>\n"; 
        }
    }
    txt += "</table>\n";
    
    document.getElementById("theCSCPage").innerHTML = txt;
   
    var allSelects = document.getElementsByTagName("select");
    for (var i=0; i < allSelects.length; i++)
    {
        allSelects[i].className = allSelects[i].options[allSelects[i].selectedIndex].className;
        allSelects[i].addEventListener("change", function() {selectChanged(this)});
    }
    
    for (var area in curricula) {
        var areaName = curricula[area].area_name;
        
        document.getElementById(areaName).addEventListener("click", function(){displayArea(this)});
        for (var unit in curricula[area].units) {
            unitName = curricula[area].units[unit].unit_name;
            document.getElementById(areaName + "__" + unitName).addEventListener("click", function(){displayUnit(this.id)});
        }
    }

    document.getElementById("newCSC").addEventListener("change", function(){loadCSC(this.id)});
    document.getElementById("saveCSC").addEventListener("click", function(){saveCSC(this.id)});
    document.getElementById("GCCSC").addEventListener("click", function(){GCCSC(this.id)});
    document.getElementById("resetCSC").addEventListener("click", function(){resetCSC(this.id)});
}

function selectChanged(elt) {
    elt.className = elt.options[elt.selectedIndex].className;
    var splitted = elt.id.split("__");
    var selectType = splitted[0];
    var areaName = splitted[1];
    var unitName = splitted[2];

    for (area in curricula) {
        var areaObj = curricula[area];
        if (areaObj.area_name == areaName) {
            for (unit in areaObj.units) {
                var unitObj = areaObj.units[unit];
                if (unitObj.unit_name == unitName) {
                    if (selectType == "skill") {
                        var skNum = splitted[3];
                        for (skill in unitObj.skills) {
                            var skillObj = unitObj.skills[skill]
                            if (skillObj.skill_num == skNum) {
                                skillObj.addressed = value;
                                return;
                            }
                        }
                    } else {
                        var topNum = splitted[3];
                        for (topic in unitObj.topics) {
                            topicObj = unitObj.topics[topic];
                            if (topicObj.topic_num == topNum) {
                                if (selectType == "subtopic") {
                                    var subtopicNum = splitted[4];
                                    for (subtopic in topicObj.subtopics) {
                                        var subtopicObj = topicObj.subtopics[subtopic];
                                        if (subtopicObj.topic_num == subtopicNum) {
                                            subtopicObj.addressed = elt.value;
                                            return;
                                        }
                                    }
                                } else {
                                    topicObj.addressed = elt.value;
                                    return;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function saveCSC(id) {
    var dlElem = document.getElementById(id);
    var data = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(curricula));
    dlElem.setAttribute("href", "data:" + data);
    dlElem.setAttribute("download", "savedCSC.json");
    // dlElem.click();
}

function loadCSC() {
    var file = document.getElementById("newCSC").files[0];
    var fr = new FileReader();
    fr.onloadend = function(e) {
        curricula = JSON.parse(e.target.result);
        printCSC();
    }
    var blob = file.slice(0, file.size-1);
    fr.readAsText(blob);
}

function resetCSC() {
    printCSC(0);
}

function resetCSC() {
    curricula = null;
    printCSC();
}

window.displayArea = function(area) {
    areaName = area.id;
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
        res += match[1] + " <pre class=\"crossref\">(cross-ref ";
        res += handleXrefs(match[2]);
        res += ")</pre>";
        return res;
    } else {
        return topicContent;
    }
}

// TODO:
// - Modification du json
//       fs.writeFile('people.json', JSON.stringify(m));
// - Ajouter support pour nombre d'heures ??
// - Un joli format json:
//   - indenter
//   - compléter la recopie depuis le pdf(arg...)
//       - essayer de copier directement dans le .json
//       - si c'est trop compliqué => passer par du csv
// - 
