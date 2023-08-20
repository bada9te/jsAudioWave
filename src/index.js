'use strict'
let animId = null;


// wait doc load
window.addEventListener("DOMContentLoaded", () => {
    // get elems
    let analyzerData = null;
    const player = document.querySelector("#player");
    const fileInput = document.querySelector("#file-input");
    const waveContainer = document.querySelector("#audio-wave")

    // onFileChange event
    fileInput.addEventListener("change", (e) => {
        player.src = URL.createObjectURL(e.target.files[0]);
        analyzerData = createAnalyzer(analyzerData, player);
    });

    player.addEventListener("timeupdate", () => {
        drawAudioWave(analyzerData, waveContainer);
    });

    ['pause', 'ended'].forEach(eventName => {
        player.addEventListener(eventName, () => {
            if (animId) cancelAnimationFrame(animId);
        });
    })  
});


// function to create audii analyzer
const createAnalyzer = (analyzerData, audioElement) => {
    // create audio ctx
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()

    // analyzer
    const analyzer = analyzerData?.analyzer || audioCtx.createAnalyser();
    analyzer.fftSize = 1024;

    const bufferLength = analyzer.frequencyBinCount;
    const dataArr = new Uint8Array(bufferLength);

    // media source
    let mediaSource = null;

    // if no analyzerData
    if (!analyzerData) {
        // create media elem source
        mediaSource = audioCtx.createMediaElementSource(audioElement);
        mediaSource.connect(analyzer);
        mediaSource.connect(audioCtx.destination);
    } else {
        mediaSource = analyzerData.mediaSource;
    }

    return {
        analyzer,
        dataArr,
        mediaSource,
        bufferLength,
    };
}


// bars animation 
const animateFrequesncyBars = (analyzerData, canvasElement) => {
    const { analyzer, dataArr, bufferLength } = analyzerData;

    // analyze audio, data will be placed in dataArr
    analyzer.getByteFrequencyData(dataArr);

    // canvas height
    const height = canvasElement.height;

    // get canvas 2d ctx
    const canvasCtx = canvasElement.getContext("2d");

    // set fill style
    canvasCtx.fillStyle = 'black';

    // calc bar width
    let barWidth = Math.ceil(canvasElement.width / bufferLength) * 2;
    let barHeight;
    let widthCounter = 0;

    dataArr.forEach((elem, i) => {
        // set bar heiught according to value in elem (from audio data)
        barHeight = (elem / 255) * height / 1.35;
        
        // draw bar
        canvasCtx.fillRect(widthCounter, height - barHeight, barWidth, barHeight);
        
        // set new pos of next bar
        widthCounter += barWidth + 1;
    });
}


// draw audioWave
const drawAudioWave = (analyzerData, canvasWaveContainer) => {
    const { analyzer } = analyzerData;

    
    // fill positioned parent elem
    canvasWaveContainer.style.width = '500px'
    canvasWaveContainer.style.height = '100%';
    
    // set internal size
    //canvasWaveContainer.width = canvasWaveContainer.offsetWdth;
    canvasWaveContainer.height = 50;

    if (!analyzer) {
        return;
    }

    const animateBars = () => {
        animId = requestAnimationFrame(animateBars);
        canvasWaveContainer.width = canvasWaveContainer.width;
        animateFrequesncyBars(analyzerData, canvasWaveContainer);
    }

    animateBars();
    
}