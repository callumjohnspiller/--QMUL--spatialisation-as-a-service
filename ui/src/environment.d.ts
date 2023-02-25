declare global {
    namespace NodeJS {
        interface ProcessEnv {
            ACCESS_KEY_ID: string;
            SECRET_ACCESS_KEY: string;
        }
    }

    declare module '*.scss';

    declare module '*.scss' {
        const content: Record<string, string>;
        export default content;
    }
}

export {}