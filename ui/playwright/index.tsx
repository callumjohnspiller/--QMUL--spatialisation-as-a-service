// Import styles, initialize component theme here.
// import '../src/common.css';

import { beforeMount, afterMount } from '@playwright/experimental-ct-react/hooks';
import { BrowserRouter } from 'react-router-dom';

export type HooksConfig = {
    enableRouting?: boolean;
}

beforeMount<HooksConfig>(async ({ App, hooksConfig }) => {
    if (hooksConfig?.enableRouting)
        return <BrowserRouter><App/></BrowserRouter>;
});