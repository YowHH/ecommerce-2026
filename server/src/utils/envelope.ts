

export type ApiEnvelope<T> = {
    status : "success" | "error";
    data : T | null; 
    meta? : Record<string, number>;
    errors? : Array<{message: string; code?: string}>
}

export function ok<T>( data: T , meta? :  Record<string, number>): ApiEnvelope<T> {
    return {status : 'success', data}
}

export function fail(message: string, code: string): ApiEnvelope<null> {
    return {status : 'success', data : null , errors: [{message, code}]}
}