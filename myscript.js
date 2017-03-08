var JSONCurricula = null;

class JSSkill {

    constructor(jsonSkill, unit) {
        this.theJSONSkill = jsonSkill;
        this.content = jsonSkill.content;
        this.theJSUnit = unit;
        this.skillNum = jsonSkill.num;
        this.id = this.theJSUnit.getId() + "__skill" + this.skillNum;
        this.mastery = jsonSkill.mastery;
        this.levels = ["No", "Familiarity", "Usage", "Assessment"];
    }

    toHTML()
    {
        var txt = "";
        //=== One column for the content
        txt += "<td class=\"skillcol\">\n"; 
        txt += "<div class=\"skill\">\n";
        txt += this.content + "\n";
        txt += "</div>";
        txt += "</td>\n";
        
        //=== One column for the select
        txt += "<td class=\"skillselectcol \">\n";
        txt += "<select align=\"right\" class=\"skillselect\" id=\"" + this.id + "\">";

        for (var i = 0 ; i < this.levels.length ; i++) {
            var level = this.levels[i];
            txt += "<option";
            if (level == this.mastery) {
                txt += " selected";
            }
            txt += " class=\"skill" + level.toLowerCase() + "\">";
            txt += level;
            txt += "</option>";
        }
        txt += "</select>";
        txt += "</td>\n"; 
        return txt;
    }
}

class JSTopic {
    
    constructor(jsonTopic, unit) {
        this.theJSONTopic = jsonTopic;
        this.content = jsonTopic.content;
        this.theJSUnit = unit;
        this.topicNum = jsonTopic.num;
        this.id = this.theJSUnit.getId() + "__topic" + this.theJSONTopic.num;
        this.theJSSubTopics = [];
        this.levels = ["No", "Yes"];
        this.addressed = this.theJSONTopic.addressed;
        
        for (var subTopicRef in this.theJSONTopic.subtopics) {
            var jsonSubTopic = this.theJSONTopic.subtopics[subTopicRef];
            var jsst = new JSSubTopic(jsonSubTopic, this);
            this.theJSSubTopics.push(jsst);
        }
    }
    
    getContent() {
        return this.content;
    }
    
    getId() {
        return this.id;
    }

    handleTopicContent()
    {
        var regex = /(.*)\(cross[-\s]reference(.*)\)(.*)/i;
        var match = regex.exec(this.content);
        if (match != null) {
            var res = "";
            var i;
            res += match[1] + " <pre class=\"crossref\">(cross-ref ";
            res += handleXrefs(match[2]);
            res += ")</pre>";
            return res;
        } else {
            return this.content;
        }
    }

    isSub()
    {
        return false;
    }
    
    getSelect()
    {
        var txt = "";
        txt += "<select id=\"select__" + this.id + "\">";
        for (var i = 0 ; i < this.levels.length ; i++) {
            var aLevel = this.levels[i];
            txt += "<option";
            if (this.addressed == aLevel) {
                txt += " selected";
            }
            txt += " class=\"topic" + aLevel.toLowerCase() + "\">";
            txt += aLevel;
            txt += "</option>";
        }
        txt += "</select>";
        return txt;
    }

    toHTML()
    {
        var txt = "";

        //=== One col for the content
        txt += "<td>";
        txt += "<div class=\"topic\">\n";
        txt += this.handleTopicContent() + "\n";
        txt += "</div>";
        txt += "<table>\n";
        for (var subtopicRef in this.theJSSubTopics) {
            var subtopic = this.theJSSubTopics[subtopicRef];
            txt += "<tr class=\"subtopicscol\">\n";
            txt += subtopic.toHTML();
            txt += "</tr>";
            txt += "<tr>\n"; 
        }
        txt += "</table>\n";
        txt += "</td\n>";
        
        //=== One col for the select
        txt += "<td class=\"topicselectcol\">\n"; 
        txt += this.getSelect();
        txt += "</td>\n"; 
        
        return txt;
    }
}

class JSSubTopic {
    
    constructor(jsonSubTopic, topic) {
        this.parentTopic = topic;
        this.theJSONTopic = jsonSubTopic;
        this.content = jsonSubTopic.content;
        this.theJSUnit = null;
        this.topicNum = jsonSubTopic.num;
        this.id = this.parentTopic.getId() + "__subtopic" + this.theJSONTopic.num;
        this.levels = ["No", "Yes"];
        this.addressed
    }

