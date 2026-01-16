import { Buffer } from "buffer";
import { EventEmitter } from "events";

// ROBUST POLYFILLS FOR VIDEO CALLING (Simple-Peer)
// Must run before any other imports!
window.global = window;
window.Buffer = Buffer;
window.EventEmitter = EventEmitter;
window.process = window.process || {};
window.process.env = window.process.env || {};
window.process.browser = true;
window.process.nextTick = window.process.nextTick || function (cb) { setTimeout(cb, 0); };
