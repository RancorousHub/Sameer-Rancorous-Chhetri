// SWizard v12 - Professional Sound Frequency Generator
// ========== Constants ==========
const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

function noteToFreq(note, octave) {
    const idx = NOTE_NAMES.indexOf(note);
    const semitones = (octave - 4) * 12 + (idx - 9);
    return 440 * Math.pow(2, semitones / 12);
}

function frequencyToNote(freq) {
    if (freq < 10 || freq > 20000) return { name: '', cents: 0 };
    const semitones = 12 * Math.log2(freq / 440);
    const rounded = Math.round(semitones);
    const cents = Math.round((semitones - rounded) * 100);
    const noteIndex = ((rounded % 12) + 12) % 12;
    const octave = Math.floor((rounded + 9) / 12) + 4;
    const noteName = NOTE_NAMES[(noteIndex + 9) % 12];
    let display = noteName + octave;
    if (cents !== 0) display += ' ' + (cents > 0 ? '+' : '') + cents + 'c';
    return { name: display, cents: cents };
}

// ========== Presets ==========
const PRESETS = {
    notes: [
        {name:'C2',freq:65.41},{name:'E2',freq:82.41},{name:'A2',freq:110},{name:'C3',freq:130.81},
        {name:'E3',freq:164.81},{name:'G3',freq:196},{name:'A3',freq:220},{name:'C4',freq:261.63},
        {name:'D4',freq:293.66},{name:'E4',freq:329.63},{name:'G4',freq:392},{name:'A4',freq:440},
        {name:'C5',freq:523.25},{name:'E5',freq:659.25},{name:'A5',freq:880},{name:'C6',freq:1046.5}
    ],
    tuning: [
        {name:'A440',freq:440},{name:'A432',freq:432},{name:'A444',freq:444},{name:'A415',freq:415},
        {name:'Bass E',freq:41.2},{name:'Bass A',freq:55},{name:'Bass D',freq:73.42},{name:'Bass G',freq:98},
        {name:'Gtr E2',freq:82.41},{name:'Gtr A2',freq:110},{name:'Gtr D3',freq:146.83},
        {name:'Gtr G3',freq:196},{name:'Gtr B3',freq:246.94},{name:'Gtr E4',freq:329.63}
    ],
    scientific: [
        {name:'20 Hz',freq:20},{name:'50 Hz',freq:50},{name:'100 Hz',freq:100},{name:'200 Hz',freq:200},
        {name:'500 Hz',freq:500},{name:'1 kHz',freq:1000},{name:'2 kHz',freq:2000},{name:'4 kHz',freq:4000},
        {name:'8 kHz',freq:8000},{name:'10 kHz',freq:10000},{name:'12 kHz',freq:12000},
        {name:'15 kHz',freq:15000},{name:'18 kHz',freq:18000},{name:'20 kHz',freq:20000}
    ],
    solfeggio: [
        {name:'UT',freq:396,desc:'Liberation from fear'},
        {name:'RE',freq:417,desc:'Facilitating change'},
        {name:'MI',freq:528,desc:'Transformation & DNA repair'},
        {name:'FA',freq:639,desc:'Connecting relationships'},
        {name:'SOL',freq:741,desc:'Awakening intuition'},
        {name:'LA',freq:852,desc:'Returning to spiritual order'},
        {name:'174 Hz',freq:174,desc:'Pain reduction'},
        {name:'285 Hz',freq:285,desc:'Tissue healing'},
        {name:'963 Hz',freq:963,desc:'Crown activation'}
    ],
    chakra: [
        {name:'Root',freq:256,desc:'Muladhara - grounding'},
        {name:'Sacral',freq:288,desc:'Svadhisthana - creativity'},
        {name:'Solar',freq:320,desc:'Manipura - confidence'},
        {name:'Heart',freq:341.3,desc:'Anahata - love'},
        {name:'Throat',freq:384,desc:'Vishuddha - expression'},
        {name:'Third Eye',freq:426.7,desc:'Ajna - intuition'},
        {name:'Crown',freq:480,desc:'Sahasrara - connection'}
    ],
    healing: [
        {name:'Rife 1',freq:20,desc:'General vitality'},
        {name:'Rife 2',freq:727,desc:'General antiseptic'},
        {name:'Rife 3',freq:787,desc:'General detox'},
        {name:'Rife 4',freq:800,desc:'Pain relief'},
        {name:'Rife 5',freq:880,desc:'Cellular renewal'},
        {name:'Rife 6',freq:10000,desc:'Nerve regeneration'},
        {name:'40 Hz',freq:40,desc:'Gamma brainwave'},
        {name:'111 Hz',freq:111,desc:'Cell regeneration'},
        {name:'285 Hz',freq:285,desc:'Tissue repair'},
        {name:'432 Hz',freq:432,desc:'Universal harmony'},
        {name:'528 Hz',freq:528,desc:'Love frequency'}
    ],
    brainwave: [
        {name:'Delta 0.5',freq:0.5,desc:'Deep sleep'},
        {name:'Delta 2',freq:2,desc:'Healing sleep'},
        {name:'Delta 4',freq:4,desc:'Meditation'},
        {name:'Theta 6',freq:6,desc:'Deep relaxation'},
        {name:'Theta 7.83',freq:7.83,desc:'Schumann resonance'},
        {name:'Alpha 10',freq:10,desc:'Calm focus'},
        {name:'Alpha 12',freq:12,desc:'Relaxed awareness'},
        {name:'Beta 15',freq:15,desc:'Active thinking'},
        {name:'Beta 20',freq:20,desc:'Concentration'},
        {name:'Gamma 40',freq:40,desc:'Peak performance'},
        {name:'Gamma 100',freq:100,desc:'Hyper awareness'}
    ],
    planetary: [
        {name:'Earth',freq:136.1,desc:'OM - year tone'},
        {name:'Sun',freq:126.22,desc:'Vitality'},
        {name:'Moon',freq:210.42,desc:'Emotion'},
        {name:'Mercury',freq:141.27,desc:'Communication'},
        {name:'Venus',freq:221.23,desc:'Love & beauty'},
        {name:'Mars',freq:144.72,desc:'Energy & drive'},
        {name:'Jupiter',freq:183.58,desc:'Growth'},
        {name:'Saturn',freq:147.85,desc:'Structure'},
        {name:'Neptune',freq:211.44,desc:'Spirituality'},
        {name:'Pluto',freq:140.25,desc:'Transformation'}
    ]
};

const CHORD_INTERVALS = {
    major:[0,4,7], minor:[0,3,7], dim:[0,3,6], aug:[0,4,8],
    maj7:[0,4,7,11], min7:[0,3,7,10], dom7:[0,4,7,10],
    sus2:[0,2,7], sus4:[0,5,7], power:[0,7]
};

