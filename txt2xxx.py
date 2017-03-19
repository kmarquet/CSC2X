#!/usr/bin/env python3.5
import os
import sys
import codecs
from subprocess import call
from optparse import OptionParser

cwd=os.getcwd()

parser = OptionParser()
parser.add_option("-i", "--areadir", dest="areapath",
                  help="Directory where the files describing each area reside", metavar="DIR")
parser.add_option("-o", "--outputfile", dest="outputfilename",
                  help="Output file", metavar="FILE")
parser.add_option("-f", "--format", dest="outputformat",
                  help="Output format in which the curricula will be printed", metavar="")
(options, args) = parser.parse_args()
    

############### Classes ###########
from enum import Enum

class PState(Enum):
    ReadingAreaTitle = 0
    ReadingAreaIntro = 1
    ReadingUnit = 2
    ReadingUnitIntro = 3
    ReadingTopics = 4
    ReadingSkills  = 5

class SkillLevel(Enum):
    Zero = 0
    Familiarity = 1
    Usage = 2
    Assessment= 3

    def fromString(str):
        if str == "":
            return SkillLevel.Zero
        elif str == "-":
            return SkillLevel.Zero
        elif str == "Familiarity":
            return SkillLevel.Familiarity
        elif str == "Usage":
            return SkillLevel.Usage
        elif str == "Assessment":
            return SkillLevel.Assessment

class Topic:
    def __init__(self, content, unit, num):
        self.content = content
        self.unit = unit
        self.addressed = "No"
        self.subtopics = []
        self.num = num
        
    def toJson(self, ):
        outlist = []
        outlist.append("         { \"content\": ");
        if self.content.startswith("\""):
            outlist.append(self.content);
        else:
            outlist.append("\"");
            outlist.append(self.content);
            outlist.append("\"");

        outlist.append(",\n           \"num\": \"");
        outlist.append(str(self.num));
        outlist.append("\"");

        if len(self.subtopics) > 0:
            outlist.append(",\n           \"subtopics\": [");
            for i, subtopic in enumerate(self.subtopics):
                if i > 0:
                    outlist.append(", \n")
                    outlist = outlist + subtopic.toJson()
                else:
                    outlist = outlist + subtopic.toJson()
            outlist.append("]");

        outlist.append(",\n           \"addressed\": \"");
        outlist.append(str(self.addressed));
        outlist.append("\"\n");

        outlist.append("         }");
        return outlist
    
    def addSubTopic(self, content):
        newSubTopic = Topic(content, self.unit, len(self.subtopics))
        self.subtopics.append(newSubTopic)
        return newSubTopic
        
class Skill:
    def __init__(self, content, unit, num):
        self.content = content
        self.unit = unit
        self.mastery = "No"
        self.num = num
        
    def toJson(self, ):
        outlist = []
        
        outlist.append("         {\"content\": ");
        if self.content.startswith("\""):
            outlist.append(self.content);
        else:
            outlist.append("\"");
            outlist.append(self.content);
            outlist.append("\"");

        outlist.append(",\n           \"mastery\": \"");
        outlist.append(self.mastery);
        outlist.append("\",\n");

        outlist.append("           \"num\": \"");
        outlist.append(str(self.num));
        outlist.append("\"\n");

        outlist.append("         }")
        return outlist
        
class Unit:
    def __init__(self, title, area):
        self.title = title
        self.topics = []
        self.skills = []
        self.area = area
        self.intro = ""

    def setIntro(self, intro):
        self.intro = intro.replace("\n\n", "+++").replace("\n", " ").replace("+++", "\n\n").replace("\"", "\\\"")

    def addTopic(self, content):
        for topic in self.topics:
            if topic.content == content:
                print("WARNING : topic present more than 1 time in " + self.area.abbrev + "/" + self.title + " : " + content)
        newTopic = Topic(content, self, len(self.topics))
        self.topics.append(newTopic)
        return newTopic

    def addSkill(self, content):
        newSkill = Skill(content, self, len(self.skills))
        self.skills.append(newSkill)
        return newSkill

    def toJson(self):
        outlist = []
        outlist += "      {\"title\": \"" + self.title + "\",\n";
        outlist += "       \"intro\": \"" + self.intro + "\",\n";        
        outlist += "       \"topics\": [\n"
        for i, topic in enumerate(self.topics):
            if i > 0:
                outlist += ",\n"
                outlist += topic.toJson()
            else:
                outlist += topic.toJson()
        outlist += "\n      ],\n"
        outlist += "      \"skills\": [\n"
        for i, skill in enumerate(self.skills):
            if i > 0:
                outlist += ",\n"
                outlist += skill.toJson()
            else:
                outlist += skill.toJson()
                
        outlist += "\n      ]}\n"
        
        return outlist
    
class Area:
    def __init__(self, abbrev):
        self.abbrev = abbrev
        self.units = []
        self.title = None
        self.intro = None
        
    def addUnit(self, title):
        for unit in self.units:
            if unit.title == title:
                print("WARNING: multiple defined unit: " + self.abbrev + "/" + title)
        newUnit = Unit(title, self)
        self.units.append(newUnit)
        return newUnit

    def setTitle(self, title):
        self.title = title

    def setIntro(self, intro):
        self.intro = intro.replace("\n\n", "+++").replace("\n", " ").replace("+++", "\n\n").replace("\"", "\\\"")
        
    def toJson(self):
        outlist = []
        outlist += "{\"abbrev\": \"" + self.abbrev + "\",\n"
        outlist += "  \"title\": \"" + self.title + "\",\n"
        outlist += "  \"intro\": \"" + self.intro + "\",\n"
        outlist += "  \"units\": [\n"
        for i, unit in enumerate(self.units):
            if i > 0:
                outlist += "      ,\n"
                outlist += unit.toJson()
            else:
                outlist += unit.toJson()
        outlist += "]}"
        return outlist

