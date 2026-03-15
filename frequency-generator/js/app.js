// ========== Note/Frequency Mapping ==========
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function frequencyToNote(freq) {
    if (freq < 16.35 || freq > 20000) return '';
    const semitones = 12 * Math.log2(freq / 440);
    const rounded = Math.round(semitones);
    const cents = Math.round((semitones - rounded) * 100);
    const noteIndex = ((rounded % 12) + 12) % 12;
    const octave = Math.floor((rounded + 9) / 12) + 4;
    const noteName = NOTE_NAMES[(noteIndex + 9) % 12];
    let display = `${noteName}${octave}`;
    if (cents !== 0) {
        display += ` ${cents > 0 ? '+' : ''}${cents}c`;
    }
    return display;
}

// ========== Presets ==========
const PRESETS = {
    notes: [
        { name: 'C2', freq: 65.41 }, { name: 'E2', freq: 82.41 },
        { name: 'A2', freq: 110 }, { name: 'C3', freq: 130.81 },
        { name: 'E3', freq: 164.81 }, { name: 'G3', freq: 196 },
        { name: 'A3', freq: 220 }, { name: 'C4', freq: 261.63 },
        { name: 'D4', freq: 293.66 }, { name: 'E4', freq: 329.63 },
        { name: 'G4', freq: 392 }, { name: 'A4', freq: 440 },
        { name: 'C5', freq: 523.25 }, { name: 'E5', freq: 659.25 },
        { name: 'A5', freq: 880 }, { name: 'C6', freq: 1046.5 },
    ],
    tuning: [
        { name: 'A440', freq: 440 }, { name: 'A432', freq: 432 },
        { name: 'A444', freq: 444 }, { name: 'A415', freq: 415 },
        { name: 'Bass E', freq: 41.2 }, { name: 'Bass A', freq: 55 },
        { name: 'Bass D', freq: 73.42 }, { name: 'Bass G', freq: 98 },
        { name: 'Gtr E2', freq: 82.41 }, { name: 'Gtr A2', freq: 110 },
        { name: 'Gtr D3', freq: 146.83 }, { name: 'Gtr G3', freq: 196 },
        { name: 'Gtr B3', freq: 246.94 }, { name: 'Gtr E4', freq: 329.63 },
    ],
    scientific: [
        { name: '20 Hz', freq: 20 }, { name: '50 Hz', freq: 50 },
        { name: '100 Hz', freq: 100 }, { name: '200 Hz', freq: 200 },
        { name: '500 Hz', freq: 500 }, { name: '1 kHz', freq: 1000 },
        { name: '2 kHz', freq: 2000 }, { name: '4 kHz', freq: 4000 },
        { name: '8 kHz', freq: 8000 }, { name: '10 kHz', freq: 10000 },
        { name: '12 kHz', freq: 12000 }, { name: '15 kHz', freq: 15000 },
        { name: '18 kHz', freq: 18000 }, { name: '20 kHz', freq: 20000 },
    ],
    binaural: [
        { name: 'Delta 2Hz', freq: 200, beat: 2 },
        { name: 'Delta 3Hz', freq: 200, beat: 3 },
        { name: 'Theta 6Hz', freq: 200, beat: 6 },
        { name: 'Theta 7Hz', freq: 200, beat: 7 },
        { name: 'Alpha 10Hz', freq: 200, beat: 10 },
        { name: 'Alpha 12Hz', freq: 200, beat: 12 },
        { name: 'Beta 20Hz', freq: 200, beat: 20 },
        { name: 'Beta 25Hz', freq: 200, beat: 25 },
        { name: 'Gamma 40Hz', freq: 200, beat: 40 },
    ],
};

// ========== Audio Engine ==========
class FrequencyGenerator {
    constructor() {
        this.audioCtx = null;
        this.oscillator = null;
        this.oscillatorR = null; // for binaural right channel
        this.gainNode = null;
        this.analyser = null;
        this.merger = null;
        this.splitter = null;
        this.isPlaying = false;
        this.isBinaural = false;
        this.frequency = 440;
        this.waveform = 'sine';
        this.volume = 0.5;
        this.binauralBeat = 10;
        this.sweepInterval = null;
    }

