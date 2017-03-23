var JSONCur = null;
var JSCur = null;
addressedLevels = ["No", "Yes"];
masteryLevels = ["No", "Familiarity", "Usage", "Assessment"];
displayOnlyConcerned = false;

class JSSkill {

    constructor(jsonSkill, unit) {
        this.theJSONSkill = jsonSkill;
        this.theJSUnit = unit;
        this.id = this.theJSUnit.getId() + "__skill__" + this.theJSONSkill.num;
        if (this.theJSONSkill.mastery != "No")
            this.theJSUnit.setConcerned();
    }

    setMastery(value)
    {
        var selectElt = document.getElementById("select__" + this.id);
        selectElt.className = "skill" + value.toLowerCase();
        selectElt.selectedIndex = masteryLevels.indexOf(value);
        this.theJSONSkill.mastery = value;
    }
    
    isConcerned()
    {
        return (this.theJSONSkill.mastery != "No");
    }

    getSelectId()
    {
        return "select__" + this.id;
    }
    
    toHTML()
    {
        var txt = "";
        
        //=== One column for the content
        txt += "<td class=\"skillcol\">\n"; 
        txt += "<div class=\"skill\">\n";
        txt += this.theJSONSkill.content + "\n";
        txt += "</div>";
        txt += "</td>\n";
        
        //=== One column for the select
        txt += "<td class=\"skillselectcol \">\n";
        txt += "<select align=\"right\" class=\"skill" + this.theJSONSkill.mastery.toLowerCase() + "\" id=\"" + this.getSelectId() + "\">";

        for (var i = 0 ; i < masteryLevels.length ; i++) {
            var level = masteryLevels[i];
            txt += "<option";
            if (level == this.theJSONSkill.mastery) {
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
    
    toLaTeX()
    {
        var txt = "";

        txt += this.theJSONSkill.content;
        txt += " & ";
        txt += this.theJSONSkill.mastery;
        return txt;
    }
}

class JSTopic {
    
    constructor(jsonTopic, unit) {
        this.theJSONTopic = jsonTopic;
        this.theJSUnit = unit;
        this.id = this.theJSUnit.getId() + "__topic__" + this.theJSONTopic.num;
        this.theJSSubTopics = [];
        this.nbSubTopicsConcerned = 0;
        
        for (var subTopicRef in this.theJSONTopic.subtopics) {
            var jsonSubTopic = this.theJSONTopic.subtopics[subTopicRef];
            var jsst = new JSSubTopic(jsonSubTopic, this);
            this.theJSSubTopics.push(jsst);
            if (jsst.isConcerned()) {
                this.nbSubTopicsConcerned++;
            }
        }
    }

    setSubTopicAddressed(num, value)
    {
        var aJSSubTopic = this.theJSSubTopics[num];
        if (aJSSubTopic.addressed != value) {
            aJSSubTopic.setAddressed(value);
            if (value == "Yes") {
                this.nbSubTopicsConcerned++;
                if (this.nbSubTopicsConcerned == 1) {
                    this.setAddressed("Yes");
                }
            } else {
                this.nbSubTopicsConcerned--;
                if (this.nbSubTopicsConcerned == 0) {
                    this.setAddressed("No");
                }
            }
        }
    }
    
    setAddressed(value)
    {
        if (this.theJSONTopic.addressed == value)
            return;
        
        var selectElt = document.getElementById("select__" + this.id);
        selectElt.className = "topic" + value.toLowerCase();
        selectElt.selectedIndex = addressedLevels.indexOf(value);
        
        this.theJSONTopic.addressed = value;

        if (value == "No") {
            for (var subtopicRef in this.theJSSubTopics) {
                this.theJSSubTopics[subtopicRef].setAddressed(value);                
            }
        }
    }
        
    getId() {
        return this.id;
    }

    getSelectId()
    {
        return "select__" + this.getId();
    }
    
    getSelect()
    {
        var txt = "";
        txt += "<select id=\"" + this.getSelectId() + "\" class=\"topic" + this.theJSONTopic.addressed.toLowerCase() + "\">";
        for (var i = 0 ; i < addressedLevels.length ; i++) {
            var aLevel = addressedLevels[i];
            txt += "<option";
            if (this.theJSONTopic.addressed == aLevel) {
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
        return (this.theJSONTopic.addressed != "No");
    }
    
    toHTML()
    {
        var txt = "";
        
        //=== One col for the content
        txt += "<td class=\"topiccol\">";
        txt += "<div class=\"topic\">\n";
        txt += this.theJSONTopic.content;
        if (this.theJSONTopic.xrefs != "") {
            txt += " <pre class=\"crossref\"> ";
            txt += this.theJSONTopic.xrefs + "<br>";
            txt += this.theJSONTopic.xrefs.replace("}{", "\">").replace("{", "<a href=\"#").replace("}", "</a>");
            txt += ")</pre>";
        }
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

    addEventListeners()
    {
        for (var subtopicRef in this.theJSSubTopics) {
            var subtopic = this.theJSSubTopics[subtopicRef];
            if (displayOnlyConcerned && (! subtopic.isConcerned()))
                break;
            else
                document.getElementById(subtopic.getSelectId()).addEventListener("change", function() {selectChanged(this)});
        }
    }
    

    toLaTeX()
    {
        var txt = " & ";
        txt += "\\begin{minipage}[h]{7cm}";
        txt += this.theJSONTopic.content;
        if (this.theJSSubTopics.length > 0) {
            txt += "\\\\";
            txt += "\\begin{tabular}{m{6.5cm} m{0.5cm}}\n";
            for (var topicRef in this.theJSSubTopics) {
                var subtopic = this.theJSSubTopics[topicRef];
                if (subtopic.isConcerned()) {
                    txt += subtopic.toLaTeX();
                    txt += "\\\\\\hline\n";
                }
            }
            txt += "\\end{tabular}\n";
        }
        txt += "\\end{minipage}";
        txt += " & " + this.theJSONTopic.addressed;
        return txt;
    }
}

class JSSubTopic {
    
    constructor(jsonSubTopic, topic) {
        this.parentTopic = topic;
        this.theJSONTopic = jsonSubTopic;
        this.theJSUnit = null;
        this.id = this.parentTopic.getId() + "__subtopic__" + this.theJSONTopic.num;
        if (this.theJSONTopic.addressed == "Yes")
            this.parentTopic.setAddressed(this.theJSONTopic.addressed);
    }
    
    setAddressed(value)
    {
        if (this.theJSONTopic.addressed == value)
            return;
        
        var selectElt = document.getElementById("select__" + this.id);
        selectElt.className = "subtopic" + value.toLowerCase();
        selectElt.selectedIndex = addressedLevels.indexOf(value);

        this.theJSONTopic.addressed = value;
    }

    isConcerned()
    {
        return (this.theJSONTopic.addressed != "No");
    }

    getSelectId()
    {
        return "select__" + this.id;
    }
    
    getSelect()
    {
        var txt = "";
        txt += "<select id=\"" + this.getSelectId() + "\" class=\"subtopic" + this.theJSONTopic.addressed.toLowerCase() + "\">";
        for (var i = 0 ; i < addressedLevels.length ; i++) {
            var aLevel = addressedLevels[i];
            txt += "<option";
            if (this.theJSONTopic.addressed == aLevel) {
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

        if (this.theJSONTopic.xrefs != "") {
            txt += " <pre class=\"crossref\">(cross-reference ";
            txt += this.theJSONTopic.xrefs.replace("}{", "\">").replace("{", "<a href=\"#").replace("}", "</a>")
            txt += ")</pre>";
        }
        txt += "</div>\n";          
        txt += "</td>\n"; 

        //=== One column for the select
        txt += "<td class=\"subtopicselectcol\" align=\"left\">\n"; 
        txt += this.getSelect();
        txt += "</td>\n";
        return txt;
    }

    toLaTeX()
    {
        var txt = " & ";
        txt += this.theJSONTopic.content;
        txt += " & ";
        txt += this.theJSONTopic.addressed;
        return txt;
    }
}


Object.setPrototypeOf(JSSubTopic.prototype, JSTopic);

class JSUnit {
    
    constructor(jsonUnit, area) {
        this.title = jsonUnit.title;
        this.theJSArea = area;
        this.id = this.theJSArea.getId() + "__" + this.title.replaceAll(" ", "_"); 
        this.title = jsonUnit.title.replaceAll("_", " ");
        this.theJSONUnit = jsonUnit;
        this.theJSTopics = [];
        this.theJSSkills = [];
        this.concerned = false;
        this.nbTopicsConcerned = 0;
        this.nbSkillsConcerned = 0;
        this.isContentVisible = false;
        
        for (var topicRef in this.theJSONUnit.topics) {
            var jsonTopic = this.theJSONUnit.topics[topicRef];
            var jst = new JSTopic(jsonTopic, this);
            this.theJSTopics.push(jst);
            if (jst.isConcerned()) {
                this.nbTopicsConcerned++;
            }
        }
        for (var skillRef in this.theJSONUnit.skills) {
            var jsonSkill = this.theJSONUnit.skills[skillRef];
            var jss = new JSSkill(jsonSkill, this);
            this.theJSSkills.push(jss);
            if (jss.isConcerned()) {
                this.nbSkillsConcerned++;
            }
        }
    }

    setTopicAddressed(topicNum, value)
    {
        var aJSTopic = this.theJSTopics[topicNum];
        if (aJSTopic.addressed != value) {
            aJSTopic.setAddressed(value);

            if (value == "Yes") {
                this.nbTopicsConcerned++;
                if (this.nbTopicsConcerned == 1) {
                    this.theJSArea.incUnitsConcerned();
                }
            } else {
                this.nbSubTopicsConcerned--;
                if (this.nbTopicsConcerned == 0) {
                    this.theJSArea.decUnitsConcerned();
                }
            }
        }
    }
    
    setSubTopicAddressed(topicNum, subTopicNum, value)
    {
        this.theJSTopics[topicNum].setSubTopicAddressed(subTopicNum, value);
    }
    setSkill(skillNum, value)
    {
        var aJSSkill = this.theJSSkills[skillNum];
        if (aJSSkill.theJSONSkill.mastery != value) {
            aJSSkill.setMastery(value);
            if (this.value == "No") {
                this.nbSkillsConcerned++;
            } else {
                if (value == "No")
                    this.nbSkillsConcerned--;
            }
        }        
    }

    isConcerned()
    {
        return (this.nbTopicsConcerned > 0);
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
        if (this.theJSONUnit.intro != "") {
            txt += "\n<br>";
            txt += "<div class=\"unitintro\">";
            txt += this.theJSONUnit.intro;
            txt += "</div>\n";
        }
        txt += "</div>";
        txt += "</tr>";


        //=== One line for the content
        if (this.isContentVisible) {
            txt += "<tr class=\"unitcontent\" id=\"contentof" + this.id + "\">\n";
            
            // one column empty
            // txt += "<td class=\"smallindent\">\n"; 
            // txt += "</td>\n";
            
            //------------ one column for the topics in a table -------
            txt += "<td class=\"topicscol\">\n"; 
            txt += "<table id=\"topicsTable\">\n";
            for (var topicRef in this.theJSTopics) {
                var topic = this.theJSTopics[topicRef];
                if (displayOnlyConcerned && (! topic.isConcerned())) {
                    continue;
                }
                txt += "<tr>\n"; 
                txt += topic.toHTML();
                // txt += " " + topic.isConcerned();
                txt += "</tr>\n"; 
            }
            txt += "</table>\n";
            txt += "</td>\n";
            //------------------- End of topics -------------------
            
            //--------- empty column ----------
            txt += "<td class=\"smallpadding\"></td>\n"; 
            
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
        }
        txt += "</table>\n"; // End of content
        txt += "</td>";
        
        return txt;
    }

    topicsToLaTeX()
    {
        var txt = " & ";
        var first = true;
        
        txt += "\\multirow {" + this.nbTopicsConcerned + "}{*}{" + this.title + "}";
        for (var topicRef in this.theJSTopics) {
            var topic = this.theJSTopics[topicRef];
            if (topic.isConcerned()) {
                if (first) {
                    first = false;
                    txt += topic.toLaTeX();
                } else {
                    txt += "\n\\\\\\cline{3-4}\n";
                    txt += " & ";
                    txt += topic.toLaTeX();
                }
            }
        }
        return txt;
    }

    addEventListeners()
    {
        for (var topicRef in this.theJSTopics) {
            var topic = this.theJSTopics[topicRef];
            if (displayOnlyConcerned && (! topic.isConcerned())) {
                continue;
            } else {
                document.getElementById(topic.getSelectId()).addEventListener("change", function() {selectChanged(this)});
                topic.addEventListeners(); 
            }
        }

        for (var skillRef in this.theJSSkills) {
            var skill = this.theJSSkills[skillRef];
            if (displayOnlyConcerned && (! skill.isConcerned())) {
                continue;
            } else {
                document.getElementById(skill.getSelectId()).addEventListener("change", function() {selectChanged(this)});
            }
        }
    }
}

class JSArea {
    
    constructor(jsonArea, curricula) {
        this.theJSONArea = jsonArea;
        this.jsUnits = [];
        this.abbrev = this.theJSONArea.abbrev;
        this.title = this.theJSONArea.title;
        this.id = this.theJSONArea.abbrev;
        this.theJSCurricula = curricula;
        this.concerned = false;
        this.nbUnitsConcerned = 0;
        this.isContentVisible = false;
        
        for (var unitRef in this.theJSONArea.units) {
            var jsonUnit = this.theJSONArea.units[unitRef];
            var jsu = new JSUnit(jsonUnit, this);
            this.jsUnits.push(jsu);
            if (jsu.isConcerned()) {
                this.nbUnitsConcerned++;
            }
        }
    }

    incUnitsConcerned()
    {
        this.nbUnitsConcerned++;
        if (this.nbUnitsConcerned == 1)
            this.theJSCurricula.incAreasConcerned();
    }
    decUnitsConcerned()
    {
        this.nbUnitsConcerned--;
        if (this.nbUnitsConcerned == 0)
            this.theJSCurricula.decAreasConcerned();
    }
    
    getId() {
        return this.id;
    }

    isConcerned()
    {
        return (this.nbUnitsConcerned != 0);
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

    getIntroId()
    {
        return "content_intro_" + this.id;
    }

    getLinkIntroId()
    {
        return "intro_" + this.id;
    }

    toHTML()
    {
        var txt = "";

        //=== One column for the area title
        txt += "<td class=\"areatitlecol\">\n"; 
        txt += "<div class=\"areaabbrev\" id=\"" + this.id + "\">\n";
        txt += this.abbrev + "<br>\n";
        txt += "<span class=\"areatitle\">" + this.title + "</span><br>\n";
        txt += "</div>";
        txt += "<div class=\"linkareaintro\" id=\""+ this.getLinkIntroId() + "\">";
        txt += "About";
        txt += "</div>";
        // txt += "<div class=\"areaintro\" id=\"" + this.getIntroId() + "\">";
        // txt += this.theJSONArea.intro;
        // txt += "</div>";        
        txt += "</td>\n";

        if (this.isContentVisible) {    
            //=== One column for the area content
            txt += "<td class=\"areacontentcol\">\n"; 
            txt += "<div id=\"contentof" + this.id + "\">\n";
            txt += "<table id=\"areaTable\">\n";
            
            //-- one row for each unit
            for (var unitRef in this.jsUnits) {
                var unit = this.jsUnits[unitRef];
                if (displayOnlyConcerned && (! unit.isConcerned()))
                    break;
                
                txt += "<tr id=\"tr__" + unit.id + "\">";
                txt += unit.toHTML();
                txt += "</tr>";
            }
            txt += "</table>\n";
            txt += "</div>\n";                
            txt += "</td>\n";
        }
        return txt;
    }

    topicsToLaTeX()
    {
        var txt = "";
        var nbTopicsTotal = 0;
        var first = true;
        
        for (var unitRef in this.jsUnits) {
            var unit = this.jsUnits[unitRef];
            nbTopicsTotal += unit.nbTopicsConcerned;
        }
        
        //=== One column for the area title
        txt += "\\multirow{" + nbTopicsTotal + "}{*}{" + this.abbrev + "}";        
        //-- one row for each unit
        for (var unitRef in this.jsUnits) {
            var unit = this.jsUnits[unitRef];
            if (unit.isConcerned()) {
                if (first) {
                    txt += unit.topicsToLaTeX();
                    first = false;
                } else {
                    txt += "\n\\\\\\cline{3-4}\n";
                    txt += unit.topicsToLaTeX();
                }
            }
        }
        return txt;
    }

    addEventListeners()
    {
        for (var unitRef in this.jsUnits) {
            var unit = this.jsUnits[unitRef];
            
            if (displayOnlyConcerned && (! unit.isConcerned()))
                continue;

            document.getElementById(unit.getId()).addEventListener("click", function(){displayUnit(this)});
            
            if (unit.isContentVisible) {
                unit.addEventListeners();
            }
        }
    }
}

class JSCurricula
{
    constructor(jsonCurricula)
    {
        this.jsonCur = jsonCurricula;
        this.jsAreas = [];
        this.nbAreasConcerned = 0;
        
        for (var areaRef in this.jsonCur) {
            var jsonArea = this.jsonCur[areaRef];
            var jsa = new JSArea(jsonArea, this);
            this.jsAreas.push(jsa);
            if (jsa.isConcerned()) {
                this.nbAreasConcerned++;
            }
        }
    }
    
    makeAreaVisible(areaElt)
    {
        var areaId = areaElt.id;
        var trElt = document.getElementById("tr__" + areaElt.id);
        var jsa = this.getArea(areaId);
        if (jsa.isContentVisible == false) {
            jsa.isContentVisible = true;
            trElt.innerHTML = jsa.toHTML();
            document.getElementById(areaId).addEventListener("click", function(){displayArea(this)});
            jsa.addEventListeners();
        } else {
            jsa.isContentVisible = false;
            trElt.innerHTML = jsa.toHTML();
            document.getElementById(areaId).addEventListener("click", function(){displayArea(this)});
        }
    }
    
    makeUnitVisible(unitElt)
    {
        var splitted = unitElt.id.split("__");
        var areaId = splitted[0];
        var unitId = splitted[1];
        var trElt = document.getElementById("tr__" + unitElt.id);
        var jsu = this.getUnit(areaId, unitId);
        if (jsu.isContentVisible == false) {
            jsu.isContentVisible = true;
            trElt.innerHTML = jsu.toHTML();
            document.getElementById(unitElt.id).addEventListener("click", function(){displayUnit(this)});
            jsu.addEventListeners();
        } else {
            jsu.isContentVisible = false;
            trElt.innerHTML = jsu.toHTML();
            document.getElementById(unitElt.id).addEventListener("click", function(){displayUnit(this)});            
        }
    }
    
    incAreasConcerned()
    {
        this.nbAreasConcerned++;
    }
    decAreasConcerned()
    {
        this.nbAreasConcerned--;
    }
    
    getArea(areaName)
    {
        for (var areaRef in this.jsAreas) {
            var jsArea = this.jsAreas[areaRef];
            if (jsArea.id == areaName)
                return jsArea;
        }
        return null;
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

    toHTML()
    {
        var txt = "";

        //=== One row for each area
        txt += "<table id=\"curricula\">\n";
        for (var areaRef in this.jsAreas) {
            var jsa = this.jsAreas[areaRef];
            if (displayOnlyConcerned && (! jsa.isConcerned()))
                break;
            txt += "<tr id=\"tr__" + jsa.id + "\">\n";
            txt += jsa.toHTML();
            txt += "</tr>\n"; 
        }
        txt += "</table>\n";

        return txt;
    }

    toLaTeX()
    {
        var txt = "";
        var first;
        
        txt += "\\begin{table}\n";

        txt += "\\begin{center}\n";
        txt += "\\begin{tabular}{ >{\\bfseries\\large}l  >{\\bfseries}m{4cm}  m{7cm}  m{1cm} }\n";
        txt += "\n";
        txt += "Area & Unit & \\textbf{Topics} & \\textbf{Addressed ?}\n";
        txt += "\\\\\\hline\n";

        for (var areaRef in this.jsAreas) {
            var jsa = this.jsAreas[areaRef];
            if (jsa.isConcerned()) {
                if (first) {
                    txt += jsa.topicsToLaTeX();
                    first = false;
                } else {
                    txt += "\\\\\\hline";
                    txt += jsa.topicsToLaTeX();                    
                }
            }
        }
        txt += "\\end{tabular}\n\\end{center}\n"
        txt += "\\end{table}\n";
        return txt;
    }

    addEventListeners()
    {
        for (var areaRef in this.jsAreas) {
            var area = this.jsAreas[areaRef];
            
            if (displayOnlyConcerned && (! area.isConcerned()))
                continue;
            
            var areaId = area.getId();
            document.getElementById(areaId).addEventListener("click", function(){displayArea(this)});
            var areaLinkIntroId = area.getLinkIntroId();
            document.getElementById(areaLinkIntroId).addEventListener("click", function(){displayAreaIntro(this)});

            if (area.isContentVisible)
                area.addEventListeners();
        }
    }
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
}

//======================================================================================
//=============== printCSC() ===========================================================
//======================================================================================
window.printCSC = function()
{    
    var fs = require('fs');
    var txt = "";

    if (JSCur == null) {
        JSONCur = JSON.parse(fs.readFileSync('CSC-content.json').toString());
        JSCur = new JSCurricula(JSONCur);
    }
    txt = JSCur.toHTML();
        
    document.getElementById("theCSCPage").innerHTML = txt;
       
    JSCur.addEventListeners();

    document.getElementById("newCSC").addEventListener("change", function(){loadCSC(this.id)});
    document.getElementById("saveCSC").addEventListener("click", function(){saveCSC(this.id)});
    document.getElementById("GCCSC").addEventListener("click", function(){GCCSC(this.id)});
    document.getElementById("showCSC").addEventListener("click", function(){showCSC(this.id)});
    document.getElementById("resetCSC").addEventListener("click", function(){resetCSC(this.id)});
    document.getElementById("latexExportCSC").addEventListener("click", function(){latexExportCSC(this.id)});
    document.getElementById("pdfExportCSC").addEventListener("click", function(){pdfExportCSC(this.id)});
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
//    var dlElem = document.getElementById(id);
    var link = document.createElement('a');
    var data = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(JSONCur));
    link.setAttribute("href", "data:" + data);
    link.setAttribute("download", "savedCSC.json");
    document.body.appendChild(link);
    link.click();

}

function loadCSC() {
    var file = document.getElementById("newCSC").files[0];
    var fr = new FileReader();
    fr.onload = function(e) {
        JSONCur = JSON.parse(e.target.result);
        JSCur = new JSCurricula(JSONCur);
        printCSC();
    }
    var blob = file.slice(0, file.size-1);
    fr.readAsText(blob);
}

function GCCSC() {
    displayOnlyConcerned = true;
    printCSC();
}

function showCSC() {
    displayOnlyConcerned = false;
    printCSC();
}

function resetCSC() {
    JSCur = null;
    printCSC();
}

function latexExportCSC(id) {
    // var dlElem = document.getElementById(id);
    var link = document.createElement('a');
    var data = "data:application/x-latex;charset=utf-8," + encodeURIComponent(JSCur.toLaTeX());
    link.setAttribute("href", "data:" + data);
    link.setAttribute("download", "savedCSC.tex");    
    document.body.appendChild(link);
    link.click();
}

function pdfExportCSC() {
    
}

window.displayArea = function(areaElt) {
    JSCur.makeAreaVisible(areaElt);
}

function displayUnit(unitElt) {
    JSCur.makeUnitVisible(unitElt);    
}

function displayAreaIntro(area) {
    var areaIntroId = area.id;
    var areaId = area.id.substring(6);
    var newdiv = document.createElement('div');
    var jsarea = JSCur.getArea(areaId);
    // var rect = area.getBoundingClientRect();
    // var x = rect.top;
    // var y = rect.left;

    newdiv.setAttribute("class", "areaintro");
    newdiv.setAttribute("id", "content_" + areaIntroId);
    // newdiv.style.top = x + 'px';
    // newdiv.style.left = y + 'px';
    
    newdiv.innerHTML += jsarea.theJSONArea.intro;

    document.body.append(newdiv);
    
    //    document.body.appendChild(newdiv);

    // var element = document.getElementById("content_" + areaIntroId);
    // var eStyle = element.currentStyle ?
    //     element.currentStyle.display :
    //     getComputedStyle(element, null).display;

    // if (eStyle === 'none')
    //     element.style.display = "block";
    // else
    //     element.style.display = "none";
}

// TODO
// - export to LaTeX
// - export to pdf
// - place buttons in a pretty manner
// - play with colors
// - copy/paste from .pdf => dans le .json
// - debugger le texte certains cross-ref sont coupés
// - mettre en ligne
