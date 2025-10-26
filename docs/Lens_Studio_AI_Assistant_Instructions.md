# Lens Studio AI Assistant Setup Instructions

**Project**: MedSnap AR Medical Assistant
**Target**: Snap Spectacles
**Purpose**: Step-by-step instructions for Lens Studio AI to build the scene

---

## STEP 1: Create New Empty Project

Create a new empty Lens Studio project and save it as:
- **Location**: `/Users/jasonyi/snaplens-code/lens-studio/MedSnap.lsproj`
- **Project Name**: `MedSnap AR Medical Assistant`
- **Template**: Empty
- **Target Device**: Spectacles (NOT mobile)

---

## STEP 2: Add Orthographic Camera

Add a second camera for UI rendering:

1. Add new Camera to Scene root
2. Configure this camera:
   - **Name**: `Orthographic Camera`
   - **Camera Type**: Orthographic
   - **Render Layer**: Ortho
   - **Render Order**: 1

Keep the default perspective Camera as-is (Render Order: 0).

---

## STEP 3: Create Patient Card UI Hierarchy

Create the following hierarchy exactly:

```
Scene
└── [ROOT] PatientCard (Screen Image)
    └── Canvas (Screen Image)
        ├── Background (Screen Image)
        ├── PatientNameText (Text)
        ├── PatientDetailsText (Text)
        ├── AllergiesText (Text)
        ├── MedicationsText (Text)
        ├── HistoryText (Text)
        ├── VitalsText (Text)
        ├── ChiefComplaintText (Text)
        └── SymptomsText (Text)
```

**Configuration for each object**:

### [ROOT] PatientCard
- Type: Screen Image
- Enabled: **FALSE** (disabled by default)
- Screen Transform → Anchors → Center: **(0.5, 0.9)** (top center)
- Screen Transform → Size: **(500, 400)** pixels

### Canvas
- Type: Screen Image
- Screen Transform: Fill parent (default)

### Background
- Type: Screen Image
- Material: Unlit
- Base Color: **(0.1, 0.1, 0.1, 0.8)** (dark semi-transparent)
- Screen Transform: Fill parent

### PatientNameText
- Type: Text
- Text: "Patient Name" (placeholder)
- Font Size: **24**
- Color: White (1, 1, 1, 1)
- Screen Transform → Position: **(0, 150, 0)**

### PatientDetailsText
- Type: Text
- Text: "Age, Sex" (placeholder)
- Font Size: **18**
- Color: White
- Screen Transform → Position: **(0, 120, 0)**

### AllergiesText
- Type: Text
- Text: "Allergies: None" (placeholder)
- Font Size: **20**
- Color: **RED (1, 0, 0, 1)** ← IMPORTANT: Must be red
- Screen Transform → Position: **(0, 80, 0)**

### MedicationsText
- Type: Text
- Text: "Medications: None" (placeholder)
- Font Size: **18**
- Color: White
- Screen Transform → Position: **(0, 40, 0)**

### HistoryText
- Type: Text
- Text: "Recent Diagnoses: None" (placeholder)
- Font Size: **18**
- Color: White
- Screen Transform → Position: **(0, 0, 0)**

### VitalsText
- Type: Text
- Text: "Vitals: Not recorded" (placeholder)
- Font Size: **18**
- Color: White
- Screen Transform → Position: **(0, -40, 0)**

### ChiefComplaintText
- Type: Text
- Text: "Chief Complaint:" (placeholder)
- Font Size: **18**
- Color: White
- Screen Transform → Position: **(0, -80, 0)**

### SymptomsText
- Type: Text
- Text: "" (empty by default)
- Font Size: **18**
- Color: White
- Screen Transform → Position: **(0, -120, 0)**

---

## STEP 4: Create Prescription UI Hierarchy

Create this hierarchy:

```
Scene
└── [ROOT] PrescriptionUI (Screen Image)
    └── Canvas (Screen Image)
        ├── Background (Screen Image)
        ├── IconImage (Image)
        ├── MessageText (Text)
        ├── AlternativesText (Text)
        └── BadgeText (Text)
```

**Configuration**:

### [ROOT] PrescriptionUI
- Type: Screen Image
- Enabled: **FALSE** (disabled by default)
- Screen Transform → Anchors → Center: **(0.5, 0.5)** (center of screen)
- Screen Transform → Size: **(450, 300)** pixels

### Canvas
- Type: Screen Image
- Screen Transform: Fill parent

### Background
- Type: Screen Image
- Material: Unlit
- Base Color: **(0.1, 0.1, 0.1, 0.9)** (dark semi-transparent)
- Screen Transform: Fill parent

### IconImage
- Type: Image
- Texture: (leave empty for now)
- Screen Transform → Size: **(60, 60)** pixels
- Screen Transform → Position: **(0, 100, 0)**

