export interface Patient {
  id: string
  name: string
  age: number
  sex: "Male" | "Female" | "Other"
  chiefComplaint: string
  currentSymptoms: string[]
  vitalSigns: {
    bloodPressure: string
    heartRate: number
    temperature: number
  }
  allergies: string[]
  medications: string[]
  diagnosisHistory: string[]
  createdAt: Date
}

const firstNames = [
  "James",
  "Mary",
  "John",
  "Patricia",
  "Robert",
  "Jennifer",
  "Michael",
  "Linda",
  "William",
  "Elizabeth",
  "David",
  "Barbara",
  "Richard",
  "Susan",
  "Joseph",
  "Jessica",
  "Thomas",
  "Sarah",
  "Charles",
  "Karen",
  "Christopher",
  "Nancy",
  "Daniel",
  "Lisa",
  "Matthew",
  "Betty",
  "Anthony",
  "Margaret",
  "Mark",
  "Sandra",
  "Donald",
  "Ashley",
  "Steven",
  "Kimberly",
  "Paul",
  "Emily",
  "Andrew",
  "Donna",
  "Joshua",
  "Michelle",
  "Kenneth",
  "Carol",
  "Kevin",
  "Amanda",
  "Brian",
  "Dorothy",
  "George",
  "Melissa",
  "Timothy",
  "Deborah",
]
const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
  "Green",
  "Adams",
  "Nelson",
  "Baker",
  "Hall",
  "Rivera",
  "Campbell",
  "Mitchell",
  "Carter",
  "Roberts",
]

const complaints = [
  "Chest pain",
  "Shortness of breath",
  "Abdominal pain",
  "Headache",
  "Fever",
  "Dizziness",
  "Nausea",
  "Back pain",
  "Cough",
  "Fatigue",
  "Joint pain",
  "Sore throat",
  "Rash",
  "Anxiety",
  "Insomnia",
]

const symptoms = [
  "Fever",
  "Chills",
  "Sweating",
  "Fatigue",
  "Weakness",
  "Dizziness",
  "Nausea",
  "Vomiting",
  "Diarrhea",
  "Constipation",
  "Headache",
  "Chest pain",
  "Shortness of breath",
  "Cough",
  "Sore throat",
  "Runny nose",
  "Congestion",
  "Rash",
  "Itching",
  "Joint pain",
  "Muscle aches",
  "Back pain",
  "Abdominal pain",
]

const allergies = [
  "Penicillin",
  "Sulfa drugs",
  "Aspirin",
  "Ibuprofen",
  "Latex",
  "Peanuts",
  "Shellfish",
  "Eggs",
  "Milk",
  "Soy",
  "Wheat",
  "Tree nuts",
  "Pollen",
  "Dust mites",
  "Pet dander",
  "Mold",
  "Bee stings",
]

const medications = [
  "Lisinopril",
  "Metformin",
  "Atorvastatin",
  "Levothyroxine",
  "Amlodipine",
  "Metoprolol",
  "Omeprazole",
  "Losartan",
  "Gabapentin",
  "Hydrochlorothiazide",
  "Sertraline",
  "Albuterol",
  "Furosemide",
  "Pantoprazole",
  "Aspirin",
  "Ibuprofen",
  "Acetaminophen",
]

const diagnoses = [
  "Hypertension",
  "Type 2 Diabetes",
  "Hyperlipidemia",
  "Asthma",
  "GERD",
  "Anxiety disorder",
  "Depression",
  "Osteoarthritis",
  "Chronic back pain",
  "Migraine",
  "Allergic rhinitis",
  "Hypothyroidism",
  "COPD",
  "Atrial fibrillation",
  "Coronary artery disease",
]

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function generatePatient(index: number): Patient {
  const sex = getRandomItem(["Male", "Female", "Other"] as const)
  const age = Math.floor(Math.random() * 70) + 18
  const daysAgo = Math.floor(Math.random() * 30)
  const createdAt = new Date()
  createdAt.setDate(createdAt.getDate() - daysAgo)

  return {
    id: `PT${String(index + 1).padStart(5, "0")}`,
    name: `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`,
    age,
    sex,
    chiefComplaint: getRandomItem(complaints),
    currentSymptoms: getRandomItems(symptoms, Math.floor(Math.random() * 4) + 2),
    vitalSigns: {
      bloodPressure: `${Math.floor(Math.random() * 40) + 110}/${Math.floor(Math.random() * 30) + 70}`,
      heartRate: Math.floor(Math.random() * 40) + 60,
      temperature: +(Math.random() * 2 + 97).toFixed(1),
    },
    allergies: Math.random() > 0.3 ? getRandomItems(allergies, Math.floor(Math.random() * 3) + 1) : ["None"],
    medications: Math.random() > 0.4 ? getRandomItems(medications, Math.floor(Math.random() * 4) + 1) : ["None"],
    diagnosisHistory: Math.random() > 0.5 ? getRandomItems(diagnoses, Math.floor(Math.random() * 3) + 1) : ["None"],
    createdAt,
  }
}

export const patientsDatabase: Patient[] = Array.from({ length: 100 }, (_, i) => generatePatient(i))