    init() {
        if (this.audioCtx) return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) {
            alert('Your browser does not support the Web Audio API. Please use a modern browser.');
            return;
        }
        this.audioCtx = new AudioCtx();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8;
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.value = this.volume;
        this.gainNode.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
    }

    play() {
        this.init();
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        this.stop(true);

        if (this.isBinaural) {
            this._playBinaural();
        } else {
            this.oscillator = this.audioCtx.createOscillator();
            this.oscillator.type = this.waveform;
            this.oscillator.frequency.setValueAtTime(this.frequency, this.audioCtx.currentTime);
            this.oscillator.connect(this.gainNode);
            this.oscillator.start();
        }

        this.isPlaying = true;
    }

    _playBinaural() {
        const halfBeat = this.binauralBeat / 2;
        const freqL = this.frequency - halfBeat;
        const freqR = this.frequency + halfBeat;

        this.merger = this.audioCtx.createChannelMerger(2);

        const gainL = this.audioCtx.createGain();
        gainL.gain.value = 1;
        const gainR = this.audioCtx.createGain();
        gainR.gain.value = 1;

        this.oscillator = this.audioCtx.createOscillator();
        this.oscillator.type = this.waveform;
        this.oscillator.frequency.setValueAtTime(freqL, this.audioCtx.currentTime);
        this.oscillator.connect(gainL);
        gainL.connect(this.merger, 0, 0);

        this.oscillatorR = this.audioCtx.createOscillator();
        this.oscillatorR.type = this.waveform;
        this.oscillatorR.frequency.setValueAtTime(freqR, this.audioCtx.currentTime);
        this.oscillatorR.connect(gainR);
        gainR.connect(this.merger, 0, 1);

        this.merger.connect(this.gainNode);

        this.oscillator.start();
        this.oscillatorR.start();

        this._gainL = gainL;
        this._gainR = gainR;
    }

    stop(internal) {
        if (this.oscillator) {
            try { this.oscillator.stop(); } catch (e) {}
            this.oscillator.disconnect();
            this.oscillator = null;
        }
        if (this.oscillatorR) {
            try { this.oscillatorR.stop(); } catch (e) {}
            this.oscillatorR.disconnect();
            this.oscillatorR = null;
        }
        if (this._gainL) { this._gainL.disconnect(); this._gainL = null; }
        if (this._gainR) { this._gainR.disconnect(); this._gainR = null; }
        if (this.merger) { this.merger.disconnect(); this.merger = null; }

        if (!internal) {
            this.isPlaying = false;
            this.stopSweep();
        }
    }

    setFrequency(freq) {
        this.frequency = Math.max(20, Math.min(20000, freq));
        if (this.isPlaying && this.oscillator) {
            if (this.isBinaural) {
                const halfBeat = this.binauralBeat / 2;
                this.oscillator.frequency.setValueAtTime(this.frequency - halfBeat, this.audioCtx.currentTime);
                if (this.oscillatorR) {
                    this.oscillatorR.frequency.setValueAtTime(this.frequency + halfBeat, this.audioCtx.currentTime);
                }
            } else {
                this.oscillator.frequency.setValueAtTime(this.frequency, this.audioCtx.currentTime);
            }
        }
    }

    setWaveform(type) {
        this.waveform = type;
        if (this.isPlaying && this.oscillator) {
            this.oscillator.type = type;
            if (this.oscillatorR) this.oscillatorR.type = type;
        }
    }

    setVolume(vol) {
        this.volume = vol;
        if (this.gainNode) {
            this.gainNode.gain.setValueAtTime(vol, this.audioCtx ? this.audioCtx.currentTime : 0);
        }
    }

    setBinauralBeat(beat) {
        this.binauralBeat = beat;
        if (this.isPlaying && this.isBinaural) {
            this.setFrequency(this.frequency);
        }
    }

    startSweep(fromFreq, toFreq, durationSec) {
        this.stopSweep();
        if (!this.isPlaying) this.play();

        const startTime = performance.now();
        const durationMs = durationSec * 1000;
        const logFrom = Math.log2(fromFreq);
        const logTo = Math.log2(toFreq);

        this.sweepInterval = requestAnimationFrame(function tick(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            // Logarithmic sweep for perceptually linear frequency change
            const logFreq = logFrom + (logTo - logFrom) * progress;
            const freq = Math.pow(2, logFreq);

            app.setFrequency(freq, true);

            if (progress < 1) {
                app.generator.sweepInterval = requestAnimationFrame(tick);
            } else {
                app.generator.sweepInterval = null;
                app.onSweepEnd();
            }
        });
    }

    stopSweep() {
        if (this.sweepInterval) {
            cancelAnimationFrame(this.sweepInterval);
            this.sweepInterval = null;
        }
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
    generator: new FrequencyGenerator(),
    activePresetTab: 'notes',
    animFrameId: null,

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderPresets('notes');
        // Sync slider position to match the default 440Hz using log scale
        this.freqSlider.value = this.freqToSlider(440);
        this.updateNoteDisplay();
        this.startVisualization();
    },

    cacheDOM() {
        this.freqInput = document.getElementById('freqInput');
        this.freqSlider = document.getElementById('freqSlider');
        this.noteDisplay = document.getElementById('noteDisplay');
        this.playBtn = document.getElementById('playBtn');
        this.playIcon = document.getElementById('playIcon');
        this.stopIcon = document.getElementById('stopIcon');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeValue = document.getElementById('volumeValue');
        this.presetGrid = document.getElementById('presetGrid');
        this.waveformCanvas = document.getElementById('waveformCanvas');
        this.spectrumCanvas = document.getElementById('spectrumCanvas');
        this.binauralSection = document.getElementById('binauralSection');
        this.binauralBeatInput = document.getElementById('binauralBeat');
        this.binauralInfo = document.getElementById('binauralInfo');
        this.sweepBtn = document.getElementById('sweepBtn');
        this.sweepFrom = document.getElementById('sweepFrom');
        this.sweepTo = document.getElementById('sweepTo');
        this.sweepDuration = document.getElementById('sweepDuration');
    },

    bindEvents() {
        // Frequency controls
        this.freqInput.addEventListener('input', () => {
            const val = parseFloat(this.freqInput.value);
            if (!isNaN(val)) this.setFrequency(val);
        });

        this.freqSlider.addEventListener('input', () => {
            // Logarithmic slider mapping for intuitive control
            const val = this.sliderToFreq(parseFloat(this.freqSlider.value));
            this.setFrequency(val, true);
        });

        // Fine tune buttons
        document.querySelectorAll('.fine-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const delta = parseFloat(btn.dataset.delta);
                this.setFrequency(this.generator.frequency + delta);
            });
        });

        // Play
        this.playBtn.addEventListener('click', () => this.togglePlay());

        // Waveform
        document.querySelectorAll('.wave-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.wave-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.generator.setWaveform(btn.dataset.wave);
            });
        });

        // Volume
        this.volumeSlider.addEventListener('input', () => {
            const vol = parseInt(this.volumeSlider.value) / 100;
            this.generator.setVolume(vol);
            this.volumeValue.textContent = `${this.volumeSlider.value}%`;
        });

        // Preset tabs
        document.querySelectorAll('.preset-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.preset-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.activePresetTab = tab.dataset.tab;
                this.renderPresets(tab.dataset.tab);

                const isBinaural = tab.dataset.tab === 'binaural';
                this.binauralSection.style.display = isBinaural ? 'block' : 'none';
                this.generator.isBinaural = isBinaural;
                if (this.generator.isPlaying) {
                    this.generator.play();
                }
            });
        });

        // Binaural beat
        this.binauralBeatInput.addEventListener('input', () => {
            const beat = parseFloat(this.binauralBeatInput.value);
            if (!isNaN(beat) && beat >= 1 && beat <= 40) {
                this.generator.setBinauralBeat(beat);
                this.updateBinauralInfo();
            }
        });

        // Sweep
        this.sweepBtn.addEventListener('click', () => this.toggleSweep());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlay();
            }
        });
    },

    // Logarithmic mapping: slider position (20-20000) -> frequency
    sliderToFreq(sliderVal) {
        const minLog = Math.log2(20);
        const maxLog = Math.log2(20000);
        const ratio = (sliderVal - 20) / (20000 - 20);
        return Math.pow(2, minLog + ratio * (maxLog - minLog));
    },

    // Frequency -> slider position
    freqToSlider(freq) {
        const minLog = Math.log2(20);
        const maxLog = Math.log2(20000);
        const ratio = (Math.log2(freq) - minLog) / (maxLog - minLog);
        return 20 + ratio * (20000 - 20);
    },

    setFrequency(freq, skipSlider, skipInput) {
        freq = Math.max(20, Math.min(20000, freq));
        this.generator.setFrequency(freq);

        if (!skipInput) {
            this.freqInput.value = freq < 100 ? freq.toFixed(1) : Math.round(freq);
        }
        if (!skipSlider) {
            this.freqSlider.value = this.freqToSlider(freq);
        }

        this.updateNoteDisplay();
        this.updateBinauralInfo();
    },

    updateNoteDisplay() {
        this.noteDisplay.textContent = frequencyToNote(this.generator.frequency);
    },

    updateBinauralInfo() {
        if (!this.generator.isBinaural) return;
        const half = this.generator.binauralBeat / 2;
        const left = (this.generator.frequency - half).toFixed(1);
        const right = (this.generator.frequency + half).toFixed(1);
        this.binauralInfo.textContent = `Left: ${left} Hz | Right: ${right} Hz`;
    },

    togglePlay() {
        if (this.generator.isPlaying) {
            this.generator.stop();
            this.playBtn.classList.remove('playing');
            this.playIcon.style.display = '';
            this.stopIcon.style.display = 'none';
        } else {
            this.generator.play();
            this.playBtn.classList.add('playing');
            this.playIcon.style.display = 'none';
            this.stopIcon.style.display = '';
        }
    },

    renderPresets(tab) {
        const presets = PRESETS[tab];
        this.presetGrid.innerHTML = '';
        presets.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'preset-btn';
            btn.innerHTML = `
                <span class="preset-name">${p.name}</span>
                <span class="preset-freq">${p.freq >= 1000 ? (p.freq / 1000).toFixed(1) + ' kHz' : p.freq + ' Hz'}</span>
            `;
            btn.addEventListener('click', () => {
                this.setFrequency(p.freq);
                if (p.beat !== undefined) {
                    this.generator.binauralBeat = p.beat;
                    this.binauralBeatInput.value = p.beat;
                    this.updateBinauralInfo();
                }
                if (this.generator.isPlaying) {
                    this.generator.play();
                }
            });
            this.presetGrid.appendChild(btn);
        });
    },

    toggleSweep() {
        if (this.generator.sweepInterval) {
            this.generator.stopSweep();
            this.generator.stop();
            this.onSweepEnd();
            return;
        }

        const from = parseFloat(this.sweepFrom.value);
        const to = parseFloat(this.sweepTo.value);
        const dur = parseFloat(this.sweepDuration.value);

        if (isNaN(from) || isNaN(to) || isNaN(dur)) return;

        this.sweepBtn.textContent = 'Stop Sweep';
        this.sweepBtn.classList.add('sweeping');

        if (!this.generator.isPlaying) {
            this.setFrequency(from);
            this.generator.play();
            this.playBtn.classList.add('playing');
            this.playIcon.style.display = 'none';
            this.stopIcon.style.display = '';
        }

        this.generator.startSweep(from, to, dur);
    },

    onSweepEnd() {
        this.sweepBtn.textContent = 'Start Sweep';
        this.sweepBtn.classList.remove('sweeping');
    },

    // ========== Visualization ==========
    startVisualization() {
        const waveCtx = this.waveformCanvas.getContext('2d');
        const specCtx = this.spectrumCanvas.getContext('2d');

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            for (const canvas of [this.waveformCanvas, this.spectrumCanvas]) {
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                canvas.getContext('2d').scale(dpr, dpr);
            }
        };

        resize();
        window.addEventListener('resize', resize);

        const draw = () => {
            this.animFrameId = requestAnimationFrame(draw);

            const waveW = this.waveformCanvas.getBoundingClientRect().width;
            const waveH = this.waveformCanvas.getBoundingClientRect().height;
            const specW = this.spectrumCanvas.getBoundingClientRect().width;
            const specH = this.spectrumCanvas.getBoundingClientRect().height;

            // Clear
            waveCtx.clearRect(0, 0, waveW, waveH);
            specCtx.clearRect(0, 0, specW, specH);

            // Draw grid lines
            waveCtx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
            waveCtx.lineWidth = 1;
            waveCtx.beginPath();
            waveCtx.moveTo(0, waveH / 2);
            waveCtx.lineTo(waveW, waveH / 2);
            waveCtx.stroke();

            const waveData = this.generator.getWaveformData();
            const specData = this.generator.getSpectrumData();

            if (!waveData || !specData) return;

            // Waveform
            waveCtx.beginPath();
            waveCtx.strokeStyle = '#6366f1';
            waveCtx.lineWidth = 2;
            const waveSlice = waveW / waveData.length;
            for (let i = 0; i < waveData.length; i++) {
                const v = waveData[i] / 128.0;
                const y = (v * waveH) / 2;
                if (i === 0) waveCtx.moveTo(0, y);
                else waveCtx.lineTo(i * waveSlice, y);
            }
            waveCtx.stroke();

            // Spectrum bars
            const barCount = 64;
            const step = Math.floor(specData.length / barCount);
            const barWidth = specW / barCount - 1;

            for (let i = 0; i < barCount; i++) {
                let sum = 0;
                for (let j = 0; j < step; j++) {
                    sum += specData[i * step + j];
                }
                const avg = sum / step;
                const barHeight = (avg / 255) * specH;

                const hue = 240 + (i / barCount) * 60;
                specCtx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
                specCtx.fillRect(
                    i * (barWidth + 1),
                    specH - barHeight,
                    barWidth,
                    barHeight
                );
            }
        };

        draw();
    },
};

// Boot
document.addEventListener('DOMContentLoaded', () => app.init());
