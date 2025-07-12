const LoadMoreBtn = ({ state, fetchDataFunc, additionalParam }) => {
    if (state != null && state.totalDocs > state.results.length) {
        return (
            <button
                onClick={() => fetchDataFunc({ ...additionalParam, page: state.page + 1 })}
                className="text-dark-grey p-2 px-3 hover:bg-grey/50 rounded-md flex items-center gap-2"

            > Load More </button>
        )
    }
    //return null;

}
export default LoadMoreBtn;