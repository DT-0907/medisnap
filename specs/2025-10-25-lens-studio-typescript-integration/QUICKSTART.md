# Quick Start Guide: Lens Studio TypeScript Integration

**Goal**: Get from zero to working TypeScript build in Lens Studio in 30 minutes.

## Prerequisites

- Node.js 20+ installed
- Lens Studio 5.13+ installed
- MedSnap repository cloned
- Marvin reference available at `/Users/jasonyi/snaplens-code/marvin/ar-core/`

## 30-Minute Setup

### Minutes 0-5: Initialize Build System

```bash
cd /Users/jasonyi/snaplens-code/lens-studio

# Create package.json
cat > package.json << 'EOF'
{
  "name": "medsnap-lens-studio",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "typescript": "^5.3.3"
  }
}
EOF

# Install dependencies
npm install

# Create TypeScript config (copy from marvin)
cp ../marvin/ar-core/tsconfig.json .
```

**Validation**: `npm run build` should succeed (even with no src/ yet)

### Minutes 5-10: Copy Type Definitions

```bash
# Create src/types directory
mkdir -p src/types

# Copy Lens Studio types from marvin
cp ../marvin/ar-core/src/types/lens-studio.d.ts src/types/

# You'll create core.ts in implementation phase
# For now, create a minimal stub:
cat > src/types/core.ts << 'EOF'
export enum AppMode {
  IDLE = 'IDLE',
  CLINICAL = 'CLINICAL',
  TRAINING = 'TRAINING'
}

export interface MedSnapConfig {
  backendUrl: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}
EOF
```

**Validation**: `npm run type-check` should succeed

### Minutes 10-20: Create Minimal Entry Point

```bash
cat > src/lens-studio-entry.ts << 'EOF'
/**
 * MedSnap Lens Studio Entry Point
 */

import { Script, SceneObject } from './types/lens-studio';
import { AppMode } from './types/core';

// @input SceneObject sceneRoot

// Global declarations
declare const script: Script;
declare const sceneRoot: SceneObject;

// Minimal system
class MedSnapARSystem {
  private currentMode: AppMode = AppMode.IDLE;

  initialize(script: Script, sceneRoot: SceneObject): void {
    print('[MedSnap] System initialized');
    this.currentMode = AppMode.IDLE;
  }

  start(): void {
    print('[MedSnap] System started');
  }

  update(): void {
    // Called every frame
  }

  dispose(): void {
    print('[MedSnap] System disposed');
  }

  getCurrentMode(): AppMode {
    return this.currentMode;
  }
}

let medSnapSystem: MedSnapARSystem;

// Initialize on scene load
const sceneLoadEvent = script.createEvent('SceneEvent.OnStart');
sceneLoadEvent.bind(() => {
  print('[MedSnap] Scene loaded, initializing...');
  medSnapSystem = new MedSnapARSystem();
  medSnapSystem.initialize(script, sceneRoot);
  medSnapSystem.start();
});

// Update loop
const updateEvent = script.createEvent('UpdateEvent');
updateEvent.bind(() => {
  if (medSnapSystem) {
    medSnapSystem.update();
  }
});

// Cleanup
const sceneUnloadEvent = script.createEvent('SceneEvent.OnDestroy');
sceneUnloadEvent.bind(() => {
  print('[MedSnap] Scene unloading, cleaning up...');
  if (medSnapSystem) {
    medSnapSystem.dispose();
  }
});

// Debug API
(global as any).medSnap = {
  getSystem: () => medSnapSystem,
  getMode: () => medSnapSystem?.getCurrentMode()
};
EOF
```

**Validation**: `npm run build` → check `dist/lens-studio-entry.js` exists and has `@input` comment

### Minutes 20-25: Import into Lens Studio

1. **Build the TypeScript**:
   ```bash
   npm run build
   ```

2. **Open Lens Studio**:
   - Open project: `/Users/jasonyi/snaplens-code/lens-studio/MedSnap.lsproj`

3. **Import script**:
   - Resources panel → right-click → Add Files
   - Navigate to `dist/lens-studio-entry.js`
   - Click Import

4. **Create scene object**:
   - Scene Hierarchy → right-click → Create New → Scene Object
   - Rename to "MedSnapSystem"

5. **Add script component**:
   - Select MedSnapSystem object
   - Inspector → Add Component → Script
   - Choose lens-studio-entry.js

