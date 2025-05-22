// Test setup file
import "@testing-library/jest-dom";

// Add polyfills for TextEncoder/TextDecoder
class MockTextEncoder {
  encode(text: string): Uint8Array {
    return new Uint8Array([...text].map((ch) => ch.charCodeAt(0)));
  }
  encodeInto(
    text: string,
    buffer: Uint8Array
  ): { read: number; written: number } {
    const encoded = this.encode(text);
    buffer.set(encoded);
    return { read: text.length, written: encoded.length };
  }
  readonly encoding = "utf-8";
}

class MockTextDecoder {
  decode(buffer: ArrayBuffer | Uint8Array): string {
    const arr = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    return String.fromCharCode(...arr);
  }
  readonly encoding = "utf-8";
  readonly fatal = false;
  readonly ignoreBOM = false;
}

// @ts-ignore - Using our custom polyfills for tests
global.TextEncoder = MockTextEncoder as any;
// @ts-ignore
global.TextDecoder = MockTextDecoder as any;

// Silence React 19 act() warnings until they're fixed
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      /Warning: ReactDOM.render is no longer supported in React 19|was not wrapped in act/.test(
        args[0]
      )
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
