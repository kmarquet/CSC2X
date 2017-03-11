var JSONCur = null;
var JSCur = null;
addressedLevels = ["No", "Yes"];
masteryLevels = ["No", "Familiarity", "Usage", "Assessment"];

class JSSkill {

    constructor(jsonSkill, unit) {
        this.theJSONSkill = jsonSkill;
        this.content = jsonSkill.content;
        this.theJSUnit = unit;
        this.skillNum = jsonSkill.num;
        this.id = this.theJSUnit.getId() + "__skill__" + this.skillNum;
        this.mastery = jsonSkill.mastery;
        if (this.mastery != "No")
            this.theJSUnit.setConcerned();
    }

    setMastery(value)
    {
        var selectElt = document.getElementById("select__" + this.id);
        selectElt.className = "skill" + value.toLowerCase();
        selectElt.selectedIndex = masteryLevels.indexOf(value);
        this.mastery = value;
        this.theJSONSkill.mastery = value;

        if (value == "No") {
            this.theJSUnit.evalConcerned();
        } else {
            this.theJSUnit.setConcerned();
        }
    }
    
    isConcerned()
    {
        return (this.mastery != "No");
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
        txt += "<select align=\"right\" class=\"skill" + this.mastery.toLowerCase() + "\" id=\"select__" + this.id + "\">";

        for (var i = 0 ; i < masteryLevels.length ; i++) {
            var level = masteryLevels[i];
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
        this.id = this.theJSUnit.getId() + "__topic__" + this.theJSONTopic.num;
        this.theJSSubTopics = [];
        this.addressed = this.theJSONTopic.addressed;
        
        for (var subTopicRef in this.theJSONTopic.subtopics) {
            var jsonSubTopic = this.theJSONTopic.subtopics[subTopicRef];
            var jsst = new JSSubTopic(jsonSubTopic, this);
            this.theJSSubTopics.push(jsst);
        }
        
        if (this.addressed != "No")
            this.theJSUnit.setConcerned();
    }

    setSubTopicAddressed(num, value)
    {
        this.theJSSubTopics[num].setAddressed(value);
    }
    
    setAddressed(value)
    {
        if (this.addressed == value)
            return;
        
        var selectElt = document.getElementById("select__" + this.id);
        selectElt.className = "topic" + value.toLowerCase();
        selectElt.selectedIndex = addressedLevels.indexOf(value);
        
        this.addressed = value;
        this.theJSONTopic.addressed = value;

        if (value == "No") {
            for (var subtopicRef in this.theJSSubTopics) {
                this.theJSSubTopics[subtopicRef].setAddressed(value);                
            }
            this.theJSUnit.evalConcerned();
        } else {
            this.theJSUnit.setConcerned();
        }
    }
    
    getContent() {
        return this.content;
    }
    
    getId() {
        return this.id;
    }

    isSub()
    {
        return false;
    }
    
    getSelect()
    {
        var txt = "";
        txt += "<select id=\"select__" + this.id + "\" class=\"topic" + this.addressed.toLowerCase() + "\">";
        for (var i = 0 ; i < addressedLevels.length ; i++) {
            var aLevel = addressedLevels[i];
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

    isConcerned()
    {
        return (this.addressed != "No");
    }
    
    toHTML(displayOnlyConcerned = false)
    {
        var txt = "";

        //=== One col for the content
        txt += "<td class=\"topiccol\">";
        txt += "<div class=\"topic\">\n";
        txt += handleTopicContent(this.content) + "\n";
        txt += "</div>";
        txt += "<table>\n";
        for (var subtopicRef in this.theJSSubTopics) {
            var subtopic = this.theJSSubTopics[subtopicRef];
            if (displayOnlyConcerned && (! subtopic.isConcerned()))
                break;
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
        this.id = this.parentTopic.getId() + "__subtopic__" + this.theJSONTopic.num;
        this.addressed = this.theJSONTopic.addressed;
        if (this.addressed == "Yes")
            this.parentTopic.setAddressed(this.addressed);
    }
    
    setAddressed(value)
    {
        if (this.addressed == value)
            return;
        
        var selectElt = document.getElementById("select__" + this.id);
        selectElt.className = "subtopic" + value.toLowerCase();
        selectElt.selectedIndex = addressedLevels.indexOf(value);

        this.addressed = value;
        this.theJSONTopic.addressed = value;

        if (value == "Yes") {
            this.parentTopic.setAddressed("Yes");
        }
    }

    isSub()
    {
        return true;
    }
    
    isConcerned()
    {
        return (this.addressed != "No");
    }
    
    getSelect()
    {
        var txt = "";
        txt += "<select id=\"select__" + this.id + "\" class=\"subtopic" + this.addressed.toLowerCase() + "\">";
        for (var i = 0 ; i < addressedLevels.length ; i++) {
            var aLevel = addressedLevels[i];
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
        txt += handleTopicContent(this.content) + "\n";
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
        this.concerned = false;
        
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

    evalConcerned()
    {
        var newConcerned = false;
        for (var topicRef in this.topics) {
            var jsTopic = this.theJSTopics[topicRef];
            if (jsTopic.isConcerned()) {
                newConcerned = true;
                break;
            }
        }
        
        if (newConcerned == false) {
            for (var skillRef in this.skills) {
                var jsSkill = this.theJSSkills[skillRef];
                if (jsSkill.isConcerned()) {
                    newConcerned = true;
                    break;
                }
            }
        }
        if (newConcerned != this.concerned) {
            if (newConcerned == false) {
                this.concerned = false;
                this.theJSArea.evalConcerned();
            } else {
                this.setConcerned();
            }
        }            
    }

    setTopicAddressed(topicNum, value)
    {
        this.theJSTopics[topicNum].setAddressed(value);
    }
    setSubTopicAddressed(topicNum, subTopicNum, value)
    {
        this.theJSTopics[topicNum].setSubTopicAddressed(subTopicNum, value);
    }
    setSkill(skillNum, value)
    {
        this.theJSSkills[skillNum].setMastery(value);        
    }

    setConcerned()
    {
        this.concerned = true;
        this.theJSArea.setConcerned();
    }

    isConcerned()
    {
        return this.concerned;
    }

    getTitle() {
        return this.title;
    }
    
    getId() {
        return this.id;
    }
    
    toHTML(displayOnlyConcerned = false)
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
            if (displayOnlyConcerned && (! topic.isConcerned())) {
                continue;
            }
            txt += "<tr>\n"; 
            txt += topic.toHTML(displayOnlyConcerned);
            // txt += " " + topic.isConcerned();
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
            if (displayOnlyConcerned && (! skill.isConcerned())) {
                continue;
            } else {
                txt += "<tr>\n"; 
                txt += skill.toHTML();
                // txt += "->" + skill.mastery;
                txt += "</tr>\n";
            }
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
        this.concerned = false;
        
        for (var unitRef in this.theJSONArea.units) {
            var jsonUnit = this.theJSONArea.units[unitRef];
            var jsu = new JSUnit(jsonUnit, this);
            this.jsUnits.push(jsu);
        }
    }
    
    evalConcerned()
    {
        var newConcerned = false;

        for (var unitRef in this.jsUnits) {
            var jsUnit = this.jsUnits[unitRef];
            if (jsUnit.isConcerned()) {
                newConcerned = true;
                break;
            }
        }
        
        if (newConcerned != this.concerned) {
            if (newConcerned == false) {
                this.concerned = false;
            } else {
                this.setConcerned();
            }
        }            
    }

    getTitle() {
        return this.title;
    }

    getId() {
        return this.id;
    }

    setConcerned()
    {
        this.concerned = true;
    }

    isConcerned()
    {
        return this.concerned;
    }

    getUnit(unitName)
    {
        for (var unitRef in this.jsUnits) {
            var jsUnit = this.jsUnits[unitRef];
            if ((this.id + "__" + unitName) == jsUnit.getId())
                return jsUnit;
        }
        return null;
    }

    toHTML(displayOnlyConcerned = false)
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
            if (displayOnlyConcerned && (! unit.isConcerned()))
                break;

            txt += "<tr id=\"unitRow\">";
            txt += unit.toHTML(displayOnlyConcerned);
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

    getUnit(areaName, unitName)
    {
        for (var areaRef in this.jsAreas) {
            var jsArea = this.jsAreas[areaRef];
            if (jsArea.id == areaName)
                return jsArea.getUnit(unitName);
        }
        return null;
    }
    
    toHTML(displayOnlyConcerned = false)
    {
        var txt = "";

        //=== One row for each area
        txt += "<table id=\"curricula\">\n";
        for (var areaRef in this.jsAreas) {
            var jsa = this.jsAreas[areaRef];
            if (displayOnlyConcerned && (! jsa.isConcerned()))
                break;
            txt += "<tr id=\"areaRow\">\n";
            txt += jsa.toHTML(displayOnlyConcerned);
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
window.printCSC = function(displayOnlyConcerned = false)
{    
    var fs = require('fs');
    var txt = "";

    if (JSONCur == null) {
        JSONCur = JSON.parse(fs.readFileSync('CSC-content.json').toString());
        JSCur = new JSCurricula(JSONCur);
    }

    txt = JSCur.toHTML(displayOnlyConcerned);
        
    document.getElementById("theCSCPage").innerHTML = txt;
   
    var allSelects = document.getElementsByTagName("select");
    for (var i=0; i < allSelects.length; i++)
    {
        allSelects[i].addEventListener("change", function() {selectChanged(this)});
    }
    
    for (var areaRef in JSCur.jsAreas) {
        var area = JSCur.jsAreas[areaRef];

        if (displayOnlyConcerned && (! area.isConcerned()))
            continue;
        
        var areaId = area.getId();
        document.getElementById(areaId).addEventListener("click", function(){displayArea(this)});
        for (var unitRef in area.jsUnits) {
            var unit = area.jsUnits[unitRef];
            
            if (displayOnlyConcerned && (! unit.isConcerned()))
                continue;

            document.getElementById(unit.getId()).addEventListener("click", function(){displayUnit(this)});
        }
    }

    document.getElementById("newCSC").addEventListener("change", function(){loadCSC(this.id)});
    document.getElementById("saveCSC").addEventListener("click", function(){saveCSC(this.id)});
    document.getElementById("GCCSC").addEventListener("click", function(){GCCSC(this.id)});
    document.getElementById("resetCSC").addEventListener("click", function(){resetCSC(this.id)});
    document.getElementById("latexExportCSC").addEventListener("click", function(){latexExportCSC(this.id)});
}

function selectChanged(elt) {
    // elt.className = elt.options[elt.selectedIndex].className;
    var splitted = elt.id.split("__");
    var areaName = splitted[1];
    var unitName = splitted[2];
    var selectType = splitted[3];

    var jsUnit = JSCur.getUnit(areaName, unitName);

    if (selectType == "skill") {
        var skNum = parseInt(splitted[4]);
        jsUnit.setSkill(skNum, elt.value);
    } else { 
        var topNum = parseInt(splitted[4]);
        if (splitted.length > 5) { //subtopic case
            var subtopNum = parseInt(splitted[6]);
            jsUnit.setSubTopicAddressed(topNum, subtopNum, elt.value);
        } else {
            jsUnit.setTopicAddressed(topNum, elt.value);
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
        printCSC(false);
    }
    var blob = file.slice(0, file.size-1);
    fr.readAsText(blob);
}

function GCCSC() {
    printCSC(true);
}

function resetCSC() {
    JSONCur = null;
    printCSC(false);
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


function handleTopicContent(content)
{
    var regex = /(.*)\(cross[-\s]reference(.*)\)(.*)/i;
    var match = regex.exec(content);
    if (match != null) {
        var res = "";
        var i;
        res += match[1] + " <pre class=\"crossref\">(cross-ref ";
        res += handleXrefs(match[2]);
        res += ")</pre>";
        return res;
    } else {
        return content;
    }
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
        res += "<a href=\"\#" + area + "__" + topic.replaceAll(" ", "_") + "\">" + area + "/" + topic + "</a>" + " and ";
    }
    match = regexEnd.exec(refs);
    if (match != null) {
        area = match[1].trim();
        topic = match[2].trim();
        res += "<a href=\"\#" + area + "__" + topic.replaceAll(" ", "_") + "\">" + area + "/" + topic + "</a>";
    } else {
        res += "BUG!!!" + refs + "!!!";
    }
    return res;
}


// TODO
// - add "Show useless item"
// - export to LaTeX
// - export to pdf
// - place buttons in a pretty manner
// - play with colors
// - copy/paste from .pdf => dans le .json
// - debugger le texte certains cross-ref sont coupés
// - mettre en ligne
