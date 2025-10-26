# Lens Studio API - Full Comprehensive Reference
**Complete API Documentation for Reference**

## Version & Compatibility
- API Version: 5.13.0
- Snapchat Compatibility: 13.55+

---

## Core Architecture

The Lens Scripting API provides a comprehensive framework for building augmented reality experiences. The API is organized into modular subsystems covering rendering, physics, audio, input handling, and data management.

---

## Audio & Voice Processing

### AudioComponent
Manages audio playback with complete control.

**Methods**:
- `play()` - Start playback
- `pause()` - Pause playback
- `resume()` - Resume from pause
- `stop()` - Stop completely

**Properties**:
- Fade in/out timing
- Spatial audio support
- Volume control
- Loop settings

### AsrModule (Automatic Speech Recognition)
Enables voice transcription with multiple accuracy modes.

**Methods**:
- `startTranscribing()` - Begin listening
- `stopTranscribing()` - Stop listening

**Modes**:
- `HighAccuracy` - Best accuracy, slower
- `Balanced` - Default balanced mode
- `HighSpeed` - Fastest processing

**Events**:
- `onTranscriptionUpdate` - Fired when new transcription available
- Error handling callbacks

### AudioTrackAsset
Audio resource management.

**Properties**:
- Configurable sample rates
- Frame size control
- Multi-channel support

### AudioTrackProvider
Audio data provider interface.

---

## Text & UI Components

### Text Component
Rich text rendering in AR space.

**Properties**:
- `text` - String content
- `size` - Font size
- `textFill` - Color and gradient fills
- `horizontalAlignment` - Left, Center, Right
- `verticalAlignment` - Top, Center, Bottom
- `font` - Font asset selection
- `letterSpacing` - Character spacing
- `lineSpacing` - Line height
- `capitalization` - Override text case

**Advanced Features**:
- Rich text formatting (bold, italic, color)
- Outline and shadow effects
- Background fill options
- Multi-line support with wrapping

### BackgroundSettings
Customizable backgrounds for text and UI.

**Properties**:
- `enabled` - Toggle background
- `fillColor` - Background color
- `cornerRadius` - Rounded corners
- `margins` - Padding controls
- `borderColor` - Border styling
- `borderWidth` - Border thickness

### Canvas
Hierarchical layout container.

**Properties**:
- Sorting layers
- Unit type (Pixels, Points, World)
- Render order
- Child management

### ScreenTransform
2D transformation in screen space.

**Properties**:
- `position` - vec3 position
- `rotation` - Rotation in degrees
- `scale` - vec2 scale factors
- `anchors` - Anchor point configuration
- `offsets` - Margin offsets
- `pivot` - Pivot point for transforms

**Unit Types**:
- `Pixels` - Fixed pixel coordinates
- `Points` - Device-independent points
- `World` - 3D world space units

---

## Animation System

### AnimationPlayer
Orchestrates multiple animation clips.

**Methods**:
- `playClip(name)` - Play named clip
- `pauseClip(name)` - Pause clip
- `stopClip(name)` - Stop clip
- `resumeClip(name)` - Resume paused clip

**Events**:
- `onClipStart` - Clip begins
- `onClipEnd` - Clip completes
- `onClipLoop` - Clip loops

### AnimationMixer
Blends multiple animation layers.

**Properties**:
- Blend modes (Additive, Default)
- Layer weights
- Speed ratios
- Priority ordering

### AnimationCurve
Keyframe-based animation curves.

**Methods**:
- `evaluate(time)` - Get value at time
- `addKey(time, value)` - Add keyframe

**Features**:
- Easing curve support
- Tangent controls
- Loop modes

---

## Camera & Rendering

### Camera Component
Renders scene from a viewpoint.

**Types**:
- Perspective camera
- Orthographic camera

**Properties**:
- `renderTarget` - Output destination
- `renderLayer` - Layer filtering
- `renderOrder` - Sorting priority
- `fov` - Field of view (perspective)
- `size` - Orthographic size
- `near` - Near clipping plane
- `far` - Far clipping plane
- `depthBufferMode` - Depth buffer handling

**Methods**:
- `worldToScreen(worldPos)` - Convert 3D to screen
- `screenToWorld(screenPos, depth)` - Convert screen to 3D

### Material System
Controls visual appearance.

