import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";
import { MicrophoneRecorder } from "./MicrophoneRecorder";

const AsrModule = require("LensStudio:AsrModule");

@component
export class ASRButtonRecorder extends BaseScriptComponent {
  @input
  microphoneRecorder: MicrophoneRecorder;

  @input
  @allowUndefined
  debugText: Text;

  private interactable: Interactable;
  private isListening = false;
  private asrModule = AsrModule;
  private rollingWords: string[] = [];
  private MAX_WORDS = 10;

  onAwake() {
    this.interactable = this.sceneObject.getComponent(
      Interactable.getTypeName()
    );

    if (!this.interactable) {
      print("⚠️ No Interactable found on this object!");
      return;
    }

    this.interactable.onTriggerStart.add(() => this.toggleASR());

    if (this.debugText) {
      this.debugText.text = "🎤 Tap to start listening";
    }
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
    print("🎙️ Starting continuous ASR...");
    if (this.debugText) this.debugText.text = "Listening...";

    this.microphoneRecorder.recordMicrophoneAudio(true);

    const options = this.asrModule.AsrTranscriptionOptions.create();
    options.silenceUntilTerminationMs = 5000; // allow long continuous listening
    options.mode = this.asrModule.AsrMode.Balanced; // better speed vs accuracy

    // callbacks
    options.onTranscriptionUpdateEvent.add((eventArgs) =>
      this.onTranscriptionUpdate(eventArgs)
    );
    options.onTranscriptionErrorEvent.add((eventArgs) =>
      this.onTranscriptionError(eventArgs)
    );

    this.asrModule.startTranscribing(options);
  }

  private stopASR() {
    print("🛑 Stopping ASR + microphone...");
    if (this.debugText) this.debugText.text = "Stopped.";

    this.microphoneRecorder.recordMicrophoneAudio(false);
    this.asrModule.stopTranscribing().then(() => {
      print("ASR stopped.");
    });
    this.rollingWords = [];
  }

  private onTranscriptionUpdate(eventArgs: AsrModule.TranscriptionUpdateEvent) {
    const text = eventArgs.text.trim();

    // split into words and keep rolling buffer
    const words = text.split(/\s+/);
    for (const word of words) {
      this.rollingWords.push(word);
      if (this.rollingWords.length > this.MAX_WORDS) {
        this.rollingWords.shift(); // remove oldest
      }
    }

    // update UI with only latest ~10 words
    const display = this.rollingWords.join(" ");
    if (this.debugText) {
      this.debugText.text = "🗣️ " + display;
    }
  }

  private onTranscriptionError(eventArgs: AsrModule.AsrStatusCode) {
    print("ASR Error: " + eventArgs);
    if (this.debugText) {
      this.debugText.text = "⚠️ ASR error: " + eventArgs;
    }
  }
}
