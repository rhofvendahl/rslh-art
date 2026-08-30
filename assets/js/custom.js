// Video grid tiles (see layouts/partials/gallery.html) start as a muted,
// controls-less poster frame with a play-icon overlay (or, for autoplay
// tiles, already playing muted). Clicking detaches the actual <video>
// element into an on-page overlay, enlarged but not OS fullscreen -- a
// simplified, video-only stand-in for PhotoSwipe, which doesn't support
// video. Closing moves the video back into its grid tile and restores its
// original playback state.

let overlay = null;
let overlayVideo = null;
let overlayItem = null;
let originalParent = null;
let originalNextSibling = null;

function onKeydown(event) {
  if (event.key === "Escape") closeOverlay();
}

function closeOverlay() {
  if (!overlay) return;

  originalParent.insertBefore(overlayVideo, originalNextSibling);
  overlayVideo.style.width = "100%";
  overlayVideo.style.height = "100%";
  overlayVideo.controls = false;
  overlayItem.classList.remove("playing");

  if (overlayItem.classList.contains("video-autoplay")) {
    overlayVideo.muted = true;
    overlayVideo.play();
  } else {
    overlayVideo.pause();
    overlayVideo.muted = true;
  }

  overlay.remove();
  document.body.style.overflow = "";
  document.removeEventListener("keydown", onKeydown);

  overlay = null;
  overlayVideo = null;
  overlayItem = null;
  originalParent = null;
  originalNextSibling = null;
}

document.addEventListener("click", (event) => {
  const item = event.target.closest(".video-item");
  if (!item) return;

  const video = item.querySelector("video");
  if (!video) return;

  event.preventDefault();

  originalParent = video.parentElement;
  originalNextSibling = video.nextSibling;
  overlayVideo = video;
  overlayItem = item;

  overlay = document.createElement("div");
  overlay.className = "video-overlay";
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeOverlay();
  });

  const closeButton = document.createElement("button");
  closeButton.className = "video-overlay-close";
  closeButton.setAttribute("aria-label", "Close");
  closeButton.textContent = "×";
  closeButton.addEventListener("click", closeOverlay);

  video.style.width = "auto";
  video.style.height = "auto";

  overlay.appendChild(video);
  overlay.appendChild(closeButton);
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";
  document.addEventListener("keydown", onKeydown);

  item.classList.add("playing");
  video.muted = false;
  video.controls = true;
  video.play();
});