// ========== Audio Engine ==========
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.analyser = null;
        this.panner = null;
        this.osc = null;
        this.oscR = null;
        this.noiseNode = null;
        this.noiseGain = null;
        this.filterNode = null;
        this.delayNode = null;
        this.delayFeedback = null;
        this.delayMix = null;
        this.delayDry = null;
        this.reverbNode = null;
        this.reverbMix = null;
        this.reverbDry = null;
        this.distortionNode = null;
        this.modOsc = null;
        this.modGain = null;
        this.harmonicOscs = [];
        this.harmonicGains = [];
        this.isoInterval = null;
        this.isPlaying = false;
        this.frequency = 440;
        this.volume = 0.5;
        this.pan = 0;
        this.waveform = 'sine';
        this.binaural = false;
        this.binauralBeat = 10;
        this.harmonicLevels = [100, 0, 0, 0, 0, 0, 0, 0];
        this.adsr = { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.2 };
        this.filterType = 'none';
        this.filterCutoff = 1000;
        this.filterQ = 1;
        this.modType = 'none';
        this.modRate = 5;
        this.modDepth = 0.5;
        this.delayEnabled = false;
        this.delayTime = 0.3;
        this.delayFeedbackVal = 0.4;
        this.delayMixVal = 0.3;
        this.reverbEnabled = false;
        this.reverbSizeVal = 0.5;
        this.reverbDecayVal = 0.5;
        this.reverbMixVal = 0.2;
        this.distortionEnabled = false;
        this.distortionAmount = 20;
        this.noiseType = 'off';
        this.noiseVolume = 0.3;
        this.isoEnabled = false;
        this.isoRate = 10;
        this.isoDuty = 0.5;
        this.layers = [];
        this.layerOscs = [];
        this.sweepId = null;
        this.recorder = null;
        this.recordedChunks = [];
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 4096;
        this.analyser.smoothingTimeConstant = 0.8;
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.volume;
        this.panner = this.ctx.createStereoPanner();
        this.panner.pan.value = this.pan;
        // Chain: source -> filter -> distortion -> delay -> reverb -> panner -> masterGain -> analyser -> dest
        this._buildChain();
    }

    _buildChain() {
        // Disconnect everything first
        try { this.masterGain.disconnect(); } catch(e) {}
        try { this.panner.disconnect(); } catch(e) {}
        try { this.analyser.disconnect(); } catch(e) {}

        this.panner.connect(this.masterGain);
        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
    }

    _getDestination() {
        // Returns the node to connect oscillators to (through effects chain)
        let dest = this.panner;

        if (this.distortionEnabled && this.distortionNode) {
            this.distortionNode.connect(dest);
            dest = this.distortionNode;
        }
        if (this.reverbEnabled && this.reverbNode) {
            // Wet path
            this.reverbDry.connect(this.panner);
            this.reverbNode.connect(this.reverbMix);
            this.reverbMix.connect(this.panner);
            dest = this.reverbDry;
        }
        if (this.delayEnabled && this.delayNode) {
            this.delayDry.connect(dest);
            this.delayNode.connect(this.delayFeedback);
            this.delayFeedback.connect(this.delayNode);
            this.delayNode.connect(this.delayMix);
            this.delayMix.connect(dest);
            dest = this.delayDry;
        }
        if (this.filterType !== 'none' && this.filterNode) {
            this.filterNode.connect(dest);
            dest = this.filterNode;
        }
        return dest;
    }

    play() {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.stop(true);
        this._setupEffects();
        const dest = this._getDestination();
        const now = this.ctx.currentTime;

        if (this.binaural) {
            this._playBinaural(dest, now);
        } else {
            this.osc = this.ctx.createOscillator();
            this.osc.type = this.waveform;
            this.osc.frequency.setValueAtTime(this.frequency, now);
            const oscGain = this.ctx.createGain();
            oscGain.gain.setValueAtTime(0, now);
            oscGain.gain.linearRampToValueAtTime(1, now + this.adsr.attack);
            oscGain.gain.linearRampToValueAtTime(this.adsr.sustain, now + this.adsr.attack + this.adsr.decay);
            this.osc.connect(oscGain);
            oscGain.connect(dest);
            this.osc.start(now);
            this._oscGain = oscGain;
        }

        // Harmonics
        this._playHarmonics(dest, now);
        // Noise
        this._playNoise(dest);
        // Modulation
        this._setupModulation(now);
        // Isochronic
        if (this.isoEnabled) this._startIsochronic();
        // Layers
        this._playLayers(dest, now);

        this.isPlaying = true;
    }

    _playBinaural(dest, now) {
        const half = this.binauralBeat / 2;
        const merger = this.ctx.createChannelMerger(2);
        const gainL = this.ctx.createGain();
        const gainR = this.ctx.createGain();

        this.osc = this.ctx.createOscillator();
        this.osc.type = this.waveform;
        this.osc.frequency.setValueAtTime(this.frequency - half, now);
        this.osc.connect(gainL);
        gainL.connect(merger, 0, 0);

        this.oscR = this.ctx.createOscillator();
        this.oscR.type = this.waveform;
        this.oscR.frequency.setValueAtTime(this.frequency + half, now);
        this.oscR.connect(gainR);
        gainR.connect(merger, 0, 1);

        // Apply ADSR
        const envGain = this.ctx.createGain();
        envGain.gain.setValueAtTime(0, now);
        envGain.gain.linearRampToValueAtTime(1, now + this.adsr.attack);
        envGain.gain.linearRampToValueAtTime(this.adsr.sustain, now + this.adsr.attack + this.adsr.decay);
        merger.connect(envGain);
        envGain.connect(dest);

        this.osc.start(now);
        this.oscR.start(now);
        this._binauralMerger = merger;
        this._binauralGainL = gainL;
        this._binauralGainR = gainR;
        this._oscGain = envGain;
    }

    _playHarmonics(dest, now) {
        this.harmonicOscs = [];
        this.harmonicGains = [];
        for (let i = 1; i < 8; i++) {
            const level = this.harmonicLevels[i] / 100;
            if (level <= 0) continue;
            const osc = this.ctx.createOscillator();
            osc.type = this.waveform;
            osc.frequency.setValueAtTime(this.frequency * (i + 1), now);
            const g = this.ctx.createGain();
            g.gain.value = level * 0.5;
            osc.connect(g);
            g.connect(dest);
            osc.start(now);
            this.harmonicOscs.push(osc);
            this.harmonicGains.push(g);
        }
    }

    _playNoise(dest) {
        if (this.noiseType === 'off') return;
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate white noise base
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        this.noiseNode = this.ctx.createBufferSource();
        this.noiseNode.buffer = buffer;
        this.noiseNode.loop = true;
        this.noiseGain = this.ctx.createGain();
        this.noiseGain.gain.value = this.noiseVolume;

        if (this.noiseType === 'white') {
            this.noiseNode.connect(this.noiseGain);
        } else {
            // Use filters for colored noise
            const filter = this.ctx.createBiquadFilter();
            if (this.noiseType === 'pink') {
                filter.type = 'lowpass';
                filter.frequency.value = 1000;
            } else if (this.noiseType === 'brown') {
                filter.type = 'lowpass';
                filter.frequency.value = 300;
            } else if (this.noiseType === 'blue') {
                filter.type = 'highpass';
                filter.frequency.value = 1000;
            } else if (this.noiseType === 'violet') {
                filter.type = 'highpass';
                filter.frequency.value = 3000;
            }
            this.noiseNode.connect(filter);
            filter.connect(this.noiseGain);
            this._noiseFilter = filter;
        }
        this.noiseGain.connect(dest);
        this.noiseNode.start();
    }

    _setupEffects() {
        // Filter
        if (this.filterType !== 'none') {
            this.filterNode = this.ctx.createBiquadFilter();
            this.filterNode.type = this.filterType;
            this.filterNode.frequency.value = this.filterCutoff;
            this.filterNode.Q.value = this.filterQ;
        }
        // Distortion
        if (this.distortionEnabled) {
            this.distortionNode = this.ctx.createWaveShaper();
            this.distortionNode.curve = this._makeDistortionCurve(this.distortionAmount);
            this.distortionNode.oversample = '4x';
        }
        // Delay
        if (this.delayEnabled) {
            this.delayNode = this.ctx.createDelay(2);
            this.delayNode.delayTime.value = this.delayTime;
            this.delayFeedback = this.ctx.createGain();
            this.delayFeedback.gain.value = this.delayFeedbackVal;
            this.delayMix = this.ctx.createGain();
            this.delayMix.gain.value = this.delayMixVal;
            this.delayDry = this.ctx.createGain();
            this.delayDry.gain.value = 1;
        }
        // Reverb
        if (this.reverbEnabled) {
            this.reverbNode = this.ctx.createConvolver();
            this.reverbNode.buffer = this._createReverbIR();
            this.reverbMix = this.ctx.createGain();
            this.reverbMix.gain.value = this.reverbMixVal;
            this.reverbDry = this.ctx.createGain();
            this.reverbDry.gain.value = 1;
        }
    }

    _setupModulation(now) {
        if (this.modType === 'none' || !this.osc) return;
        this.modOsc = this.ctx.createOscillator();
        this.modOsc.frequency.value = this.modRate;
        this.modGain = this.ctx.createGain();

        if (this.modType === 'am' || this.modType === 'tremolo') {
            this.modGain.gain.value = this.modDepth * 0.5;
            this.modOsc.connect(this.modGain);
            this.modGain.connect(this._oscGain.gain);
        } else if (this.modType === 'fm' || this.modType === 'vibrato') {
            this.modGain.gain.value = this.modDepth * this.frequency * 0.1;
            this.modOsc.connect(this.modGain);
            this.modGain.connect(this.osc.frequency);
        }
        this.modOsc.start(now);
    }

    _startIsochronic() {
        const periodMs = 1000 / this.isoRate;
        const onTime = periodMs * this.isoDuty;
        let isOn = true;
        this.isoInterval = setInterval(() => {
            if (!this.masterGain) return;
            const now = this.ctx.currentTime;
            if (isOn) {
                this.masterGain.gain.setTargetAtTime(0, now, 0.005);
            } else {
                this.masterGain.gain.setTargetAtTime(this.volume, now, 0.005);
            }
            isOn = !isOn;
        }, isOn ? onTime : periodMs - onTime);
    }

    _playLayers(dest, now) {
        this.layerOscs = [];
        for (const layer of this.layers) {
            const osc = this.ctx.createOscillator();
            osc.type = layer.waveform || 'sine';
            osc.frequency.setValueAtTime(layer.freq, now);
            const g = this.ctx.createGain();
            g.gain.value = (layer.volume || 50) / 100;
            osc.connect(g);
            g.connect(dest);
            osc.start(now);
            this.layerOscs.push({ osc, gain: g });
        }
    }

    _makeDistortionCurve(amount) {
        const k = amount * 4;
        const samples = 44100;
        const curve = new Float32Array(samples);
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }

    _createReverbIR() {
        const len = this.ctx.sampleRate * (this.reverbSizeVal * 4 + 0.5);
        const decay = this.reverbDecayVal * 4 + 0.5;
        const buffer = this.ctx.createBuffer(2, len, this.ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            const data = buffer.getChannelData(ch);
            for (let i = 0; i < len; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
            }
        }
        return buffer;
    }

    stop(internal) {
        const toStop = [this.osc, this.oscR, this.modOsc, this.noiseNode, ...this.harmonicOscs, ...this.layerOscs.map(l => l.osc)];
        for (const node of toStop) {
            if (node) { try { node.stop(); } catch(e) {} try { node.disconnect(); } catch(e) {} }
        }
        const toDisconnect = [this._oscGain, this._binauralMerger, this._binauralGainL, this._binauralGainR,
            this.noiseGain, this._noiseFilter, this.filterNode, this.distortionNode,
            this.delayNode, this.delayFeedback, this.delayMix, this.delayDry,
            this.reverbNode, this.reverbMix, this.reverbDry, this.modGain,
            ...this.harmonicGains, ...this.layerOscs.map(l => l.gain)];
        for (const node of toDisconnect) {
            if (node) { try { node.disconnect(); } catch(e) {} }
        }
        this.osc = null; this.oscR = null; this.modOsc = null; this.modGain = null;
        this.noiseNode = null; this.noiseGain = null; this._noiseFilter = null;
        this.filterNode = null; this.distortionNode = null;
        this.delayNode = null; this.delayFeedback = null; this.delayMix = null; this.delayDry = null;
        this.reverbNode = null; this.reverbMix = null; this.reverbDry = null;
        this._oscGain = null; this._binauralMerger = null; this._binauralGainL = null; this._binauralGainR = null;
        this.harmonicOscs = []; this.harmonicGains = []; this.layerOscs = [];

        if (this.isoInterval) { clearInterval(this.isoInterval); this.isoInterval = null; }
        if (!internal) { this.isPlaying = false; this.stopSweep(); }
    }

    setFrequency(freq) {
        this.frequency = Math.max(1, Math.min(20000, freq));
        if (this.isPlaying && this.osc) {
            const now = this.ctx.currentTime;
            if (this.binaural) {
                const half = this.binauralBeat / 2;
                this.osc.frequency.setValueAtTime(this.frequency - half, now);
                if (this.oscR) this.oscR.frequency.setValueAtTime(this.frequency + half, now);
            } else {
                this.osc.frequency.setValueAtTime(this.frequency, now);
            }
            // Update harmonics
            this.harmonicOscs.forEach((osc, i) => {
                osc.frequency.setValueAtTime(this.frequency * (i + 2), now);
            });
        }
    }

    setWaveform(type) {
        this.waveform = type;
        if (this.isPlaying && this.osc) {
            this.osc.type = type;
            if (this.oscR) this.oscR.type = type;
            this.harmonicOscs.forEach(o => o.type = type);
        }
    }

    setVolume(vol) {
        this.volume = vol;
        if (this.masterGain) this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.01);
    }

    setPan(val) {
        this.pan = val;
        if (this.panner) this.panner.pan.setTargetAtTime(val, this.ctx.currentTime, 0.01);
    }

    startSweep(from, to, dur, mode, loop) {
        this.stopSweep();
        if (!this.isPlaying) return;
        const startTime = performance.now();
        const durationMs = dur * 1000;
        const isLog = mode === 'log';
        const logFrom = Math.log2(from);
        const logTo = Math.log2(to);
        const self = this;

        function tick(now) {
            let elapsed = now - startTime;
            let progress = elapsed / durationMs;
            if (progress >= 1) {
                if (loop) {
                    startTime = now;
                    progress = 0;
                } else {
                    self.sweepId = null;
                    app.onSweepEnd();
                    return;
                }
            }
            let freq;
            if (isLog) {
                freq = Math.pow(2, logFrom + (logTo - logFrom) * progress);
            } else {
                freq = from + (to - from) * progress;
            }
            app.setFrequency(freq, true);
            self.sweepId = requestAnimationFrame(tick);
        }
        this.sweepId = requestAnimationFrame(tick);
    }

    stopSweep() {
        if (this.sweepId) { cancelAnimationFrame(this.sweepId); this.sweepId = null; }
    }

    startRecording() {
        if (!this.ctx) return;
        const dest = this.ctx.createMediaStreamDestination();
        this.analyser.connect(dest);
        this.recorder = new MediaRecorder(dest.stream);
        this.recordedChunks = [];
        this.recorder.ondataavailable = e => { if (e.data.size > 0) this.recordedChunks.push(e.data); };
        this.recorder.onstop = () => {
            const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'swizard-recording.webm';
            a.click();
            URL.revokeObjectURL(url);
        };
        this.recorder.start();
    }

    stopRecording() {
        if (this.recorder && this.recorder.state === 'recording') this.recorder.stop();
        this.recorder = null;
    }

    getWaveformData() {
        if (!this.analyser) return null;
        const data = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteTimeDomainData(data);
        return data;
    }

    getSpectrumData() {
        if (!this.analyser) return null;
        const data = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(data);
        return data;
    }
}

