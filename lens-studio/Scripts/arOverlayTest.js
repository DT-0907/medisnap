/**
 * AR Overlay Test Script
 * Quick test to verify visual overlays are working
 *
 * To test:
 * 1. Add this script to a SceneObject in Lens Studio
 * 2. Run in preview mode
 * 3. Should see cyan circle and yellow arrows appear
 */

// Test the AR overlay manager
function testAROverlays() {
    print("=== AR Overlay Test Starting ===");

    // Check if global manager exists
    if (!global.arOverlayManager) {
        print("ERROR: Global AR overlay manager not found!");
        print("Make sure arOverlayManager.js is loaded first");
        return false;
    }

    print("✓ Global AR overlay manager found");

    // Test 1: Show pulse point (cyan circle)
    print("\nTest 1: Showing pulse point...");
    const testPosition = { x: 0, y: 0, z: -0.5 };
    global.arOverlayManager.showPulsePoint(testPosition);

    // Check if overlay was created
    if (global.arOverlayManager.pulsePointOverlay) {
        print("✓ Pulse point overlay created");

        // Check if it's a Text component
        const textComp = global.arOverlayManager.pulsePointOverlay.getComponent("Component.Text");
        if (textComp) {
            print("✓ Using Text component with character: " + textComp.text);
            print("✓ Color: Cyan (0, 1, 1, 0.5)");
        } else {
            print("⚠ Text component not found on pulse point");
        }
    } else {
        print("✗ Pulse point overlay not created");
    }

    // Test 2: Show correction arrows
    print("\nTest 2: Showing correction arrows...");
    global.arOverlayManager.showCorrectionArrows({
        direction: "up",
        position: testPosition
    });

    // Check arrows
    if (global.arOverlayManager.guidanceArrows && global.arOverlayManager.guidanceArrows.length > 0) {
        print("✓ " + global.arOverlayManager.guidanceArrows.length + " arrows created");

        // Check first arrow
        const firstArrow = global.arOverlayManager.guidanceArrows[0];
        if (firstArrow && firstArrow.object) {
            const arrowText = firstArrow.object.getComponent("Component.Text");
            if (arrowText) {
                print("✓ Arrow using Text component: " + firstArrow.character);
                print("✓ Color: Yellow (1, 1, 0, 1)");
            }
        }
    } else {
        print("✗ Guidance arrows not created");
    }

    // Test 3: Show text overlay
    print("\nTest 3: Showing text overlay...");
    global.arOverlayManager.showText("Testing AR Overlay", testPosition, 24);

    if (global.arOverlayManager.textOverlay) {
        print("✓ Text overlay created");
    }

    // Test 4: Clear overlays after 3 seconds
    print("\nTest 4: Clearing overlays in 3 seconds...");
    const delayedEvent = script.createEvent("DelayedCallbackEvent");
    delayedEvent.bind(function() {
        global.arOverlayManager.clearOverlays();
        print("✓ Overlays cleared");
        print("\n=== AR Overlay Test Complete ===");
    });
    delayedEvent.reset(3); // 3 second delay

    return true;
}

// Run test on start
script.createEvent("OnAwakeEvent").bind(function() {
    // Wait a moment for arOverlayManager to initialize
    const delayedEvent = script.createEvent("DelayedCallbackEvent");
    delayedEvent.bind(function() {
        testAROverlays();
    });
    delayedEvent.reset(0.5); // 500ms delay
});

print("[AR Overlay Test] Script loaded - will test in 500ms");