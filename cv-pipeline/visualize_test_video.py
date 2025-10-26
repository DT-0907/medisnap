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
PULSE_POINT_OFFSET = 0.04  # ~4cm in normalized coordinates (below wrist on thumb side)
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
    Finds the radial pulse point (thumb-side of wrist, slightly below wrist crease)
    """
    wrist = landmarks[WRIST]
    thumb_cmc = landmarks[THUMB_CMC]
    index_mcp = landmarks[INDEX_FINGER_MCP]
    
    # Calculate thumb-side direction
    dx = thumb_cmc.x - wrist.x
    dy = thumb_cmc.y - wrist.y
    
    # Normalize direction
    magnitude = math.sqrt(dx * dx + dy * dy)
    if magnitude == 0:
        return None
    
    dx /= magnitude
    dy /= magnitude
    
    # Calculate downward direction (toward palm/away from arm)
    # Use index MCP as reference for palm direction
    palm_dx = index_mcp.x - wrist.x
    palm_dy = index_mcp.y - wrist.y
    palm_magnitude = math.sqrt(palm_dx * palm_dx + palm_dy * palm_dy)
    
    if palm_magnitude > 0:
        palm_dx /= palm_magnitude
        palm_dy /= palm_magnitude
    
    # Combine thumb-side direction with slight palm-ward offset
    # 70% toward thumb, 30% toward palm (anatomically accurate)
    combined_dx = dx * 0.7 + palm_dx * 0.3
    combined_dy = dy * 0.7 + palm_dy * 0.3
    
    # Normalize combined direction
    combined_magnitude = math.sqrt(combined_dx * combined_dx + combined_dy * combined_dy)
    if combined_magnitude > 0:
        combined_dx /= combined_magnitude
        combined_dy /= combined_magnitude
    
    # Offset ~4cm toward thumb and slightly down from wrist
    pulse_x = wrist.x + combined_dx * PULSE_POINT_OFFSET
    pulse_y = wrist.y + combined_dy * PULSE_POINT_OFFSET
    
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

def check_overlap(box1, box2, margin=20):
    """
    Check if two bounding boxes overlap (with margin)
    box = (x1, y1, x2, y2)
    """
    x1_min, y1_min, x1_max, y1_max = box1
    x2_min, y2_min, x2_max, y2_max = box2
    
    # Add margin for safety buffer
    x1_min -= margin
    y1_min -= margin
    x1_max += margin
    y1_max += margin
    
    # Check for overlap
    return not (x1_max < x2_min or x2_max < x1_min or y1_max < y2_min or y2_max < y1_min)

def get_text_bbox(text, position, font_scale=0.6, thickness=2, padding=8, font_style='duplex'):
    """
    Get bounding box for text with background
    Returns (x1, y1, x2, y2)
    """
    font_map = {
        'simplex': cv2.FONT_HERSHEY_SIMPLEX,
        'duplex': cv2.FONT_HERSHEY_DUPLEX,
        'triplex': cv2.FONT_HERSHEY_TRIPLEX,
        'complex': cv2.FONT_HERSHEY_COMPLEX,
        'plain': cv2.FONT_HERSHEY_PLAIN
    }
    font = font_map.get(font_style, cv2.FONT_HERSHEY_DUPLEX)
    (text_width, text_height), baseline = cv2.getTextSize(text, font, font_scale, thickness)
    
    x, y = position
    x1 = x - padding
    y1 = y - text_height - padding
    x2 = x + text_width + padding
    y2 = y + baseline + padding
    
    return (x1, y1, x2, y2)

def adjust_position_to_avoid_overlap(position, occupied_boxes, width, height, min_offset=50):
    """
    Adjust position to avoid overlapping with occupied boxes
    Returns adjusted (x, y) position
    """
    x, y = position
    
    # Try different offsets to find non-overlapping position
    offsets = [
        (0, 0),           # Original position
        (0, -min_offset), # Up
        (0, min_offset),  # Down
        (min_offset, 0),  # Right
        (-min_offset, 0), # Left
        (min_offset, -min_offset),  # Upper right
        (-min_offset, -min_offset), # Upper left
        (min_offset, min_offset),   # Lower right
        (-min_offset, min_offset),  # Lower left
    ]
    
    for dx, dy in offsets:
        new_x = max(10, min(width - 200, x + dx))
        new_y = max(30, min(height - 50, y + dy))
        
        # Check if this position overlaps with any occupied box
        test_box = (new_x - 100, new_y - 50, new_x + 100, new_y + 50)
        
        overlaps = False
        for occupied_box in occupied_boxes:
            if check_overlap(test_box, occupied_box):
                overlaps = True
                break
        
        if not overlaps:
            return (new_x, new_y)
    
    # If no non-overlapping position found, return original with offset
    return (x, y + min_offset * 2)

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
    
    # Pressure smoothing buffer
    pressure_history = []
    pressure_smoothing_window = 5  # Smooth over 5 frames (more sensitive)
    
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
                # Track occupied boxes to prevent overlap
                occupied_boxes = []
                
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
                
                # Draw only nurse hand's two extended fingers (index and middle)
                if nurse_hand:
                    landmarks = nurse_hand.landmark
                    
                    # Define finger connections (from wrist/MCP to tip)
                    index_finger_connections = [
                        (WRIST, INDEX_FINGER_MCP),
                        (INDEX_FINGER_MCP, INDEX_FINGER_PIP),
                        (INDEX_FINGER_PIP, INDEX_FINGER_DIP),
                        (INDEX_FINGER_DIP, INDEX_FINGER_TIP)
                    ]
                    
                    middle_finger_connections = [
                        (WRIST, MIDDLE_FINGER_MCP),
                        (MIDDLE_FINGER_MCP, MIDDLE_FINGER_PIP),
                        (MIDDLE_FINGER_PIP, MIDDLE_FINGER_DIP),
                        (MIDDLE_FINGER_DIP, MIDDLE_FINGER_TIP)
                    ]
                    
                    # Draw index and middle finger lines
                    for connection in index_finger_connections + middle_finger_connections:
                        start_idx, end_idx = connection
                        start = landmarks[start_idx]
                        end = landmarks[end_idx]
                        
                        start_point = (int(start.x * width), int(start.y * height))
                        end_point = (int(end.x * width), int(end.y * height))
                        
                        # Draw green line
                        cv2.line(frame, start_point, end_point, (0, 255, 0), 2)
                    
                    # Draw circles at finger joints
                    finger_landmarks = [
                        WRIST, INDEX_FINGER_MCP, INDEX_FINGER_PIP, INDEX_FINGER_DIP, INDEX_FINGER_TIP,
                        MIDDLE_FINGER_MCP, MIDDLE_FINGER_PIP, MIDDLE_FINGER_DIP, MIDDLE_FINGER_TIP
                    ]
                    
                    for idx in finger_landmarks:
                        landmark = landmarks[idx]
                        point = (int(landmark.x * width), int(landmark.y * height))
                        cv2.circle(frame, point, 3, (0, 255, 0), -1)
                
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
                        
                        # Smart positioning for instruction box - adapt based on nurse hand proximity
                        # Default: upper right of pulse point
                        instruction_offset_x = 100
                        instruction_offset_y = -100
                        
                        # If nurse hand is close, move instruction box to avoid overlap
                        if nurse_hand:
                            nurse_wrist = nurse_hand.landmark[WRIST]
                            nurse_x = int(nurse_wrist.x * width)
                            nurse_y = int(nurse_wrist.y * height)
                            
                            # Calculate distance between nurse hand and pulse point
                            distance = math.sqrt((nurse_x - pulse_point[0])**2 + (nurse_y - pulse_point[1])**2)
                            
                            # If too close (< 200px), reposition instruction box
                            if distance < 200:
                                # Move instruction to opposite side
                                if nurse_x > pulse_point[0]:
                                    instruction_offset_x = -250  # Move left
                                else:
                                    instruction_offset_x = 100   # Keep right
                                
                                if nurse_y > pulse_point[1]:
                                    instruction_offset_y = -150  # Move up more
                                else:
                                    instruction_offset_y = 50    # Move down
                        
                        # Draw smaller arrow pointing to pulse point with space from circle
                        arrow_start = (pulse_point[0] + instruction_offset_x, pulse_point[1] + instruction_offset_y)
                        
                        # Calculate direction vector from arrow start to pulse point
                        dx = pulse_point[0] - arrow_start[0]
                        dy = pulse_point[1] - arrow_start[1]
                        magnitude = math.sqrt(dx*dx + dy*dy)
                        
                        # Stop arrow 35px away from pulse point (to leave space for pulsing circle)
                        if magnitude > 35:
                            scale = (magnitude - 35) / magnitude
                            arrow_end = (
                                int(arrow_start[0] + dx * scale),
                                int(arrow_start[1] + dy * scale)
                            )
                        else:
                            arrow_end = (pulse_point[0] + 25, pulse_point[1] - 25)
                        
                        draw_arrow(frame, arrow_start, arrow_end, CYAN, thickness=2)
                        
                        # Add instruction text with elegant styling (FR-7)
                        label_pos = (arrow_start[0] - 80, arrow_start[1] - 15)
                        
                        # Calculate bounding boxes and add to occupied
                        bbox1 = get_text_bbox("Place index and pointer", label_pos, 0.8, 2, 12, 'duplex')
                        bbox2 = get_text_bbox("fingertips here", (label_pos[0] + 40, label_pos[1] + 35), 0.8, 2, 12, 'duplex')
                        occupied_boxes.append(bbox1)
                        occupied_boxes.append(bbox2)
                        
                        draw_text_with_background(
                            frame,
                            "Place index and pointer",
                            label_pos,
                            font_scale=0.8,
                            thickness=2,
                            bg_color=(40, 40, 40),
                            text_color=CYAN,
                            alpha=0.85,
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
                            bg_color=(40, 40, 40),
                            text_color=CYAN,
                            alpha=0.85,
                            padding=12,
                            rounded=True,
                            font_style='duplex'
                        )
                
                # Process nurse hand for pressure tracking
                if nurse_hand:
                    # Detect pressure from nurse's hand
                    pressure = detect_pressure(nurse_hand.landmark)
                    
                    # Smooth pressure for better visualization
                    pressure_history.append(pressure['score'])
                    if len(pressure_history) > pressure_smoothing_window:
                        pressure_history.pop(0)
                    
                    # Use moving average for smoother bar movement
                    smoothed_score = sum(pressure_history) / len(pressure_history)
                    pressure['score'] = smoothed_score
                    
                    # Re-classify pressure level based on smoothed score
                    if smoothed_score > EXCESSIVE_PRESSURE_THRESHOLD:
                        pressure['level'] = 'TOO HEAVY'
                        pressure['feedback'] = "You're pressing too hard. Lighten your touch."
                        pressure['color'] = RED
                    elif smoothed_score >= OPTIMAL_PRESSURE_MIN and smoothed_score <= OPTIMAL_PRESSURE_MAX:
                        pressure['level'] = 'OPTIMAL'
                        pressure['feedback'] = "Good pressure. Apply gentle, steady pressure."
                        pressure['color'] = GREEN
                    elif smoothed_score < TOO_LIGHT_THRESHOLD:
                        pressure['level'] = 'TOO LIGHT'
                        pressure['feedback'] = "Apply slightly more pressure."
                        pressure['color'] = YELLOW
                    else:
                        pressure['level'] = 'OPTIMAL'
                        pressure['feedback'] = "Good pressure."
                        pressure['color'] = GREEN
                    
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
                        bg_color=(40, 40, 40),
                        text_color=pressure['color'],
                        alpha=0.88,
                        padding=10,
                        rounded=True,
                        font_style='duplex'
                    )
                    
                    # Label nurse hand with smart positioning
                    nurse_label_pos = adjust_position_to_avoid_overlap(
                        (nurse_x - 30, nurse_y - 40),
                        occupied_boxes,
                        width,
                        height,
                        min_offset=40
                    )
                    nurse_bbox = get_text_bbox("NURSE", nurse_label_pos, 0.7, 2, 10, 'duplex')
                    occupied_boxes.append(nurse_bbox)
                    
                    draw_text_with_background(
                        frame,
                        "NURSE",
                        nurse_label_pos,
                        font_scale=0.7,
                        thickness=2,
                        bg_color=(0, 180, 0),
                        text_color=WHITE,
                        alpha=0.9,
                        padding=10,
                        rounded=True,
                        font_style='duplex'
                    )
                
                # Label patient hand with smart positioning
                if patient_hand and patient_hand != nurse_hand:
                    patient_wrist = patient_hand.landmark[WRIST]
                    patient_x = int(patient_wrist.x * width)
                    patient_y = int(patient_wrist.y * height)
                    
                    patient_label_pos = adjust_position_to_avoid_overlap(
                        (patient_x - 45, patient_y - 40),
                        occupied_boxes,
                        width,
                        height,
                        min_offset=40
                    )
                    patient_bbox = get_text_bbox("PATIENT", patient_label_pos, 0.7, 2, 10, 'duplex')
                    occupied_boxes.append(patient_bbox)
                    
                    draw_text_with_background(
                        frame,
                        "PATIENT",
                        patient_label_pos,
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
    input_video = Path("../CVTestJason.MP4")
    output_video = Path("../CVTestJason_Processed.mp4")

    
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

