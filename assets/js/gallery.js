import justifiedLayout from "./justified-layout.js";
import * as params from "@params";

const gallery = document.getElementById("gallery");

if (gallery) {
  let containerWidth = 0;
  const items = gallery.querySelectorAll(".gallery-item");

  const aspectRatios = Array.from(items).map((item, i) => {
    const img = item.querySelector("img");
    if (img) {
      img.style.width = "100%";
      img.style.height = "auto";
      return parseFloat(img.getAttribute("width")) / parseFloat(img.getAttribute("height"));
    }

    // A video's real dimensions aren't known until its metadata loads (an
    // mp4 has no width/height attribute to read up front like an <img>
    // does), so it starts on a 16/9 guess and gets corrected below once
    // videoWidth/videoHeight are available, re-running the layout so the
    // tile ends up sized to its real aspect ratio instead of cropped to fit
    // the wrong assumed box.
    const video = item.querySelector("video");
    if (video) {
      video.style.width = "100%";
      video.style.height = "100%";

      const applyRealRatio = () => {
        if (!video.videoWidth || !video.videoHeight) return;
        aspectRatios[i] = video.videoWidth / video.videoHeight;
        containerWidth = 0; // force updateGallery() past its no-op-if-unchanged guard
        updateGallery();
      };
      if (video.readyState >= 1) {
        applyRealRatio();
      } else {
        video.addEventListener("loadedmetadata", applyRealRatio, { once: true });
      }

      return 16 / 9;
    }

    return 1;
  });

  function updateGallery() {
    if (containerWidth === gallery.getBoundingClientRect().width) return;
    containerWidth = gallery.getBoundingClientRect().width;

    const layout = justifiedLayout(aspectRatios, {
      rowWidth: containerWidth,
      spacing: Number.isInteger(params.boxSpacing) ? params.boxSpacing : 8,
      rowHeight: params.targetRowHeight || 288,
      heightTolerance: Number.isInteger(params.targetRowHeightTolerance) ? params.targetRowHeightTolerance : 0.25,
    });

    items.forEach((item, i) => {
      const { width, height, top, left } = layout.boxes[i];
      item.style.position = "absolute";
      item.style.width = width + "px";
      item.style.height = height + "px";
      item.style.top = top + "px";
      item.style.left = left + "px";
      item.style.overflow = "hidden";
    });

    gallery.style.position = "relative";
    gallery.style.height = layout.containerHeight + "px";
    gallery.style.visibility = "";
  }

  window.addEventListener("resize", updateGallery);
  window.addEventListener("orientationchange", updateGallery);

  // Call twice to adjust for scrollbars appearing after first call
  updateGallery();
  updateGallery();
}
