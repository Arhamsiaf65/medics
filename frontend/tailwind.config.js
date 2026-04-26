import { Config } from 'tailwindcss';
const config = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#1890ff',
            }
        },
    },
    plugins: [],
};
export default config;
//# sourceMappingURL=tailwind.config.js.map