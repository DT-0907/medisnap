#!/usr/bin/env python3
"""
MediaPipe Hands Video Visualization Demo
Applies MedSnap CV pipeline to test video

Features:
- Detects hands using MediaPipe Hands model
- Identifies radial pulse point on wrist
- Shows finger placement guidance
- Displays pressure level indicators
- Demonstrates all CV logic from TypeScript implementation

Based on:
- cv-pipeline/src/mediapipeHands.ts
- cv-pipeline/src/wristDetection.ts
- cv-pipeline/src/pressureDetection.ts
"""

import cv2
import mediapipe as mp
import numpy as np
from pathlib import Path
import math

# MediaPipe setup
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# Constants from PRD FR-32
DETECTION_CONFIDENCE = 0.7
TRACKING_CONFIDENCE = 0.7
MAX_NUM_HANDS = 2  # UPDATED: Detect both nurse and patient hands

# Landmark indices (from SNAPML_INTEGRATION_GUIDE.md)
WRIST = 0
THUMB_CMC = 1
THUMB_TIP = 4
INDEX_FINGER_TIP = 8
INDEX_FINGER_DIP = 7
INDEX_FINGER_PIP = 6
MIDDLE_FINGER_TIP = 12
MIDDLE_FINGER_DIP = 11
MIDDLE_FINGER_PIP = 10
RING_FINGER_TIP = 16
RING_FINGER_PIP = 14
PINKY_TIP = 20
PINKY_PIP = 18
INDEX_FINGER_MCP = 5
MIDDLE_FINGER_MCP = 9

# Colors (from PRD AR-1)
CYAN = (255, 255, 0)      # Cyan for pulse point (BGR format)
YELLOW = (0, 255, 255)    # Yellow for arrows/corrections
GREEN = (0, 255, 0)       # Green for success
RED = (0, 0, 255)         # Red for warnings
WHITE = (255, 255, 255)
NAVY_BLUE = (128, 0, 0)   # Navy blue (BGR format)
OFF_WHITE = (245, 245, 250) # Off-white (BGR format)

# Pressure thresholds (from pressureDetection.ts)
OPTIMAL_PRESSURE_MIN = 0.30
OPTIMAL_PRESSURE_MAX = 0.65
EXCESSIVE_PRESSURE_THRESHOLD = 0.70
TOO_LIGHT_THRESHOLD = 0.25

# Pulse point constants (from wristDetection.ts)
PULSE_POINT_OFFSET = 0.02  # ~2cm in normalized coordinates
PLACEMENT_TOLERANCE = 0.015  # 1.5cm tolerance

def is_nurse_hand(landmarks):
    """
    Detect if a hand is the nurse's hand (index and middle fingers extended)
    Returns True if index and middle fingers are extended, others are curled
    """
    # Check if index finger is extended
    index_extended = landmarks[INDEX_FINGER_TIP].y < landmarks[INDEX_FINGER_PIP].y
    
    # Check if middle finger is extended
    middle_extended = landmarks[MIDDLE_FINGER_TIP].y < landmarks[MIDDLE_FINGER_PIP].y
    
    # Check if ring finger is curled (not extended)
    ring_curled = landmarks[RING_FINGER_TIP].y > landmarks[RING_FINGER_PIP].y
    
    # Check if pinky is curled (not extended)
    pinky_curled = landmarks[PINKY_TIP].y > landmarks[PINKY_PIP].y
    
    # Nurse hand: index and middle extended, ring and pinky curled
    return index_extended and middle_extended and ring_curled and pinky_curled

def find_radial_pulse_point(landmarks, img_width, img_height):
    """
    Port of wristDetection.ts:findRadialPulsePoint()
    Finds the radial pulse point (thumb-side of wrist)
    """
    wrist = landmarks[WRIST]
    thumb_cmc = landmarks[THUMB_CMC]
    
    # Calculate thumb-side direction
    dx = thumb_cmc.x - wrist.x
    dy = thumb_cmc.y - wrist.y
    
    # Normalize direction
    magnitude = math.sqrt(dx * dx + dy * dy)
    if magnitude == 0:
        return None
    
    dx /= magnitude
    dy /= magnitude
    
    # Offset ~2cm toward thumb
    pulse_x = wrist.x + dx * PULSE_POINT_OFFSET
    pulse_y = wrist.y + dy * PULSE_POINT_OFFSET
    
    # Convert to pixel coordinates
    return (
        int(pulse_x * img_width),
        int(pulse_y * img_height)
    )

