/**
 * Locally bundled Arabic fonts used by financial and administrative report output.
 * The same declarations are injected into standalone print/PDF documents so they
 * render consistently without requesting fonts from external services.
 */
export const reportArabicFontStack =
  '"IBM Plex Sans Arabic", "Noto Sans Arabic", "Noto Naskh Arabic", "Cairo", Tahoma, Arial, sans-serif';

export const reportArabicFontFacesCss = `
  @font-face {
    font-family: "Cairo";
    src: url("/Cairo-Regular.ttf") format("truetype");
    font-style: normal;
    font-weight: 400;
    font-display: swap;
  }

  @font-face {
    font-family: "IBM Plex Sans Arabic";
    src: url("/fonts/IBMPlexSansArabic-Regular.woff2") format("woff2");
    font-style: normal;
    font-weight: 400;
    font-display: swap;
  }
  @font-face {
    font-family: "IBM Plex Sans Arabic";
    src: url("/fonts/IBMPlexSansArabic-Medium.woff2") format("woff2");
    font-style: normal;
    font-weight: 500;
    font-display: swap;
  }
  @font-face {
    font-family: "IBM Plex Sans Arabic";
    src: url("/fonts/IBMPlexSansArabic-SemiBold.woff2") format("woff2");
    font-style: normal;
    font-weight: 600;
    font-display: swap;
  }
  @font-face {
    font-family: "IBM Plex Sans Arabic";
    src: url("/fonts/IBMPlexSansArabic-Bold.woff2") format("woff2");
    font-style: normal;
    font-weight: 700;
    font-display: swap;
  }

  @font-face {
    font-family: "Noto Sans Arabic";
    src: url("/NotoSansArabic-Regular.ttf") format("truetype");
    font-style: normal;
    font-weight: 400;
    font-display: swap;
  }
  @font-face {
    font-family: "Noto Sans Arabic";
    src: url("/NotoSansArabic-SemiBold.ttf") format("truetype");
    font-style: normal;
    font-weight: 600;
    font-display: swap;
  }

  @font-face {
    font-family: "Noto Naskh Arabic";
    src: url("/fonts/NotoNaskhArabic-Variable.ttf") format("truetype");
    font-style: normal;
    font-weight: 400 700;
    font-display: swap;
  }
`;