    isSub()
    {
        return true;
    }

    getSelect()
    {
        var txt = "";
        txt += "<select id=\"select__" + this.id + "\">";
        for (var i = 0 ; i < this.levels.length ; i++) {
            var aLevel = this.levels[i];
            txt += "<option";
            if (this.addressed == aLevel) {
                txt += " selected";
            }
            txt += " class=\"subtopic" + aLevel.toLowerCase() + "\">";                
            txt += aLevel;
            txt += "</option>";
        }
        txt += "</select>";
        return txt;
    }

    toHTML()
    {
        var txt = "";
        txt += "<td class=\"subtopicpad\"></td>\n"; 

        //=== One column for the topic
        txt += "<td class=\"subtopiccol\">\n"; 
        txt += "<div class=\"subtopic\">\n";            
        txt += this.content;
        txt += "</div>\n";          
        txt += "</td>\n"; 

        //=== One column for the select
        txt += "<td class=\"subtopicselectcol\" align=\"left\">\n"; 
        txt += this.getSelect();
        txt += "</td>\n";
        return txt;
    }
}

Object.setPrototypeOf(JSSubTopic.prototype, JSTopic);

class JSUnit {
    
    constructor(jsonUnit, area) {
        this.title = jsonUnit.unit_name;
        this.theJSArea = area;
        this.id = this.theJSArea.getId() + "__" + this.title.replaceAll(" ", "_"); 
        this.title = this.id.replaceAll("_", " "); 
        this.theJSONUnit = jsonUnit;
        this.theJSTopics = [];
        this.theJSSkills = [];

        
        for (var topicRef in this.theJSONUnit.topics) {
            var jsonTopic = this.theJSONUnit.topics[topicRef];
            var jst = new JSTopic(jsonTopic, this);
            this.theJSTopics.push(jst);
        }
        for (var skillRef in this.theJSONUnit.skills) {
            var jsonSkill = this.theJSONUnit.skills[skillRef];
            var jss = new JSSkill(jsonSkill, this);
            this.theJSSkills.push(jss);
        }
    }
    
    getTitle() {
        return this.title;
    }
    
    getId() {
        return this.id;
    }
    
    toHTML()
    {
        var txt = "";
        txt += "<td>";
        txt += "<table>\n";
        
        //=== One line for the unit title
        txt += "<tr>";
        txt += "<div class=\"unittitle\" id=\"" + this.id + "\">";
        txt += this.title;
        txt += "</div>";
        txt += "</tr>";

        //=== One line for the content
        txt += "<tr class=\"unitcontent\" id=\"contentof" + this.id + "\">\n";

        // one column empty
        txt += "<td class=\"indent\">\n"; 
        txt += "</td>\n";

        //------------ one column for the topics in a table -------
        txt += "<td class=\"topicscol\">\n"; 
        txt += "<table id=\"topicsTable\">\n";
        for (var topicRef in this.theJSTopics) {
            var topic = this.theJSTopics[topicRef];
            txt += "<tr class=\"topiccol\">\n"; 
            txt += topic.toHTML();
            txt += "</tr>\n"; 
        }
        txt += "</table>\n";
        txt += "</td>\n";
        //------------------- End of topics -------------------

        //--------- empty column ----------
        txt += "<td class=\"paddingtopskill\"></td>\n"; 

        //-------- one column for the skills ---------------
        txt += "<td class=\"skillscol\">\n"; 
        
        // Skills in a table, one row for each skill
        txt += "<table>\n";
        for (var skillRef in this.theJSSkills) {
            var skill = this.theJSSkills[skillRef];
            txt += "<tr>\n"; 
            txt += skill.toHTML();
            txt += "</tr>\n"; 
        }
        txt += "</table>\n";
        txt += "</td>\n"; 

        //---------------- end of skills --------------
        txt += "</tr>";
        txt += "</table>\n"; // End of content

        txt += "</td>";

        return txt;
    }
}

class JSArea {
    
    constructor(jsonArea, curricula) {
        this.theJSONArea = jsonArea;
        this.jsUnits = [];
        this.title = this.theJSONArea.area_name;
        this.id = this.theJSONArea.area_name;
        this.theJSCurricula = curricula;
        
        for (var unitRef in this.theJSONArea.units) {
            var jsonUnit = this.theJSONArea.units[unitRef];
            var jsu = new JSUnit(jsonUnit, this);
            this.jsUnits.push(jsu);
        }
    }

