/**
 * Dev 2 Task 2.0: Demo Mode Middleware
 * Intercepts API calls and returns mock responses when DEMO_MODE=true
 */

const fs = require('fs');
const path = require('path');

let demoPatientData = null;
let demoApiResponses = null;

function loadDemoData() {
  if (process.env.DEMO_MODE !== 'true') {
    return;
  }

  const patientDataPath = path.join(__dirname, '../../..', process.env.DEMO_PATIENT_DATA_PATH);
  const apiResponsesPath = path.join(__dirname, '../../..', process.env.DEMO_API_RESPONSES_PATH);

  demoPatientData = JSON.parse(fs.readFileSync(patientDataPath, 'utf-8'));
  demoApiResponses = JSON.parse(fs.readFileSync(apiResponsesPath, 'utf-8'));
}

function isDemoMode() {
  return process.env.DEMO_MODE === 'true';
}

function getDemoPatient(patientName) {
  if (!demoPatientData) loadDemoData();

  const key = patientName.toLowerCase().replace(/\s+/g, '_');
  return demoPatientData[key] || null;
}

function getDemoApiResponse(responseType) {
  if (!demoApiResponses) loadDemoData();

  return demoApiResponses[responseType] || null;
}

module.exports = {
  isDemoMode,
  getDemoPatient,
  getDemoApiResponse,
  loadDemoData
};
