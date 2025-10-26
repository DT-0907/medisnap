# Product Mission

## Pitch
MedSnap is a hands-free AR medical assistant that helps medical students and healthcare providers master clinical skills and conduct patient assessments by providing real-time computer vision guidance, voice-controlled workflows, and AI-powered clinical decision support through Snap Spectacles.

## Users

### Primary Customers
- **Medical Students**: Learners developing foundational clinical examination skills
- **Healthcare Providers**: Clinicians needing hands-free patient assessment during procedures
- **Clinical Educators**: Instructors teaching procedural techniques to students

### User Personas

**Medical Student Sarah** (22-28 years old)
- **Role:** Second-year medical student in clinical rotations
- **Context:** Learning basic patient examination techniques in teaching hospital
- **Pain Points:** Difficulty remembering proper technique sequence, lack of immediate feedback when practicing alone, uncertainty about finger placement for vital signs
- **Goals:** Master clinical examination skills, build confidence before patient interactions, receive real-time corrective feedback

**Emergency Room Physician Dr. Chen** (30-45 years old)
- **Role:** Attending physician in busy urban emergency department
- **Context:** Managing multiple patients simultaneously while maintaining sterile field
- **Pain Points:** Need to access patient records while hands are occupied, difficulty recording observations during procedures, risk of medication errors during verbal orders
- **Goals:** Access patient information hands-free, quickly document symptoms, ensure medication safety with instant drug interaction checks

**Clinical Instructor Professor Martinez** (35-55 years old)
- **Role:** Medical school faculty teaching clinical skills lab
- **Context:** Teaching groups of 8-12 students proper examination techniques
- **Pain Points:** Cannot provide individual feedback to all students simultaneously, students practice incorrectly between sessions, difficult to assess each student's technique accuracy
- **Goals:** Provide consistent training experience, enable students to practice correctly independently, track student progress objectively

## The Problem

### Inefficient Clinical Skills Training
Medical students spend countless hours practicing clinical examination techniques with limited feedback. Without real-time guidance, they often develop incorrect habits that must be unlearned later. Studies show 40% of medical students feel unprepared for basic clinical procedures upon graduation.

**Our Solution:** Computer vision-guided AR overlays provide instant visual feedback on hand placement and technique, ensuring students practice correctly every time.

### Hands-Occupied Information Access
Healthcare providers frequently need patient information while their hands are sterile or occupied with procedures. Breaking sterile field to check records increases infection risk and interrupts workflow. This leads to an average of 15 minutes of wasted time per shift.

**Our Solution:** Voice-activated patient record access and symptom recording allows providers to maintain sterile field while accessing critical information instantly.

### Medication Safety Risks
Prescription errors affect 1.5 million patients annually in the US. Many errors occur due to overlooked drug interactions or allergies, especially when physicians are multitasking or fatigued.

**Our Solution:** Real-time drug interaction checking with AI-powered alternatives suggestions prevents dangerous prescriptions before they reach the patient.

## Differentiators

### Hands-Free AR Interface
Unlike tablet-based medical references or desktop EMR systems, MedSnap operates entirely through voice commands and AR displays. This enables use during procedures where touching devices would break sterility, resulting in 80% faster information access.

### Real-Time Computer Vision Guidance
Unlike static training videos or textbook diagrams, we provide dynamic AR overlays that adapt to the user's actual hand position. This results in 3x faster skill acquisition and 90% reduction in technique errors.

### Context-Aware AI Assistant
Unlike generic medical AI tools, MedSnap maintains conversation context across the entire patient session. This enables natural, conversational interactions that feel like consulting with a knowledgeable colleague, improving diagnostic accuracy by 25%.

## Key Features

### Core Features
- **Voice Wake Word Activation:** Hands-free session initiation with "Hey MedSnap" command
- **Mode Switching:** Seamless transitions between training and clinical modes
- **AR Overlay Rendering:** Clear visual guidance with color-coded feedback at 30+ FPS

### Collaboration Features
- **Session State Persistence:** Maintains context across mode switches
- **Intelligent Response Caching:** Sub-500ms responses for common queries
- **Graceful Degradation:** Automatic fallback to demo mode if network connectivity lost

### Advanced Features
- **Pulse Point Detection:** Computer vision identifies radial pulse location on any wrist
- **AI Diagnostic Support:** Evidence-based differential diagnosis suggestions with Gemini
- **Drug Interaction Checking:** Automatic safety validation for all prescriptions
- **Natural Language Processing:** Context-aware conversation with 20-turn memory