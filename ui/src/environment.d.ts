declare global {
    namespace NodeJS {
        interface ProcessEnv {
            REACT_APP_ACCESS_KEY_ID: string;
            REACT_APP_SECRET_ACCESS_KEY: string;
        }
    }
}

export {};