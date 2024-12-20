declare module 'es5-ext/object/is-empty' {
  function isEmpty(value: Record<string, any>): boolean;
  export = isEmpty;
}

declare module 'es5-ext/object/valid-value' {
  function validValue<T>(value: T): T;

  export = validValue;
}

declare module 'event-emitter/has-listeners' {
  export default function hasListeners(
    obj: Record<string, any>,
    type?: string,
  ): boolean;
}
