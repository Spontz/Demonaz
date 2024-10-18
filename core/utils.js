export const fetchAsset = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Server response: ${response.status}`);
        }
        return response;
    } catch (error) {
        console.error(error.message);
    }
}