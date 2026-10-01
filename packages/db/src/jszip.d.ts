declare module 'jszip' {
  interface JSZipObject {
    name: string;
    dir: boolean;
    async(type: 'string'): Promise<string>;
  }

  class JSZip {
    file(path: string): JSZipObject | null;
    static loadAsync(input: ArrayBuffer | Uint8Array): Promise<JSZip>;
  }

  export = JSZip;
}