def calculate_finger_curvature(landmarks):
    """
    Port of pressureDetection.ts:calculateFingerCurvature()
    Estimates pressure from finger bend
    """
    index_mcp = landmarks[INDEX_FINGER_MCP]
    index_tip = landmarks[INDEX_FINGER_TIP]
    middle_mcp = landmarks[MIDDLE_FINGER_MCP]
    middle_tip = landmarks[MIDDLE_FINGER_TIP]
    
    # Calculate distances
    index_dist = math.sqrt(
        (index_tip.x - index_mcp.x)**2 + 
        (index_tip.y - index_mcp.y)**2
    )
    middle_dist = math.sqrt(
        (middle_tip.x - middle_mcp.x)**2 + 
        (middle_tip.y - middle_mcp.y)**2
    )
    
    avg_distance = (index_dist + middle_dist) / 2
    
    # Invert: shorter distance = more curled = more pressure
    curvature = max(0, min(1, 1 - (avg_distance / 0.30)))
    return curvature

def calculate_depth_compression(landmarks):
    """
    Port of pressureDetection.ts:calculateDepthCompression()
    Estimates pressure from z-axis compression
    """
    depths = [lm.z for lm in landmarks]
    max_depth = max(depths)
    min_depth = min(depths)
    depth_range = max_depth - min_depth
    
    # Lower range = more compressed = more pressure
    compression = 1 - min(1, depth_range / 0.10)
    return compression

def detect_pressure(landmarks):
    """
    Port of pressureDetection.ts:detectPressure()
    Returns pressure level and feedback
    """
    finger_curvature = calculate_finger_curvature(landmarks)
    depth_compression = calculate_depth_compression(landmarks)
    
    # Weighted combination (simplified - no visibility score in video)
    pressure_score = (
        finger_curvature * 0.60 +
        depth_compression * 0.40
    )
    
    # Classify pressure level
    if pressure_score > EXCESSIVE_PRESSURE_THRESHOLD:
        level = 'TOO HEAVY'
        feedback = "You're pressing too hard. Lighten your touch."  # FR-9
        color = RED
    elif pressure_score >= OPTIMAL_PRESSURE_MIN and pressure_score <= OPTIMAL_PRESSURE_MAX:
        level = 'OPTIMAL'
        feedback = "Good pressure. Apply gentle, steady pressure."
        color = GREEN
    elif pressure_score < TOO_LIGHT_THRESHOLD:
        level = 'TOO LIGHT'
        feedback = "Apply slightly more pressure."
        color = YELLOW
    else:
        level = 'OPTIMAL'
        feedback = "Good pressure."
        color = GREEN
    
    return {
        'level': level,
        'score': pressure_score,
        'feedback': feedback,
        'color': color
    }

def draw_pulsing_circle(img, center, radius, color, frame_count, pulse_rate=30):
    """
    Draw a smoothly pulsing circle effect (1 pulse per second at 30fps)
    
    Args:
        img: Image to draw on
        center: (x, y) center position
        radius: Base radius
        color: Circle color
        frame_count: Current frame number
        pulse_rate: Frames per pulse cycle (30 = 1 second at 30fps)
    """
    # Calculate pulse phase (0 to 1)
    pulse_phase = (frame_count % pulse_rate) / pulse_rate
    
    # Smooth sine wave for pulsing (0.7 to 1.3 scale)
    scale = 0.85 + 0.3 * math.sin(pulse_phase * 2 * math.pi)
    
    # Varying alpha for glow intensity
    alpha_multiplier = 0.7 + 0.3 * math.sin(pulse_phase * 2 * math.pi)
    
    # Draw glow layers
    glow_intensity = 4
    for i in range(glow_intensity, 0, -1):
        alpha = (0.3 / i) * alpha_multiplier
        overlay = img.copy()
        glow_radius = int((radius + i*4) * scale)
        cv2.circle(overlay, center, glow_radius, color, thickness=-1)
        cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0, img)
    
    # Draw main circle with pulsing
    main_radius = int(radius * scale)
    cv2.circle(img, center, main_radius, color, thickness=3)
    
    return img

def draw_arrow(img, start, end, color, thickness=2):
    """
    Draw an arrow from start to end
    """
    cv2.arrowedLine(img, start, end, color, thickness, tipLength=0.3)

