var JSONCur = null;
var JSCur = null;
addressedLevels = ["No", "Yes"];
masteryLevels = ["No", "Familiarity", "Usage", "Assessment"];
displayOnlyConcerned = false;
boardDisplayed = false;
expand = false;


class JSSkill {
    constructor(jsonSkill, unit) {
        this.theJSONSkill = jsonSkill;
        this.theJSUnit = unit;
        this.id = this.theJSUnit.getId() + "__skill__" + this.theJSONSkill.num;
	this.duplication = 0;
    }

    setMastery(value)
    {
        var selectElt = document.getElementById("select__" + this.id);
	if (selectElt != null) {
            selectElt.className = "skill" + value.toLowerCase();
            selectElt.selectedIndex = masteryLevels.indexOf(value);
	}
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
	if (this.duplication == 0) {
            txt += "<td class=\"skillcol\">\n"; 
	} else {
	    txt += "<td class=\"skillcol duplicate\">\n"; 
	}

	txt += "<div class=\"skill\">\n" ;

        // txt += this.theJSONSkill.content + "\n";
        txt += this.theJSONSkill.content.replaceAll("}{", "\">").replaceAll("{", "<a href=\"#").replaceAll("}", "</a>");

        txt += "\n</div>";
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
        var txt = " & ";
        txt += "\\begin{minipage}[h]{8cm}";
        txt += this.theJSONSkill.content;
        txt += "\\end{minipage}";
        txt += " & ";
	txt += this.theJSONSkill.mastery;
        return txt;
    }

    toLaTeX2()
    {
        var txt = "";
        txt += "\\textmd{\\sffamily\\small " + this.theJSONSkill.mastery + "} ";
        txt += this.theJSONSkill.content;
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
        this.duplication = 0;

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
	if (selectElt != null) {
            selectElt.className = "topic" + value.toLowerCase();
            selectElt.selectedIndex = addressedLevels.indexOf(value);
        }
	
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
	if (this.duplication == 0) {
            txt += "<td class=\"topiccol\">";
	} else {
            txt += "<td class=\"topiccol duplicate\">";
	}

	txt += "<div class=\"topic\">\n";

        txt += this.theJSONTopic.content;
        if (this.theJSONTopic.xrefs != "") {
            txt += "<pre class=\"crossref\">cross-reference ";
            txt += this.theJSONTopic.xrefs.replaceAll("}{", "\">").replaceAll("{", "<a href=\"#").replaceAll("}", "</a>");
            txt += "</pre>";
        }
        txt += "</div>";
        txt += "<table>\n";
        for (var subtopicRef in this.theJSSubTopics) {
            var subtopic = this.theJSSubTopics[subtopicRef];
            if (displayOnlyConcerned && (! subtopic.isConcerned()))
                continue;
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
            if (displayOnlyConcerned && (! subtopic.isConcerned())) {
                continue;
            } else {
                document.getElementById(subtopic.getSelectId()).addEventListener("change", function() {selectChanged(this)});
            }
        }
    }
    

    toLaTeX()
    {
        var txt = " & ";
        var first = true;
        txt += "\\begin{minipage}[h]{8cm}";
        txt += this.theJSONTopic.content;
        if (this.theJSSubTopics.length > 0) {
            txt += "\\\\";
            txt += "\\begin{tabular}{m{6.5cm} m{0.5cm}}\n";
            for (var topicRef in this.theJSSubTopics) {
                var subtopic = this.theJSSubTopics[topicRef];
                if (subtopic.isConcerned()) {
                    if (! first) {
                        txt += "\\\\\\hline\n";
                        first = false;
                    } else {
                        txt += subtopic.toLaTeX();
                    }
                }
            }
            txt += "\\end{tabular}\n";
        }
        txt += "\\end{minipage}";
        txt += " & " + this.theJSONTopic.addressed;
        return txt;
    }

    toLaTeX2()
    {
        var txt = "";
        txt += this.theJSONTopic.content;
        if (this.theJSSubTopics.length > 0) {
            txt += "\\begin{itemize}\n";
            for (var topicRef in this.theJSSubTopics) {
                var subtopic = this.theJSSubTopics[topicRef];
                if (subtopic.isConcerned()) {
                    txt += "\\item ";
                    txt += subtopic.toLaTeX2();
                    txt += "\n";
                }
            }
            txt += "\\end{itemize}\n";
        }
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
	this.duplication = 0;
    }
    
