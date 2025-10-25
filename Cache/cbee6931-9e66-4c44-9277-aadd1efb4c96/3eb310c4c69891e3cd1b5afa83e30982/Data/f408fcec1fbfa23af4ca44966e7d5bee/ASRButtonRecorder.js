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
exports.ASRButtonRecorder = void 0;
var __selfType = requireType("./ASRButtonRecorder");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const Interactable_1 = require("SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable");
const AsrModule = require("LensStudio:AsrModule");
let ASRButtonRecorder = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var ASRButtonRecorder = _classThis = class extends _classSuper {
        constructor() {
            super();
            // --- Inputs ---
            this.microphoneRecorder = this.microphoneRecorder;
            this.debugText = this.debugText;
            this.isListening = false;
            this.asrModule = AsrModule;
        }
        __initialize() {
            super.__initialize();
            // --- Inputs ---
            this.microphoneRecorder = this.microphoneRecorder;
            this.debugText = this.debugText;
            this.isListening = false;
            this.asrModule = AsrModule;
        }
        onAwake() {
            // get the Interactable component on this button
            this.interactable = this.sceneObject.getComponent(Interactable_1.Interactable.getTypeName());
            if (!this.interactable) {
                print("⚠️ No Interactable found on this object!");
                return;
            }
            // when the button is pressed (trigger start)
            this.interactable.onTriggerStart.add(() => this.toggleASR());
            if (this.debugText)
                this.debugText.text = "🎤 Tap to start listening";
        }
        toggleASR() {
            this.isListening = !this.isListening;
            if (this.isListening) {
                this.startASR();
            }
            else {
                this.stopASR();
            }
        }
        startASR() {
            print("🎙️ Starting microphone + ASR...");
            if (this.debugText)
                this.debugText.text = "Listening...";
            // start microphone recording
            this.microphoneRecorder.recordMicrophoneAudio(true);
            // configure ASR
            const options = this.asrModule.AsrTranscriptionOptions.create();
            options.silenceUntilTerminationMs = 1000;
            options.mode = this.asrModule.AsrMode.HighAccuracy;
            // add callbacks
            options.onTranscriptionUpdateEvent.add((eventArgs) => this.onTranscriptionUpdate(eventArgs));
            options.onTranscriptionErrorEvent.add((eventArgs) => this.onTranscriptionError(eventArgs));
            // start transcribing
            this.asrModule.startTranscribing(options);
        }
        stopASR() {
            print("🛑 Stopping ASR + microphone...");
            if (this.debugText)
                this.debugText.text = "Stopped.";
            this.microphoneRecorder.recordMicrophoneAudio(false);
            this.asrModule.stopTranscribing().then(() => {
                print("ASR stopped.");
            });
        }
        onTranscriptionUpdate(eventArgs) {
            // show only latest finalized sentence
            if (eventArgs.isFinal && this.debugText) {
                this.debugText.text = "🗣️ " + eventArgs.text;
            }
        }
        onTranscriptionError(eventArgs) {
            print("ASR Error: " + eventArgs);
            if (this.debugText) {
                this.debugText.text = "⚠️ ASR error: " + eventArgs;
            }
        }
    };
    __setFunctionName(_classThis, "ASRButtonRecorder");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ASRButtonRecorder = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ASRButtonRecorder = _classThis;
})();
exports.ASRButtonRecorder = ASRButtonRecorder;
//# sourceMappingURL=ASRButtonRecorder.js.map