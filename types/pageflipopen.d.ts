declare module "pageflipopen" {
  export type PageFlipOpenOptions = {
    source: string;
    startPage?: number;
    flipDuration?: number;
    autoLayout?: boolean;
    singlePageMode?: boolean;
    enableZoom?: boolean;
    zoom?: number;
    zoomMin?: number;
    zoomMax?: number;
    backgroundColor?: string;
    pageBackground?: string;
    enableFullscreen?: boolean;
    enableDownload?: boolean;
    downloadFilename?: string | null;
    autoHeight?: boolean;
    enableKeyboard?: boolean;
    enableTouch?: boolean;
    toolbar?: boolean;
    toolbarAlwaysVisible?: boolean;
    onReady?: () => void;
    onPageChange?: (page: number) => void;
    onError?: (error: Error) => void;
  };

  export default class PageFlipOpen {
    static setPdfWorkerSrc(source: string): void;

    constructor(container: HTMLElement, options: PageFlipOpenOptions);

    currentPage: number;
    totalPages: number;
    layout: "single" | "double";
    readonly isAnimating: boolean;

    flipTo(pageNumber: number): void;
    next(): void;
    prev(): void;
    first(): void;
    last(): void;
    zoomIn(): void;
    zoomOut(): void;
    zoomReset(): void;
    toggleFullscreen(): void;
    destroy(): void;
  }

  export { PageFlipOpen };
}