**Blend Modes**:
- `Normal` - Standard blending
- `Multiply` - Multiply colors
- `Add` - Additive blending
- `Screen` - Screen blending
- `Alpha` - Alpha blending
- `Premultiplied` - Pre-multiplied alpha

**Properties**:
- `mainPass` - Primary render pass
- `baseColor` - Base material color
- `baseTexture` - Diffuse texture
- `opacity` - Transparency
- `metallic` - Metalness factor
- `roughness` - Surface roughness

### MeshVisual
Renders 3D meshes.

**Properties**:
- `mesh` - Mesh asset reference
- `mainMaterial` - Material to use
- `blendMode` - Blending mode
- `stretchMode` - Stretch/fit behavior

### Image Component
2D image rendering.

**Properties**:
- `mainPass.baseTex` - Image texture
- `mainPass.baseColor` - Tint color
- `stretchMode` - Fit, Fill, Stretch modes

---

## Body & Face Tracking

### BodyTrackingAsset
Full-body pose estimation.

**Bone Identifiers**:
- Head, neck, chest
- Left/right shoulders, elbows, wrists
- Left/right hips, knees, ankles
- Spine segments
- Hand and finger bones (thumb, index, middle, ring, pinky)

**Methods**:
- `getBonePosition(boneId)` - Get bone world position
- `getBoneRotation(boneId)` - Get bone rotation

### Face/Head Tracking
Facial feature detection and tracking.

**Attachment Points**:
- `CandideCenter` - Face center
- `EyeballCenter` - Eye tracking
- Mouth, nose, forehead regions
- Ear positions
- Chin point

### BodyDepthTextureProvider
Generates depth maps from body tracking.

**Properties**:
- Confidence threshold configuration
- Depth texture output
- Resolution settings

---

## Physics Engine

### BodyComponent
Physics simulation for dynamic objects.

**Methods**:
- `addForce(force, mode)` - Apply force
- `addTorque(torque, mode)` - Apply rotational force
- `setVelocity(velocity)` - Set linear velocity
- `setAngularVelocity(angVel)` - Set rotation velocity

**Properties**:
- `mass` - Object mass
- `drag` - Linear damping
- `angularDrag` - Rotational damping
- `isStatic` - Static vs dynamic
- `useGravity` - Gravity enabled

### ColliderComponent
Collision and overlap detection.

**Methods**:
- `onCollisionEnter` - Collision begins
- `onCollisionStay` - Ongoing collision
- `onCollisionExit` - Collision ends
- `onOverlapEnter` - Overlap begins
- `onOverlapStay` - Ongoing overlap
- `onOverlapExit` - Overlap ends

**Properties**:
- `filter` - Collision filtering
- `isTrigger` - Trigger vs solid
- `shape` - Collider shape reference

### Shape Types
- **BoxShape**: Rectangular box collider
- **CapsuleShape**: Capsule collider
- **ConeShape**: Cone collider
- **CylinderShape**: Cylinder collider
- **SphereShape**: Sphere collider
- **MeshShape**: Custom mesh collider

---

## Multiplayer & Networking

### MultiplayerSession
Manages multi-user sessions.

**Events**:
- `onConnected` - User joins
- `onDisconnected` - User leaves
- `onMessageReceived` - Message from peer
- `onRealtimeStoreUpdated` - Shared data changed

**Methods**:
- `sendMessage(userId, data)` - Send to specific user
- `broadcastMessage(data)` - Send to all

### CloudStorageModule
Cloud-based data persistence.

**Methods**:
- `read(scope, key)` - Async read
- `write(scope, key, value)` - Async write
- `delete(scope, key)` - Remove data

**Scopes**:
- User scope - Per-user data
- Public scope - Shared data

### GeneralDataStore
Realtime data synchronization.

**Methods**:
- `set(key, value)` - Set value
- `get(key)` - Get value
- `delete(key)` - Remove key

**Features**:
- Automatic sync across session
- Change event callbacks

---

## Input & Device Access

### CameraModule
Device camera access.

**Properties**:
- `deviceCamera` - Front/back selection
- `cameraMode` - Mono/stereo
- `requestedResolution` - Resolution config

### CameraRollModule
Media picker for user content.

**Methods**:
- `pickImage()` - Select image from camera roll
- `pickVideo()` - Select video

**Events**:
- `onMediaSelected` - User selected media

### BluetoothModule
Bluetooth Low Energy (BLE) connectivity.

