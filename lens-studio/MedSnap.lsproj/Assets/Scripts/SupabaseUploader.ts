import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";

@component
export class SupabaseUploader extends BaseScriptComponent {
    @input microphoneRecorder: any;
    @input @allowUndefined debugText: Text;

    // hard-coded Supabase + API Spec ID
    private supabaseUrl: string = "https://dplmtpqfspabypjafari.supabase.co";
    private bucketName: string = "audio-uploads";
    private apiSpecId: string = "b57dee7b-7513-4fe2-8a51-14cf0a67f501"; // 👈 your Snap API Spec ID

    onAwake() {
        this.setupUploadButton();
    }

    private setupUploadButton() {
        const interactable = this.sceneObject.getComponent(Interactable.getTypeName());
        if (!isNull(interactable)) {
            interactable.onTriggerStart.add(() => this.uploadAudio());
        }
    }

    private async uploadAudio() {
        if (isNull(this.microphoneRecorder) || this.microphoneRecorder.recordingDuration <= 0) {
            this.updateDebugText("No audio recorded!");
            return;
        }
        this.updateDebugText("Preparing upload…");
        const recordedFrames = (this.microphoneRecorder as any).recordedAudioFrames;
        if (!recordedFrames || recordedFrames.length === 0) {
            this.updateDebugText("No audio data!");
            return;
        }
        const latest = recordedFrames[recordedFrames.length - 1];
        if (!latest || !latest.audioFrame) {
            this.updateDebugText("Invalid audio frame!");
            return;
        }
        const wav = this.convertToWav(latest.audioFrame, 44100);
        await this.uploadToSupabase(wav);
    }

    private convertToWav(audioBuffer: Float32Array, sampleRate: number): ArrayBuffer {
        const len = audioBuffer.length;
        const buf = new ArrayBuffer(44 + len * 2);
        const view = new DataView(buf);
        const write = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
        write(0, "RIFF");
        view.setUint32(4, 36 + len * 2, true);
        write(8, "WAVE");
        write(12, "fmt ");
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        write(36, "data");
        view.setUint32(40, len * 2, true);
        let o = 44;
        for (let i = 0; i < len; i++) {
            const s = Math.max(-1, Math.min(1, audioBuffer[i]));
            view.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            o += 2;
        }
        return buf;
    }

    private arrayBufferToBase64(buf: ArrayBuffer): string {
        const bytes = new Uint8Array(buf);
        let bin = "";
        for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
        return this.simpleBase64Encode(bin);
    }
    private simpleBase64Encode(str: string): string {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let res = "", i = 0;
        while (i < str.length) {
            const a = str.charCodeAt(i++), b = i < str.length ? str.charCodeAt(i++) : 0, c = i < str.length ? str.charCodeAt(i++) : 0;
            const bits = (a << 16) | (b << 8) | c;
            res += chars[(bits >> 18) & 63];
            res += chars[(bits >> 12) & 63];
            res += i - 2 < str.length ? chars[(bits >> 6) & 63] : "=";
            res += i - 1 < str.length ? chars[bits & 63] : "=";
        }
        return res;
    }

    private async uploadToSupabase(wav: ArrayBuffer) {
        this.updateDebugText("Uploading…");
        try {
            const ts = Date.now();
            const file = `audio_${ts}.wav`;
            const url = `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${file}`;
            const headers = { "Content-Type": "audio/wav", "Cache-Control": "no-cache" };
            const base64 = this.arrayBufferToBase64(wav);
            const result = await this.callSnapApi(url, "POST", base64, headers);
            if (result) {
                this.updateDebugText(`✅ Uploaded: ${file}`);
                this.updateDebugText(`${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${file}`);
            } else this.updateDebugText("❌ Upload failed");
        } catch (e) { this.updateDebugText(`Error: ${e.message}`); }
    }

    private async callSnapApi(url: string, method: string, data: string, headers: any): Promise<boolean> {
        try {
            const req = (global as any).RemoteApiRequest.create();
            req.apiSpecId = this.apiSpecId;              // 👈 directly uses your API Spec ID
            req.endpoint = "upload_audio";
            req.parameters = { url, method, headers, body: data };

            const res = await new Promise<any>((resolve) => {
                (global as any).RemoteServiceModule.performApiRequest(req, (r: any) => resolve(r));
            });
            return res && res.statusCode === 1;
        } catch (e) {
            this.updateDebugText(`HTTP Error: ${e.message}`);
            return false;
        }
    }

    private updateDebugText(msg: string) {
        if (!isNull(this.debugText)) this.debugText.text = msg;
    }
}
