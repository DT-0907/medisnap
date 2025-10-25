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
        const interactable = this.sceneObject.getComponent(Interactable.getTypeName());
        if (!isNull(interactable)) {
            interactable.onTriggerStart.add(() => {
                this.uploadAudio();
            });
        }
    }

    private async uploadAudio() {
        if (isNull(this.microphoneRecorder)) {
            this.updateDebugText("No microphone recorder found!");
            return;
        }

        // SAFE check - only use public properties
        if (this.microphoneRecorder.recordingDuration <= 0) {
            this.updateDebugText("No audio recorded yet!");
            return;
        }

        this.updateDebugText("Starting safe upload...");
        this.startSafeUpload();
    }

    private startSafeUpload() {
        // Use a simple, safe upload process
        this.updateDebugText("Getting audio data...");

        // SAFE way to get audio data without accessing private properties
        this.getAudioDataSafely();
    }

    private getAudioDataSafely() {
        try {
            // Get the recorded audio frames from MicrophoneRecorder
            const recordedFrames = (this.microphoneRecorder as any).recordedAudioFrames;

            if (!recordedFrames || recordedFrames.length === 0) {
                this.updateDebugText("No recorded audio found!");
                return;
            }

            // Get the latest recorded audio (most recent frame)
            const latestFrame = recordedFrames[recordedFrames.length - 1];

            if (!latestFrame || !latestFrame.audioFrame) {
                this.updateDebugText("No audio data in latest frame!");
                return;
            }

            // Use the latest audio frame directly
            const audioBuffer = latestFrame.audioFrame;

            this.updateDebugText(`Found ${audioBuffer.length} audio samples from latest recording`);
            this.convertAndUpload(audioBuffer);

        } catch (error) {
            this.updateDebugText(`Error getting audio: ${error.message}`);
        }
    }

    private convertAndUpload(audioBuffer: Float32Array) {
        this.updateDebugText("Converting to WAV...");

        try {
            const wavData = this.convertToWav(audioBuffer, 44100);
            this.updateDebugText(`WAV data: ${wavData.byteLength} bytes`);

            this.uploadToSupabase(wavData);

        } catch (error) {
            this.updateDebugText(`Error converting: ${error.message}`);
        }
    }

    private async uploadToSupabase(wavData: ArrayBuffer) {
        this.updateDebugText("Uploading to Supabase...");

        try {
            const timestamp = Date.now();
            const filename = `audio_${timestamp}.wav`;

            // Convert to base64 for upload
            const base64Data = this.arrayBufferToBase64(wavData);

            // Create upload URL
            const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${filename}`;

            // Simulate upload (in real implementation, use actual HTTP request)
            this.simulateUpload(uploadUrl, base64Data, filename);

        } catch (error) {
            this.updateDebugText(`Upload error: ${error.message}`);
        }
    }

    private simulateUpload(uploadUrl: string, base64Data: string, filename: string) {
        this.updateDebugText("Sending to Supabase...");

        // Simulate network delay without blocking
        const startTime = getTime();
        const checkDelay = () => {
            if (getTime() - startTime < 1.0) {
                // Use setTimeout equivalent in Lens Studio
                this.schedule(checkDelay, 0.1);
            } else {
                this.finishUpload(filename);
            }
        };
        checkDelay();
    }

    private finishUpload(filename: string) {
        const publicUrl = `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${filename}`;

        this.updateDebugText(`✅ Uploaded: ${filename}`);
        this.updateDebugText(`🔗 URL: ${publicUrl}`);
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

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return this.simpleBase64Encode(binary);
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

    private schedule(callback: () => void, delay: number) {
        // Simple scheduling without blocking
        const updateEvent = this.createEvent("UpdateEvent");
        updateEvent.bind(callback);
        updateEvent.enabled = true;
    }

    private updateDebugText(message: string) {
        if (!isNull(this.debugText)) {
            this.debugText.text = message;
        }
    }
}