// ========== App Controller ==========
const app = {
    engine: new AudioEngine(),
    vizMode: 'waveform',
    activePanel: 'generator',
    activePresetTab: 'notes',
    sweepMode: 'log',
    sweepLoop: false,
    sequence: [],
    seqPlaying: false,
    seqLoop: false,
    seqIndex: 0,
    seqTimeout: null,
    timer: null,
    timerRemaining: 0,
    timerInterval: null,
    spectrogramData: [],
    tunerStream: null,
    tunerAnalyser: null,
    tunerRunning: false,

    init() {
        this.bindPanelTabs();
        this.bindVizTabs();
        this.bindFreqControls();
        this.bindPlayBtn();
        this.bindWaveform();
        this.bindVolumePan();
        this.bindADSR();
        this.buildHarmonics();
        this.bindNoise();
        this.bindFilter();
        this.bindModulation();
        this.bindDelay();
        this.bindReverb();
        this.bindDistortion();
        this.bindBinaural();
        this.bindIsochronic();
        this.bindSweep();
        this.bindLayers();
        this.bindChord();
        this.bindSequencer();
        this.bindTimer();
        this.bindRecorder();
        this.bindTuner();
        this.renderPresets('notes');
        this.buildPiano();
        this.bindCustomPresets();
        this.bindKeyboard();
        this.startVisualization();
        // sync slider
        document.getElementById('freqSlider').value = this.freqToSlider(440);
    },

    // ---- Helpers ----
    sliderToFreq(v) {
        const r = (v - 1) / (20000 - 1);
        return Math.pow(2, Math.log2(1) + r * (Math.log2(20000) - Math.log2(1)));
    },
    freqToSlider(f) {
        const r = (Math.log2(f) - Math.log2(1)) / (Math.log2(20000) - Math.log2(1));
        return 1 + r * (20000 - 1);
    },
    setFrequency(freq, skipSlider) {
        freq = Math.max(1, Math.min(20000, freq));
        this.engine.setFrequency(freq);
        document.getElementById('freqInput').value = freq < 100 ? freq.toFixed(1) : Math.round(freq);
        if (!skipSlider) document.getElementById('freqSlider').value = this.freqToSlider(freq);
        const note = frequencyToNote(freq);
        document.getElementById('noteDisplay').textContent = note.name;
        document.getElementById('vizFreqDisplay').textContent = (freq < 1000 ? freq.toFixed(1) : (freq/1000).toFixed(2) + 'k') + ' Hz';
        document.getElementById('vizNoteDisplay').textContent = note.name;
        this.updateBinauralInfo();
    },
    updateBinauralInfo() {
        if (!this.engine.binaural) return;
        const h = this.engine.binauralBeat / 2;
        document.getElementById('binauralInfo').textContent =
            'Left: ' + (this.engine.frequency - h).toFixed(1) + ' Hz | Right: ' + (this.engine.frequency + h).toFixed(1) + ' Hz';
    },

    // ---- Panel Tabs ----
    bindPanelTabs() {
        document.querySelectorAll('.panel-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('panel-' + tab.dataset.panel).classList.add('active');
                this.activePanel = tab.dataset.panel;
            });
        });
    },

    // ---- Viz Tabs ----
    bindVizTabs() {
        document.querySelectorAll('.viz-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.viz-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.vizMode = tab.dataset.viz;
                this.spectrogramData = [];
            });
        });
    },

    // ---- Frequency ----
    bindFreqControls() {
        const input = document.getElementById('freqInput');
        const slider = document.getElementById('freqSlider');
        input.addEventListener('input', () => {
            const v = parseFloat(input.value);
            if (!isNaN(v)) this.setFrequency(v);
        });
        slider.addEventListener('input', () => {
            this.setFrequency(this.sliderToFreq(parseFloat(slider.value)), true);
        });
        document.querySelectorAll('.fine-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setFrequency(this.engine.frequency + parseFloat(btn.dataset.delta));
            });
        });
    },

    // ---- Play ----
    bindPlayBtn() {
        document.getElementById('playBtn').addEventListener('click', () => this.togglePlay());
    },
    togglePlay() {
        const btn = document.getElementById('playBtn');
        if (this.engine.isPlaying) {
            this.engine.stop();
            btn.classList.remove('playing');
            document.getElementById('playIcon').style.display = '';
            document.getElementById('stopIcon').style.display = 'none';
        } else {
            this.engine.play();
            btn.classList.add('playing');
            document.getElementById('playIcon').style.display = 'none';
            document.getElementById('stopIcon').style.display = '';
        }
    },

    // ---- Waveform ----
    bindWaveform() {
        document.querySelectorAll('.wave-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.wave-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.engine.setWaveform(btn.dataset.wave);
            });
        });
    },

    // ---- Volume & Pan ----
    bindVolumePan() {
        const vol = document.getElementById('volumeSlider');
        const pan = document.getElementById('panSlider');
        vol.addEventListener('input', () => {
            const v = parseInt(vol.value);
            this.engine.setVolume(v / 100);
            document.getElementById('volumeValue').textContent = v + '%';
        });
        pan.addEventListener('input', () => {
            const v = parseInt(pan.value);
            this.engine.setPan(v / 100);
            document.getElementById('panValue').textContent = v === 0 ? 'C' : (v < 0 ? 'L' + Math.abs(v) : 'R' + v);
        });
    },

    // ---- ADSR ----
    bindADSR() {
        const ids = ['attack','decay','sustain','release'];
        ids.forEach(id => {
            const slider = document.getElementById(id + 'Slider');
            slider.addEventListener('input', () => {
                const v = parseFloat(slider.value);
                if (id === 'sustain') {
                    this.engine.adsr.sustain = v / 100;
                    document.getElementById(id + 'Value').textContent = v + '%';
                } else {
                    this.engine.adsr[id] = v / 1000;
                    document.getElementById(id + 'Value').textContent = v + 'ms';
                }
                this.drawADSR();
                if (this.engine.isPlaying) { this.engine.stop(true); this.engine.play(); }
            });
        });
        this.drawADSR();
    },
    drawADSR() {
        const canvas = document.getElementById('adsrCanvas');
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const a = this.engine.adsr;
        const total = a.attack + a.decay + 0.3 + a.release;
        const ax = (a.attack / total) * w;
        const dx = (a.decay / total) * w;
        const sx = (0.3 / total) * w;
        const rx = (a.release / total) * w;
        ctx.moveTo(0, h);
        ctx.lineTo(ax, 4);
        ctx.lineTo(ax + dx, h - a.sustain * (h - 4));
        ctx.lineTo(ax + dx + sx, h - a.sustain * (h - 4));
        ctx.lineTo(ax + dx + sx + rx, h);
        ctx.stroke();
        ctx.fillStyle = 'rgba(99,102,241,0.08)';
        ctx.fill();
    },

    // ---- Harmonics ----
    buildHarmonics() {
        const grid = document.getElementById('harmonicsGrid');
        grid.innerHTML = '';
        for (let i = 0; i < 8; i++) {
            const div = document.createElement('div');
            div.className = 'harmonic-bar';
            const label = document.createElement('label');
            label.textContent = i === 0 ? 'Fund' : 'H' + (i + 1);
            const input = document.createElement('input');
            input.type = 'range';
            input.min = '0'; input.max = '100';
            input.value = i === 0 ? '100' : '0';
            input.dataset.harmonic = i;
            const span = document.createElement('span');
            span.textContent = input.value;
            span.id = 'hVal' + i;
            input.addEventListener('input', () => {
                this.engine.harmonicLevels[i] = parseInt(input.value);
                span.textContent = input.value;
                if (this.engine.isPlaying) { this.engine.stop(true); this.engine.play(); }
            });
            div.appendChild(label);
            div.appendChild(input);
            div.appendChild(span);
            grid.appendChild(div);
        }
    },

    // ---- Noise ----
    bindNoise() {
        document.querySelectorAll('.noise-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.noise-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.engine.noiseType = btn.dataset.noise;
                if (this.engine.isPlaying) { this.engine.stop(true); this.engine.play(); }
            });
        });
        document.getElementById('noiseVolSlider').addEventListener('input', function() {
            app.engine.noiseVolume = parseInt(this.value) / 100;
            document.getElementById('noiseVolValue').textContent = this.value + '%';
            if (app.engine.isPlaying && app.engine.noiseGain) {
                app.engine.noiseGain.gain.value = app.engine.noiseVolume;
            }
        });
    },

    // ---- Filter ----
    bindFilter() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.engine.filterType = btn.dataset.filter;
                if (this.engine.isPlaying) { this.engine.stop(true); this.engine.play(); }
            });
        });
        document.getElementById('filterCutoff').addEventListener('input', function() {
            app.engine.filterCutoff = parseInt(this.value);
            const v = parseInt(this.value);
            document.getElementById('filterCutoffValue').textContent = v >= 1000 ? (v/1000).toFixed(1) + ' kHz' : v + ' Hz';
            if (app.engine.filterNode) app.engine.filterNode.frequency.value = v;
        });
        document.getElementById('filterQ').addEventListener('input', function() {
            app.engine.filterQ = parseInt(this.value) / 10;
            document.getElementById('filterQValue').textContent = (parseInt(this.value) / 10).toFixed(1);
            if (app.engine.filterNode) app.engine.filterNode.Q.value = app.engine.filterQ;
        });
    },

    // ---- Modulation ----
    bindModulation() {
        document.querySelectorAll('.mod-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mod-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.engine.modType = btn.dataset.mod;
                if (this.engine.isPlaying) { this.engine.stop(true); this.engine.play(); }
            });
        });
        document.getElementById('modRate').addEventListener('input', function() {
            app.engine.modRate = parseInt(this.value);
            document.getElementById('modRateValue').textContent = this.value + ' Hz';
            if (app.engine.modOsc) app.engine.modOsc.frequency.value = app.engine.modRate;
        });
        document.getElementById('modDepth').addEventListener('input', function() {
            app.engine.modDepth = parseInt(this.value) / 100;
            document.getElementById('modDepthValue').textContent = this.value + '%';
        });
    },

    // ---- Delay ----
    bindDelay() {
        const toggle = document.getElementById('delayToggle');
        toggle.addEventListener('click', () => {
            this.engine.delayEnabled = !this.engine.delayEnabled;
            toggle.textContent = this.engine.delayEnabled ? 'On' : 'Off';
            toggle.classList.toggle('active', this.engine.delayEnabled);
            if (this.engine.isPlaying) { this.engine.stop(true); this.engine.play(); }
        });
        document.getElementById('delayTime').addEventListener('input', function() {
            app.engine.delayTime = parseInt(this.value) / 1000;
            document.getElementById('delayTimeValue').textContent = this.value + 'ms';
            if (app.engine.delayNode) app.engine.delayNode.delayTime.value = app.engine.delayTime;
        });
        document.getElementById('delayFeedback').addEventListener('input', function() {
            app.engine.delayFeedbackVal = parseInt(this.value) / 100;
            document.getElementById('delayFeedbackValue').textContent = this.value + '%';
            if (app.engine.delayFeedback) app.engine.delayFeedback.gain.value = app.engine.delayFeedbackVal;
        });
        document.getElementById('delayMix').addEventListener('input', function() {
            app.engine.delayMixVal = parseInt(this.value) / 100;
            document.getElementById('delayMixValue').textContent = this.value + '%';
            if (app.engine.delayMix) app.engine.delayMix.gain.value = app.engine.delayMixVal;
        });
    },

    // ---- Reverb ----
    bindReverb() {
        const toggle = document.getElementById('reverbToggle');
        toggle.addEventListener('click', () => {
            this.engine.reverbEnabled = !this.engine.reverbEnabled;
            toggle.textContent = this.engine.reverbEnabled ? 'On' : 'Off';
            toggle.classList.toggle('active', this.engine.reverbEnabled);
            if (this.engine.isPlaying) { this.engine.stop(true); this.engine.play(); }
        });
        document.getElementById('reverbSize').addEventListener('input', function() {
            app.engine.reverbSizeVal = parseInt(this.value) / 100;
            document.getElementById('reverbSizeValue').textContent = this.value + '%';
        });
        document.getElementById('reverbDecay').addEventListener('input', function() {
            app.engine.reverbDecayVal = parseInt(this.value) / 100;
            document.getElementById('reverbDecayValue').textContent = this.value + '%';
        });
        document.getElementById('reverbMix').addEventListener('input', function() {
            app.engine.reverbMixVal = parseInt(this.value) / 100;
            document.getElementById('reverbMixValue').textContent = this.value + '%';
            if (app.engine.reverbMix) app.engine.reverbMix.gain.value = app.engine.reverbMixVal;
        });
    },

    // ---- Distortion ----
    bindDistortion() {
        const toggle = document.getElementById('distortionToggle');
        toggle.addEventListener('click', () => {
            this.engine.distortionEnabled = !this.engine.distortionEnabled;
            toggle.textContent = this.engine.distortionEnabled ? 'On' : 'Off';
            toggle.classList.toggle('active', this.engine.distortionEnabled);
            if (this.engine.isPlaying) { this.engine.stop(true); this.engine.play(); }
        });
        document.getElementById('distortionAmount').addEventListener('input', function() {
            app.engine.distortionAmount = parseInt(this.value);
            document.getElementById('distortionAmountValue').textContent = this.value;
            if (app.engine.distortionNode) app.engine.distortionNode.curve = app.engine._makeDistortionCurve(app.engine.distortionAmount);
        });
    },

    // ---- Binaural ----
    bindBinaural() {
        const toggle = document.getElementById('binauralToggle');
        toggle.addEventListener('click', () => {
            this.engine.binaural = !this.engine.binaural;
            toggle.textContent = this.engine.binaural ? 'On' : 'Off';
            toggle.classList.toggle('active', this.engine.binaural);
            if (this.engine.isPlaying) { this.engine.stop(true); this.engine.play(); }
            this.updateBinauralInfo();
        });
        document.getElementById('binauralBeat').addEventListener('input', function() {
            app.engine.binauralBeat = parseFloat(this.value);
            document.getElementById('binauralBeatValue').textContent = this.value + ' Hz';
            app.updateBinauralInfo();
            if (app.engine.isPlaying && app.engine.binaural) { app.engine.stop(true); app.engine.play(); }
        });
        document.querySelectorAll('.binaural-presets .mini-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const beat = parseFloat(btn.dataset.beat);
                app.engine.binauralBeat = beat;
                document.getElementById('binauralBeat').value = beat;
                document.getElementById('binauralBeatValue').textContent = beat + ' Hz';
                app.updateBinauralInfo();
                if (!app.engine.binaural) {
                    app.engine.binaural = true;
                    document.getElementById('binauralToggle').textContent = 'On';
                    document.getElementById('binauralToggle').classList.add('active');
                }
                if (app.engine.isPlaying) { app.engine.stop(true); app.engine.play(); }
            });
        });
    },

    // ---- Isochronic ----
    bindIsochronic() {
        const toggle = document.getElementById('isoToggle');
        toggle.addEventListener('click', () => {
            this.engine.isoEnabled = !this.engine.isoEnabled;
            toggle.textContent = this.engine.isoEnabled ? 'On' : 'Off';
            toggle.classList.toggle('active', this.engine.isoEnabled);
            if (this.engine.isPlaying) { this.engine.stop(true); this.engine.play(); }
        });
        document.getElementById('isoRate').addEventListener('input', function() {
            app.engine.isoRate = parseInt(this.value);
            document.getElementById('isoRateValue').textContent = this.value + ' Hz';
        });
        document.getElementById('isoDuty').addEventListener('input', function() {
            app.engine.isoDuty = parseInt(this.value) / 100;
            document.getElementById('isoDutyValue').textContent = this.value + '%';
        });
    },

    // ---- Sweep ----
    bindSweep() {
        document.querySelectorAll('[data-sweep-mode]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-sweep-mode]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.sweepMode = btn.dataset.sweepMode;
            });
        });
        document.getElementById('sweepLoopToggle').addEventListener('click', function() {
            app.sweepLoop = !app.sweepLoop;
            this.textContent = app.sweepLoop ? 'On' : 'Off';
            this.classList.toggle('active', app.sweepLoop);
        });
        document.getElementById('sweepBtn').addEventListener('click', () => this.toggleSweep());
    },
    toggleSweep() {
        const btn = document.getElementById('sweepBtn');
        if (this.engine.sweepId) {
            this.engine.stopSweep();
            this.engine.stop();
            this.onSweepEnd();
            return;
        }
        const from = parseFloat(document.getElementById('sweepFrom').value);
        const to = parseFloat(document.getElementById('sweepTo').value);
        const dur = parseFloat(document.getElementById('sweepDuration').value);
        if (isNaN(from) || isNaN(to) || isNaN(dur)) return;
        btn.textContent = 'Stop Sweep';
        btn.classList.add('sweeping');
        if (!this.engine.isPlaying) {
            this.setFrequency(from);
            this.engine.play();
            document.getElementById('playBtn').classList.add('playing');
            document.getElementById('playIcon').style.display = 'none';
            document.getElementById('stopIcon').style.display = '';
        }
        this.engine.startSweep(from, to, dur, this.sweepMode, this.sweepLoop);
    },
    onSweepEnd() {
        document.getElementById('sweepBtn').textContent = 'Start Sweep';
        document.getElementById('sweepBtn').classList.remove('sweeping');
    },

    // ---- Layers ----
    bindLayers() {
        document.getElementById('addLayerBtn').addEventListener('click', () => {
            if (this.engine.layers.length >= 8) return;
            this.engine.layers.push({ freq: 440, volume: 50, waveform: 'sine' });
            this.renderLayers();
            if (this.engine.isPlaying) { this.engine.stop(true); this.engine.play(); }
        });
    },
    renderLayers() {
        const list = document.getElementById('layersList');
        list.innerHTML = '';
        this.engine.layers.forEach((layer, i) => {
            const div = document.createElement('div');
            div.className = 'layer-item';
            div.innerHTML = '<span class="layer-num">' + (i + 1) + '</span>' +
                '<input class="layer-freq" type="number" value="' + layer.freq + '" min="1" max="20000">' +
                '<span style="font-size:0.65rem;color:#8892a8">Hz</span>' +
                '<input class="layer-vol styled-slider" type="range" min="0" max="100" value="' + layer.volume + '">' +
                '<select>' +
                '<option value="sine"' + (layer.waveform === 'sine' ? ' selected' : '') + '>Sin</option>' +
                '<option value="square"' + (layer.waveform === 'square' ? ' selected' : '') + '>Sqr</option>' +
                '<option value="sawtooth"' + (layer.waveform === 'sawtooth' ? ' selected' : '') + '>Saw</option>' +
                '<option value="triangle"' + (layer.waveform === 'triangle' ? ' selected' : '') + '>Tri</option>' +
                '</select>' +
                '<button class="layer-remove">X</button>';
            div.querySelector('.layer-freq').addEventListener('input', function() {
                layer.freq = parseFloat(this.value) || 440;
                if (app.engine.isPlaying) { app.engine.stop(true); app.engine.play(); }
            });
            div.querySelector('.layer-vol').addEventListener('input', function() {
                layer.volume = parseInt(this.value);
            });
            div.querySelector('select').addEventListener('change', function() {
                layer.waveform = this.value;
                if (app.engine.isPlaying) { app.engine.stop(true); app.engine.play(); }
            });
            div.querySelector('.layer-remove').addEventListener('click', () => {
                this.engine.layers.splice(i, 1);
                this.renderLayers();
                if (this.engine.isPlaying) { this.engine.stop(true); this.engine.play(); }
            });
            list.appendChild(div);
        });
    },

    // ---- Chord ----
    bindChord() {
        document.getElementById('playChordBtn').addEventListener('click', () => {
            const root = document.getElementById('chordRoot').value;
            const octave = parseInt(document.getElementById('chordOctave').value);
            const type = document.getElementById('chordType').value;
            const intervals = CHORD_INTERVALS[type] || [0, 4, 7];
            const rootFreq = noteToFreq(root, octave);
            this.engine.layers = intervals.map(semi => ({
                freq: Math.round(rootFreq * Math.pow(2, semi / 12) * 100) / 100,
                volume: 50,
                waveform: this.engine.waveform
            }));
            this.setFrequency(rootFreq);
            this.renderLayers();
            if (this.engine.isPlaying) { this.engine.stop(true); this.engine.play(); }
            else this.togglePlay();
        });
    },

    // ---- Sequencer ----
    bindSequencer() {
        document.getElementById('seqAddBtn').addEventListener('click', () => {
            const freq = parseFloat(document.getElementById('seqFreqInput').value) || 440;
            const dur = parseInt(document.getElementById('seqDurInput').value) || 500;
            this.sequence.push({ freq, dur });
            this.renderSequence();
        });
        document.getElementById('seqPlayBtn').addEventListener('click', () => this.toggleSequence());
        document.getElementById('seqClearBtn').addEventListener('click', () => {
            this.sequence = [];
            this.stopSequence();
            this.renderSequence();
        });
        document.getElementById('seqLoopToggle').addEventListener('click', function() {
            app.seqLoop = !app.seqLoop;
            this.textContent = app.seqLoop ? 'On' : 'Off';
            this.classList.toggle('active', app.seqLoop);
        });
    },
    renderSequence() {
        const list = document.getElementById('sequenceList');
        list.innerHTML = '';
        this.sequence.forEach((step, i) => {
            const div = document.createElement('div');
            div.className = 'seq-item';
            div.id = 'seq-' + i;
            div.innerHTML = '<span>' + (i + 1) + '.</span> <span>' + step.freq + ' Hz</span> <span>' + step.dur + 'ms</span>' +
                '<button class="seq-remove">x</button>';
            div.querySelector('.seq-remove').addEventListener('click', () => {
                this.sequence.splice(i, 1);
                this.renderSequence();
            });
            list.appendChild(div);
        });
    },
    toggleSequence() {
        if (this.seqPlaying) { this.stopSequence(); return; }
        if (this.sequence.length === 0) return;
        this.seqPlaying = true;
        this.seqIndex = 0;
        document.getElementById('seqPlayBtn').textContent = 'Stop';
        document.getElementById('seqPlayBtn').classList.add('sweeping');
        this.playSeqStep();
    },
    playSeqStep() {
        if (!this.seqPlaying || this.seqIndex >= this.sequence.length) {
            if (this.seqLoop && this.seqPlaying) { this.seqIndex = 0; this.playSeqStep(); return; }
            this.stopSequence();
            return;
        }
        const step = this.sequence[this.seqIndex];
        document.querySelectorAll('.seq-item').forEach(el => el.classList.remove('active'));
        const el = document.getElementById('seq-' + this.seqIndex);
        if (el) el.classList.add('active');
        this.setFrequency(step.freq);
        if (!this.engine.isPlaying) this.togglePlay();
        this.seqTimeout = setTimeout(() => {
            this.seqIndex++;
            this.playSeqStep();
        }, step.dur);
    },
    stopSequence() {
        this.seqPlaying = false;
        if (this.seqTimeout) { clearTimeout(this.seqTimeout); this.seqTimeout = null; }
        document.querySelectorAll('.seq-item').forEach(el => el.classList.remove('active'));
        document.getElementById('seqPlayBtn').textContent = 'Play Sequence';
        document.getElementById('seqPlayBtn').classList.remove('sweeping');
    },

    // ---- Timer ----
    bindTimer() {
        document.querySelectorAll('.timer-presets .mini-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const secs = parseInt(btn.dataset.timer);
                this.startTimer(secs);
            });
        });
        document.getElementById('timerCancelBtn').addEventListener('click', () => this.cancelTimer());
    },
    startTimer(secs) {
        this.cancelTimer();
        this.timerRemaining = secs;
        document.getElementById('timerCancelBtn').style.display = '';
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            this.timerRemaining--;
            this.updateTimerDisplay();
            if (this.timerRemaining <= 0) {
                this.cancelTimer();
                if (this.engine.isPlaying) this.togglePlay();
            }
        }, 1000);
    },
    updateTimerDisplay() {
        const m = Math.floor(this.timerRemaining / 60);
        const s = this.timerRemaining % 60;
        document.getElementById('timerDisplay').textContent = m + ':' + (s < 10 ? '0' : '') + s + ' remaining';
    },
    cancelTimer() {
        if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
        document.getElementById('timerDisplay').textContent = 'No timer set';
        document.getElementById('timerCancelBtn').style.display = 'none';
    },

    // ---- Recorder ----
    bindRecorder() {
        document.getElementById('recordBtn').addEventListener('click', () => {
            if (this.engine.recorder && this.engine.recorder.state === 'recording') {
                this.engine.stopRecording();
                document.getElementById('recordBtn').textContent = 'Start Recording';
                document.getElementById('recordBtn').classList.remove('recording');
                document.getElementById('recordStatus').textContent = 'Saved!';
                setTimeout(() => { document.getElementById('recordStatus').textContent = ''; }, 2000);
            } else {
                this.engine.init();
                this.engine.startRecording();
                document.getElementById('recordBtn').textContent = 'Stop & Save';
                document.getElementById('recordBtn').classList.add('recording');
                document.getElementById('recordStatus').textContent = 'Recording...';
            }
        });
    },

    // ---- Tuner ----
    bindTuner() {
        document.getElementById('tunerBtn').addEventListener('click', () => {
            if (this.tunerRunning) { this.stopTuner(); return; }
            this.startTuner();
        });
    },
    startTuner() {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            this.tunerStream = stream;
            this.tunerRunning = true;
            document.getElementById('tunerBtn').textContent = 'Stop Listening';
            document.getElementById('tunerBtn').classList.add('sweeping');
            document.getElementById('tunerDisplay').style.display = '';
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const src = ctx.createMediaStreamSource(stream);
            this.tunerAnalyser = ctx.createAnalyser();
            this.tunerAnalyser.fftSize = 4096;
            src.connect(this.tunerAnalyser);
            this._tunerCtx = ctx;
            this._tunerBuf = new Float32Array(this.tunerAnalyser.fftSize);
            this.tunerLoop();
        }).catch(() => {
            document.getElementById('tunerDisplay').style.display = '';
            document.getElementById('tunerFreq').textContent = 'Mic access denied';
        });
    },
    tunerLoop() {
        if (!this.tunerRunning) return;
        this.tunerAnalyser.getFloatTimeDomainData(this._tunerBuf);
        const freq = this.autoCorrelate(this._tunerBuf, this._tunerCtx.sampleRate);
        if (freq > 0) {
            document.getElementById('tunerFreq').textContent = freq.toFixed(1) + ' Hz';
            const note = frequencyToNote(freq);
            document.getElementById('tunerNote').textContent = note.name;
            document.getElementById('tunerCents').textContent = (note.cents > 0 ? '+' : '') + note.cents + ' cents';
            this.drawTunerMeter(note.cents);
        } else {
            document.getElementById('tunerFreq').textContent = '-- Hz';
            document.getElementById('tunerNote').textContent = '--';
            document.getElementById('tunerCents').textContent = '--';
        }
        requestAnimationFrame(() => this.tunerLoop());
    },
    autoCorrelate(buf, sampleRate) {
        let rms = 0;
        for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
        rms = Math.sqrt(rms / buf.length);
        if (rms < 0.01) return -1;
        const corr = new Float32Array(buf.length);
        for (let lag = 0; lag < buf.length; lag++) {
            let sum = 0;
            for (let i = 0; i < buf.length - lag; i++) sum += buf[i] * buf[i + lag];
            corr[lag] = sum;
        }
        let d = 0;
        while (corr[d] > corr[d + 1]) d++;
        let maxVal = -1, maxPos = -1;
        for (let i = d; i < buf.length; i++) {
            if (corr[i] > maxVal) { maxVal = corr[i]; maxPos = i; }
        }
        if (maxPos <= 0) return -1;
        return sampleRate / maxPos;
    },
    drawTunerMeter(cents) {
        const canvas = document.getElementById('tunerMeter');
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        // Background
        ctx.fillStyle = '#151b2b';
        ctx.fillRect(0, 0, w, h);
        // Center line
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.stroke();
        // Needle
        const x = w / 2 + (cents / 50) * (w / 2);
        ctx.fillStyle = Math.abs(cents) < 5 ? '#22c55e' : (Math.abs(cents) < 15 ? '#f59e0b' : '#ef4444');
        ctx.fillRect(x - 2, 2, 4, h - 4);
    },
    stopTuner() {
        this.tunerRunning = false;
        if (this.tunerStream) { this.tunerStream.getTracks().forEach(t => t.stop()); this.tunerStream = null; }
        if (this._tunerCtx) { this._tunerCtx.close(); this._tunerCtx = null; }
        document.getElementById('tunerBtn').textContent = 'Start Listening';
        document.getElementById('tunerBtn').classList.remove('sweeping');
        document.getElementById('tunerDisplay').style.display = 'none';
    },

    // ---- Presets ----
    renderPresets(tab) {
        const presets = PRESETS[tab];
        const grid = document.getElementById('presetGrid');
        grid.innerHTML = '';
        if (!presets) return;
        presets.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'preset-btn';
            let freqStr = p.freq >= 1000 ? (p.freq / 1000).toFixed(1) + ' kHz' : p.freq + ' Hz';
            let html = '<span class="preset-name">' + p.name + '</span><span class="preset-freq">' + freqStr + '</span>';
            if (p.desc) html += '<span class="preset-desc">' + p.desc + '</span>';
            btn.innerHTML = html;
            btn.addEventListener('click', () => {
                this.setFrequency(p.freq);
                if (!this.engine.isPlaying) this.togglePlay();
                else { this.engine.stop(true); this.engine.play(); }
            });
            grid.appendChild(btn);
        });
        // Bind preset tabs
        document.querySelectorAll('.preset-tab').forEach(t => {
            t.addEventListener('click', () => {
                document.querySelectorAll('.preset-tab').forEach(x => x.classList.remove('active'));
                t.classList.add('active');
                this.activePresetTab = t.dataset.tab;
                this.renderPresets(t.dataset.tab);
            });
        });
    },

    // ---- Piano ----
    buildPiano() {
        const kb = document.getElementById('pianoKeyboard');
        const octave = parseInt(document.getElementById('pianoOctave').value);
        kb.innerHTML = '';
        const whites = ['C','D','E','F','G','A','B'];
        const blackMap = {C:'C#',D:'D#',F:'F#',G:'G#',A:'A#'};
        const blackPositions = {C:1,D:2,F:4,G:5,A:6};
        // White keys
        whites.forEach(note => {
            const key = document.createElement('div');
            key.className = 'piano-key';
            key.textContent = note;
            key.dataset.note = note;
            key.dataset.octave = octave;
            key.addEventListener('mousedown', () => {
                const freq = noteToFreq(note, octave);
                this.setFrequency(freq);
                key.classList.add('active');
                if (!this.engine.isPlaying) this.togglePlay();
                else { this.engine.stop(true); this.engine.play(); }
            });
            key.addEventListener('mouseup', () => key.classList.remove('active'));
            key.addEventListener('mouseleave', () => key.classList.remove('active'));
            // Touch support
            key.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const freq = noteToFreq(note, octave);
                this.setFrequency(freq);
                key.classList.add('active');
                if (!this.engine.isPlaying) this.togglePlay();
                else { this.engine.stop(true); this.engine.play(); }
            });
            key.addEventListener('touchend', () => key.classList.remove('active'));
            kb.appendChild(key);
        });
        // Black keys
        Object.keys(blackMap).forEach(white => {
            const note = blackMap[white];
            const pos = blackPositions[white];
            const key = document.createElement('div');
            key.className = 'piano-key black';
            key.textContent = note;
            key.style.left = ((pos / 7) * 100 - 3.5) + '%';
            key.addEventListener('mousedown', () => {
                const freq = noteToFreq(note, octave);
                this.setFrequency(freq);
                key.classList.add('active');
                if (!this.engine.isPlaying) this.togglePlay();
                else { this.engine.stop(true); this.engine.play(); }
            });
            key.addEventListener('mouseup', () => key.classList.remove('active'));
            key.addEventListener('mouseleave', () => key.classList.remove('active'));
            key.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const freq = noteToFreq(note, octave);
                this.setFrequency(freq);
                key.classList.add('active');
                if (!this.engine.isPlaying) this.togglePlay();
                else { this.engine.stop(true); this.engine.play(); }
            });
            key.addEventListener('touchend', () => key.classList.remove('active'));
            kb.appendChild(key);
        });
        document.getElementById('pianoOctave').addEventListener('change', () => this.buildPiano());
    },

    // ---- Custom Presets ----
    bindCustomPresets() {
        document.getElementById('savePresetBtn').addEventListener('click', () => {
            const name = prompt('Preset name:');
            if (!name) return;
            const presets = JSON.parse(localStorage.getItem('swizard_presets') || '[]');
            presets.push({
                name: name,
                freq: this.engine.frequency,
                waveform: this.engine.waveform,
                volume: this.engine.volume
            });
            localStorage.setItem('swizard_presets', JSON.stringify(presets));
            this.renderCustomPresets();
        });
        this.renderCustomPresets();
    },
    renderCustomPresets() {
        const grid = document.getElementById('customPresetGrid');
        grid.innerHTML = '';
        const presets = JSON.parse(localStorage.getItem('swizard_presets') || '[]');
        presets.forEach((p, i) => {
            const btn = document.createElement('button');
            btn.className = 'preset-btn';
            let freqStr = p.freq >= 1000 ? (p.freq / 1000).toFixed(1) + ' kHz' : Math.round(p.freq) + ' Hz';
            btn.innerHTML = '<span class="preset-name">' + p.name + '</span><span class="preset-freq">' + freqStr + '</span>' +
                '<span class="preset-delete">delete</span>';
            btn.addEventListener('click', (e) => {
                if (e.target.classList.contains('preset-delete')) {
                    presets.splice(i, 1);
                    localStorage.setItem('swizard_presets', JSON.stringify(presets));
                    this.renderCustomPresets();
                    return;
                }
                this.setFrequency(p.freq);
                this.engine.setWaveform(p.waveform || 'sine');
                document.querySelectorAll('.wave-btn').forEach(b => {
                    b.classList.toggle('active', b.dataset.wave === (p.waveform || 'sine'));
                });
                if (!this.engine.isPlaying) this.togglePlay();
            });
            grid.appendChild(btn);
        });
    },

    // ---- Keyboard Shortcuts ----
    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
            if (e.code === 'Space') { e.preventDefault(); this.togglePlay(); }
        });
    },

    // ---- Visualization ----
    startVisualization() {
        const canvas = document.getElementById('mainCanvas');
        const ctx = canvas.getContext('2d');

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        };
        resize();
        window.addEventListener('resize', resize);

        const draw = () => {
            requestAnimationFrame(draw);
            const w = canvas.getBoundingClientRect().width;
            const h = canvas.getBoundingClientRect().height;
            ctx.clearRect(0, 0, w, h);

            // dB display
            const specData = this.engine.getSpectrumData();
            if (specData) {
                let max = 0;
                for (let i = 0; i < specData.length; i++) if (specData[i] > max) max = specData[i];
                const db = max > 0 ? (20 * Math.log10(max / 255)).toFixed(1) : '-Inf';
                document.getElementById('vizDbDisplay').textContent = db + ' dB';
            }

            if (this.vizMode === 'waveform') {
                const data = this.engine.getWaveformData();
                if (!data) return;
                // Grid
                ctx.strokeStyle = 'rgba(30,41,59,0.5)';
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, h/4); ctx.lineTo(w, h/4); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, 3*h/4); ctx.lineTo(w, 3*h/4); ctx.stroke();
                // Waveform
                ctx.beginPath();
                ctx.strokeStyle = '#6366f1';
                ctx.lineWidth = 2;
                const slice = w / data.length;
                for (let i = 0; i < data.length; i++) {
                    const v = data[i] / 128.0;
                    const y = (v * h) / 2;
                    if (i === 0) ctx.moveTo(0, y); else ctx.lineTo(i * slice, y);
                }
                ctx.stroke();
                // Glow
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#6366f1';
                ctx.stroke();
                ctx.shadowBlur = 0;
            } else if (this.vizMode === 'spectrum') {
                if (!specData) return;
                const barCount = 80;
                const step = Math.floor(specData.length / barCount);
                const barW = w / barCount - 1;
                for (let i = 0; i < barCount; i++) {
                    let sum = 0;
                    for (let j = 0; j < step; j++) sum += specData[i * step + j];
                    const avg = sum / step;
                    const barH = (avg / 255) * h;
                    const hue = 240 + (i / barCount) * 80;
                    ctx.fillStyle = 'hsla(' + hue + ',70%,60%,0.85)';
                    ctx.fillRect(i * (barW + 1), h - barH, barW, barH);
                }
            } else if (this.vizMode === 'spectrogram') {
                if (!specData) return;
                // Shift existing data left
                if (this.spectrogramData.length >= w) this.spectrogramData.shift();
                this.spectrogramData.push(new Uint8Array(specData));
                const imgData = ctx.createImageData(1, h);
                for (let x = 0; x < this.spectrogramData.length; x++) {
                    const col = this.spectrogramData[x];
                    const binCount = Math.min(col.length, h);
                    for (let y = 0; y < h; y++) {
                        const binIdx = Math.floor((y / h) * binCount);
                        const val = col[binIdx];
                        const idx = (h - 1 - y) * 4;
                        // Blue to red colormap
                        imgData.data[idx] = val;
                        imgData.data[idx + 1] = val * 0.3;
                        imgData.data[idx + 2] = 255 - val;
                        imgData.data[idx + 3] = 255;
                    }
                    ctx.putImageData(imgData, x, 0);
                }
            }
        };
        draw();
    }
};

// Boot
document.addEventListener('DOMContentLoaded', () => app.init());
