#!/usr/bin/env python3.5
import os
import csv
import sys
import codecs
from subprocess import call
from optparse import OptionParser

cwd=os.getcwd()

parser = OptionParser()
parser.add_option("-i", "--csvdir", dest="csvpath",
                  help="Directory where all csv files reside", metavar="DIR")
parser.add_option("-o", "--outputfile", dest="outputfilename",
                  help="Output file", metavar="FILE")
parser.add_option("-f", "--format", dest="outputformat",
                  help="Output format in which the curricula will be printed", metavar="")
(options, args) = parser.parse_args()
    

############### Classes ###########
from enum import Enum
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
    def __init__(self, content, unit, addressed):
        self.content = content
        self.unit = unit
        self.addressed = addressed
        self.subtopics = []

    def toJson(self, ):
        outlist = []
        # outlist.append("{ \"area\": \"");
        # outlist.append(self.unit.area.abbrev);
        # outlist.append("\", \n\"unit\" : \"");
        # outlist.append(self.unit.name);
        # outlist.append("\",\n\"concept\": ");
        outlist.append("{ \"topic_content\": ");
        if self.content.startswith("\""):
            outlist.append(self.content);
        else:
            outlist.append("\"");
            outlist.append(self.content);
            outlist.append("\"");

        if len(self.subtopics) > 0:
            outlist.append(",\n\"subtopics\": [");
            for i, subtopic in enumerate(self.subtopics):
                if i > 0:
                    outlist.append(", \n")
                    outlist = outlist + subtopic.toJson()
                else:
                    outlist = outlist + subtopic.toJson()
            outlist.append("]");

        outlist.append(",\n\"addressed\": \"");
        outlist.append(str(self.addressed));
        outlist.append("\"\n");
        outlist.append("}");
        return outlist
    
    def addSubTopic(self, content, addressed):
        newSubTopic = Topic(content, self.unit, addressed)
        self.subtopics.append(newSubTopic)
        return newSubTopic
        
class Skill:
    def __init__(self, content, unit, num, mastery):
        self.content = content
        self.unit = unit
        self.mastery = mastery
        self.num = num
        
    def toJson(self, ):
        outlist = []
        # outlist.append("{ \"area\": \"");
        # outlist.append(self.unit.area.abbrev);
        # outlist.append("\", \n\"unit\": \"");
        # outlist.append(self.unit.name);
        # outlist.append("\",\n\"num\": \"");
        # outlist.append(self.num);
        #        outlist.append("\", \n\"skill\": ");
        
        outlist.append("{\"skill\": ");
        if self.content.startswith("\""):
            outlist.append(self.content);
        else:
            outlist.append("\"");
            outlist.append(self.content);
            outlist.append("\"");

        outlist.append(",\n\"mastery\": \"");
        outlist.append(self.mastery);
        outlist.append("\"\n");
    
        outlist.append("}")
        return outlist
        
class Unit:
    def __init__(self, name, area):
        self.name = name
        self.topics = []
        self.skills = []
        self.area = area
        
    def getAddressedTopics(self, ):
        theAddressedTopics = []
        for topic in topics:
            if topic.addressed:
                addressed_topics += topic
        return addressed_topics

    def getSkillsForLevel(self, level):
        theSkills = []
        for skill in skills:
            if skill.skillLevel > level:
                the_skills += skill
        return theSkills

    def addTopicIfNeeded(self, content, addressed):
        for topic in self.topics:
            if topic.content == content:
                return topic
        newTopic = Topic(content, self, addressed)
        self.topics.append(newTopic)
        return newTopic

    def addSkill(self, content, num, mastery):
        newSkill = Skill(content, self, num, mastery)
        self.skills.append(newSkill)
        return newSkill

    def toJson(self):
        outlist = []
        outlist += "{\"unit_name\": \"" + self.name + "\",\n";
        outlist += "\"topics\": [\n"
        for i, topic in enumerate(self.topics):
            if i > 0:
                outlist += ",\n"
                outlist += topic.toJson()
            else:
                outlist += topic.toJson()
        outlist += "],\n"
        outlist += "\"skills\": [\n"
        for i, skill in enumerate(self.skills):
            if i > 0:
                outlist += ",\n"
                outlist += skill.toJson()
            else:
                outlist += skill.toJson()
                
        outlist += "]}\n"
        
        return outlist
    
class Area:
    def __init__(self, abbrev):
        self.abbrev = abbrev
        self.units = []
        
    def addUnitIfNeeded(self, name):
        for unit in self.units:
            if unit.name == name:
                return unit
        newUnit = Unit(name, self)
        self.units.append(newUnit)
        return newUnit

    def toJson(self):
        outlist = []
        outlist += "{\"area_name\": \"" + self.abbrev + "\",\n"
        outlist += "\"units\": [\n"
        for i, unit in enumerate(self.units):
            if i > 0:
                outlist += ",\n"
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

for csvfilename in os.listdir(options.csvpath):
    current_csv_filename = options.csvpath + os.sep + csvfilename
    with open(current_csv_filename) as csvfile:
        
        if not (csvfilename.endswith('.csv')):
            continue
        if "Concept" in csvfilename:
            isConcept = True
        elif "Skill" in csvfilename:
            isConcept = False
        else:
            print("File is neither Skill or Concept file ; or its name does not contain 'Skill' nor 'Concept' : " + current_csv_filename)
            continue

        print("\n========== Handling file " + csvfilename + " ================")

        # ---- Read file, process each row -----
        csvreader = csv.reader(csvfile, delimiter=',', skipinitialspace=True)

        namesplitted = csvfilename.replace('.csv', '').split('-')
        areaAbbrev = namesplitted[0]
        unitName = namesplitted[1]
        currentArea = theCurricula.addAreaIfNeeded(areaAbbrev)
        currentUnit = currentArea.addUnitIfNeeded(unitName)

        for row in csvreader:
            if isConcept:
                topicContent = row[0].strip()
                addressed = row[1].strip()
                if topicContent.startswith('<'):
                    splitted = topicContent.split('>:')
                    parentTopicContent = splitted[0][1:].strip()
                    topic = currentUnit.addTopicIfNeeded(parentTopicContent, addressed)
                    subTopicContent = splitted[1].strip()
                    topic.addSubTopic(subTopicContent, addressed)
                else:
                    currentUnit.addTopicIfNeeded(topicContent, addressed)
            else:
                skillNum = row[0].strip()
                if not skillNum.isdigit():
                    print("ERROR IN SKILL FILE : lack number")
                    print(current_csv_filename)
                    print(csvfilename)
                    exit(-1)
                skillContent = row[1].strip()
                mastery = row[2].strip()
                currentUnit.addSkill(skillContent, skillNum, mastery)
        csvfile.close()

################## Output ###############
outfile = create_open_file(options.outputfilename)
outlist =theCurricula.toJson()
outfile.write(''.join(outlist))
outfile.close()
