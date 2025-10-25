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
var __selfType = requireType("./SupabaseUploader");
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
            this.remoteServiceModule = this.remoteServiceModule; // RemoteServiceModule Asset
            // Your Supabase configuration
            this.supabaseUrl = "https://dplmtpqfspabypjafari.supabase.co";
            this.supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwbG10cHFmc3BhYnlwamFmYXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNjQ1OTAsImV4cCI6MjA3Njk0MDU5MH0.OGsTEPtMW2xwEfulxxMJO7Ew1U7AbJ206ZAfEemUA-w";
            this.bucketName = "audio-uploads";
            // API Spec ID for RemoteServiceModule
            this.apiSpecId = "363ee2a5-ad35-4a5f-9547-d42b2c60a927"; // Placeholder API
        }
        __initialize() {
            super.__initialize();
            this.microphoneRecorder = this.microphoneRecorder;
            this.debugText = this.debugText;
            this.remoteServiceModule = this.remoteServiceModule; // RemoteServiceModule Asset
            // Your Supabase configuration
            this.supabaseUrl = "https://dplmtpqfspabypjafari.supabase.co";
            this.supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwbG10cHFmc3BhYnlwamFmYXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNjQ1OTAsImV4cCI6MjA3Njk0MDU5MH0.OGsTEPtMW2xwEfulxxMJO7Ew1U7AbJ206ZAfEemUA-w";
            this.bucketName = "audio-uploads";
            // API Spec ID for RemoteServiceModule
            this.apiSpecId = "363ee2a5-ad35-4a5f-9547-d42b2c60a927"; // Placeholder API
        }
        onAwake() {
            this.setupUploadButton();
        }
        setupUploadButton() {
            const interactable = this.sceneObject.getComponent(Interactable_1.Interactable.getTypeName());
            if (!isNull(interactable)) {
                interactable.onTriggerStart.add(() => {
                    this.uploadAudio();
                });
            }
        }
        async uploadAudio() {
            if (isNull(this.microphoneRecorder)) {
                this.updateDebugText("No microphone recorder found!");
                return;
            }
            // SAFE check - only use public properties
            if (this.microphoneRecorder.recordingDuration <= 0) {
                this.updateDebugText("No audio recorded yet!");
                return;
            }
            this.updateDebugText("Starting safe upload...");
            this.startSafeUpload();
        }
        startSafeUpload() {
            // Use a simple, safe upload process
            this.updateDebugText("Getting audio data...");
            // SAFE way to get audio data without accessing private properties
            this.getAudioDataSafely();
        }
        getAudioDataSafely() {
            try {
                // Get the recorded audio frames from MicrophoneRecorder
                const recordedFrames = this.microphoneRecorder.recordedAudioFrames;
                if (!recordedFrames || recordedFrames.length === 0) {
                    this.updateDebugText("No recorded audio found!");
                    return;
                }
                // Get the latest recorded audio (most recent frame)
                const latestFrame = recordedFrames[recordedFrames.length - 1];
                if (!latestFrame || !latestFrame.audioFrame) {
                    this.updateDebugText("No audio data in latest frame!");
                    return;
                }
                // Use the latest audio frame directly
                const audioBuffer = latestFrame.audioFrame;
                this.updateDebugText(`Found ${audioBuffer.length} audio samples from latest recording`);
                this.convertAndUpload(audioBuffer);
            }
            catch (error) {
                this.updateDebugText(`Error getting audio: ${error.message}`);
            }
        }
        convertAndUpload(audioBuffer) {
            this.updateDebugText("Converting to WAV...");
            try {
                const wavData = this.convertToWav(audioBuffer, 44100);
                this.updateDebugText(`WAV data: ${wavData.byteLength} bytes`);
                this.uploadToSupabase(wavData);
            }
            catch (error) {
                this.updateDebugText(`Error converting: ${error.message}`);
            }
        }
        async uploadToSupabase(wavData) {
            this.updateDebugText("Uploading to Supabase...");
            try {
                const timestamp = Date.now();
                const filename = `audio_${timestamp}.wav`;
                // Create upload URL
                const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${filename}`;
                // Set up headers for Supabase
                const headers = {
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'audio/wav',
                    'Cache-Control': 'no-cache'
                };
                // Make the actual HTTP request
                const response = await this.makeHttpRequest(uploadUrl, 'PUT', wavData, headers);
                if (response.success) {
                    this.finishUpload(filename);
                }
                else {
                    this.updateDebugText(`❌ Upload failed: ${response.error}`);
                }
            }
            catch (error) {
                this.updateDebugText(`Upload error: ${error.message}`);
            }
        }
        async makeHttpRequest(url, method, data, headers) {
            try {
                this.updateDebugText("Connecting to Supabase...");
                // Use Lens Studio's built-in HTTP capabilities
                // Create a simple HTTP request using the global fetch-like API
                const base64Data = this.arrayBufferToBase64(data);
                // Make the actual HTTP request using Lens Studio's HTTP system
                this.updateDebugText("Sending to Supabase...");
                // Use a simple approach that works with Lens Studio
                const response = await this.performHttpRequest(url, method, base64Data, headers);
                if (response && response.status >= 200 && response.status < 300) {
                    this.updateDebugText("✅ Upload successful!");
                    return { success: true };
                }
                else {
                    this.updateDebugText(`❌ Upload failed: ${response.status}`);
                    return { success: false, error: `HTTP ${response.status}` };
                }
            }
            catch (error) {
                this.updateDebugText(`❌ Network error: ${error.message}`);
                return { success: false, error: error.message };
            }
        }
        async performHttpRequest(url, method, data, headers) {
            try {
                this.updateDebugText("Uploading to audio-uploads bucket...");
                // Use RemoteServiceModule Asset for real HTTP requests
                if (isNull(this.remoteServiceModule)) {
                    this.updateDebugText("❌ RemoteServiceModule Asset not assigned");
                    return { status: 500 };
                }
                this.updateDebugText("Sending to Supabase...");
                // Use the RemoteServiceModule Asset
                const response = await this.useRemoteServiceModule(url, method, data, headers);
                if (response && response.status >= 200 && response.status < 300) {
                    this.updateDebugText(`✅ Upload successful! Status: ${response.status}`);
                    return { status: response.status };
                }
                else {
                    this.updateDebugText(`❌ Upload failed: ${response.status}`);
                    return { status: 500 };
                }
            }
            catch (error) {
                this.updateDebugText(`HTTP Error: ${error.message}`);
                return { status: 500 };
            }
        }
        async useRemoteServiceModule(url, method, data, headers) {
            try {
                // Use RemoteServiceModule Asset for real HTTP requests
                const req = global.RemoteApiRequest.create();
                req.endpoint = 'upload_audio';
                req.parameters = {
                    url: url,
                    method: method,
                    headers: headers,
                    body: data
                };
                // Make the actual HTTP request using RemoteServiceModule Asset
                const response = await new Promise((resolve, reject) => {
                    this.remoteServiceModule.performApiRequest(req, (response) => {
                        resolve(response);
                    });
                });
                if (response && response.statusCode === 1) {
                    this.updateDebugText(`✅ RemoteServiceModule success! Status: ${response.statusCode}`);
                    return { status: 200 };
                }
                else {
                    this.updateDebugText(`❌ RemoteServiceModule failed: ${response.statusCode}`);
                    return { status: 500 };
                }
            }
            catch (error) {
                this.updateDebugText(`RemoteServiceModule Error: ${error.message}`);
                return { status: 500 };
            }
        }
        async sendHttpRequest(url, method, data, headers) {
            // Use Lens Studio's actual HTTP system
            try {
                // Create HTTP request using Lens Studio's capabilities
                const request = new global.XMLHttpRequest();
                return new Promise((resolve, reject) => {
                    request.open(method, url, true);
                    // Set headers
                    for (const key in headers) {
                        request.setRequestHeader(key, headers[key]);
                    }
                    request.onload = () => {
                        resolve({ status: request.status });
                    };
                    request.onerror = () => {
                        reject(new Error('Network error'));
                    };
                    // Send the request
                    request.send(data);
                });
            }
            catch (error) {
                this.updateDebugText(`HTTP Request Error: ${error.message}`);
                return { status: 500 };
            }
        }
        base64ToArrayBuffer(base64) {
            // Custom base64 decoder since atob is not available
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
            let result = '';
            let i = 0;
            // Remove padding
            base64 = base64.replace(/[^A-Za-z0-9+/]/g, '');
            while (i < base64.length) {
                const encoded1 = chars.indexOf(base64.charAt(i++));
                const encoded2 = chars.indexOf(base64.charAt(i++));
                const encoded3 = chars.indexOf(base64.charAt(i++));
                const encoded4 = chars.indexOf(base64.charAt(i++));
                const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;
                result += String.fromCharCode((bitmap >> 16) & 255);
                if (encoded3 !== 64)
                    result += String.fromCharCode((bitmap >> 8) & 255);
                if (encoded4 !== 64)
                    result += String.fromCharCode(bitmap & 255);
            }
            const bytes = new Uint8Array(result.length);
            for (let i = 0; i < result.length; i++) {
                bytes[i] = result.charCodeAt(i);
            }
            return bytes.buffer;
        }
        finishUpload(filename) {
            const publicUrl = `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${filename}`;
            this.updateDebugText(`✅ Uploaded: ${filename}`);
            this.updateDebugText(`🔗 URL: ${publicUrl}`);
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
        arrayBufferToBase64(buffer) {
            const bytes = new Uint8Array(buffer);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return this.simpleBase64Encode(binary);
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
        updateDebugText(message) {
            if (!isNull(this.debugText)) {
                this.debugText.text = message;
            }
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
//# sourceMappingURL=SupabaseUploader.js.map