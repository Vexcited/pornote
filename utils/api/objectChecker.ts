/**
 * Use any object as parameter with its type.
 *
 * It will returns a `get` function that will check that
 * the `object[key]` has the right type and if it exists.
 *
 * If everything is fine, it returns the `object[key]` with typings.
 * When there's an error, it will throw it with the right error message
 * to use it in a try/catch block `(e as Error).message`.
 */
export default function objectTypeChecker <T> (object: any) {
  return {
    get: <K extends keyof T> (
      key: K,
      expectedType: "string" | "number" | "boolean" | "object",
      { required = false } = {}
    ) => {
      if (required) {
        // Check if the key exists in object.
        if (!object[key]) {
          throw new Error(`Missing key: ${key}`);
        }

        // Check if the type is correct for the object.
        if (typeof object[key] !== expectedType) {
          throw new Error(`Invalid type for ${key}: ${typeof object[key]}`);
        }
      }

      return object[key] as T[K];
    }
  };
}