### MessageText
- Type: Text
- Text: "Message" (placeholder)
- Font Size: **18**
- Color: White
- Screen Transform → Position: **(0, 40, 0)**

### AlternativesText
- Type: Text
- Text: "Alternatives: None" (placeholder)
- Font Size: **16**
- Color: White
- Screen Transform → Position: **(0, -20, 0)**

### BadgeText
- Type: Text
- Text: "PENDING" (placeholder)
- Font Size: **14**
- Color: **Yellow (1, 1, 0, 1)**
- Screen Transform → Position: **(0, -80, 0)**

---

## STEP 5: Import Scripts

Import the following JavaScript files from `/Users/jasonyi/snaplens-code/lens-studio/Public/Scripts/`:

1. `config.js`
2. `clinical/modeManager.js`
3. `clinical/clinicalMode.js`
4. `ui/patientCardRenderer.js`
5. `ui/prescriptionUI.js`

**How to import**:
- Resources Panel → Add New → Import Files
- Navigate to the paths above and select each file
- Verify all scripts appear in Resources Panel under Scripts/

---

## STEP 6: Attach Scripts to Objects

Attach scripts in this order (order matters for loading):

### 6.1: Attach config.js to Orthographic Camera
- Select: **Orthographic Camera**
- Add Component → Script
- Script: `config.js`
- No inputs needed

### 6.2: Attach modeManager.js to Scene
- Select: **Scene** (root object)
- Add Component → Script
- Script: `clinical/modeManager.js`
- Set `debugMode` = **TRUE** (check the box)

### 6.3: Attach clinicalMode.js to Scene
- Select: **Scene** (root object)
- Add Component → Script (add a second script to Scene)
- Script: `clinical/clinicalMode.js`
- Set `debugMode` = **TRUE**

### 6.4: Attach patientCardRenderer.js to [ROOT] PatientCard
- Select: **[ROOT] PatientCard**
- Add Component → Script
- Script: `ui/patientCardRenderer.js`
- Set `debugMode` = **TRUE**

### 6.5: Attach prescriptionUI.js to [ROOT] PrescriptionUI
- Select: **[ROOT] PrescriptionUI**
- Add Component → Script
- Script: `ui/prescriptionUI.js`
- Set `debugMode` = **TRUE**

---

## STEP 7: Wire Script Input Parameters

### 7.1: Configure patientCardRenderer.js inputs

Select **[ROOT] PatientCard**, find the patientCardRenderer Script Component in Inspector.

Wire these inputs by selecting from dropdowns:

- `patientNameText` → **PatientNameText** (the Text component)
- `allergiesText` → **AllergiesText**
- `medicationsText` → **MedicationsText**
- `historyText` → **HistoryText**
- `vitalsText` → **VitalsText**
- `chiefComplaintText` → **ChiefComplaintText**
- `symptomsText` → **SymptomsText**
- `cardBackground` → **Background** (the Image component)
- `cardRootObject` → **[ROOT] PatientCard** (the parent object itself)
- `debugMode` → **TRUE** (already set)

**NOTE**: The script expects these exact input names. If the script shows different inputs (like `patientAgeText` instead of `patientDetailsText`), update the script to match the Text components we created above, OR rename the Text components to match the script inputs.

### 7.2: Configure prescriptionUI.js inputs

Select **[ROOT] PrescriptionUI**, find the prescriptionUI Script Component.

Wire these inputs:

- `iconImage` → **IconImage**
- `messageText` → **MessageText**
- `alternativesText` → **AlternativesText**
- `badgeText` → **BadgeText**
- `backgroundImage` → **Background**
- `uiRootObject` → **[ROOT] PrescriptionUI**
- `debugMode` → **TRUE**

### 7.3: Configure clinicalMode.js inputs

Select **Scene**, find the clinicalMode Script Component.

Wire these inputs:

- `modeManager` → **Script Component: modeManager.js** (select the script component, not the object)
- `patientCardRenderer` → **Script Component: patientCardRenderer.js**
- `prescriptionUI` → **Script Component: prescriptionUI.js**
- `debugMode` → **TRUE**

**How to select Script Components**:
- Click the input dropdown
- Look for entries like "Scene/Script: modeManager.js" or "[ROOT] PatientCard/Script: patientCardRenderer.js"
- Select the matching script component reference

---

## STEP 8: Enable Text Wrapping

For all Text components in Patient Card and Prescription UI:

1. Select each Text component (PatientNameText, AllergiesText, MedicationsText, etc.)
2. In Inspector → Text Component
3. Find **"Horizontal Overflow"** setting
4. Set to: **Wrap** (not Overflow)

This ensures long text doesn't overflow off-screen.

---

## STEP 9: Verify in Logger

Open the Logger Panel (bottom of Lens Studio).

You should see these messages in order:

