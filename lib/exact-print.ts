export async function printElementExact(target: HTMLElement) {
  let html2canvas: typeof import("html2canvas").default;

  try {
    ({ default: html2canvas } = await import("html2canvas"));
  } catch {
    window.alert(
      "Could not load the exact print renderer. Falling back to browser print.",
    );
    window.print();
    return;
  }

  const canvas = await html2canvas(target, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const dataUrl = canvas.toDataURL("image/png");
  const win = window.open("", "_blank", "noopener");
  if (!win) {
    window.alert("Pop-up blocked. Allow pop-ups for exact print output.");
    return;
  }

  win.document.open();
  win.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Print</title>
<style>
  @page { size: letter; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; width: 8.5in; height: 11in; overflow: hidden; }
  .page {
    width: 8.5in;
    height: 11in;
    margin: 0 auto;
    display: grid;
    place-items: center;
    overflow: hidden;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
</style>
</head>
<body>
  <div class="page"><img src="${dataUrl}" alt="Form print output"></div>
  <script>
    window.onload = function () {
      setTimeout(function () { window.print(); }, 80);
    };
  <\/script>
</body>
</html>`);
  win.document.close();
}