6. **Create SceneRoot object**:
   - Scene Hierarchy → right-click → Create New → Scene Object
   - Rename to "SceneRoot"

7. **Wire input**:
   - Select MedSnapSystem object
   - In Inspector, find Script component
   - See "sceneRoot" input field
   - Drag SceneRoot object from hierarchy to this field

### Minutes 25-30: Test and Validate

1. **Click Play** in Lens Studio

2. **Open Logs** (View → Logs)

3. **Expected output**:
   ```
   [MedSnap] Scene loaded, initializing...
   [MedSnap] System initialized
   [MedSnap] System started
   ```

4. **Stop scene**

5. **Expected output**:
   ```
   [MedSnap] Scene unloading, cleaning up...
   [MedSnap] System disposed
   ```

6. **Test debug API**:
   - In Lens Studio console, type: `global.medSnap.getMode()`
   - Should return: `"IDLE"`

## Success Checklist

After 30 minutes, you should have:

- [x] TypeScript compiles without errors
- [x] dist/lens-studio-entry.js generated
- [x] @input annotations preserved in .js file
- [x] Script imports into Lens Studio
- [x] Scene plays without errors
- [x] Console shows initialization logs
- [x] System disposes cleanly on stop
- [x] Debug API accessible

## Next Steps

You now have the minimal foundation. Proceed to:

1. **Follow implementation-guide.md** to build out full components
2. **Reference marvin-to-medsnap-mapping.md** for patterns
3. **Follow test-plan.md** for TDD workflow

## Troubleshooting

### Build fails
**Problem**: `npm run build` errors

**Solution**:
```bash
# Check TypeScript version
npx tsc --version  # Should be 5.3.3

# Check for syntax errors
npm run type-check

# Rebuild from scratch
npm run clean
npm run build
```

### @input not appearing in Inspector
**Problem**: No input fields in Lens Studio

**Solution**:
1. Check that `@input` comment is in `dist/lens-studio-entry.js` (before variable)
2. Reimport the script (delete and re-add)
3. Ensure comment has correct format: `// @input SceneObject sceneRoot`

### No console logs
**Problem**: Scene plays but no logs

**Solution**:
1. Check View → Logs panel is open
2. Verify script is attached to scene object
3. Add `print("Test")` at top of file to confirm script runs
4. Check for JavaScript errors in console

### System doesn't initialize
**Problem**: Logs show errors on play

**Solution**:
1. Check that sceneRoot input is wired
2. Add try-catch with logging:
   ```typescript
   sceneLoadEvent.bind(() => {
     try {
       print('[MedSnap] Scene loaded, initializing...');
       medSnapSystem = new MedSnapARSystem();
       medSnapSystem.initialize(script, sceneRoot);
       medSnapSystem.start();
     } catch (error) {
       print('[MedSnap] Initialization failed: ' + error.message);
     }
   });
   ```
3. Rebuild after changes: `npm run build`
4. Reimport script in Lens Studio

## Hot Reload Workflow

For rapid development:

```bash
# Terminal 1: Watch mode
cd /Users/jasonyi/snaplens-code/lens-studio
npm run dev  # Watches for changes and rebuilds
```

**In Lens Studio**:
1. Make change in .ts file
2. Wait for rebuild (terminal shows "Compilation complete")
3. Resources panel → right-click lens-studio-entry.js → Reload
4. Play scene to test

**Note**: You don't need to reimport, just reload the script.

## Development Loop

Once set up, your workflow is:

1. **Write test first** (TDD principle)
2. **Implement in TypeScript** (watch mode auto-rebuilds)
3. **Reload script in Lens Studio**
4. **Test in simulator**
5. **Iterate until test passes**
6. **Commit** with descriptive message

## Resources

- **Full spec**: `README.md` in this folder
- **Implementation guide**: `implementation-guide.md`
- **Test plan**: `test-plan.md`
- **Pattern reference**: `marvin-to-medsnap-mapping.md`
- **Marvin code**: `/Users/jasonyi/snaplens-code/marvin/ar-core/`

## Questions?

Refer to troubleshooting sections in:
- `implementation-guide.md` - Phase-specific issues
- `test-plan.md` - Testing issues
- `marvin-to-medsnap-mapping.md` - Pattern questions

---

**You're ready to build!** Follow the implementation guide to add components one by one, always starting with tests first (TDD).