    getTitle() {
        return this.title;
    }

    getId() {
        return this.id;
    }

    toHTML()
    {
        var txt = "";

        //=== One column for the area title
        txt += "<td class=\"areatitlecol\">\n"; 
         txt += "<div class=\"areatitle\" id=\"" + this.id + "\">\n";
        txt += this.title + "<br>\n";
        txt += "</div>";
        txt += "</td>\n"; 

        //=== One column for the area content
        txt += "<td class=\"areacontentcol\">\n"; 
        txt += "<div id=\"contentof" + this.id + "\">\n";
        txt += "<table id=\"areaTable\">\n";

        //-- one row for each unit
        for (var unitRef in this.jsUnits) {
            var unit = this.jsUnits[unitRef];
            txt += "<tr id=\"unitRow\">";
            txt += unit.toHTML();
            txt += "</tr>";
        }
        txt += "</table>\n";
        txt += "</div>\n";                
        txt += "</td>\n";        
        return txt;
    }
}

class JSCurricula {
    
    constructor(jsonCurricula)
    {
        this.jsonCur = jsonCurricula;
        this.jsAreas = [];
        
        for (var areaRef in this.jsonCur) {
            var jsonArea = this.jsonCur[areaRef];
            var jsa = new JSArea(jsonArea, this);
            this.jsAreas.push(jsa);
        }
    }
    
    toHTML()
    {
        var txt = "";

        //=== One row for each area
        txt += "<table id=\"curricula\">\n";
        for (var areaRef in this.jsAreas) {
            var jsa = this.jsAreas[areaRef];
            txt += "<tr id=\"areaRow\">\n";
            txt += jsa.toHTML();
            txt += "</tr>\n"; 
        }
        txt += "</table>\n";

        return txt;
    }
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
}

//======================================================================================
//=============== printCSC() ===========================================================
//======================================================================================
window.printCSC = function(printNotAdressed = true)
{    
    var fs = require('fs');
    var txt = "";

    if (JSONCurricula == null) {
        JSONCurricula = JSON.parse(fs.readFileSync('CSC-content.json').toString());
        JSCurricula = new JSCurricula(JSONCurricula);
    }

    txt = JSCurricula.toHTML();
        
    document.getElementById("theCSCPage").innerHTML = txt;
   
    var allSelects = document.getElementsByTagName("select");
    for (var i=0; i < allSelects.length; i++)
    {
        allSelects[i].className = allSelects[i].options[allSelects[i].selectedIndex].className;
        allSelects[i].addEventListener("change", function() {selectChanged(this)});
    }
    
    for (var areaRef in JSCurricula.jsAreas) {
        var area = JSCurricula.jsAreas[areaRef];
        var areaId = area.getId();
        document.getElementById(areaId).addEventListener("click", function(){displayArea(this)});
        for (var unit in area.jsUnits) {
            var unitId = area.jsUnits[unit].getId();
            document.getElementById(unitId).addEventListener("click", function(){displayUnit(this)});
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
                            if (skillObj.num == skNum) {
                                skillObj.addressed = value;
                                return;
                            }
                        }
                    } else {
                        var topNum = splitted[3];
                        for (topic in unitObj.topics) {
                            topicObj = unitObj.topics[topic];
                            if (topicObj.num == topNum) {
                                if (selectType == "subtopic") {
                                    var subtopicNum = splitted[4];
                                    for (subtopic in topicObj.subtopics) {
                                        var subtopicObj = topicObj.subtopics[subtopic];
                                        if (subtopicObj.num == subtopicNum) {
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
    var element = document.getElementById("contentof" + area.id);
    var eStyle = element.currentStyle ?
        element.currentStyle.display :
        getComputedStyle(element, null).display;

    if (eStyle === 'none')
        document.getElementById("contentof" + area.id).style.display = 'inline';
    else
        document.getElementById("contentof" + area.id).style.display = "none";
}

function displayUnit(unit) {
    var element = document.getElementById("contentof" + unit.id);
    var eStyle = element.currentStyle ?
        element.currentStyle.display :
        getComputedStyle(element, null).display;

    if (eStyle === 'none')
        document.getElementById("contentof" + unit.id).style.display = 'block';
    else
        document.getElementById("contentof" + unit.id).style.display = "none";
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
