//inspired by https://gist.github.com/beesandbombs/9b657863a3c403ceaf253b6503bb80a2

import * as seedrandom from 'seedrandom';
import { BaseRenderer } from './baseRenderer';
import gsap from 'gsap';
import P5 from 'p5';

const srandom = seedrandom('b');

//let t; 
let c;
let x, y, z, tt;
let N = 12;
let l, L = 16;
let qq;
let ascent;
let noiseScale = 0.003, noiseAmt = 1.5;
let RED, BLACK, WHITE;
let mn, ia;

let c01 = (g: number, s) => {
    return s.constrain(g, 0, 1);
}

let ease = (p, s) => {
    p = c01(p, s);
    return 3*p*p - 2*p*p*p;
  }
  
let ease2 = (p, g, s) => {
    p = c01(p, s);
    if (p < 0.5) 
      return 0.5 * s.pow(2*p, g);
    else
      return 1 - 0.5 * s.pow(2*(1 - p), g);
  }

let colors = ['#340352', '#FF6EA7', '#FFE15F'];
let backgroundColor = '#FFE15F';

export default class P5Renderer implements BaseRenderer{

    recording: boolean = false;
    canvas: HTMLCanvasElement;
    s: any;

    completeCallback: any;
    delta = 0;
    animating = true;

    width: number = 1920 / 2;
    height: number = 1080 / 2;

    size: number;

    x: number;
    y: number;

    frameCount = 0;
    totalFrames = 1000;

    constructor(w, h) {

        this.width = w;
        this.height = h;

        const sketch = (s) => {
            this.s = s;
            s.pixelDensity(1);
            s.setup = () => this.setup(s)
            s.draw = () => this.draw(s)
        }

        new P5(sketch);
    }

    protected setup(s) {
        let renderer = s.createCanvas(this.width, this.height, s.WEBGL);
        this.canvas = renderer.canvas;

        RED = s.color('#d02030')
        BLACK = s.color('#202020')
        WHITE = s.color('#fafafa');

        mn = .5*s.sqrt(3)
        ia = s.atan(s.sqrt(.5));


        //s.size(750, 750, s.P3D);
        s.smooth(8);  
        s.rectMode(s.CENTER);
        s.pixelDensity(1);
        s.fill(32);
        s.noStroke();
        s.ortho();

        //s.background(0, 0, 0, 255);
        //s.colorMode(s.HSB);

    }

    protected draw(s) {
        if (this.animating) { 
            this.frameCount += 1;

            let frameDelta = 2 * Math.PI * (this.frameCount % this.totalFrames) / this.totalFrames;
            //t = (s.millis()/(20.0*numFrames))%1;

            this.draw_(s, frameDelta);

            if (this.recording) {
                if (frameDelta == 0) {
                    this.completeCallback();
                }
            }
        }
    }

    protected draw_(s, t) {
        s.background(s.color(backgroundColor));
        s.push();
      
        //s.translate(s.width/2, s.height/2); 
        s.scale(.4);
        s.rotateX(-ia);
        s.rotateY(-s.QUARTER_PI);
        for (let a=-N; a<N; a++) {
          z = a*L;
          s.push();
          s.translate(0, 0, z);
          for (let i=-N; i<N; i++) {
            for (let j=-N; j<N; j++) {
              x = (i+.5)*L;
              y = (j+.5)*L;
              tt = (t + 2*noiseAmt - noiseAmt*s.noise(noiseScale*x+123, noiseScale*y+234, noiseScale*z+345))%1;
              if (tt <= .25) {
                qq = ease(4*tt, s);
                s.fill(s.lerpColor(s.color(colors[0]), s.color(colors[1]), qq));
                l = L*qq;
                ascent = 0;
              } else {
                
                qq = (s.map(tt, .25, 1, 0, 1));
                s.fill(s.lerpColor(s.color(colors[0]), s.color(colors[1]), ease(qq, s)));
                l = L*(1-ease(qq, s));
                ascent = -180*s.sq(qq);
              }
      
              s.push();
              s.translate(x, y+40+ascent);
              s.box(l);
              s.pop();
            }
          }
          s.pop();
        }
        s.pop();
    }

    public render() {

    }

    public play() {
        this.frameCount = 0;
        this.recording = true;
        this.animating = true;
        this.s.background(0, 0, 0, 255);
    }

    public stop() {
        this.animating = false;
    }

    public setCompleteCallback(completeCallback: any) {
        this.completeCallback = completeCallback;
    }

    public resize() {
        this.s.resizeCanvas(window.innerWidth, window.innerHeight);
        this.s.background(0, 0, 0, 255);
    }
}