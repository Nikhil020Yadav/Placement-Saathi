import axios from "axios";

export const FilterPaginationData = async ({
    create_new_arr = false,
    arr,
    data,
    page,
    countRoute,
    data_to_send = {},
    user
}) => {
    let obj;
    let headers = {};

    if (user) {
        headers.headers = {
            'Authorization': `Bearer ${user}`
        };
    }

    // Fetch totalDocs only on first page
    let totalDocs = arr?.totalDocs || 0;
    if (page === 1) {
        try {
            const countRes = await axios.post(
                import.meta.env.VITE_SERVER_URL + countRoute,
                data_to_send,
                headers
            );
            totalDocs = countRes.data.totalDocs;
        } catch (err) {
            console.log("❌ Error fetching totalDocs:", err);
        }
    }

    if (arr != null && !create_new_arr) {
        const existingIds = new Set((arr?.results || []).map(blog => blog._id));
        const newData = data.filter(blog => !existingIds.has(blog._id));

        console.log("✅ Existing IDs:", [...existingIds]);
        console.log("📥 Incoming:", data.map(b => b.blog_id));
        console.log("🆕 New to append:", newData.map(b => b.blog_id));

        obj = {
            ...arr,
            results: [...(arr?.results || []), ...newData],
            page,
            totalDocs
        };
    } else {
        obj = {
            results: data,
            page,
            totalDocs
        };
    }

    return obj;
};