**Methods**:
- `scan()` - Scan for peripherals
- `connect(peripheral)` - Connect to device
- `disconnect()` - Disconnect
- `readCharacteristic(uuid)` - Read GATT characteristic
- `writeCharacteristic(uuid, data)` - Write GATT characteristic

**Events**:
- `onPeripheralFound` - Device discovered
- `onConnected` - Connection established
- `onDisconnected` - Connection lost
- `onCharacteristicUpdate` - Data received

---

## Machine Learning

### MachineLearning Namespace
Custom ML model inference.

**Methods**:
- `createModel(asset)` - Load ML model
- `predict(input)` - Run inference

**Features**:
- Data layout control (NCHW/NHWC)
- Tensor input/output handling
- Async prediction with callbacks

### Bitmoji Integration
Generate Bitmoji avatars.

**Types**:
- 2D Bitmoji rendering
- 3D Bitmoji models

**Customization**:
- Pose parameters
- Expression controls
- Outfit selection

---

## Data Types & Math

### Vector Types
- `vec2` - 2D vector (x, y)
- `vec3` - 3D vector (x, y, z)
- `vec4` - 4D vector (x, y, z, w) / Color (r, g, b, a)

**Common Methods**:
- `length()` - Magnitude
- `normalize()` - Unit vector
- `dot(other)` - Dot product
- `cross(other)` - Cross product (vec3)
- `distance(other)` - Distance between vectors

### Quaternion (quat)
Represents 3D rotations.

**Methods**:
- `fromEulerAngles(x, y, z)` - Create from Euler
- `toEulerAngles()` - Convert to Euler
- `multiply(other)` - Combine rotations
- `slerp(other, t)` - Spherical interpolation

### Matrix Types
- `mat2` - 2x2 matrix
- `mat3` - 3x3 matrix
- `mat4` - 4x4 transformation matrix

**mat4 Methods**:
- `makeTranslation(vec3)` - Translation matrix
- `makeRotation(quat)` - Rotation matrix
- `makeScale(vec3)` - Scale matrix
- `multiply(other)` - Matrix multiplication
- `inverse()` - Inverse matrix

---

## Event System

### ScriptComponent Events
- `onAwake` - Component initialized
- `onStart` - First frame
- `onUpdate` - Every frame
- `onLateUpdate` - After all updates
- `onDestroy` - Component destroyed

### DelayedCallbackEvent
Scheduled execution.

**Methods**:
- `bind(callback)` - Set callback function
- `reset(delay)` - Schedule/reschedule with delay (seconds)
- `cancel()` - Cancel scheduled callback

### UpdateEvent
Frame-by-frame updates.

**Properties**:
- `getDeltaTime()` - Time since last frame
- `getTime()` - Total elapsed time

### Custom Events
Create and trigger custom events for component communication.

---

## Asset Management

### TextureProvider
Image texture data source.

**Types**:
- Static texture
- Camera texture (live feed)
- Render target texture
- Procedural texture

### MaterialAsset
Material definition asset.

**Properties**:
- Shader reference
- Property values
- Texture assignments

### MeshAsset
3D geometry data.

**Properties**:
- Vertex data
- Index data
- Bounds information

---

## Utility Classes

### Request (HTTP)
HTTP request construction.

**Properties**:
- `url` - Target URL
- `method` - GET, POST, PUT, DELETE
- `headers` - HTTP headers object
- `body` - Request body (string)
- `timeout` - Request timeout

### RemoteServiceModule
Execute HTTP requests.

**Methods**:
- `performHttpRequest(request, callback)` - Execute request

**Callback Parameters**:
- `statusCode` - HTTP status
- `body` - Response body string
- `headers` - Response headers

---

## Best Practices

### Performance
1. **Object Pooling**: Reuse objects instead of create/destroy
2. **Batching**: Combine draw calls when possible
3. **LOD**: Use level-of-detail for complex meshes
4. **Update Frequency**: Limit updates to necessary framerate
5. **Async Operations**: Use callbacks for network/file operations

### Memory Management
1. Destroy unused scene objects
2. Clear event listeners when done
3. Release texture references
4. Limit simultaneous audio playback

### Debugging
1. Use `print()` for console logging
2. Profile with performance counters
3. Test on actual device, not just simulator
4. Monitor network request timing

---

**Source**: Snap Lens Studio API Documentation
**Version**: 5.13.0
**Snapchat Compatibility**: 13.55+