def draw_text_with_background(img, text, position, font_scale=0.6, thickness=2, 
                                bg_color=(0, 0, 0), text_color=(255, 255, 255), 
                                alpha=1.0, padding=8, rounded=False, font_style='duplex'):
    """
    Draw text with a background rectangle for better visibility
    
    Args:
        img: Image to draw on
        text: Text to display
        position: (x, y) position
        font_scale: Font size scale
        thickness: Font thickness
        bg_color: Background color (BGR)
        text_color: Text color (BGR)
        alpha: Background transparency (0.0-1.0, where 1.0 is opaque)
        padding: Padding around text
        rounded: Whether to use rounded corners
        font_style: Font style ('simplex', 'duplex', 'triplex', 'complex')
    """
    # Select font based on style
    font_map = {
        'simplex': cv2.FONT_HERSHEY_SIMPLEX,
        'duplex': cv2.FONT_HERSHEY_DUPLEX,      # Clean, modern
        'triplex': cv2.FONT_HERSHEY_TRIPLEX,    # Bold, elegant
        'complex': cv2.FONT_HERSHEY_COMPLEX,    # Decorative
        'plain': cv2.FONT_HERSHEY_PLAIN         # Very basic
    }
    font = font_map.get(font_style, cv2.FONT_HERSHEY_DUPLEX)
    (text_width, text_height), baseline = cv2.getTextSize(text, font, font_scale, thickness)
    
    x, y = position
    
    # Calculate rectangle coordinates
    x1 = x - padding
    y1 = y - text_height - padding
    x2 = x + text_width + padding
    y2 = y + baseline + padding
    
    # Draw background with transparency
    if alpha < 1.0:
        overlay = img.copy()
        if rounded:
            # Draw rounded rectangle (approximate with multiple shapes)
            radius = min(10, padding)
            cv2.rectangle(overlay, (x1 + radius, y1), (x2 - radius, y2), bg_color, -1)
            cv2.rectangle(overlay, (x1, y1 + radius), (x2, y2 - radius), bg_color, -1)
            cv2.circle(overlay, (x1 + radius, y1 + radius), radius, bg_color, -1)
            cv2.circle(overlay, (x2 - radius, y1 + radius), radius, bg_color, -1)
            cv2.circle(overlay, (x1 + radius, y2 - radius), radius, bg_color, -1)
            cv2.circle(overlay, (x2 - radius, y2 - radius), radius, bg_color, -1)
        else:
            cv2.rectangle(overlay, (x1, y1), (x2, y2), bg_color, -1)
        
        cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0, img)
    else:
        if rounded:
            radius = min(10, padding)
            cv2.rectangle(img, (x1 + radius, y1), (x2 - radius, y2), bg_color, -1)
            cv2.rectangle(img, (x1, y1 + radius), (x2, y2 - radius), bg_color, -1)
            cv2.circle(img, (x1 + radius, y1 + radius), radius, bg_color, -1)
            cv2.circle(img, (x2 - radius, y1 + radius), radius, bg_color, -1)
            cv2.circle(img, (x1 + radius, y2 - radius), radius, bg_color, -1)
            cv2.circle(img, (x2 - radius, y2 - radius), radius, bg_color, -1)
        else:
            cv2.rectangle(img, (x1, y1), (x2, y2), bg_color, -1)
    
    # Draw text
    cv2.putText(img, text, (x, y), font, font_scale, text_color, thickness, cv2.LINE_AA)

