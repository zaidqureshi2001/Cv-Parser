import os
import re
import json
import pdfplumber
import docx
import fitz
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from agno.agent import Agent
from agno.models.groq import Groq
from agno.tools.duckduckgo import DuckDuckGoTools
from dotenv import load_dotenv
from pdf2docx import Converter

# Load environment variables
load_dotenv()
os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY")

app = Flask(__name__)
CORS(app)

# File upload configuration
UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'docx'}  # ✅ Added 'docx'

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def clean_text(text):
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)  # Remove non-ASCII
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def parse_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            if page.extract_text():
                text += page.extract_text()
    return text

def parse_docx(file_path):
    text = ""
    doc = docx.Document(file_path)
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

def extract_text(file_path, file_extension):
    if file_extension == 'pdf':
        text, urls = parse_pdf_with_fitz(file_path)
        return text, urls
    elif file_extension == 'docx':
        return clean_text(parse_docx(file_path)), []
    return None, []


def build_prompt(resume_text):
    return f"""
You are a professional resume parser.

From the following resume text, extract the following details in structured JSON format:

1. name  
2. email  
3. phone  
4. location: The candidate's location. Please extract the address if available. This could include:
  - address (street address, city, state, country, or region)

5. profile: A short summary or career objective written by the candidate.

6. skills: A list of technical and non-technical skills, tools, technologies, or proficiencies mentioned by the candidate.

7. education: an array of objects with:
  - degree
  - institution
  - university (optional)
  - year
  - grade (CGPA/percentage)

8. experience: an array of objects with:
  - job_title
  - company
  - duration (e.g., "Jan 2022 – Dec 2023")
  - location (if mentioned)
  - description (summary of responsibilities or achievements)

9. projects: an array of objects with:
  - name (name of the project)
  - description (brief description of the project)
  - technologies (list of technologies used in the project)
  - link (a link of the project and its deployment link)

10. certifications: an array of objects with:
  - certification_name
  - issuing_organization
  - date (optional)

11. publications: an array of objects with:
  - publication_title
  - publication_link (optional)
  - publication_date (optional)

12. languages: an array of objects with:
  - language
  - proficiency_level (e.g., Fluent, Intermediate, Beginner)

Return the result in valid JSON format like this:

{{
  "basicInfo": {{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1 123-456-7890",
    "location": "1234 Elm Street, Springfield, IL, USA"
  }},
  "profile": "Creative and detail-oriented developer passionate about building efficient and scalable web applications.",
  "skills": ["React", "HTML", "CSS", "JavaScript", "Git", "Tailwind CSS"],
  "education": [
    {{
      "degree": "B.Sc IT",
      "institution": "XYZ College",
      "university": "Mumbai University",
      "year": "2020 - 2023",
      "grade": "CGPA: 7.5"
    }}
  ],
  "experience": [
    {{
      "job_title": "Frontend Developer",
      "company": "Zuberiya Global",
      "duration": "March 2023 – Present",
      "location": "Remote",
      "description": "Built e-commerce UI using React, Redux Toolkit, and Tailwind CSS, improving load time and user experience."
    }}
  ],
  "projects": [
    {{
      "name": "E-commerce Web App",
      "description": "Built a full-stack e-commerce web application with React, Redux, and integrated Stripe payments.",
      "technologies": ["React", "Redux", "Stripe API", "Tailwind CSS"],
      "link": "https://github.com/username/ecommerce-app"
    }}
  ],
  "certifications": [
    {{
      "certification_name": "Certified React Developer",
      "issuing_organization": "React Academy",
      "date": "2023"
    }}
  ],
  "publications": [
    {{
      "publication_title": "The Future of Web Development",
      "publication_link": "https://example.com/future-of-web",
      "publication_date": "2022"
    }}
  ],
  "languages": [
    {{
      "language": "English",
      "proficiency_level": "Fluent"
    }},
    {{
      "language": "Spanish",
      "proficiency_level": "Intermediate"
    }}
  ]
}}

Resume:
\"\"\" {resume_text} \"\"\" 
"""

