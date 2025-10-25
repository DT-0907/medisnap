const AsrModule = require("LensStudio:AsrModule");

@component
export class ASRLiveTranscriber extends BaseScriptComponent {
  @input
  debugText: Text;

  private asrModule = AsrModule;
  private isActive = false;
  private currentText = "";
  private lastFinalText = "";

  onAwake() {
    if (this.debugText) this.debugText.text = "🎤 Tap to start listening";
  }

  // Call this method from a button press or interaction trigger
  public toggleASR() {
    this.isActive ? this.stopASR() : this.startASR();
  }

  private startASR() {
    this.isActive = true;
    this.currentText = "";
    this.lastFinalText = "";
    if (this.debugText) this.debugText.text = "Listening...";

    const options = this.asrModule.AsrTranscriptionOptions.create();
    options.silenceUntilTerminationMs = 1200;   // 1.2 s pause finalizes sentence
    options.mode = this.asrModule.AsrMode.HighAccuracy;

    options.onTranscriptionUpdateEvent.add((eventArgs) =>
      this.onUpdate(eventArgs)
    );
    options.onTranscriptionErrorEvent.add((error) =>
      this.onError(error)
    );

    this.asrModule.startTranscribing(options);
  }

  private stopASR() {
    this.isActive = false;
    if (this.debugText) this.debugText.text = "Stopped.";
    this.asrModule.stopTranscribing().then(() => print("ASR stopped"));
  }

  private onUpdate(eventArgs: AsrModule.TranscriptionUpdateEvent) {
    // Partial text updates while speaking
    if (!eventArgs.isFinal) {
      this.currentText = eventArgs.text;
      this.updateDisplay(this.lastFinalText + this.currentText);
    }
    // Sentence finalized after short silence
    else {
      this.lastFinalText += eventArgs.text + " ";
      this.currentText = "";
      this.updateDisplay(this.lastFinalText);
    }
  }

  private onError(errorCode: AsrModule.AsrStatusCode) {
    print("ASR Error: " + errorCode);
    if (this.debugText) this.debugText.text = "⚠️ ASR error: " + errorCode;
    this.isActive = false;
  }

  private updateDisplay(text: string) {
    if (this.debugText) this.debugText.text = "🗣️ " + text.trim();
  }
}
