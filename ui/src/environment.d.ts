declare global {
    namespace NodeJS {
        interface ProcessEnv {
            REACT_APP_ACCESS_KEY_ID: string;
            REACT_APP_SECRET_ACCESS_KEY: string;
        }
    }

    declare module "*.scss";

    declare module "*.scss" {
        const content: Record<string, string>;
        export default content;
    }
}

export {};