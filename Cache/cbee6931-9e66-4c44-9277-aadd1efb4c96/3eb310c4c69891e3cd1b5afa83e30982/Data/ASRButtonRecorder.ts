import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";
import { MicrophoneRecorder } from "./MicrophoneRecorder";

const AsrModule = require("LensStudio:AsrModule");

@component
export class ASRButtonRecorder extends BaseScriptComponent {
  // --- Inputs ---
  @input
  microphoneRecorder: MicrophoneRecorder;

  @input
  @allowUndefined
  debugText: Text;

  private interactable: Interactable;
  private isListening = false;
  private asrModule = AsrModule;

  onAwake() {
    // get the Interactable component on this button
    this.interactable = this.sceneObject.getComponent(
      Interactable.getTypeName()
    );

    if (!this.interactable) {
      print("⚠️ No Interactable found on this object!");
      return;
    }

    // when the button is pressed (trigger start)
    this.interactable.onTriggerStart.add(() => this.toggleASR());

    if (this.debugText) this.debugText.text = "🎤 Tap to start listening";
  }

  private toggleASR() {
    this.isListening = !this.isListening;
    if (this.isListening) {
      this.startASR();
    } else {
      this.stopASR();
    }
  }

  private startASR() {
    print("🎙️ Starting microphone + ASR...");
    if (this.debugText) this.debugText.text = "Listening...";

    // start microphone recording
    this.microphoneRecorder.recordMicrophoneAudio(true);

    // configure ASR
    const options = this.asrModule.AsrTranscriptionOptions.create();
    options.silenceUntilTerminationMs = 1000;
    options.mode = this.asrModule.AsrMode.HighAccuracy;

    // add callbacks
    options.onTranscriptionUpdateEvent.add((eventArgs) =>
      this.onTranscriptionUpdate(eventArgs)
    );
    options.onTranscriptionErrorEvent.add((eventArgs) =>
      this.onTranscriptionError(eventArgs)
    );

    // start transcribing
    this.asrModule.startTranscribing(options);
  }

  private stopASR() {
    print("🛑 Stopping ASR + microphone...");
    if (this.debugText) this.debugText.text = "Stopped.";

    this.microphoneRecorder.recordMicrophoneAudio(false);

    this.asrModule.stopTranscribing().then(() => {
      print("ASR stopped.");
    });
  }

  private onTranscriptionUpdate(eventArgs: AsrModule.TranscriptionUpdateEvent) {
    // show only latest finalized sentence
    if (eventArgs.isFinal && this.debugText) {
      this.debugText.text = "🗣️ " + eventArgs.text;
    }
  }

  private onTranscriptionError(eventArgs: AsrModule.AsrStatusCode) {
    print("ASR Error: " + eventArgs);
    if (this.debugText) {
      this.debugText.text = "⚠️ ASR error: " + eventArgs;
    }
  }
}
