# Lens Studio Manual Setup Guide - Dev 2

**Task**: 2.0 Environment Setup
**Duration**: ~30-45 minutes
**Prerequisites**: Lens Studio 5.15.0+ installed

---

## Overview

This guide walks you through the **manual** Lens Studio GUI setup for the MedSnap AR Medical Assistant. You will:
1. Create a new Lens Studio project
2. Build the scene hierarchy (cameras, UI objects)
3. Attach the placeholder scripts we created
4. Configure component inputs
5. Verify scripts load correctly in Logger

**Important**: The scripts are placeholders for now. Full implementation happens in Tasks 2.1-2.4.

---

## Table of Contents
1. [Create New Project](#step-1-create-new-project)
2. [Configure Project Settings](#step-2-configure-project-settings)
3. [Set Up Cameras](#step-3-set-up-cameras)
4. [Create Patient Card UI](#step-4-create-patient-card-ui)
5. [Create Prescription UI](#step-5-create-prescription-ui)
6. [Attach Scripts](#step-6-attach-scripts)
7. [Configure Script Inputs](#step-7-configure-script-inputs)
8. [Test in Logger](#step-8-test-in-logger)
9. [Save and Version Control](#step-9-save-and-version-control)

---

## Step 1: Create New Project

### 1.1 Launch Lens Studio
1. Open **Lens Studio 5.15.0** (or newer)
2. If prompted with templates, click **Skip** or **Close**

### 1.2 Create Empty Project
1. **File → New Project**
2. Select **Empty** template
3. Click **Create**

### 1.3 Save Project
1. **File → Save As...**
2. Navigate to: `/Users/jasonyi/snaplens-code/lens-studio/`
3. Name: `MedSnap.lsproj`
4. Click **Save**

**Checkpoint**: Project saved at `/Users/jasonyi/snaplens-code/lens-studio/MedSnap.lsproj`

---

## Step 2: Configure Project Settings

### 2.1 Project Info
1. Open **Project Info** panel (bottom-left corner)
2. Set **Project Name**: `MedSnap AR Medical Assistant`
3. Leave **Icon** and **Snapcode** as default for now

### 2.2 Preview Panel
1. Open **Preview Panel** (top-right)
2. Click device selector dropdown
3. Select **Spectacles** (NOT mobile device)
4. Verify preview shows Spectacles AR view

**Checkpoint**: Preview panel shows "Spectacles" device selected

---

## Step 3: Set Up Cameras

### 3.1 Verify Default Camera
1. In **Objects Panel** (left side), you should see:
   - **Scene** (root)
   - **Camera** (default perspective camera)

2. Leave the default **Camera** as-is (for 3D world view)

### 3.2 Add Orthographic Camera for UI
1. Right-click **Scene** → **Add New → Camera**
2. Rename to: `Orthographic Camera`
3. Select **Orthographic Camera** in Objects Panel
4. In **Inspector Panel** (right side):
   - **Camera Type**: Change to **Orthographic**
   - **Render Layer**: Set to **Ortho** (for 2D UI)
5. **Render Order**: Set to `1` (renders after main camera)

**Why Orthographic Camera?**: AR UI elements (patient card, prescription UI) need 2D rendering at fixed screen positions.

**Checkpoint**: Objects Panel shows both "Camera" and "Orthographic Camera"

---

## Step 4: Create Patient Card UI

### 4.1 Create Patient Card Root Object
1. Right-click **Scene** → **Add New → Screen Image**
2. Rename to: `[ROOT] PatientCard`
3. Select `[ROOT] PatientCard` in Objects Panel
4. In **Inspector Panel**:
   - **Enabled**: Uncheck (disabled by default, shown on patient load)
   - **Screen Transform → Anchors**: Will be set to Top Center programmatically

### 4.2 Add Canvas to Patient Card
1. Right-click `[ROOT] PatientCard` → **Add New → Screen Image**
2. Rename to: `Canvas`
3. In **Inspector Panel**:
   - **Screen Transform → Anchors → Center**: Set to `(0.5, 0.9)` (top center per AR-3)
   - **Screen Transform → Size**: Set to `(400, 300)` pixels

### 4.3 Add Background Panel
1. Right-click `Canvas` → **Add New → Screen Image**
2. Rename to: `Background`
3. In **Inspector Panel**:
   - **Materials → Add Material → Unlit**
   - **Unlit Material → Base Color**: Set to dark gray `(0.1, 0.1, 0.1, 0.8)` (semi-transparent)
   - **Screen Transform → Anchors**: Fill parent (default)

### 4.4 Add Patient Name Text
1. Right-click `Canvas` → **Add New → Text**
2. Rename to: `PatientNameText`
3. In **Inspector Panel**:
   - **Text Component → Text**: "Patient Name" (placeholder)
   - **Font Size**: `24` (larger for name)
   - **Screen Transform → Position**: `(0, 100, 0)` (top of card)

### 4.5 Add Patient Age/Sex Text
1. Right-click `Canvas` → **Add New → Text**
2. Rename to: `PatientAgeText`
3. In **Inspector Panel**:
   - **Text Component → Text**: "Age: 34, Female" (placeholder)
   - **Font Size**: `18` (minimum per AR-2)
   - **Screen Transform → Position**: `(0, 70, 0)`

### 4.6 Add Allergies Text
1. Right-click `Canvas` → **Add New → Text**
2. Rename to: `AllergiesText`
3. In **Inspector Panel**:
   - **Text Component → Text**: "Allergies: None" (placeholder)
   - **Font Size**: `18`
   - **Text Fill → Color**: **RED** `(1, 0, 0, 1)` (per FR-13, AR-1)
   - **Screen Transform → Position**: `(0, 40, 0)`

### 4.7 Add Medications Text
1. Right-click `Canvas` → **Add New → Text**
2. Rename to: `MedicationsText`
3. In **Inspector Panel**:
   - **Text Component → Text**: "Medications: None" (placeholder)
   - **Font Size**: `18`
   - **Screen Transform → Position**: `(0, 0, 0)` (center)

### 4.8 Add Vitals Text
1. Right-click `Canvas` → **Add New → Text**
2. Rename to: `VitalsText`
3. In **Inspector Panel**:
   - **Text Component → Text**: "BP: 120/80, HR: 72" (placeholder)
   - **Font Size**: `18`
   - **Screen Transform → Position**: `(0, -40, 0)`

**Checkpoint**: Objects Panel hierarchy looks like:
```
Scene
├── Camera
├── Orthographic Camera
└── [ROOT] PatientCard (disabled)
    └── Canvas
        ├── Background
        ├── PatientNameText
        ├── PatientAgeText
        ├── AllergiesText (RED text)
        ├── MedicationsText
        └── VitalsText
```

---

## Step 5: Create Prescription UI

### 5.1 Create Prescription UI Root Object
1. Right-click **Scene** → **Add New → Screen Image**
2. Rename to: `[ROOT] PrescriptionUI`
3. In **Inspector Panel**:
   - **Enabled**: Uncheck (disabled by default)
   - **Screen Transform → Anchors → Center**: `(0.5, 0.5)` (center of screen per AR-3)
   - **Screen Transform → Size**: `(400, 250)` pixels

### 5.2 Add Prescription Canvas
1. Right-click `[ROOT] PrescriptionUI` → **Add New → Screen Image**
2. Rename to: `Canvas`

### 5.3 Add Background
1. Right-click `Canvas` → **Add New → Screen Image**
2. Rename to: `Background`
3. In **Inspector Panel**:
   - **Materials → Add Material → Unlit**
   - **Unlit Material → Base Color**: Dark gray `(0.1, 0.1, 0.1, 0.9)`
   - **Screen Transform → Anchors**: Fill parent

### 5.4 Add Icon Image (Checkmark or X)
1. Right-click `Canvas` → **Add New → Image**
2. Rename to: `IconImage`
3. In **Inspector Panel**:
   - **Image Component → Texture**: Leave empty for now (will be set programmatically)
   - **Screen Transform → Size**: `(60, 60)` pixels
   - **Screen Transform → Position**: `(0, 80, 0)` (top of UI)

**Note**: We'll use colored squares for now. In Task 2.4, you can add actual checkmark/X icons.

### 5.5 Add Message Text
1. Right-click `Canvas` → **Add New → Text**
2. Rename to: `MessageText`
3. In **Inspector Panel**:
   - **Text Component → Text**: "Message" (placeholder)
   - **Font Size**: `18`
   - **Screen Transform → Position**: `(0, 20, 0)`

### 5.6 Add Alternatives Text
1. Right-click `Canvas` → **Add New → Text**
2. Rename to: `AlternativesText`
3. In **Inspector Panel**:
   - **Text Component → Text**: "Alternatives: None" (placeholder)
   - **Font Size**: `16`
   - **Screen Transform → Position**: `(0, -20, 0)`

### 5.7 Add Badge Text (PENDING)
1. Right-click `Canvas` → **Add New → Text**
2. Rename to: `BadgeText`
3. In **Inspector Panel**:
   - **Text Component → Text**: "PENDING" (per FR-26)
   - **Font Size**: `14`
   - **Text Fill → Color**: Yellow `(1, 1, 0, 1)` (stands out)
   - **Screen Transform → Position**: `(0, -60, 0)` (bottom)

**Checkpoint**: Objects Panel hierarchy includes:
```
Scene
├── Camera
├── Orthographic Camera
├── [ROOT] PatientCard (disabled)
│   └── ...
└── [ROOT] PrescriptionUI (disabled)
    └── Canvas
        ├── Background
        ├── IconImage
        ├── MessageText
        ├── AlternativesText
        └── BadgeText
```

---

## Step 6: Attach Scripts

### 6.1 Import Scripts to Lens Studio

**Important**: Lens Studio needs to see the scripts in its Resources panel.

1. In **Resources Panel** (bottom), click **+ Add New → Import Files...**
2. Navigate to: `/Users/jasonyi/snaplens-code/lens-studio/Public/Scripts/`
3. Select **config.js** and click **Open**
4. Repeat for:
   - `clinical/modeManager.js`
   - `clinical/clinicalMode.js`
   - `ui/patientCardRenderer.js`
   - `ui/prescriptionUI.js`

**Alternative Method** (if import doesn't work):
1. In Finder, copy all `.js` files from `/Users/jasonyi/snaplens-code/lens-studio/Public/Scripts/`
2. Paste into the Lens Studio project's `Public/Scripts/` folder
3. In Lens Studio: **Resources Panel → Right-click → Refresh**

**Checkpoint**: Resources Panel shows all 5 scripts under `Scripts/` folder

### 6.2 Attach config.js to Orthographic Camera
1. Select **Orthographic Camera** in Objects Panel
2. In **Inspector Panel**, scroll down and click **Add Component → Script**
3. In the new **Script Component**:
   - **Script**: Select `config.js` from dropdown
4. Verify **Logger Panel** (bottom) shows: `"MedSnap Config loaded - Task 2.0 complete"`

**Why Orthographic Camera?**: Config needs to load first, before any UI scripts. Camera is always active.

### 6.3 Attach modeManager.js to Scene Root
1. Select **Scene** in Objects Panel
2. **Inspector Panel → Add Component → Script**
3. **Script**: Select `modeManager.js`
4. **debugMode**: Check the box (enable debug logging)
5. Verify Logger shows: `"ModeManager loaded - awaiting Task 2.1 implementation"`

### 6.4 Attach patientCardRenderer.js to [ROOT] PatientCard
1. Select **[ROOT] PatientCard** in Objects Panel
2. **Inspector Panel → Add Component → Script**
3. **Script**: Select `patientCardRenderer.js`
4. **debugMode**: Check the box
5. Verify Logger shows: `"PatientCardRenderer loaded - awaiting Task 2.2 implementation"`

**Note**: We'll configure script inputs (patientNameText, etc.) in the next step.

### 6.5 Attach clinicalMode.js to Scene Root
1. Select **Scene** in Objects Panel
2. **Inspector Panel → Add Component → Script** (add another script)
3. **Script**: Select `clinicalMode.js`
4. **debugMode**: Check the box
5. Verify Logger shows: `"ClinicalMode loaded - awaiting Task 2.3 implementation"`

### 6.6 Attach prescriptionUI.js to [ROOT] PrescriptionUI
1. Select **[ROOT] PrescriptionUI** in Objects Panel
2. **Inspector Panel → Add Component → Script**
3. **Script**: Select `prescriptionUI.js`
4. **debugMode**: Check the box
5. Verify Logger shows: `"PrescriptionUI loaded - awaiting Task 2.4 implementation"`

**Checkpoint**: Logger Panel shows 5 load messages (config, modeManager, patientCard, clinicalMode, prescriptionUI)

---

## Step 7: Configure Script Inputs

Now we need to wire up the script input parameters to the actual scene objects.

### 7.1 Configure patientCardRenderer.js Inputs

1. Select **[ROOT] PatientCard** in Objects Panel
2. In **Inspector Panel**, find the **patientCardRenderer Script Component**
3. You should see input fields for:
   - `patientNameText`
   - `patientAgeText`
   - `allergiesText`
   - `medicationsText`
   - `vitalsText`
   - `cardBackground`
   - `cardRootObject`
   - `debugMode` (already checked)

4. For each input, click the dropdown and select the corresponding object:
   - **patientNameText**: Select `PatientNameText` (from Canvas children)
   - **patientAgeText**: Select `PatientAgeText`
   - **allergiesText**: Select `AllergiesText`
   - **medicationsText**: Select `MedicationsText`
   - **vitalsText**: Select `VitalsText`
   - **cardBackground**: Select `Background`
   - **cardRootObject**: Select `[ROOT] PatientCard` itself

**Tip**: If dropdowns are empty, make sure all objects have the correct component types:
- Text objects need **Text Component**
- Image objects need **Image Component**

### 7.2 Configure prescriptionUI.js Inputs

1. Select **[ROOT] PrescriptionUI** in Objects Panel
2. In **Inspector Panel**, find the **prescriptionUI Script Component**
3. Configure inputs:
   - **iconImage**: Select `IconImage`
   - **messageText**: Select `MessageText`
   - **alternativesText**: Select `AlternativesText`
   - **badgeText**: Select `BadgeText`
   - **backgroundImage**: Select `Background`
   - **uiRootObject**: Select `[ROOT] PrescriptionUI` itself
   - **debugMode**: Already checked

### 7.3 Configure clinicalMode.js Inputs

1. Select **Scene** in Objects Panel
2. Find the **clinicalMode Script Component** in Inspector
3. Configure inputs:
   - **modeManager**: Select the **Script Component** from `Scene` that has `modeManager.js`
   - **patientCardRenderer**: Select the **Script Component** from `[ROOT] PatientCard` that has `patientCardRenderer.js`
   - **prescriptionUI**: Select the **Script Component** from `[ROOT] PrescriptionUI` that has `prescriptionUI.js`
   - **debugMode**: Already checked

**How to select Script Components**:
- Click the dropdown
- Look for entries like: `Scene/Script: modeManager.js`
- Select the matching script component

**Checkpoint**: All script inputs wired to scene objects (no red warning icons)

---

## Step 8: Test in Logger

### 8.1 Check Initial Load Messages
1. Open **Logger Panel** (bottom of screen)
2. You should see (in order):
   ```
   MedSnap Config loaded - Task 2.0 complete
   ModeManager loaded - awaiting Task 2.1 implementation
   Debug: Available modes: {"IDLE":"idle","TRAINING":"training","CLINICAL":"clinical"}
   PatientCardRenderer loaded - awaiting Task 2.2 implementation
   Debug: Allergy text color: {"x":1,"y":0,"z":0,"w":1}
   Debug: Auto-hide timeout: 10000ms
   ClinicalMode loaded - awaiting Task 2.3 implementation
   Debug: Clinical states: {"IDLE":"idle","LOADING_PATIENT":"loading_patient",...}
   Debug: Inactivity timeout: 120000ms
   PrescriptionUI loaded - awaiting Task 2.4 implementation
   Debug: Success color: {"x":0,"y":1,"z":0,"w":1}
   Debug: Warning color: {"x":1,"y":0,"z":0,"w":1}
   Debug: Auto-dismiss timeout: 5000ms
   ```

**If you see errors**:
- **"MedSnapConfig not loaded"**: config.js didn't run first. Make sure it's on Orthographic Camera and loads before other scripts.
- **"Cannot read property..."**: Script input not wired correctly. Go back to Step 7.

### 8.2 Test Script Function Calls (Optional Advanced)

You can test placeholder functions using the **Console** in Logger:

1. In **Logger Panel**, click the **Console** tab
2. Type test commands:

```javascript
// Test mode manager
var modeScript = Scene.getScriptComponent("modeManager");
modeScript.switchMode("clinical");
// Should log: "ModeManager: Mode switched to clinical (placeholder)"

// Test patient card
var cardScript = Scene.getChild("[ROOT] PatientCard").getScriptComponent("patientCardRenderer");
cardScript.renderPatientCard({name: "Test Patient"});
// Should log: "PatientCardRenderer: Card rendered for Test Patient (placeholder)"
```

**Note**: These are just placeholder functions. Full implementation happens in Tasks 2.1-2.4.

---

## Step 9: Save and Version Control

### 9.1 Save Project
1. **File → Save** (Cmd+S / Ctrl+S)
2. Verify no errors in Logger

### 9.2 Document Project Structure

The guide already created `docs/Lens_Studio_Project_Structure.md`, but let's verify it's accurate:

**Final Scene Hierarchy**:
```
Scene
├── Camera (default perspective)
├── Orthographic Camera (UI rendering)
│   └── Script: config.js
├── Script: modeManager.js
├── Script: clinicalMode.js
├── [ROOT] PatientCard (disabled)
│   ├── Script: patientCardRenderer.js
│   └── Canvas (top center, 0.5, 0.9)
│       ├── Background (dark semi-transparent)
│       ├── PatientNameText (24pt)
│       ├── PatientAgeText (18pt)
│       ├── AllergiesText (18pt, RED)
│       ├── MedicationsText (18pt)
│       └── VitalsText (18pt)
└── [ROOT] PrescriptionUI (disabled)
    ├── Script: prescriptionUI.js
    └── Canvas (center, 0.5, 0.5)
        ├── Background (dark semi-transparent)
        ├── IconImage (60x60)
        ├── MessageText (18pt)
        ├── AlternativesText (16pt)
        └── BadgeText (14pt, yellow)
```

### 9.3 Export Project Summary (Optional)

If you want to export a summary for documentation:

1. **File → Project Info**
2. Take a screenshot of the scene hierarchy
3. Save to: `/Users/jasonyi/snaplens-code/docs/screenshots/lens_studio_hierarchy.png`

**Note**: Don't commit screenshots to git unless necessary (large file size).

### 9.4 Git Note: .lsproj Files

Lens Studio project files (`.lsproj`) are binary packages. Git will track them as blobs, which is fine for now. The important thing is that the **scripts** (`.js` files) are tracked as text files in `lens-studio/Public/Scripts/`.

**Current Git Status**:
- ✅ All scripts committed in Phase 6
- ✅ .lsproj file will be auto-tracked when you save it

---

## Testing on Spectacles Hardware (Optional)

If you have Snap Spectacles hardware available:

### Connect Device
1. Connect Spectacles via USB or Wi-Fi
2. In Lens Studio **Preview Panel** → **Device** dropdown
3. Select your connected Spectacles

### Push to Device
1. Click **"Push to Device"** button (top-right)
2. Wait for transfer to complete
3. Put on Spectacles
4. Verify AR UI appears (patient card and prescription UI will be hidden by default)

### Check Logs
1. Spectacles logs will appear in **Logger Panel**
2. Verify all 5 scripts loaded successfully

---

## Troubleshooting

### "Script not found" Error
**Problem**: Resources Panel doesn't show scripts
**Solution**:
1. Verify scripts are in `/Users/jasonyi/snaplens-code/lens-studio/Public/Scripts/`
2. In Lens Studio: **Resources Panel → Right-click → Refresh**
3. Reimport scripts using **Add New → Import Files...**

### "MedSnapConfig not loaded" Error
**Problem**: config.js didn't run before other scripts
**Solution**:
1. Verify config.js is attached to **Orthographic Camera** (loads early)
2. Check script component order: config.js should be first
3. Restart Lens Studio to force reload

### Script Inputs Show "None"
**Problem**: Component types don't match script inputs
**Solution**:
1. Verify text objects have **Text Component** (not just Image Component)
2. Verify image objects have **Image Component**
3. Recreate objects if component types are wrong

### Logger Shows No Messages
**Problem**: Logger Panel might be collapsed or filtered
**Solution**:
1. **View → Logger** to open Logger Panel
2. Click **Clear** button, then **Refresh** (circular arrow)
3. **File → Reopen Project** to force script reload

### Preview Shows Black Screen
**Problem**: Camera settings incorrect
**Solution**:
1. Select **Camera** (main perspective camera)
2. Verify **Camera Type** is **Perspective** (not Orthographic)
3. Select **Orthographic Camera**
4. Verify **Camera Type** is **Orthographic**
5. Verify **Render Order**: Orthographic Camera = 1, Main Camera = 0

---

## Next Steps After Manual Setup

Once you've completed this manual setup:

1. ✅ **Verify all scripts loaded** (5 log messages in Logger)
2. ✅ **Test scene hierarchy** (all objects created, disabled by default)
3. ✅ **Save project**

**Then proceed to**:
- **Phase 8**: Run validation script to verify entire Task 2.0
- **Task 2.1** (Hours 6-12): Implement Mode Manager with TDD
- **Task 2.2** (Hours 12-18): Implement Patient Card Renderer with TDD

---

## Reference Documentation

For Lens Studio API help during implementation:

1. **Local Docs**: `docs/Lens_Studio_API_Reference.md` (Dev 2 focused)
2. **Full API**: `docs/Full_Lens_API_Comprehensive.md`
3. **Official Docs**: https://developers.snap.com/lens-studio/references/scripting-api
4. **Sample Projects**: `Spectacles-Sample/` folder

**Key APIs for Dev 2**:
- `Component.Text` - Text rendering
- `Component.Image` - Image rendering
- `Component.ScreenTransform` - UI positioning
- `Component.AudioComponent` - TTS playback (Task 2.3+)
- `global.*` - Global variables (MedSnapConfig)

---

**Setup Complete!** ✅

You now have:
- Lens Studio project with scene hierarchy
- All placeholder scripts attached and configured
- Debug logging working
- Ready for Task 2.1 implementation

**Last Updated**: October 24, 2025
**Version**: 1.0 (Task 2.0 - Environment Setup)
