// @input Component.ScriptComponent microphoneRecorder
// @input Component.Text debugText

const AsrModule = require('LensStudio:AsrModule');

@component
export class ASRButtonRecorder extends BaseScriptComponent {
  private asrModule = AsrModule;
  private isListening = false;
  private micRecorder: any;
  private debugText: Text;

  onAwake() {
    this.micRecorder = this.microphoneRecorder.api;
    this.debugText = this.debugText;

    const interaction = this.getComponent("InteractionComponent");
    if (!interaction) {
      print("⚠️ InteractionComponent missing on button!");
      return;
    }

    interaction.onTouchStart.add(() => this.toggleASR());
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

    // Start mic
    if (this.micRecorder && this.micRecorder.recordMicrophoneAudio) {
      this.micRecorder.recordMicrophoneAudio(true);
    }

    // Configure ASR
    const options = AsrModule.AsrTranscriptionOptions.create();
    options.silenceUntilTerminationMs = 1000;
    options.mode = AsrModule.AsrMode.HighAccuracy;

    options.onTranscriptionUpdateEvent.add((eventArgs) =>
      this.onTranscriptionUpdate(eventArgs)
    );
    options.onTranscriptionErrorEvent.add((eventArgs) =>
      this.onTranscriptionError(eventArgs)
    );

    this.asrModule.startTranscribing(options);
  }

  private stopASR() {
    print("🛑 Stopping ASR + mic...");
    if (this.debugText) this.debugText.text = "Stopped.";

    if (this.micRecorder && this.micRecorder.recordMicrophoneAudio) {
      this.micRecorder.recordMicrophoneAudio(false);
    }

    this.asrModule.stopTranscribing().then(() => {
      print("ASR stopped.");
    });
  }

  private onTranscriptionUpdate(eventArgs: AsrModule.TranscriptionUpdateEvent) {
    // Display only the finalized sentence
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
