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
exports.ASRLiveTranscriber = void 0;
var __selfType = requireType("./ASRButtonRecorder");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const AsrModule = require("LensStudio:AsrModule");
let ASRLiveTranscriber = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var ASRLiveTranscriber = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.debugText = this.debugText;
            this.asrModule = AsrModule;
            this.isActive = false;
            this.currentText = "";
            this.finalText = "";
        }
        __initialize() {
            super.__initialize();
            this.debugText = this.debugText;
            this.asrModule = AsrModule;
            this.isActive = false;
            this.currentText = "";
            this.finalText = "";
        }
        onAwake() {
            if (this.debugText)
                this.debugText.text = "🎤 Tap to start listening";
        }
        toggleASR() {
            this.isActive ? this.stopASR() : this.startASR();
        }
        startASR() {
            this.isActive = true;
            this.currentText = "";
            this.finalText = "";
            if (this.debugText)
                this.debugText.text = "Listening...";
            const opts = this.asrModule.AsrTranscriptionOptions.create();
            opts.silenceUntilTerminationMs = 1200;
            opts.mode = this.asrModule.AsrMode.HighAccuracy;
            opts.onTranscriptionUpdateEvent.add(e => this.onUpdate(e));
            opts.onTranscriptionErrorEvent.add(e => this.onError(e));
            this.asrModule.startTranscribing(opts);
        }
        stopASR() {
            this.isActive = false;
            if (this.debugText)
                this.debugText.text = "Stopped.";
            this.asrModule.stopTranscribing();
        }
        onUpdate(e) {
            if (!e.isFinal) {
                this.currentText = e.text;
            }
            else {
                this.finalText += e.text + " ";
                this.currentText = "";
            }
            this.updateDisplay(this.finalText + this.currentText);
        }
        onError(code) {
            print("ASR error " + code);
            if (this.debugText)
                this.debugText.text = "⚠️ ASR error: " + code;
        }
        updateDisplay(text) {
            if (this.debugText)
                this.debugText.text = "🗣️ " + text.trim();
        }
    };
    __setFunctionName(_classThis, "ASRLiveTranscriber");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ASRLiveTranscriber = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ASRLiveTranscriber = _classThis;
})();
exports.ASRLiveTranscriber = ASRLiveTranscriber;
//# sourceMappingURL=ASRButtonRecorder.js.map