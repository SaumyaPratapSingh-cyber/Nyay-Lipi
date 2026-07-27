import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Radio, Send } from 'lucide-react';

interface AudioRecorderProps {
  onTranscriptGenerated: (liveTranscript: string, diarization: any[], audioFileUrl?: string) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onTranscriptGenerated }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startLiveSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech Recognition API not supported in this browser environment.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN'; // Default to Indic / Hindi dialect

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript.trim()) {
          setLiveTranscript((prev) => (prev ? prev + ' ' + finalTranscript : finalTranscript));
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
    }
  };

  const startMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setRecordedAudioUrl(base64Audio);
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
    } catch (err) {
      console.warn('Microphone audio stream permission denied or unavailable:', err);
    }
  };

  const handleStartRecord = () => {
    setIsRecording(true);
    setTimer(0);
    setLiveTranscript('');
    setRecordedAudioUrl('');
    startLiveSpeechRecognition();
    startMediaRecorder();
  };

  const handleStopRecord = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        // ignore
      }
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const textToEmit = liveTranscript.trim();
      onTranscriptGenerated(textToEmit, [], recordedAudioUrl);
    }, 1200);
  };

  const handleManualTranscriptSubmit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onTranscriptGenerated(liveTranscript.trim(), [], recordedAudioUrl);
    }, 800);
  };

  return (
    <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
      <div className="flex-between" style={{ marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Volume2 size={18} color="var(--primary-gold)" /> Live Ambient Audio Sensor & Speech-to-Text (STT)
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Streams real-time natural interview audio from police officer laptop microphone into the digital witness ledger.
          </p>
        </div>

        <div>
          {!isRecording ? (
            <button className="btn-primary" onClick={handleStartRecord} disabled={isProcessing}>
              <Mic size={16} /> Start Live Audio Stream
            </button>
          ) : (
            <button className="btn-danger" onClick={handleStopRecord}>
              <MicOff size={16} /> Stop & Finalize Speech Stream ({timer}s)
            </button>
          )}
        </div>
      </div>

      {/* CONTINUOUS LIVE TRANSCRIPT WORKSPACE */}
      <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-gold)', borderRadius: '12px', padding: '14px' }}>
        {isRecording && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Radio size={18} color="#ef4444" className="animate-pulse" />
            <span style={{ fontSize: '0.85rem', color: 'var(--primary-gold)', fontWeight: 600 }}>
              LIVE MICROPHONE STREAMING ACTIVE ({timer}s) — Speak naturally in Hindi or English...
            </span>
          </div>
        )}

        {isRecording && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '35px', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', marginBottom: '12px' }}>
            <div className="waveform-bar" style={{ animationDelay: '0.1s' }}></div>
            <div className="waveform-bar" style={{ animationDelay: '0.3s' }}></div>
            <div className="waveform-bar" style={{ animationDelay: '0.5s' }}></div>
            <div className="waveform-bar" style={{ animationDelay: '0.2s' }}></div>
            <div className="waveform-bar" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}

        <div>
          <div className="flex-between" style={{ marginBottom: '4px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Live Ambient Communication Transcript (Real-Time Voice Capture / Verbatim Input):
            </label>
            {liveTranscript && !isRecording && (
              <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={handleManualTranscriptSubmit}>
                <Send size={12} /> Sync Ambient Communication to AI Box
              </button>
            )}
          </div>
          <textarea
            value={liveTranscript}
            onChange={(e) => setLiveTranscript(e.target.value)}
            placeholder="Click 'Start Live Audio Stream' above to speak into microphone... (Or type live conversation verbatim here)"
            rows={4}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid var(--border-card)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>

        {recordedAudioUrl && (
          <div style={{ marginTop: '12px', background: 'rgba(15, 23, 42, 0.8)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-gold)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary-gold)', fontWeight: 600, marginBottom: '4px' }}>
              Recorded Microphone Audio Playback (Ready for Evidence Lock):
            </div>
            <audio controls src={recordedAudioUrl} style={{ width: '100%', height: '36px' }} />
          </div>
        )}
      </div>

      {isProcessing && (
        <div style={{ padding: '12px', marginTop: '12px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-gold)' }}>
          <Sparkles size={18} className="animate-spin" />
          <span>Executing LangGraph AI Engine: Extracting Legal Entities $\rightarrow$ BNS 2023 Penal Mapping $\rightarrow$ Cryptographic Merkle Lock...</span>
        </div>
      )}
    </div>
  );
};
