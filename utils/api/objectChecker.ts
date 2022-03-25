import type { NextApiRequest } from "next";

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
        if (!(key in object)) {
          throw new Error(`Missing required key "${key}" in body request.`);
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

type BodyCheckerSuccess<T> = {
  success: true;
  body: T;
}

type BodyCheckerFail = {
  success: false;
  message: string;
}

export const bodyChecker = <T>(req: NextApiRequest, values: {
  param: keyof T;
  type: "string" | "number" | "boolean" | "object";
  required: boolean;
}[]): BodyCheckerSuccess<T> | BodyCheckerFail => {
  const body = objectTypeChecker<T>(req.body);

  try {
    const returnBody = values.reduce((o, { param, type, required }) => ({
      ...o, [param]: body.get(param, type, { required })}), {}) as T;

    return {
      success: true,
      body: returnBody
    };
  }
  catch (e) {
    const error = e as Error;

    return {
      success: false,
      message: error.message
    };
  }
};