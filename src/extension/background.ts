/**
 * LickUI Chrome Extension - Background Service Worker
 * Minimal background script for the LickUI extension
 */

console.log("[LickUI] Background service worker loaded");

// Handle extension installation
chrome.runtime.onInstalled.addListener((details: { reason: string }) => {
    if (details.reason === "install") {
        console.log("[LickUI] Extension installed");
    } else if (details.reason === "update") {
        console.log("[LickUI] Extension updated");
    }
});