```
MedSnap Config loaded - Task 2.0 complete
ModeManager loaded - awaiting Task 2.1 implementation
Debug: Available modes: {"IDLE":"idle","TRAINING":"training","CLINICAL":"clinical"}
PatientCardRenderer loaded - awaiting Task 2.2 implementation
Debug: Allergy text color: {"x":1,"y":0,"z":0,"w":1}
Debug: Auto-hide timeout: 10000ms
ClinicalMode loaded - awaiting Task 2.3 implementation
Debug: Clinical states: ...
PrescriptionUI loaded - awaiting Task 2.4 implementation
Debug: Success color: {"x":0,"y":1,"z":0,"w":1}
```

**If you see errors**:
- "MedSnapConfig not loaded" → config.js didn't load first. Verify it's on Orthographic Camera.
- "Cannot read property..." → Script inputs not wired correctly. Recheck Step 7.
- "Script not found" → Scripts didn't import. Redo Step 5.

---

## STEP 10: Save Project

Save the project:
- File → Save
- Verify path: `/Users/jasonyi/snaplens-code/lens-studio/MedSnap.lsproj`

---

## EXPECTED FINAL HIERARCHY

```
Scene
├── Camera (Perspective, Render Order: 0)
├── Orthographic Camera (Orthographic, Render Order: 1)
│   └── Script: config.js
├── Script: modeManager.js (debugMode: true)
├── Script: clinicalMode.js (debugMode: true)
├── [ROOT] PatientCard (DISABLED, anchors: 0.5, 0.9)
│   ├── Script: patientCardRenderer.js (debugMode: true, all inputs wired)
│   └── Canvas
│       ├── Background (dark semi-transparent)
│       ├── PatientNameText (24pt, white)
│       ├── PatientDetailsText (18pt, white)
│       ├── AllergiesText (20pt, RED)
│       ├── MedicationsText (18pt, white)
│       ├── HistoryText (18pt, white)
│       ├── VitalsText (18pt, white)
│       ├── ChiefComplaintText (18pt, white)
│       └── SymptomsText (18pt, white)
└── [ROOT] PrescriptionUI (DISABLED, anchors: 0.5, 0.5)
    ├── Script: prescriptionUI.js (debugMode: true, all inputs wired)
    └── Canvas
        ├── Background (dark semi-transparent)
        ├── IconImage (60x60)
        ├── MessageText (18pt, white)
        ├── AlternativesText (16pt, white)
        └── BadgeText (14pt, yellow)
```

---

## VERIFICATION CHECKLIST

Before marking complete, verify:

- [ ] Project saved at correct path
- [ ] Spectacles selected as target device (not mobile)
- [ ] 2 cameras: Perspective (order 0) + Orthographic (order 1)
- [ ] Patient Card has 8 text components (1 is RED for allergies)
- [ ] Prescription UI has 4 text components
- [ ] 5 scripts imported and visible in Resources Panel
- [ ] All 5 scripts attached to correct objects
- [ ] All script inputs wired (no "None" values in Inspector)
- [ ] Logger shows 5 "loaded" messages with no errors
- [ ] Text wrapping enabled for all text components
- [ ] Both UI root objects ([ROOT] PatientCard and [ROOT] PrescriptionUI) are DISABLED by default

---

## TROUBLESHOOTING

**Script inputs show "None" or empty dropdowns**:
- Verify Text components have **Text Component** (not just Screen Transform)
- Verify Image components have **Image Component**
- Try removing and re-adding the component if type is wrong

**Logger shows no messages**:
- View → Logger to open panel
- Click Refresh button (circular arrow)
- Try File → Reopen Project

**"Cannot find component" errors**:
- Verify object names match exactly (case-sensitive)
- Verify hierarchy structure matches Step 3 and Step 4

**Red text not appearing red**:
- Select AllergiesText
- Inspector → Text Component → Text Fill → Color
- Manually set to: R=1, G=0, B=0, A=1

---

## NOTES FOR AI ASSISTANT

- **Screen Transform anchors** use (x, y) coordinates where:
  - (0.5, 0.5) = center
  - (0.5, 0.9) = top center
  - (0, 0) = bottom-left
  - (1, 1) = top-right

- **Colors** use RGBA format (Red, Green, Blue, Alpha) with values 0-1:
  - Red = (1, 0, 0, 1)
  - White = (1, 1, 1, 1)
  - Yellow = (1, 1, 0, 1)
  - Semi-transparent dark = (0.1, 0.1, 0.1, 0.8)

- **Script Component references** are different from Object references:
  - When wiring script inputs that expect "Component.ScriptComponent", select the script itself (e.g., "Scene/Script: modeManager.js")
  - When wiring inputs that expect objects, select the object (e.g., "PatientNameText")

- **Disabled objects** ([ROOT] PatientCard, [ROOT] PrescriptionUI) will not be visible in preview. This is correct - they are shown/hidden programmatically by the scripts.

---

**Setup Complete!** The scene is now ready for Task 2.2 implementation (Patient Card Renderer).