    setAddressed(value)
    {
        if (this.theJSONTopic.addressed == value)
            return;
        
        var selectElt = document.getElementById("select__" + this.id);
	if (selectElt != null) {
            selectElt.className = "subtopic" + value.toLowerCase();
            selectElt.selectedIndex = addressedLevels.indexOf(value);
	}
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

	if (this.duplication == 0) {
            txt += "<td class=\"subtopiccol\">\n"; 
	} else {
            txt += "<div class=\"subtopicol duplicate\">\n";
	}
	
        txt += "<div class=\"subtopic\">\n";

        txt += this.theJSONTopic.content;
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
        var txt = "$\\rightarrow $";
        txt += this.theJSONTopic.content;
        txt += " & ";
        txt += this.theJSONTopic.addressed;
        return txt;
    }

    toLaTeX2()
    {
        var txt = this.theJSONTopic.content;
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
        this.nbTopicsConcerned = 0;
        this.nbSkillsConcerned = 0;

        if (expand)
            this.isContentVisible = true;            
        else
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
        
	    if (this.nbTopicsConcerned > 1) {
            txt += "\\multirow {" + this.nbTopicsConcerned + "}{*}{\\begin{minipage}{4cm}" + this.title + "\\end{minipage}}";
	    } else {
            txt += "\\begin{minipage}{4cm}" + this.title + "\\end{minipage}";
	    }
	    
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

    skillsToLaTeX()
    {
        var txt = " & ";
        var first = true;

	if (this.nbSkillsConcerned > 1)
            txt += "\\multirow {" + this.nbSkillsConcerned + "}{*}{\\begin{minipage}{4cm}" + this.title + "\\end{minipage}}";
	else
            txt += "\\begin{minipage}{4cm}" + this.title + "\\end{minipage}";
	
        for (var skillRef in this.theJSSkills) {
            var skill = this.theJSSkills[skillRef];
            if (skill.isConcerned()) {
                if (first) {
                    first = false;
                    txt += skill.toLaTeX();
                } else {
                    txt += "\n\\\\\\cline{3-4}\n";
                    txt += " & ";
                    txt += skill.toLaTeX();
                }
            }
        }
        return txt;
    }

    toLaTeX2() {
        var txt = "";
        txt += "\\textbf{\\large " + this.title + "}\n";
        txt += "\\textbf{Topics addressed}\\\\\n";
        txt += "\\begin{enumerate}\n";
        for (var topicRef in this.theJSTopics) {
            var topic = this.theJSTopics[topicRef];
            if (topic.isConcerned()) {
                txt += "\\item ";
                txt += topic.toLaTeX2();
                txt += "\n";
            }
        }
        txt += "\\end{enumerate}\n";

        txt += "\\textbf{Skills aimed:}";
        if (this.nbSkillsConcerned == 0) {
            txt += " None \\\\\n";
        } else {            
            txt += "\n\\begin{enumerate}\n";
            for (var skillRef in this.theJSSkills) {
                var skill = this.theJSSkills[skillRef];
                if (skill.isConcerned()) {
                    txt += "\\item ";
                    txt += skill.toLaTeX2();
                    txt += "\n";
                }
            }
            txt += "\\end{enumerate}\n";
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
        this.nbUnitsConcerned = 0;

        if (expand)
            this.isContentVisible = true;
        else
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
                    continue;
                
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
	if (nbTopicsTotal > 1) {
            txt += "\\multirow{" + nbTopicsTotal + "}{*}{" + this.abbrev + "}";        
	} else {
            txt += this.abbrev;        
	}
        //-- one row for each unit
        for (var unitRef in this.jsUnits) {
            var unit = this.jsUnits[unitRef];
            if (unit.isConcerned()) {
                if (first) {
                    txt += unit.topicsToLaTeX();
                    first = false;
                } else {
                    txt += "\n\\\\\\cline{2-4}\n";
                    txt += unit.topicsToLaTeX();
                }
            }
        }
        return txt;
    }

    skillsToLaTeX()
    {
        var txt = "";
        var nbSkillsTotal = 0;
        var first = true;
        
        for (var unitRef in this.jsUnits) {
            var unit = this.jsUnits[unitRef];
            nbSkillsTotal += unit.nbSkillsConcerned;
        }
        
        //=== One column for the area title
	if (nbSkillsTotal == 0) {
	    return txt;
	} else if (nbSkillsTotal > 1) {
            txt += "\\multirow{" + nbSkillsTotal + "}{*}{" + this.abbrev + "}";
	} else {
	    txt += this.abbrev;
	}
	//-- one row for each unit
        for (var unitRef in this.jsUnits) {
            var unit = this.jsUnits[unitRef];
            if (unit.isConcerned()) {
                if (first) {
                    txt += unit.skillsToLaTeX();
                    first = false;
                } else {
                    txt += "\n\\\\\\cline{2-4}\n";
                    txt += unit.skillsToLaTeX();
                }
            }
        }
        return txt;
    }

    toLaTeX2()
    {
        var txt = "";
        txt += "\\textbf{\\Large " + this.title + "}\n";
        txt += "\\begin{itemize}\n";           
        for (var unitRef in this.jsUnits) {
            var unit = this.jsUnits[unitRef];
            if (unit.isConcerned()) {
                txt += "\\item " + unit.toLaTeX2();
            }
        }
        txt += "\\end{itemize}\n";    
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
                continue;
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
        var first = true;

        txt += "\\documentclass[a4paper, article, 10pt, left=10mm, top=10mm]{article}\n"

        txt += "\\usepackage{tabularx}\n";
        txt += "\\usepackage{multicol}\n";
        txt += "\\usepackage{multirow}\n";
        txt += "\\usepackage[margin=0.5in]{geometry}\n";
        txt += "\\begin{document}\n";
        
        txt += "\\begin{table}\n";
        txt += "\\begin{center}\n";
        txt += "\\begin{tabular}{>{\\bfseries\\large}l | >{\\bfseries}m{4cm} | m{8cm} c |}\n";
        txt += "\n";
        txt += "\\hline\n";
        txt += "Area & Unit & \\textbf{Topics} & \\textbf{Addressed}\n";
        txt += "\\\\\\hline\n";

        for (var areaRef in this.jsAreas) {
            var jsa = this.jsAreas[areaRef];
            if (jsa.isConcerned()) {
                if (first) {
                    txt += jsa.topicsToLaTeX();
                    first = false;
                } else {
                    txt += "\\\\\\hline\n";
                    txt += jsa.topicsToLaTeX();                    
                }
            }
        }
        txt += "\n\\\\\\hline\n\\end{tabular}\n\\end{center}\n"
        txt += "\\end{table}\n";


        txt += "\\begin{table}\n";
        txt += "\\begin{center}\n";
        txt += "\\begin{tabular}{| >{\\bfseries\\large}l  >{\\bfseries}m{4cm} | m{8cm} c |}\n";
        txt += "\n";
        txt += "Area & Unit & \\textbf{Skill} & \\textbf{Mastery}\n";
        txt += "\\\\\\hline\n";

        for (var areaRef in this.jsAreas) {
            var jsa = this.jsAreas[areaRef];
            if (jsa.isConcerned()) {
                if (first) {
                    txt += jsa.skillsToLaTeX();
                    first = false;
                } else {
                    txt += "\\\\\\hline\n";
                    txt += jsa.skillsToLaTeX();                    
                }
            }
        }
        txt += "\\\\\\hline\\end{tabular}\n\\end{center}\n"
        txt += "\\end{table}\n";
        txt += "\\end{document}\n";
        
	    return txt;
    }

    toLaTeX2()
    {
        var txt = "";
        txt += "\\documentclass[a4paper, article, 10pt]{article}\n"
        txt += "\\usepackage[margin=0.5in]{geometry}\n";
        txt += "\\begin{document}\n";

        txt += "\\begin{itemize}\n";           
        for (var areaRef in this.jsAreas) {
            var jsa = this.jsAreas[areaRef];
            if (jsa.isConcerned()) {
                txt += "\\item " + jsa.toLaTeX2();
            }
        }
        txt += "\\end{itemize}\n";    
        txt += "\\end{document}\n";
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


    appendCSC(otherCSC) {

	var otherAreaNumber = otherCSC.jsAreas.length;
	var thisAreaNumber = this.jsAreas.length;
	
	if (otherAreaNumber != thisAreaNumber) {
	    return false;
	}
	
	for (var a = 0 ; a < otherAreaNumber ; a++ ) {
	    var otherArea = otherCSC.jsAreas[a];
	    var thisArea = this.jsAreas[a];
	    if (! otherArea.isConcerned()) {
		continue;
	    }
	    
	    for (var u = 0 ; u < otherArea.jsUnits.length ; u++ ) {
		var otherUnit = otherArea.jsUnits[u];
		var thisUnit = thisArea.jsUnits[u];
		if (! otherUnit.isConcerned()) {
		    continue;		    
		}

		for (var t = 0 ; t < otherUnit.theJSTopics.length ; t++ ) {
		    var otherTopic = otherUnit.theJSTopics[t];
		    var thisTopic = thisUnit.theJSTopics[t];
		    if (! otherTopic.isConcerned()) {
			continue;		    
		    } else if (! thisTopic.isConcerned()) {
			thisTopic.setAddressed(otherTopic.theJSONTopic.addressed);
		    } else if(thisTopic.isConcerned()) {
			thisTopic.duplication++;
		    }
		    
		    for (var st = 0 ; st < otherTopic.theJSSubTopics.length ; st++ ) {
			var otherSubTopic = otherTopic.theJSSubTopics[st];
			var thisSubTopic = thisTopic.theJSSubTopics[st];
			if (! otherSubTopic.isConcerned()) {
			    continue;		    
			} else if (! thisSubTopic.isConcerned()) {
			    thisSubTopic.setAddressed(otherSubTopic.theJSONTopic.addressed);
			} else {
			    thisSubTopic.duplication++;
			}
		    }
		}

		for (var s = 0 ; s < otherUnit.theJSSkills.length ; s++ ) {
		    var otherSkill = otherUnit.theJSSkills[s];
		    var thisSkill = thisUnit.theJSSkills[s];
		    if (otherSkill.isConcerned() && ! thisSkill.isConcerned()) {
			thisSkill.setMastery(otherSkill.theJSONSkill.mastery);
		    } else if(otherSkill.isConcerned() && thisSkill.isConcerned()) {
			thisSkill.duplication++;
		    }
		}
	    }
	}
	
	return true;
    }
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
}


//======================================================================================
//=============== printCSC() ===========================================================
//======================================================================================

readStringFromFileAtPath = function(pathOfFileToReadFrom)
{
    var request = new XMLHttpRequest();
    request.open("GET", pathOfFileToReadFrom, false);
    request.send(null);
    var returnValue = request.responseText;
    
    return returnValue;
}

window.printCSC = function()
{    
    var txt = "";
    
    if (! boardDisplayed) {
        document.body.innerHTML = readStringFromFileAtPath("cscbody.html");
        boardDisplayed = true;
        document.getElementById("newCSC").addEventListener("change", function(){loadCSC(this.id)});
        document.getElementById("saveCSC").addEventListener("click", function(){saveCSC(this.id)});
        document.getElementById("GCCSC").addEventListener("click", function(){GCCSC(this.id)});
        document.getElementById("expandCSC").addEventListener("click", function(){expandCSC(this.id)});
        document.getElementById("resetCSC").addEventListener("click", function(){resetCSC(this.id)});
        document.getElementById("latexExportCSC").addEventListener("click", function(){latexExportCSC(this.id)});
        document.getElementById("latexExportCSC2").addEventListener("click", function(){latexExportCSC2(this.id)});
        document.getElementById("appendCSC").addEventListener("change", function(){appendCSC(this.id)});
    }
    
    if (JSONCur == null) {
        var request = new XMLHttpRequest();
        request.open("GET", "CSC.json", true);
        request.setRequestHeader("Content-type", "application/json");
        request.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                JSONCur = JSON.parse(this.responseText);
                displayCSC();
            }
        }
        request.send();
        
        //JSONCur = fs.readFileSync('CSC-content.json').toString();
    } else {
        displayCSC();
    }
}

function displayCSC() {
    if (JSCur == null) {
        JSCur = new JSCurricula(JSONCur);
    }
    txt = JSCur.toHTML();
    document.getElementById("theCSCPage").innerHTML = txt;
    JSCur.addEventListeners();
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
    var data = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(JSONCur) + "\n");
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

function appendCSC() {
    var file = document.getElementById("appendCSC").files[0];
    var fr = new FileReader();
    fr.onload = function(e) {
        OtherJSONCur = JSON.parse(e.target.result);
        OtherJSCur = new JSCurricula(OtherJSONCur);
        JSCur.appendCSC(OtherJSCur);
	printCSC();
    }
    var blob = file.slice(0, file.size-1);
    fr.readAsText(blob);
}

function GCCSC() {
    var elt = document.getElementById("GCCSC");

    if (displayOnlyConcerned) {
        displayOnlyConcerned = false;
        elt.className = "showbutton"; 
    } else {
        displayOnlyConcerned = true;
        elt.className = "hidebutton";
    }
    printCSC();
}

function expandCSC() {
    var elt = document.getElementById("expandCSC");

    if (expand) {
        expand = false;
        elt.className = "showbutton"; 
    } else {
        expand = true;
        elt.className = "hidebutton";
    }
    JSCur = null;
    printCSC();
}

function resetCSC() {
    JSCur = null;
    JSONCur = null;
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

function latexExportCSC2(id) {
    // var dlElem = document.getElementById(id);
    var link = document.createElement('a');
    var data = "data:application/x-latex;charset=utf-8," + encodeURIComponent(JSCur.toLaTeX2());
    link.setAttribute("href", "data:" + data);
    link.setAttribute("download", "savedCSC.tex");    
    document.body.appendChild(link);
    link.click();
}

function pdfExportCSC() {
    var latexData = JSCur.toLaTeX();
    
    //**** Solution 1 => ne peut marcher dans un browser => exécute une commande pdflatex***** /
    // var pdfstream = require("latex")([
    //     "\\documentclass{article}",
    //     "\\begin{document}",
    //     "hello world",
    //     "\\end{document}"
    // ]).pipe(process.stdout);

    // var pdfcontent = '';
    // pdfstream.on('data', function(chunk) {
    //     pdfcontent += chunk;
    // });
    // pdfstream.on('end', function() {
    //     var link = document.createElement('a');
    //     var data = "data:application/pdf," + encodeURIComponent(request.responseText);
    //     link.setAttribute("href", "data:" + data);
    //     link.setAttribute("download", "CSC.pdf");            
    //     document.body.appendChild(link);
    //     link.click();
    // });

    //**** Solution 2 => ne peut marcher dans un browser ****/
    // var file = "./tmp.tex";
    // var fs = require('browserify-fs');
    // fs.writeFile(file, latexData, function (err) {
    //     if (err) {
    //         document.getElementById("theCSCPage").innerHTML = "ERROR !\n";       
    //     } else {
    // 	    document.getElementById("theCSCPage").innerHTML = "launch xelatex !\n";       
    //         var pdfLatex = require("child_process").exec("xelatex", [ "./tmp.tex" ]);
    //         pdfLatex.stdout.on("end", function (data) {
    // 		document.getElementById("theCSCPage").innerHTML += "<br>FINI !\n";       
    // 	    });
    //     }
    // });
    
    //**** Solution 3 => idem que 1) et 2) ****/
   
    // const latex = require('node-latex')
    // const fs = require('fs')
    
    // const input = fs.createReadStream('input.tex')
    // const output = fs.createWriteStream('output.pdf')
    
    // latex(input).pipe(output);
    
    // 'use strict';

    /********** Juste un essai => idem ***********/
    // const
    // spawn = require( 'child_process' ).spawn,
    // ls = spawn( 'ls', [ '-lh', '/usr' ] );
    
    // ls.stdout.on( 'data', data => {
    //     console.log( `stdout: ${data}` );
    // });
    
    // ls.stderr.on( 'data', data => {
    //     console.log( `stderr: ${data}` );
    // });
    
    // ls.on( 'close', code => {
    //     console.log( `child process exited with code ${code}` );
    // });

    /********** If I had a dedicated server, I would do like below  *******/
    /*** mais nécessite un serveur sur lequel je peux installer et exécuter ce que je veux ***/
    
    // var request = new XMLHttpRequest();
    // request.open("POST", "textopdf.php", true);
    // request.setRequestHeader("Content-type", "application/x-latex;charset=utf-8");
    // request.onreadystatechange = function() {
    //     if (this.readyState == 3 && this.status == 200) {
    //         document.getElementById("theCSCPage").innerText = this.responseText;
            
    //     // var link = document.createElement('a');
    //     // var data = "data:text/plain; charset=UTF-8," + encodeURIComponent(request.responseText);
    //     // link.setAttribute("href", "data:" + data);
    //     // link.setAttribute("download", "CSC.txt");            
    //     // document.body.appendChild(link);
    //     // link.click();
    //     // }
    // }
    // request.send(latexData);
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
    var rect = area.getBoundingClientRect();
    var x = rect.top;
    var y = rect.left;

    newdiv.setAttribute("class", "areaintro");
    newdiv.setAttribute("id", "areaintro");
    // newdiv.style.top = x + 'px';
    // newdiv.style.left = y + 'px';
    
    newdiv.innerHTML += jsarea.theJSONArea.intro;
    newdiv.innerHTML += "\n<br><b>Click to close\n</b><br>";

    var introelt = document.getElementById("areaintro");
    if (introelt)
        document.body.removeChild(introelt);

    document.body.append(newdiv);
    newdiv.addEventListener("click", function(){document.body.removeChild(document.getElementById("areaintro"))});
    
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
