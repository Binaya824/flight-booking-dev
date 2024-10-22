/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects(){
        return [
            {
                source: "/",
                destination: "/app",
                permanent:false
            }
        ]
    }
};

export default nextConfig;
