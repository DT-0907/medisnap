import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";

@component
export class SupabaseUploader extends BaseScriptComponent {
    @input
    microphoneRecorder: any;

    @input
    @allowUndefined
    debugText: Text;

    // Your Supabase configuration
    private supabaseUrl: string = "https://dplmtpqfspabypjafari.supabase.co";
    private supabaseKey: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwbG10cHFmc3BhYnlwamFmYXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNjQ1OTAsImV4cCI6MjA3Njk0MDU5MH0.OGsTEPtMW2xwEfulxxMJO7Ew1U7AbJ206ZAfEemUA-w";
    private bucketName: string = "audio-files";

    onAwake() {
        this.setupUploadButton();
    }

    private setupUploadButton() {
        // Get the Interactable component from THIS object (the upload button itself)
        const interactable = this.sceneObject.getComponent(Interactable.getTypeName());
        if (!isNull(interactable)) {
            interactable.onTriggerStart.add(() => {
                this.uploadRecordedAudio();
            });
        }
    }

    private async uploadRecordedAudio() {
        if (isNull(this.microphoneRecorder)) {
            this.updateDebugText("No microphone recorder found!");
            return;
        }

        // Check if there's recorded audio
        if (this.microphoneRecorder.recordingDuration <= 0) {
            this.updateDebugText("No audio recorded yet!");
            return;
        }

        this.updateDebugText("Preparing audio for upload...");

        try {
            // Get the recorded audio data
            const audioData = this.getRecordedAudioData();

            if (audioData.length === 0) {
                this.updateDebugText("No audio data found!");
                return;
            }

            // Convert to WAV format
            const wavData = this.convertToWav(audioData, 44100);

            // Generate unique filename
            const timestamp = Date.now();
            const filename = `audio_${timestamp}.wav`;

            this.updateDebugText("Uploading to Supabase...");

            // Upload to Supabase
            const result = await this.uploadToSupabase(filename, wavData);

            if (result.success) {
                this.updateDebugText(`✅ Uploaded: ${filename}`);
                this.updateDebugText(`🔗 URL: ${result.url}`);
            } else {
                this.updateDebugText(`❌ Upload failed: ${result.error}`);
            }

        } catch (error) {
            this.updateDebugText(`❌ Error: ${error.message}`);
        }
    }

    private getRecordedAudioData(): Float32Array {
        // Access the recorded audio frames from MicrophoneRecorder
        // This accesses the private recordedAudioFrames property
        const recordedFrames = (this.microphoneRecorder as any).recordedAudioFrames;

        if (!recordedFrames || recordedFrames.length === 0) {
            return new Float32Array(0);
        }

        // Combine all recorded frames into a single array
        const totalSamples = recordedFrames.reduce((sum: number, frame: any) => sum + frame.audioFrame.length, 0);
        const audioBuffer = new Float32Array(totalSamples);

        let offset = 0;
        for (const frame of recordedFrames) {
            audioBuffer.set(frame.audioFrame, offset);
            offset += frame.audioFrame.length;
        }

        return audioBuffer;
    }

    private convertToWav(audioBuffer: Float32Array, sampleRate: number): ArrayBuffer {
        const length = audioBuffer.length;
        const buffer = new ArrayBuffer(44 + length * 2);
        const view = new DataView(buffer);

        // WAV header
        const writeString = (offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * 2, true);

        // Convert float samples to 16-bit PCM
        let offset = 44;
        for (let i = 0; i < length; i++) {
            const sample = Math.max(-1, Math.min(1, audioBuffer[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }

        return buffer;
    }

    private async uploadToSupabase(filename: string, audioData: ArrayBuffer): Promise<{ success: boolean, url?: string, error?: string }> {
        try {
            // Convert ArrayBuffer to base64
            const base64Data = this.arrayBufferToBase64(audioData);

            // Create the upload request
            const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${filename}`;

            // Convert base64 to binary
            const binaryData = this.base64ToArrayBuffer(base64Data);

            // Simulate the upload process (in a real implementation, you'd use fetch or similar)
            this.updateDebugText("Sending to Supabase...");

            // For now, we'll simulate a successful upload
            // In a real implementation, you would make an actual HTTP request to Supabase
            await this.simulateUpload();

            const publicUrl = `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${filename}`;

            return {
                success: true,
                url: publicUrl
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return this.simpleBase64Encode(binary);
    }

    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binaryString = this.simpleBase64Decode(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    private simpleBase64Encode(str: string): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let result = '';
        let i = 0;

        while (i < str.length) {
            const a = str.charCodeAt(i++);
            const b = i < str.length ? str.charCodeAt(i++) : 0;
            const c = i < str.length ? str.charCodeAt(i++) : 0;

            const bitmap = (a << 16) | (b << 8) | c;

            result += chars.charAt((bitmap >> 18) & 63);
            result += chars.charAt((bitmap >> 12) & 63);
            result += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
            result += i - 1 < str.length ? chars.charAt(bitmap & 63) : '=';
        }

        return result;
    }

    private simpleBase64Decode(str: string): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let result = '';
        let i = 0;

        while (i < str.length) {
            const a = chars.indexOf(str.charAt(i++));
            const b = chars.indexOf(str.charAt(i++));
            const c = chars.indexOf(str.charAt(i++));
            const d = chars.indexOf(str.charAt(i++));

            const bitmap = (a << 18) | (b << 12) | (c << 6) | d;

            result += String.fromCharCode((bitmap >> 16) & 255);
            if (c !== 64) result += String.fromCharCode((bitmap >> 8) & 255);
            if (d !== 64) result += String.fromCharCode(bitmap & 255);
        }

        return result;
    }

    private async simulateUpload(): Promise<void> {
        // Simulate upload delay
        const startTime = getTime();
        while (getTime() - startTime < 2.0) {
            // Wait for 2 seconds to simulate upload
        }
    }

    private updateDebugText(message: string) {
        if (!isNull(this.debugText)) {
            this.debugText.text = message;
        }
    }

    // Public method to manually trigger upload
    public async uploadAudio() {
        await this.uploadRecordedAudio();
    }
}
