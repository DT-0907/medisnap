import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";
import { MicrophoneASRRecorder } from "./MicrophoneRecorder";


@component
export class PlaybackActivateMicrophoneRecorder extends BaseScriptComponent {
  @input
  microphoneRecorder: MicrophoneRecorder;

  private interactable: Interactable;

  onAwake() {
    this.interactable = this.sceneObject.getComponent(
      Interactable.getTypeName()
    );

    this.interactable.onTriggerStart.add(() => {
      this.microphoneRecorder.playbackRecordedAudio();
    });
  }
}