class Curricula:
    def __init__(self):
        self.areas = []

    def addAreaIfNeeded(self, areaAbbrev):
        for area in self.areas:
            if area.abbrev == areaAbbrev:
                return area
        newArea = Area(areaAbbrev)
        self.areas.append(newArea)
        return newArea

    def toJson(self):
        outlist = []
        outlist += ("[")
        for i, area in enumerate(self.areas):
            if i > 0:
                outlist += ",\n"
                outlist += area.toJson()
            else:
                outlist += area.toJson()                
        outlist += ("]\n")
        return outlist
        
#################### LATEX ########################
def processHeaderLatex(area, unit, isConcept):
    outlist = []
    outlist.append("\newcommand{\\")
    outlist.append(area)
    outlist.append("_")
    outlist.append(unit)
    outlist.append("_")
    outlist.append(abstraction)
    outlist.append("}{\n")
    
    outlist.append("\\begin{center}\n")
    if isConcept:
        outlist.append("\\begin{tabular}{| p{12cm} p{2cm}}")
    else:
        outlist.append("\\begin{tabular}{| l | p{12cm} | p{2cm}| }")
    outlist.append("\\hline\n")

    return outlist

def processFooterLatex():
    outlist = "\\end{tabular}\n\\end{center}\n}\n}"
    return outlist

def processConceptLatex(area, unit, concept, addressed, isLast):
    outlist = []
    if concept:
        if concept.startswith('<'):
            splitted = concept.split('>:')
            parent = splitted[0][1:]
            outlist.append("\\begin{minipage}{1.0\linewidth}");
            outlist.append("\\medskip\\textbf{"+ parent + ":} \\\\")
            outlist.append(splitted[1])
            outlist.append("\\medskip\end{minipage}")
        else:
            outlist.append("\\begin{minipage}{1.0\linewidth}" + concept + "\\smallskip\end{minipage} ")

        outlist.append(' & ')

        outlist.append(row[1])
        outlist.append("\n")
        outlist.append("\\\\\\hline\n")


def processSkillLatex(area, unit, concept, nb, mastery, isLast):        
    outlist.append("\\begin{minipage}{1.0\linewidth}" + nb + " \end{minipage} & ")
    outlist.append(concept + " & ")
    outlist.append(mastery)
    outlist.append("\n")
    outlist.append("\\\\\\hline\n")
    return outlist

def processFileHeaderLatex():
    outlist = []
    return outlist

def processFileFooterLatex():
    outlist = []
    return outlist

def create_open_file(filename):
    if os.path.exists(filename):
        os.remove(filename)
    return open(filename, 'x')

theCurricula = Curricula()

for areafilename in os.listdir(options.areapath):
    current_area_filename = options.areapath + os.sep + areafilename
    with open(current_area_filename) as areafile:        
        if not (areafilename.endswith('.txt')):
            print("Warning: " + areafilename + " not handled." )
            continue

        print("\n========== Handling file " + areafilename + " ================")

        areaAbbrev = areafilename.replace('.txt', '')
        currentArea = theCurricula.addAreaIfNeeded(areaAbbrev)
        currentAreaIntro = ""
        currentTopic = None
        currentSkillContent = ""

        # ---- Read file, process each line -----
        for line in areafile:
            sline = line.strip()
            if sline == "":
                continue
            elif sline == "===Title":
                state = PState.ReadingAreaTitle
            elif sline == "===Intro":
                state = PState.ReadingAreaIntro
            elif sline.startswith("====="):
                if state == PState.ReadingAreaIntro:
                    currentArea.setIntro(currentAreaIntro)
                state = PState.ReadingUnit
                unitTitle = sline[5:].strip()
                currentUnit = currentArea.addUnit(unitTitle)
                currentUnitIntro = ""

            elif sline == "==Intro":
                state = PState.ReadingUnitIntro
            elif sline == "==Topics":
                if state == PState.ReadingUnitIntro:
                    currentUnit.setIntro(currentUnitIntro)
                state = PState.ReadingTopics
            elif sline == "==Skills":
                state = PState.ReadingSkills
            elif sline.startswith("o "):
                subTopicContent = sline[2:]
                currentTopic.addSubTopic(subTopicContent);
            else:
                if state == PState.ReadingAreaTitle:
                    currentArea.setTitle(sline)
                elif state == PState.ReadingAreaIntro:
                    currentAreaIntro += line
                elif state == PState.ReadingUnitIntro:
                    currentUnitIntro += line
                elif state == PState.ReadingTopics:
                    currentTopic = currentUnit.addTopic(sline)
                elif state == PState.ReadingSkills:
                    currentSkillContent += sline
                    if state == PState.ReadingSkills:
                        endIndex = sline.find("[")
                        if  endIndex >= 0:
                            currentSkillContent += sline[0:endIndex]
                            currentUnit.addSkill(currentSkillContent)
                            currentSkillContent = ""
                        else:
                            currentSkillContent += sline
                else:
                    continue                
        areafile.close()

################## Output ###############
outfile = create_open_file(options.outputfilename)
outlist = theCurricula.toJson()
outfile.write(''.join(outlist))
outfile.close()
