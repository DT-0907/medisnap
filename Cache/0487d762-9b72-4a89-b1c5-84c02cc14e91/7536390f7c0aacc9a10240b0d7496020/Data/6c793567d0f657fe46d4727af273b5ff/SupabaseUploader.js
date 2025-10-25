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
            // hard-coded Supabase + API Spec ID
            this.supabaseUrl = "https://dplmtpqfspabypjafari.supabase.co";
            this.bucketName = "audio-uploads";
            this.apiSpecId = "b57dee7b-7513-4fe2-8a51-14cf0a67f501"; // 👈 your Snap API Spec ID
        }
        __initialize() {
            super.__initialize();
            this.microphoneRecorder = this.microphoneRecorder;
            this.debugText = this.debugText;
            // hard-coded Supabase + API Spec ID
            this.supabaseUrl = "https://dplmtpqfspabypjafari.supabase.co";
            this.bucketName = "audio-uploads";
            this.apiSpecId = "b57dee7b-7513-4fe2-8a51-14cf0a67f501"; // 👈 your Snap API Spec ID
        }
        onAwake() {
            this.setupUploadButton();
        }
        setupUploadButton() {
            const interactable = this.sceneObject.getComponent(Interactable_1.Interactable.getTypeName());
            if (!isNull(interactable)) {
                interactable.onTriggerStart.add(() => this.uploadAudio());
            }
        }
        async uploadAudio() {
            if (isNull(this.microphoneRecorder) || this.microphoneRecorder.recordingDuration <= 0) {
                this.updateDebugText("No audio recorded!");
                return;
            }
            this.updateDebugText("Preparing upload…");
            const recordedFrames = this.microphoneRecorder.recordedAudioFrames;
            if (!recordedFrames || recordedFrames.length === 0) {
                this.updateDebugText("No audio data!");
                return;
            }
            const latest = recordedFrames[recordedFrames.length - 1];
            if (!latest || !latest.audioFrame) {
                this.updateDebugText("Invalid audio frame!");
                return;
            }
            const wav = this.convertToWav(latest.audioFrame, 44100);
            await this.uploadToSupabase(wav);
        }
        convertToWav(audioBuffer, sampleRate) {
            const len = audioBuffer.length;
            const buf = new ArrayBuffer(44 + len * 2);
            const view = new DataView(buf);
            const write = (o, s) => { for (let i = 0; i < s.length; i++)
                view.setUint8(o + i, s.charCodeAt(i)); };
            write(0, "RIFF");
            view.setUint32(4, 36 + len * 2, true);
            write(8, "WAVE");
            write(12, "fmt ");
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);
            view.setUint16(22, 1, true);
            view.setUint32(24, sampleRate, true);
            view.setUint32(28, sampleRate * 2, true);
            view.setUint16(32, 2, true);
            view.setUint16(34, 16, true);
            write(36, "data");
            view.setUint32(40, len * 2, true);
            let o = 44;
            for (let i = 0; i < len; i++) {
                const s = Math.max(-1, Math.min(1, audioBuffer[i]));
                view.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
                o += 2;
            }
            return buf;
        }
        arrayBufferToBase64(buf) {
            const bytes = new Uint8Array(buf);
            let bin = "";
            for (let i = 0; i < bytes.byteLength; i++)
                bin += String.fromCharCode(bytes[i]);
            return this.simpleBase64Encode(bin);
        }
        simpleBase64Encode(str) {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            let res = "", i = 0;
            while (i < str.length) {
                const a = str.charCodeAt(i++), b = i < str.length ? str.charCodeAt(i++) : 0, c = i < str.length ? str.charCodeAt(i++) : 0;
                const bits = (a << 16) | (b << 8) | c;
                res += chars[(bits >> 18) & 63];
                res += chars[(bits >> 12) & 63];
                res += i - 2 < str.length ? chars[(bits >> 6) & 63] : "=";
                res += i - 1 < str.length ? chars[bits & 63] : "=";
            }
            return res;
        }
        async uploadToSupabase(wav) {
            this.updateDebugText("Uploading…");
            try {
                const ts = Date.now();
                const file = `audio_${ts}.wav`;
                const url = `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${file}`;
                const headers = { "Content-Type": "audio/wav", "Cache-Control": "no-cache" };
                const base64 = this.arrayBufferToBase64(wav);
                const result = await this.callSnapApi(url, "POST", base64, headers);
                if (result) {
                    this.updateDebugText(`✅ Uploaded: ${file}`);
                    this.updateDebugText(`${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${file}`);
                }
                else
                    this.updateDebugText("❌ Upload failed");
            }
            catch (e) {
                this.updateDebugText(`Error: ${e.message}`);
            }
        }
        async callSnapApi(url, method, data, headers) {
            try {
                const req = global.RemoteApiRequest.create();
                req.apiSpecId = this.apiSpecId; // 👈 directly uses your API Spec ID
                req.endpoint = "upload_audio";
                req.parameters = { url, method, headers, body: data };
                const res = await new Promise((resolve) => {
                    global.RemoteServiceModule.performApiRequest(req, (r) => resolve(r));
                });
                return res && res.statusCode === 1;
            }
            catch (e) {
                this.updateDebugText(`HTTP Error: ${e.message}`);
                return false;
            }
        }
        updateDebugText(msg) {
            if (!isNull(this.debugText))
                this.debugText.text = msg;
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