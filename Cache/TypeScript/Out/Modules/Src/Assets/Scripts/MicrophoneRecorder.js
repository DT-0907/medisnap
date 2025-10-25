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
exports.MicrophoneRecorder = void 0;
var __selfType = requireType("./MicrophoneRecorder");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const SAMPLE_RATE = 44100;
let MicrophoneRecorder = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var MicrophoneRecorder = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.microphoneAsset = this.microphoneAsset;
            this.audioOutput = this.audioOutput;
            this.debugText = this.debugText;
            this.recordedAudioFrames = [];
            this.numberOfSamples = 0;
            this._recordingDuration = 0;
            this.currentPlaybackTime = 0;
        }
        __initialize() {
            super.__initialize();
            this.microphoneAsset = this.microphoneAsset;
            this.audioOutput = this.audioOutput;
            this.debugText = this.debugText;
            this.recordedAudioFrames = [];
            this.numberOfSamples = 0;
            this._recordingDuration = 0;
            this.currentPlaybackTime = 0;
        }
        onAwake() {
            // Initialize microphone control and set sample rate
            this.microphoneControl = this.microphoneAsset
                .control;
            this.microphoneControl.sampleRate = SAMPLE_RATE;
            // Create and configure audio component
            this.audioComponent = this.sceneObject.createComponent("AudioComponent");
            this.audioComponent.audioTrack = this.audioOutput;
            this.audioOutputProvider = this.audioOutput.control;
            this.audioOutputProvider.sampleRate = SAMPLE_RATE;
            // Create and bind record audio update event
            this.recordAudioUpdateEvent = this.createEvent("UpdateEvent");
            this.recordAudioUpdateEvent.bind(() => {
                this.onRecordAudio();
            });
            this.recordAudioUpdateEvent.enabled = false;
            // Create and bind playback audio update event
            this.playbackAudioUpdateEvent = this.createEvent("UpdateEvent");
            this.playbackAudioUpdateEvent.bind(() => {
                this.onPlaybackAudio();
            });
            this.playbackAudioUpdateEvent.enabled = false;
        }
        // Called to record audio from the microphone
        onRecordAudio() {
            let frameSize = this.microphoneControl.maxFrameSize;
            let audioFrame = new Float32Array(frameSize);
            // Get audio frame shape
            const audioFrameShape = this.microphoneControl.getAudioFrame(audioFrame);
            // If no audio data, return early
            if (audioFrameShape.x === 0) {
                return;
            }
            // Reduce the initial subarray size to the audioFrameShape value
            audioFrame = audioFrame.subarray(0, audioFrameShape.x);
            // Update the number of samples and recording duration
            this.numberOfSamples += audioFrameShape.x;
            this._recordingDuration = this.numberOfSamples / SAMPLE_RATE;
            // Update debug text with recording information
            this.updateRecordingDebugText();
            // Store the recorded audio frame
            this.recordedAudioFrames.push({
                audioFrame: audioFrame,
                audioFrameShape: audioFrameShape,
            });
        }
        // Called to handle playback of recorded audio
        onPlaybackAudio() {
            this.currentPlaybackTime += getDeltaTime();
            this.currentPlaybackTime = Math.min(this.currentPlaybackTime, this._recordingDuration);
            // Update debug text with playback information
            this.updatePlaybackDebugText();
            // Stop playback if the end of the recording is reached
            if (this.currentPlaybackTime >= this._recordingDuration) {
                this.audioComponent.stop(false);
                this.playbackAudioUpdateEvent.enabled = false;
            }
        }
        // Update the debug text with recording information
        updateRecordingDebugText() {
            if (isNull(this.debugText)) {
                return;
            }
            this.debugText.text =
                "Duration: " + this._recordingDuration.toFixed(1) + "s";
            this.debugText.text +=
                "\n Size: " + (this.getTotalRecordedBytes() / 1000).toFixed(1) + "kB";
            this.debugText.text += "\nSample Rate: " + SAMPLE_RATE;
        }
        // Update the debug text with playback information
        updatePlaybackDebugText() {
            if (this.numberOfSamples <= 0) {
                this.debugText.text =
                    "Oops! \nNo audio has been recorded yet. Please try recording again.";
                return;
            }
            this.debugText.text = "Playback Time: \n";
            this.debugText.text +=
                this.currentPlaybackTime.toFixed(1) +
                    "s / " +
                    this._recordingDuration.toFixed(1) +
                    "s";
        }
        // Start or stop recording audio from the microphone
        recordMicrophoneAudio(toRecord) {
            if (toRecord) {
                this.recordedAudioFrames = [];
                this.audioComponent.stop(false);
                this.numberOfSamples = 0;
                this.microphoneControl.start();
                this.recordAudioUpdateEvent.enabled = true;
                this.playbackAudioUpdateEvent.enabled = false;
            }
            else {
                this.microphoneControl.stop();
                this.recordAudioUpdateEvent.enabled = false;
            }
        }
        // Start playback of the recorded audio
        playbackRecordedAudio() {
            this.updatePlaybackDebugText();
            if (this.recordedAudioFrames.length <= 0) {
                return false;
            }
            this.currentPlaybackTime = 0;
            this.audioComponent.stop(false);
            this.playbackAudioUpdateEvent.enabled = true;
            this.audioComponent.play(-1);
            for (let i = 0; i < this.recordedAudioFrames.length; i++) {
                this.audioOutputProvider.enqueueAudioFrame(this.recordedAudioFrames[i].audioFrame, this.recordedAudioFrames[i].audioFrameShape);
            }
            return true;
        }
        // Getter for recording duration
        get recordingDuration() {
            return this._recordingDuration;
        }
        // Calculate the total recorded bytes
        getTotalRecordedBytes() {
            let totalBytes = 0;
            for (const frame of this.recordedAudioFrames) {
                totalBytes += frame.audioFrame.byteLength;
            }
            return totalBytes;
        }
    };
    __setFunctionName(_classThis, "MicrophoneRecorder");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MicrophoneRecorder = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MicrophoneRecorder = _classThis;
})();
exports.MicrophoneRecorder = MicrophoneRecorder;
//# sourceMappingURL=MicrophoneRecorder.js.map