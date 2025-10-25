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
exports.HandDockedMenu = void 0;
var __selfType = requireType("./HandDockedMenu");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const SIK_1 = require("SpectaclesInteractionKit.lspkg/SIK");
const WorldCameraFinderProvider_1 = require("SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider");
const animate_1 = require("SpectaclesInteractionKit.lspkg/Utils/animate");
let HandDockedMenu = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var HandDockedMenu = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.menuButtons = [];
            this.menuButtonTransforms = [];
            this.buttonAnimations = [];
            this.isShown = false;
            this.buttonHorizontalSpacing = this.buttonHorizontalSpacing;
            this.handProvider = SIK_1.SIK.HandInputData;
            this.menuHand = this.handProvider.getHand("left");
            this.mCamera = WorldCameraFinderProvider_1.default.getInstance();
        }
        __initialize() {
            super.__initialize();
            this.menuButtons = [];
            this.menuButtonTransforms = [];
            this.buttonAnimations = [];
            this.isShown = false;
            this.buttonHorizontalSpacing = this.buttonHorizontalSpacing;
            this.handProvider = SIK_1.SIK.HandInputData;
            this.menuHand = this.handProvider.getHand("left");
            this.mCamera = WorldCameraFinderProvider_1.default.getInstance();
        }
        onAwake() {
            for (let index = 0; index < this.getSceneObject().getChildrenCount(); index++) {
                this.menuButtons[index] = this.getSceneObject().getChild(index);
                this.menuButtonTransforms[index] = this.getSceneObject()
                    .getChild(index)
                    .getTransform();
            }
            this.layoutMenu();
            this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
            let delay = this.createEvent("DelayedCallbackEvent");
            delay.bind(() => {
                if (global.deviceInfoSystem.isEditor()) {
                    this.showMenu();
                }
                else {
                    this.hideMenu();
                }
            });
            delay.reset(0.25);
        }
        onUpdate() {
            this.positionMenu();
            this.checkforMenuActivation();
        }
        layoutMenu() {
            for (let index = 0; index < this.menuButtons.length; index++) {
                let buttonTransform = this.menuButtonTransforms[index];
                buttonTransform.setLocalPosition(new vec3(this.buttonHorizontalSpacing * (index + 1), 0, 0));
                buttonTransform.setLocalRotation(quat.quatIdentity());
            }
        }
        checkforMenuActivation() {
            if (global.deviceInfoSystem.isEditor()) {
                return;
            }
            if (this.menuHand.isTracked() && this.menuHand.isFacingCamera()) {
                if (!this.isShown) {
                    this.showMenu();
                }
            }
            else {
                if (this.isShown) {
                    this.hideMenu();
                }
            }
        }
        positionMenu() {
            let handPosition = this.menuHand.pinkyKnuckle.position;
            let handRight = this.menuHand.indexTip.right;
            let curPosition = this.getSceneObject().getTransform().getWorldPosition();
            let menuPosition = handPosition.add(handRight.uniformScale(1.5));
            if (global.deviceInfoSystem.isEditor()) {
                menuPosition = this.mCamera.getWorldPosition().add(new vec3(0, -20, -25));
            }
            let nPosition = vec3.lerp(curPosition, menuPosition, 0.2);
            this.getSceneObject().getTransform().setWorldPosition(nPosition);
            var billboardPos = this.mCamera
                .getWorldPosition()
                .add(this.mCamera.forward().uniformScale(5));
            billboardPos = billboardPos.add(this.mCamera.right().uniformScale(-5));
            let dir = billboardPos.sub(menuPosition).normalize();
            this.getSceneObject()
                .getTransform()
                .setWorldRotation(quat.lookAt(dir, vec3.up()));
        }
        showMenu() {
            this.isShown = true;
            for (var i = 0; i < this.menuButtons.length; i++) {
                let btn = this.menuButtons[i];
                btn.enabled = true;
                if (i < this.buttonAnimations.length) {
                    this.buttonAnimations[i]();
                }
                else {
                    this.buttonAnimations[i] = new animate_1.CancelSet();
                }
                (0, animate_1.default)({
                    cancelSet: this.buttonAnimations[i],
                    duration: 0.2,
                    delayFrames: i * 4,
                    update: (t) => {
                        //btn.getChild(0).getComponent("Component.RenderMeshVisual").mainMaterial.mainPass.opacity = MathUtils.lerp(0, 1, t)
                        let s = MathUtils.lerp(1.0, 1.3, t);
                        btn.getTransform().setLocalScale(new vec3(s, s, s));
                    },
                });
            }
        }
        hideMenu() {
            this.isShown = false;
            this.menuButtons.forEach((btn) => {
                btn.enabled = false;
            });
        }
    };
    __setFunctionName(_classThis, "HandDockedMenu");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        HandDockedMenu = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return HandDockedMenu = _classThis;
})();
exports.HandDockedMenu = HandDockedMenu;
//# sourceMappingURL=HandDockedMenu.js.map