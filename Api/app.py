from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import docx
import re
import spacy
from spacy.matcher import Matcher

app = Flask(__name__)
CORS(app)

# Load the spaCy model
nlp = spacy.load("en_core_web_sm")
matcher = Matcher(nlp.vocab)

# Custom Pattern for extracting names (More Accurate)
name_pattern = [{"POS": "PROPN"}, {"POS": "PROPN"}]
matcher.add("NAME", [name_pattern])

@app.route('/parse-cv', methods=['POST'])
def parse_cv():
    try:
        file = request.files['file']
        file_extension = file.filename.split('.')[-1].lower()

        if file_extension == 'pdf':
            text = extract_text_from_pdf(file)
        elif file_extension == 'docx':
            text = extract_text_from_docx(file)
        else:
            return jsonify({'error': 'Unsupported file type'}), 400

        parsed_data = parse_text_to_data(text)
        return jsonify(parsed_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def extract_text_from_pdf(file):
    with pdfplumber.open(file) as pdf:
        text = ''
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text

def extract_text_from_docx(file):
    doc = docx.Document(file)
    text = ''
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text

def parse_text_to_data(text):
    doc = nlp(text)
    name = extract_name(doc)
    data = {
        'name': name,
        'email': extract_email(text),
        'phone_number': extract_phone_number(text),
        'address': extract_address(text),
        'skills': extract_skills(text),
        'experience': extract_experience(text),
        'education': extract_education(text)
    }
    return data


def extract_name(doc):
    matches = matcher(doc)
    for match_id, start, end in matches:
        span = doc[start:end]
        return span.text
    return "Name not found"

def extract_email(text):
    match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    return match.group(0) if match else "Email not found"

def extract_phone_number(text):
    match = re.search(r"(\+?\d{1,3})?[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4,6}", text)
    return match.group(0) if match else "Phone number not found"

def extract_address(text):
    address_patterns = [
        r"\d{1,4} [A-Za-z0-9.,\- ]+ [A-Za-z]+, [A-Za-z]+",  # e.g., "123 Main Street, New York, NY"
        r"[A-Za-z]+, [A-Za-z]+"  # e.g., "New York, NY"
    ]
    for pattern in address_patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0)
    return "Address not found"

def extract_skills(text):
    skills_list = [
        'Python', 'Java', 'C++', 'JavaScript', 'Ruby', 'Data Science', 'AI', 'React',
        'Node.js', 'SQL', 'HTML', 'CSS', 'Django', 'Flask', 'Angular', 'Machine Learning',
        'Deep Learning', 'Tailwind CSS', 'Redux', 'Problem-solving', 'Communication', 
        'Bootstrap', 'Tesseract', 'NLP', 'OCR', 'API Development'
    ]
    found_skills = [skill for skill in skills_list if skill.lower() in text.lower()]
    return found_skills if found_skills else ["No skills found"]

def extract_experience(text):
    experience_keywords = ['experience', 'worked as', 'employment', 'professional experience', 'internship']
    experience = []

    sentences = text.split('\n')
    for sentence in sentences:
        if any(keyword.lower() in sentence.lower() for keyword in experience_keywords):
            experience.append(sentence.strip())

    return experience if experience else ["No experience found"]


def extract_education(text):
    education_keywords = [
        'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Doctorate', 'Diploma',
        'B.Sc.', 'B.Sc. IT', 'B.Sc. Computer Science', 'B.Tech', 'M.Tech', 'M.Sc.',
        'MCA', 'MBA', 'BE', 'ME', 'MS', 'Information Technology', 'IT', 'Computer Science',
        'Software Engineering', 'Data Science', 'Artificial Intelligence', 'Machine Learning',
        'Electronics', 'Electrical Engineering', 'Computer Engineering', 'Cybersecurity',
        'Networking', 'Cloud Computing', 'Digital Marketing', 'Web Development'
    ]
    
    education_patterns = [
        r"(Bachelor's Degree in [\w\s]+)",            # e.g., Bachelor's Degree in Computer Science
        r"(Master's Degree in [\w\s]+)",               # e.g., Master's Degree in Information Technology
        r"(PhD in [\w\s]+)",                          # e.g., PhD in Machine Learning
        r"([\w\s]+ Diploma)",                         # e.g., Advanced Diploma in IT
        r"([\w\s]+ University)",                     # e.g., New York University
        r"([\w\s]+ College)",                       # e.g., Bunts S.M. Shetty College
        r"([\w\s]+ Institute)",                     # e.g., Interaction Design Foundation
        r"([\w\s]+ School of Technology)",          # e.g., School of Information Technology
    ]
    
    found_education = []
    
    for pattern in education_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        found_education.extend(matches)
    
    # Filter results to only include lines containing relevant keywords
    filtered_education = [edu for edu in found_education if any(keyword.lower() in edu.lower() for keyword in education_keywords)]
    
    return filtered_education if filtered_education else ["No education details found"]



if __name__ == '__main__':
    app.run(debug=True)