def process_video(input_path, output_path):
    """
    Process video with CV pipeline visualization
    """
    # Open video
    cap = cv2.VideoCapture(str(input_path))
    
    if not cap.isOpened():
        print(f"Error: Could not open video {input_path}")
        return
    
    # Get video properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    print(f"Video: {width}x{height} @ {fps}fps, {total_frames} frames")
    
    # Create video writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(str(output_path), fourcc, fps, (width, height))
    
    # Initialize MediaPipe Hands
    with mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=MAX_NUM_HANDS,  # FR-33
        min_detection_confidence=DETECTION_CONFIDENCE,  # FR-32
        min_tracking_confidence=TRACKING_CONFIDENCE
    ) as hands:
        
        frame_count = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            
            # Convert BGR to RGB for MediaPipe
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process frame
            results = hands.process(rgb_frame)
            
            # Draw visualizations
            if results.multi_hand_landmarks:
                # Classify hands: nurse (2 fingers extended) vs patient
                nurse_hand = None
                patient_hand = None
                
                for hand_landmarks in results.multi_hand_landmarks:
                    if is_nurse_hand(hand_landmarks.landmark):
                        nurse_hand = hand_landmarks
                    else:
                        patient_hand = hand_landmarks
                
                # If we can't identify nurse hand, use first hand as patient
                if nurse_hand is None and len(results.multi_hand_landmarks) > 0:
                    patient_hand = results.multi_hand_landmarks[0]
                
                # Draw only nurse hand skeleton (not patient)
                if nurse_hand:
                    # Nurse hand: bright green, highly visible
                    mp_drawing.draw_landmarks(
                        frame,
                        nurse_hand,
                        mp_hands.HAND_CONNECTIONS,
                        landmark_drawing_spec=mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=3),
                        connection_drawing_spec=mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2)
                    )
                
                # Process patient hand for pulse point
                if patient_hand:
                    pulse_point = find_radial_pulse_point(
                        patient_hand.landmark, 
                        width, 
                        height
                    )
                    
                    if pulse_point:
                        # Draw smoothly pulsing circle on pulse point (FR-6)
                        draw_pulsing_circle(frame, pulse_point, 15, CYAN, frame_count, pulse_rate=30)
                        
                        # Draw arrow pointing to pulse point
                        arrow_start = (pulse_point[0] + 100, pulse_point[1] - 100)
                        arrow_end = (pulse_point[0] + 25, pulse_point[1] - 25)
                        draw_arrow(frame, arrow_start, arrow_end, CYAN, thickness=3)
                        
                        # Add instruction text with elegant styling (FR-7)
                        label_pos = (arrow_start[0] - 80, arrow_start[1] - 15)
                        draw_text_with_background(
                            frame,
                            "Place index and pointer",
                            label_pos,
                            font_scale=0.8,
                            thickness=2,
                            bg_color=OFF_WHITE,
                            text_color=CYAN,
                            alpha=0.65,
                            padding=12,
                            rounded=True,
                            font_style='duplex'
                        )
                        draw_text_with_background(
                            frame,
                            "fingertips here",
                            (label_pos[0] + 40, label_pos[1] + 35),
                            font_scale=0.8,
                            thickness=2,
                            bg_color=OFF_WHITE,
                            text_color=CYAN,
                            alpha=0.65,
                            padding=12,
                            rounded=True,
                            font_style='duplex'
                        )
                
                # Process nurse hand for pressure tracking
                if nurse_hand:
                    # Detect pressure from nurse's hand
                    pressure = detect_pressure(nurse_hand.landmark)
                    
                    # Get nurse hand position (wrist center)
                    nurse_wrist = nurse_hand.landmark[WRIST]
                    nurse_x = int(nurse_wrist.x * width)
                    nurse_y = int(nurse_wrist.y * height)
                    
                    # Position pressure bar near nurse's hand
                    # Offset to the right and slightly up from wrist
                    bar_offset_x = 100
                    bar_offset_y = -80
                    bar_x = max(10, min(width - 220, nurse_x + bar_offset_x))
                    bar_y = max(30, min(height - 100, nurse_y + bar_offset_y))
                    bar_width = 200
                    bar_height = 30
                    
                    # Background bar
                    cv2.rectangle(frame, (bar_x, bar_y), 
                                (bar_x + bar_width, bar_y + bar_height), 
                                (50, 50, 50), -1)
                    
                    # Pressure fill
                    fill_width = int(bar_width * pressure['score'])
                    cv2.rectangle(frame, (bar_x, bar_y), 
                                (bar_x + fill_width, bar_y + bar_height), 
                                pressure['color'], -1)
                    
                    # Optimal range indicator (vertical lines)
                    opt_min_x = bar_x + int(bar_width * OPTIMAL_PRESSURE_MIN)
                    opt_max_x = bar_x + int(bar_width * OPTIMAL_PRESSURE_MAX)
                    cv2.line(frame, (opt_min_x, bar_y), (opt_min_x, bar_y + bar_height), 
                           GREEN, 2)
                    cv2.line(frame, (opt_max_x, bar_y), (opt_max_x, bar_y + bar_height), 
                           GREEN, 2)
                    
                    # Pressure label with elegant styling
                    draw_text_with_background(
                        frame,
                        f"Pressure: {pressure['level']}",
                        (bar_x, bar_y - 15),
                        font_scale=0.65,
                        thickness=2,
                        bg_color=(40, 40, 40),
                        text_color=WHITE,
                        alpha=0.85,
                        padding=8,
                        rounded=True,
                        font_style='duplex'
                    )
                    
                    # Feedback message (FR-9) with elegant styling
                    draw_text_with_background(
                        frame,
                        pressure['feedback'],
                        (bar_x - 30, bar_y + bar_height + 35),
                        font_scale=0.65,
                        thickness=2,
                        bg_color=OFF_WHITE,
                        text_color=pressure['color'],
                        alpha=0.88,
                        padding=10,
                        rounded=True,
                        font_style='duplex'
                    )
                    
                    # Label nurse hand with elegant styling
                    draw_text_with_background(
                        frame,
                        "NURSE",
                        (nurse_x - 30, nurse_y - 40),
                        font_scale=0.7,
                        thickness=2,
                        bg_color=(0, 180, 0),
                        text_color=WHITE,
                        alpha=0.9,
                        padding=10,
                        rounded=True,
                        font_style='duplex'
                    )
                
                # Label patient hand with elegant styling
                if patient_hand and patient_hand != nurse_hand:
                    patient_wrist = patient_hand.landmark[WRIST]
                    patient_x = int(patient_wrist.x * width)
                    patient_y = int(patient_wrist.y * height)
                    draw_text_with_background(
                        frame,
                        "PATIENT",
                        (patient_x - 45, patient_y - 40),
                        font_scale=0.7,
                        thickness=2,
                        bg_color=(40, 40, 40),
                        text_color=CYAN,
                        alpha=0.9,
                        padding=10,
                        rounded=True,
                        font_style='duplex'
                    )
            else:
                # No hands detected
                draw_text_with_background(
                    frame,
                    "No hand detected - Position wrist in view",
                    (width // 2 - 200, 50),
                    font_scale=0.7,
                    thickness=2,
                    bg_color=(0, 0, 50),
                    text_color=RED,
                    font_style='duplex'
                )
            
            # Add MedSnap branding with elegant styling
            draw_text_with_background(
                frame,
                "MedSnap CV Pipeline - MediaPipe Hands v0.9+",
                (15, 35),
                font_scale=0.65,
                thickness=2,
                bg_color=(30, 30, 30),
                text_color=CYAN,
                alpha=0.85,
                padding=10,
                rounded=True,
                font_style='duplex'
            )
            
            # Frame counter with subtle styling
            draw_text_with_background(
                frame,
                f"Frame: {frame_count}/{total_frames}",
                (15, height - 25),
                font_scale=0.5,
                thickness=1,
                bg_color=(30, 30, 30),
                text_color=WHITE,
                alpha=0.7,
                padding=8,
                rounded=True,
                font_style='duplex'
            )
            
            # Write frame
            out.write(frame)
            
            # Progress
            if frame_count % 30 == 0:
                progress = (frame_count / total_frames) * 100
                print(f"Processing: {progress:.1f}% ({frame_count}/{total_frames} frames)")
    
    # Cleanup
    cap.release()
    out.release()
    print(f"\n✅ Video processing complete!")
    print(f"Output saved to: {output_path}")

def main():
    """
    Main entry point
    """
    print("=" * 80)
    print("MedSnap CV Pipeline - Multi-Hand Video Visualization Demo")
    print("=" * 80)
    print()
    print("Features demonstrated:")
    print("  ✓ MULTI-HAND DETECTION: Nurse + Patient hands (FR-32)")
    print("  ✓ NURSE HAND CLASSIFICATION: 2-finger extended detection")
    print("  ✓ Radial pulse point on PATIENT'S wrist (FR-34)")
    print("  ✓ Finger placement guidance (FR-7, FR-9)")
    print("  ✓ DYNAMIC pressure tracking (follows nurse hand) (FR-34)")
    print("  ✓ AR overlay visualization (FR-6)")
    print()
    
    # File paths
    input_video = Path("../CVTestVid.MP4")
    output_video = Path("../CVTestVid_Processed.mp4")
    
    if not input_video.exists():
        print(f"❌ Error: Input video not found: {input_video}")
        print("Please ensure CVTestVid.MP4 is in the medisnap root directory")
        return
    
    print(f"Input:  {input_video}")
    print(f"Output: {output_video}")
    print()
    print("Processing video...")
    print("-" * 80)
    
    # Process video
    process_video(input_video, output_video)
    
    print("-" * 80)
    print()
    print("🎉 Demo complete!")
    print()
    print("The processed video shows:")
    print("  • MULTI-HAND DETECTION: Nurse hand (green) + Patient hand (white)")
    print("  • NURSE IDENTIFICATION: Detects 2-finger extended hand position")
    print("  • Glowing cyan circle on PATIENT'S radial pulse point")
    print("  • Yellow arrow with placement instructions")
    print("  • DYNAMIC pressure tracker that FOLLOWS the nurse's hand")
    print("  • Real-time pressure detection bar (green = optimal)")
    print("  • Pressure feedback messages (FR-9)")
    print("  • Hand skeleton overlays from MediaPipe")
    print()
    print(f"Open the video: {output_video.absolute()}")
    print()

if __name__ == "__main__":
    main()

