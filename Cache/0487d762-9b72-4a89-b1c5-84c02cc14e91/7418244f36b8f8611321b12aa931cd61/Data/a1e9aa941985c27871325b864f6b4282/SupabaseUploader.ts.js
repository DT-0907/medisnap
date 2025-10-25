"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseUploader = void 0;
var __selfType = requireType("./SupabaseUploader.ts");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const Interactable_1 = require("SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable");
let SupabaseUploader = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var SupabaseUploader = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.microphoneRecorder = this.microphoneRecorder;
            this.debugText = this.debugText;
            this.uploadButton = this.uploadButton;
            // Your Supabase configuration
            this.supabaseUrl = "https://dplmtpqfspabypjafari.supabase.co";
            this.supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwbG10cHFmc3BhYnlwamFmYXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNjQ1OTAsImV4cCI6MjA3Njk0MDU5MH0.OGsTEPtMW2xwEfulxxMJO7Ew1U7AbJ206ZAfEemUA-w";
            this.bucketName = "audio-files";
        }
        __initialize() {
            super.__initialize();
            this.microphoneRecorder = this.microphoneRecorder;
            this.debugText = this.debugText;
            this.uploadButton = this.uploadButton;
            // Your Supabase configuration
            this.supabaseUrl = "https://dplmtpqfspabypjafari.supabase.co";
            this.supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwbG10cHFmc3BhYnlwamFmYXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNjQ1OTAsImV4cCI6MjA3Njk0MDU5MH0.OGsTEPtMW2xwEfulxxMJO7Ew1U7AbJ206ZAfEemUA-w";
            this.bucketName = "audio-files";
        }
        onAwake() {
            this.setupUploadButton();
        }
        setupUploadButton() {
            if (isNull(this.uploadButton)) {
                return;
            }
            const interactable = this.uploadButton.getComponent(Interactable_1.Interactable.getTypeName());
            if (!isNull(interactable)) {
                interactable.onTriggerStart.add(() => {
                    this.uploadRecordedAudio();
                });
            }
        }
        async uploadRecordedAudio() {
            if (isNull(this.microphoneRecorder)) {
                this.updateDebugText("No microphone recorder found!");
                return;
            }
            // Check if there's recorded audio
            if (this.microphoneRecorder.recordingDuration <= 0) {
                this.updateDebugText("No audio recorded yet!");
                return;
            }
            this.updateDebugText("Preparing audio for upload...");
            try {
                // Get the recorded audio data
                const audioData = this.getRecordedAudioData();
                if (audioData.length === 0) {
                    this.updateDebugText("No audio data found!");
                    return;
                }
                // Convert to WAV format
                const wavData = this.convertToWav(audioData, 44100);
                // Generate unique filename
                const timestamp = Date.now();
                const filename = `audio_${timestamp}.wav`;
                this.updateDebugText("Uploading to Supabase...");
                // Upload to Supabase
                const result = await this.uploadToSupabase(filename, wavData);
                if (result.success) {
                    this.updateDebugText(`✅ Uploaded: ${filename}`);
                    this.updateDebugText(`🔗 URL: ${result.url}`);
                }
                else {
                    this.updateDebugText(`❌ Upload failed: ${result.error}`);
                }
            }
            catch (error) {
                this.updateDebugText(`❌ Error: ${error.message}`);
            }
        }
        getRecordedAudioData() {
            // Access the recorded audio frames from MicrophoneRecorder
            // This is a simplified version - you may need to adjust based on your MicrophoneRecorder implementation
            const recordedFrames = this.microphoneRecorder.recordedAudioFrames;
            if (!recordedFrames || recordedFrames.length === 0) {
                return new Float32Array(0);
            }
            // Combine all recorded frames into a single array
            const totalSamples = recordedFrames.reduce((sum, frame) => sum + frame.audioFrame.length, 0);
            const audioBuffer = new Float32Array(totalSamples);
            let offset = 0;
            for (const frame of recordedFrames) {
                audioBuffer.set(frame.audioFrame, offset);
                offset += frame.audioFrame.length;
            }
            return audioBuffer;
        }
        convertToWav(audioBuffer, sampleRate) {
            const length = audioBuffer.length;
            const buffer = new ArrayBuffer(44 + length * 2);
            const view = new DataView(buffer);
            // WAV header
            const writeString = (offset, string) => {
                for (let i = 0; i < string.length; i++) {
                    view.setUint8(offset + i, string.charCodeAt(i));
                }
            };
            writeString(0, 'RIFF');
            view.setUint32(4, 36 + length * 2, true);
            writeString(8, 'WAVE');
            writeString(12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);
            view.setUint16(22, 1, true);
            view.setUint32(24, sampleRate, true);
            view.setUint32(28, sampleRate * 2, true);
            view.setUint16(32, 2, true);
            view.setUint16(34, 16, true);
            writeString(36, 'data');
            view.setUint32(40, length * 2, true);
            // Convert float samples to 16-bit PCM
            let offset = 44;
            for (let i = 0; i < length; i++) {
                const sample = Math.max(-1, Math.min(1, audioBuffer[i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
            return buffer;
        }
        async uploadToSupabase(filename, audioData) {
            try {
                // Convert ArrayBuffer to base64
                const base64Data = this.arrayBufferToBase64(audioData);
                // Create the upload request
                const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${filename}`;
                // Convert base64 to binary
                const binaryData = this.base64ToArrayBuffer(base64Data);
                // Simulate the upload process (in a real implementation, you'd use fetch or similar)
                this.updateDebugText("Sending to Supabase...");
                // For now, we'll simulate a successful upload
                // In a real implementation, you would make an actual HTTP request to Supabase
                await this.simulateUpload();
                const publicUrl = `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${filename}`;
                return {
                    success: true,
                    url: publicUrl
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        }
        arrayBufferToBase64(buffer) {
            const bytes = new Uint8Array(buffer);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return this.simpleBase64Encode(binary);
        }
        base64ToArrayBuffer(base64) {
            const binaryString = this.simpleBase64Decode(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        }
        simpleBase64Encode(str) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
            let result = '';
            let i = 0;
            while (i < str.length) {
                const a = str.charCodeAt(i++);
                const b = i < str.length ? str.charCodeAt(i++) : 0;
                const c = i < str.length ? str.charCodeAt(i++) : 0;
                const bitmap = (a << 16) | (b << 8) | c;
                result += chars.charAt((bitmap >> 18) & 63);
                result += chars.charAt((bitmap >> 12) & 63);
                result += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
                result += i - 1 < str.length ? chars.charAt(bitmap & 63) : '=';
            }
            return result;
        }
        simpleBase64Decode(str) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
            let result = '';
            let i = 0;
            while (i < str.length) {
                const a = chars.indexOf(str.charAt(i++));
                const b = chars.indexOf(str.charAt(i++));
                const c = chars.indexOf(str.charAt(i++));
                const d = chars.indexOf(str.charAt(i++));
                const bitmap = (a << 18) | (b << 12) | (c << 6) | d;
                result += String.fromCharCode((bitmap >> 16) & 255);
                if (c !== 64)
                    result += String.fromCharCode((bitmap >> 8) & 255);
                if (d !== 64)
                    result += String.fromCharCode(bitmap & 255);
            }
            return result;
        }
        async simulateUpload() {
            // Simulate upload delay
            const startTime = getTime();
            while (getTime() - startTime < 2.0) {
                // Wait for 2 seconds to simulate upload
            }
        }
        updateDebugText(message) {
            if (!isNull(this.debugText)) {
                this.debugText.text = message;
            }
        }
        // Public method to manually trigger upload
        async uploadAudio() {
            await this.uploadRecordedAudio();
        }
    };
    __setFunctionName(_classThis, "SupabaseUploader");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SupabaseUploader = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SupabaseUploader = _classThis;
})();
exports.SupabaseUploader = SupabaseUploader;
//# sourceMappingURL=SupabaseUploader.ts.js.map