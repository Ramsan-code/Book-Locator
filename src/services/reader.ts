import axios from "axios";
const API_URL ="https://book-link-api.vercel.app/api/readers"

export const createReader = async () => {
    const response = await axios.post(API_URL,);
    return response.data.reader;
};
