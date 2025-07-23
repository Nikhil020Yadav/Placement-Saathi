const LoadMoreBtn = ({ state, fetchDataFunc }) => {
    // if (!state || state.results.length >= state.totalDocs) return null;
    if (!state) return null;

    if (state.results.length >= state.totalDocs) {
        return (
            <p className="text-center mt-4 text-gray-500">
                🎉 You’ve reached the end of all blogs!
            </p>
        );
    }
    return (
        <button
            onClick={() => fetchDataFunc(state.page + 1)}
            className="btn-load-more"
        >
            Load More
        </button>
    );
};

export default LoadMoreBtn;