def query_groq_qwen(prompt):
    try:
        agent = Agent(
            model=Groq(id="llama3-8b-8192"),
            description="You are an assistant, please reply based on the question",
            tools=[DuckDuckGoTools()],
            markdown=True
        )
        response = agent.run(prompt)
        print("📄 Model Response:\n", response.content)
        return response.content
    except Exception as e:
        print(f"❌ Error querying Groq: {e}")
        return {"error": "Failed to get response from model"}

def extract_json_from_output(text):
    try:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            json_str = match.group()
            json_obj = json.loads(json_str)
            return json_obj
        else:
            return {"error": "No valid JSON found in response"}
    except json.JSONDecodeError:
        return {"error": "Failed to decode JSON from the model's response"}
    except Exception as e:
        return {"error": f"Error extracting JSON: {str(e)}"}
@app.route('/parse-cv', methods=['POST'])
def parse_cv():
    # Check if the file is part of the request
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    # Get the uploaded file
    file = request.files['file']
    filename = secure_filename(file.filename)

    # Check if the file extension is allowed (PDF files only)
    if not allowed_file(filename):
        return jsonify({'error': 'Only PDF files are allowed'}), 400

    # Save the file to the server
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    print("File received:", filename)

    # Extract text from the uploaded PDF file
    resume_text, extracted_urls = extract_text(file_path, 'pdf')

    # Check if text extraction was successful
    if not resume_text:
        return jsonify({'error': 'Failed to extract text from the PDF file'}), 400

    # Print extracted URLs for debugging
    print("Extracted URLs:", extracted_urls)

    # Build prompt for the model using the extracted resume text
    prompt = build_prompt(resume_text)
    
    # Query the Groq model (or whichever model you're using)
    response_text = query_groq_qwen(prompt)

    # Debugging: Print raw model response
    print("📄 Raw Model Response:\n", response_text)

    # Extract structured JSON data from the model's response
    parsed_data = extract_json_from_output(response_text)

    # Debugging: Print parsed data for 'projects' section
    print("📄 Parsed Data (Projects Section):", parsed_data.get('projects', 'No projects found'))

    # Initialize a list for project links
    project_links = []

    # Check if 'projects' field exists and extract links from it
    if "projects" in parsed_data:
        for project in parsed_data["projects"]:
            # Ensure that the project is a dictionary and contains the 'link' or 'description' fields
            if isinstance(project, dict):
                # Extract the project link if available
                project_link = (project.get("link") or "").strip()
                if project_link and project_link != "Source code":
                    print(f"🔗 Project Link Found: {project_link}")  # Debugging project link
                    project_links.append(project_link)
                else:
                    # If no direct link, check for URLs in the project description
                    description = project.get("description", "")
                    print(f"🔍 Project Description: {description}")  # Debugging description

                    # Use regex to find URLs in the description
                    links_in_description = re.findall(r'https?://[^\s]+', description)
                    if links_in_description:
                        print(f"🔗 Links Found in Description: {links_in_description}")  # Debugging found links
                        project_links.extend(links_in_description)
                    else:
                        # Additional check for common project-related keywords
                        if "GitHub" in description or "Netlify" in description or "Live link" in description:
                            potential_links = re.findall(r'(https?://[^\s]+)', description)
                            if potential_links:
                                project_links.extend(potential_links)

    # Print the extracted project links for debugging
    print("🔗 Extracted Project Links:", project_links)

    # Add social media links (LinkedIn, GitHub) from the extracted URLs
    parsed_data['links'] = {
        "linkedin": next((url for url in extracted_urls if "linkedin.com" in url), ""),
        "github": next((url for url in extracted_urls if "github.com" in url), "")
    }

    # Return the parsed data, extracted URLs, and project links as JSON response
    return jsonify({
        'parsed_data': parsed_data,
        'extracted_urls': extracted_urls,
        'project_links': project_links  # Include project links in the response
    })





    
def parse_pdf_with_fitz(file_path):
    text = ""
    urls = []
    doc = fitz.open(file_path)

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        
        # Extract text from the page
        text += page.get_text("text")

        # Extract links (URLs)
        for link in page.links():
            uri = link.get('uri')
            if uri:
                urls.append(uri)
    
    return text, urls
  
if __name__ == '__main__':
    app.run(debug=True)
