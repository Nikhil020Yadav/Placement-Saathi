import axios from "axios";
export const FilterPaginationData = async ({ create_new_arr = false, arr, data, page, countRoute, data_to_send = {}, user }) => {
    let obj;

    let headers = {}


    if (user) {
        headers.headers = {
            'Authorization': `Bearer ${user}`
        }
    }
    if (arr != null && !create_new_arr) {
        obj = { ...arr, results: [...arr.results, ...data], page: page }
    } else {
        await axios.post(import.meta.env.VITE_SERVER_URL + countRoute, data_to_send, headers)
            .then(({ data: { totalDocs } }) => {
                obj = { results: data, page: 1, totalDocs };
            })
            .catch((err) => {
                console.log(err);

            })
    }
    return obj;
}