const asrModule = require('LensStudio:AsrModule');

type AudioFrameData = {
  audioFrame: Float32Array;
  audioFrameShape: vec3;
};

const SAMPLE_RATE = 44100;

@component
export class MicrophoneASRRecorder extends BaseScriptComponent {
  @input
  microphoneAsset: AudioTrackAsset;

  @input
  audioOutput: AudioTrackAsset;

  @input
  @allowUndefined
  debugText: Text;

  private audioComponent: AudioComponent;
  private recordAudioUpdateEvent: UpdateEvent;
  private playbackAudioUpdateEvent: UpdateEvent;
  private microphoneControl: MicrophoneAudioProvider;
  private audioOutputProvider: AudioOutputProvider;
  private recordedAudioFrames: AudioFrameData[] = [];
  private numberOfSamples: number = 0;
  private _recordingDuration: number = 0;
  private currentPlaybackTime: number = 0;

  // ASR
  private asrModule = asrModule;
  private currentTranscript: string = "";

  onAwake() {
    // Setup microphone
    this.microphoneControl = this.microphoneAsset
      .control as MicrophoneAudioProvider;
    this.microphoneControl.sampleRate = SAMPLE_RATE;

    this.audioComponent = this.sceneObject.createComponent("AudioComponent");
    this.audioComponent.audioTrack = this.audioOutput;
    this.audioOutputProvider = this.audioOutput.control as AudioOutputProvider;
    this.audioOutputProvider.sampleRate = SAMPLE_RATE;

    // Recording events
    this.recordAudioUpdateEvent = this.createEvent("UpdateEvent");
    this.recordAudioUpdateEvent.bind(() => this.onRecordAudio());
    this.recordAudioUpdateEvent.enabled = false;

    // Playback events
    this.playbackAudioUpdateEvent = this.createEvent("UpdateEvent");
    this.playbackAudioUpdateEvent.bind(() => this.onPlaybackAudio());
    this.playbackAudioUpdateEvent.enabled = false;

    // Start ASR
    this.startASR();
  }

  private startASR() {
    const options = asrModule.AsrTranscriptionOptions.create();
    options.silenceUntilTerminationMs = 1000;
    options.mode = asrModule.AsrMode.HighAccuracy;

    options.onTranscriptionUpdateEvent.add((eventArgs) => {
      this.onTranscriptionUpdate(eventArgs);
    });
    options.onTranscriptionErrorEvent.add((eventArgs) => {
      this.onTranscriptionError(eventArgs);
    });

    this.asrModule.startTranscribing(options);
  }

  private onTranscriptionUpdate(eventArgs: AsrModule.TranscriptionUpdateEvent) {
    const text = eventArgs.text;
    this.currentTranscript = text;
    this.updateRecordingDebugText();
  }

  private onTranscriptionError(eventArgs: AsrModule.AsrStatusCode) {
    print(`ASR error: ${eventArgs}`);
  }

  private onRecordAudio() {
    let frameSize = this.microphoneControl.maxFrameSize;
    let audioFrame = new Float32Array(frameSize);
    const audioFrameShape = this.microphoneControl.getAudioFrame(audioFrame);

    if (audioFrameShape.x === 0) return;

    audioFrame = audioFrame.subarray(0, audioFrameShape.x);
    this.numberOfSamples += audioFrameShape.x;
    this._recordingDuration = this.numberOfSamples / SAMPLE_RATE;

    this.recordedAudioFrames.push({
      audioFrame: audioFrame,
      audioFrameShape: audioFrameShape,
    });

    this.updateRecordingDebugText();
  }

  private onPlaybackAudio() {
    this.currentPlaybackTime += getDeltaTime();
    this.currentPlaybackTime = Math.min(
      this.currentPlaybackTime,
      this._recordingDuration
    );
    this.updatePlaybackDebugText();

    if (this.currentPlaybackTime >= this._recordingDuration) {
      this.audioComponent.stop(false);
      this.playbackAudioUpdateEvent.enabled = false;
    }
  }

  private updateRecordingDebugText() {
    if (isNull(this.debugText)) return;

    let baseText =
      "Duration: " + this._recordingDuration.toFixed(1) + "s" +
      "\nSize: " + (this.getTotalRecordedBytes() / 1000).toFixed(1) + "kB" +
      "\nSample Rate: " + SAMPLE_RATE;

    if (this.currentTranscript && this.currentTranscript.length > 0) {
      baseText += "\n\n🗣️ Transcript:\n" + this.currentTranscript;
    }

    this.debugText.text = baseText;
  }

  private updatePlaybackDebugText() {
    if (this.numberOfSamples <= 0) {
      this.debugText.text = "No audio recorded.";
      return;
    }
    this.debugText.text =
      "Playback Time: " +
      this.currentPlaybackTime.toFixed(1) +
      "s / " +
      this._recordingDuration.toFixed(1) +
      "s";
  }

  recordMicrophoneAudio(toRecord: boolean) {
    if (toRecord) {
      this.recordedAudioFrames = [];
      this.audioComponent.stop(false);
      this.numberOfSamples = 0;
      this.microphoneControl.start();
      this.recordAudioUpdateEvent.enabled = true;
      this.playbackAudioUpdateEvent.enabled = false;
    } else {
      this.microphoneControl.stop();
      this.recordAudioUpdateEvent.enabled = false;
    }
  }

  playbackRecordedAudio(): boolean {
    this.updatePlaybackDebugText();
    if (this.recordedAudioFrames.length <= 0) return false;
    this.currentPlaybackTime = 0;
    this.audioComponent.stop(false);
    this.playbackAudioUpdateEvent.enabled = true;
    this.audioComponent.play(-1);
    for (let i = 0; i < this.recordedAudioFrames.length; i++) {
      this.audioOutputProvider.enqueueAudioFrame(
        this.recordedAudioFrames[i].audioFrame,
        this.recordedAudioFrames[i].audioFrameShape
      );
    }
    return true;
  }

  private getTotalRecordedBytes(): number {
    let totalBytes = 0;
    for (const frame of this.recordedAudioFrames) {
      totalBytes += frame.audioFrame.byteLength;
    }
    return totalBytes;
  }
}
