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
MAX_NUM_HANDS = 1  # FR-33: Single-person detection

# Landmark indices (from SNAPML_INTEGRATION_GUIDE.md)
WRIST = 0
THUMB_CMC = 1
INDEX_FINGER_TIP = 8
MIDDLE_FINGER_TIP = 12
INDEX_FINGER_MCP = 5
MIDDLE_FINGER_MCP = 9

# Colors (from PRD AR-1)
CYAN = (255, 255, 0)      # Cyan for pulse point (BGR format)
YELLOW = (0, 255, 255)    # Yellow for arrows/corrections
GREEN = (0, 255, 0)       # Green for success
RED = (0, 0, 255)         # Red for warnings
WHITE = (255, 255, 255)

# Pressure thresholds (from pressureDetection.ts)
OPTIMAL_PRESSURE_MIN = 0.30
OPTIMAL_PRESSURE_MAX = 0.65
EXCESSIVE_PRESSURE_THRESHOLD = 0.70
TOO_LIGHT_THRESHOLD = 0.25

# Pulse point constants (from wristDetection.ts)
PULSE_POINT_OFFSET = 0.02  # ~2cm in normalized coordinates
PLACEMENT_TOLERANCE = 0.015  # 1.5cm tolerance

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

def draw_glowing_circle(img, center, radius, color, glow_intensity=3):
    """
    Draw a glowing circle effect (AR overlay simulation)
    """
    # Draw multiple circles with decreasing intensity for glow effect
    for i in range(glow_intensity, 0, -1):
        alpha = 0.3 / i
        overlay = img.copy()
        cv2.circle(overlay, center, radius + i*3, color, thickness=-1)
        cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0, img)
    
    # Draw main circle
    cv2.circle(img, center, radius, color, thickness=3)
    
    return img

def draw_arrow(img, start, end, color, thickness=2):
    """
    Draw an arrow from start to end
    """
    cv2.arrowedLine(img, start, end, color, thickness, tipLength=0.3)

def draw_text_with_background(img, text, position, font_scale=0.6, thickness=2, 
                                bg_color=(0, 0, 0), text_color=(255, 255, 255)):
    """
    Draw text with a background rectangle for better visibility
    """
    font = cv2.FONT_HERSHEY_SIMPLEX
    (text_width, text_height), baseline = cv2.getTextSize(text, font, font_scale, thickness)
    
    x, y = position
    # Draw background rectangle
    padding = 5
    cv2.rectangle(img, 
                  (x - padding, y - text_height - padding),
                  (x + text_width + padding, y + baseline + padding),
                  bg_color, -1)
    
    # Draw text
    cv2.putText(img, text, (x, y), font, font_scale, text_color, thickness)

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
                for hand_landmarks in results.multi_hand_landmarks:
                    # Draw hand skeleton (subtle)
                    mp_drawing.draw_landmarks(
                        frame,
                        hand_landmarks,
                        mp_hands.HAND_CONNECTIONS,
                        mp_drawing_styles.get_default_hand_landmarks_style(),
                        mp_drawing_styles.get_default_hand_connections_style()
                    )
                    
                    # Find radial pulse point
                    pulse_point = find_radial_pulse_point(
                        hand_landmarks.landmark, 
                        width, 
                        height
                    )
                    
                    if pulse_point:
                        # Draw glowing circle on pulse point (FR-6)
                        draw_glowing_circle(frame, pulse_point, 15, CYAN, glow_intensity=4)
                        
                        # Draw arrow and label
                        arrow_start = (pulse_point[0] + 80, pulse_point[1] - 80)
                        arrow_end = (pulse_point[0] + 20, pulse_point[1] - 20)
                        draw_arrow(frame, arrow_start, arrow_end, YELLOW, thickness=3)
                        
                        # Add instruction text (FR-7)
                        label_pos = (arrow_start[0] - 50, arrow_start[1] - 10)
                        draw_text_with_background(
                            frame,
                            "Place index and",
                            label_pos,
                            font_scale=0.7,
                            thickness=2,
                            bg_color=(0, 0, 0),
                            text_color=YELLOW
                        )
                        draw_text_with_background(
                            frame,
                            "pointer fingertips here",
                            (label_pos[0], label_pos[1] + 30),
                            font_scale=0.7,
                            thickness=2,
                            bg_color=(0, 0, 0),
                            text_color=YELLOW
                        )
                        
                        # Detect pressure
                        pressure = detect_pressure(hand_landmarks.landmark)
                        
                        # Draw pressure bar (top-right corner)
                        bar_x = width - 250
                        bar_y = 30
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
                        
                        # Pressure label
                        draw_text_with_background(
                            frame,
                            f"Pressure: {pressure['level']} ({pressure['score']:.2f})",
                            (bar_x, bar_y - 10),
                            font_scale=0.6,
                            thickness=2,
                            bg_color=(0, 0, 0),
                            text_color=WHITE
                        )
                        
                        # Feedback message (FR-9)
                        draw_text_with_background(
                            frame,
                            pressure['feedback'],
                            (bar_x - 150, bar_y + bar_height + 30),
                            font_scale=0.6,
                            thickness=2,
                            bg_color=(0, 0, 0),
                            text_color=pressure['color']
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
                    text_color=RED
                )
            
            # Add MedSnap branding and info
            draw_text_with_background(
                frame,
                "MedSnap CV Pipeline - MediaPipe Hands v0.9+",
                (10, 30),
                font_scale=0.6,
                thickness=2,
                bg_color=(20, 20, 20),
                text_color=CYAN
            )
            
            # Frame counter
            draw_text_with_background(
                frame,
                f"Frame: {frame_count}/{total_frames}",
                (10, height - 20),
                font_scale=0.5,
                thickness=1,
                bg_color=(20, 20, 20),
                text_color=WHITE
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
    print("MedSnap CV Pipeline - Video Visualization Demo")
    print("=" * 80)
    print()
    print("Features demonstrated:")
    print("  ✓ MediaPipe Hands detection (FR-32)")
    print("  ✓ Radial pulse point identification (FR-34)")
    print("  ✓ Finger placement guidance (FR-7, FR-9)")
    print("  ✓ Pressure level detection (FR-34)")
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
    print("  • Glowing cyan circle on radial pulse point")
    print("  • Yellow arrow with placement instructions")
    print("  • Real-time pressure detection bar (green = optimal)")
    print("  • Pressure feedback messages (FR-9)")
    print("  • Hand skeleton overlay from MediaPipe")
    print()
    print(f"Open the video: {output_video.absolute()}")
    print()

if __name__ == "__main__":
    main()

