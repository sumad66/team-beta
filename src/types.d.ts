declare module 'pdfjs-dist' {
  export function getDocument(data: Uint8Array): {
    promise: Promise<{
      numPages: number;
      getPage(pageNumber: number): Promise<{
        getTextContent(): Promise<{
          items: Array<{ str: string }>;
        }>;
      }>;
    }>;
  };
}

// Add any other type declarations here if needed 