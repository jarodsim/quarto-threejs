export function toggleFullscreen() {
    const element = document.documentElement;

    if (!document.webkitFullscreenElement) {
        if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
    } else {
        if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}
