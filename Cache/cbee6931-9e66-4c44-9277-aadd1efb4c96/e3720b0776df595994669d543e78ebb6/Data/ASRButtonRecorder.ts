const AsrModule = require("LensStudio:AsrModule");

@component
export class ASRLiveTranscriber extends BaseScriptComponent {
  @input
  debugText: Text;

  private asrModule = AsrModule;
  private isActive = false;
  private currentText = "";
  private finalText = "";

  onAwake() {
    if (this.debugText) this.debugText.text = "🎤 Tap to start listening";
  }

  public toggleASR() {
    this.isActive ? this.stopASR() : this.startASR();
  }

  private startASR() {
    this.isActive = true;
    this.currentText = "";
    this.finalText = "";
    if (this.debugText) this.debugText.text = "Listening...";

    const opts = this.asrModule.AsrTranscriptionOptions.create();
    opts.silenceUntilTerminationMs = 1200;
    opts.mode = this.asrModule.AsrMode.HighAccuracy;

    opts.onTranscriptionUpdateEvent.add(e => this.onUpdate(e));
    opts.onTranscriptionErrorEvent.add(e => this.onError(e));

    this.asrModule.startTranscribing(opts);
  }

  private stopASR() {
    this.isActive = false;
    if (this.debugText) this.debugText.text = "Stopped.";
    this.asrModule.stopTranscribing();
  }

  private onUpdate(e: AsrModule.TranscriptionUpdateEvent) {
    if (!e.isFinal) {
      this.currentText = e.text;
    } else {
      this.finalText += e.text + " ";
      this.currentText = "";
    }
    this.updateDisplay(this.finalText + this.currentText);
  }

  private onError(code: AsrModule.AsrStatusCode) {
    print("ASR error " + code);
    if (this.debugText) this.debugText.text = "⚠️ ASR error: " + code;
  }

  private updateDisplay(text: string) {
    if (this.debugText) this.debugText.text = "🗣️ " + text.trim();
  }
}
