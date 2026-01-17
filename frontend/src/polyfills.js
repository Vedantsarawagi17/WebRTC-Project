//  Provides Node.js compatibility variables for the browser environment. 
//  They rely on global variables like 'Buffer', 'process', and 'global' that exist in Node.js ,but do NOT exist in standard web browsers.
//  Without this file, using those libraries would cause "ReferenceError: Buffer is not defined" crashes.
//  This file manually creates those missing variables and attaches them to the browser's 'window' object.

import { Buffer } from "buffer";
import { EventEmitter } from "events";

// 1. Map 'global' to 'window'
// Node.js uses 'global' as the top-level object; browsers use 'window'.
window.global = window;

// 2. Polyfill 'Buffer'
// Handles binary data streams (crucial for video/audio processing).
window.Buffer = Buffer;

// 3. Polyfill 'EventEmitter'
// Allows objects to subscribe and listen to events (e.g., "stream received").
window.EventEmitter = EventEmitter;

// 4. Polyfill 'process'
// Logic often checks 'process.env' or 'process.browser' to Switch behavior.
window.process = window.process || {};
window.process.env = window.process.env || {};
window.process.browser = true; // Signals to libraries: "We are running in a browser"

// 5. Polyfill 'nextTick'
// Simulates Node's immediate execution queue using setTimeout(..., 0).
window.process.nextTick = window.process.nextTick || function (cb) { setTimeout(cb, 0); };
