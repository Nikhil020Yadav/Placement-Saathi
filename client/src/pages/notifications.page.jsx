import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { FilterPaginationData } from "../common/filter-pagination-data";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NotificationCard from "../components/notification-card.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreBtn from "../components/load-more.component";

const NotificationPage = () => {
    const [filter, setFilter] = useState('all');
    const [notifications, setNotifications] = useState(null);
    let filters = ['all', 'like', 'comment', 'reply']

    let { userAuth, userAuth: { access_token, new_notification_available }, setUserAuth } = useContext(UserContext)
    const fetchNotification = ({ page, deletedDocCnt = 0 }) => {
        axios.post(import.meta.env.VITE_SERVER_URL + "/notification", { page, filter, deletedDocCnt }, {
            headers:
            {
                'Authorization': `Bearer ${access_token}`
            }
        })
            .then(async ({ data }) => {

                console.log(data);
                if (new_notification_available) {
                    setUserAuth({ ...userAuth, new_notification_available: false })
                }
                let formatedData = await FilterPaginationData({
                    state: notifications,
                    data: data.results,
                    page,
                    countRoute: "/all-notifications-count",
                    data_to_send: { filter },
                    user: access_token
                })

                setNotifications(formatedData);
                console.log(formatedData);


            })

            .catch((err) => {
                console.log(err);

            })
    }

    const handleFilter = (e) => {
        let btn = e.target;
        setFilter(btn.innerHTML);
        setNotifications(null);
    }



    useEffect(() => {
        if (access_token) {
            fetchNotification({ page: 1 })
        }
    }, [access_token, filter])
    console.log(notifications);

    return (
        <div>
            <h1 className="max-md:hidden"> Recent Notifications </h1>
            <div className="my-8 flex gap-6">
                {
                    filters.map((filterName, i) => {

                        return <button key={i} className={"py-2 " + (filter === filterName ? "btn-dark" : "btn-light")} onClick={handleFilter}>{filterName}</button>
                    })
                }
            </div>
            {
                notifications === null ? <Loader /> :
                    <>


                        {


                            notifications.results.length ?
                                notifications.results.map((notification, i) => {
                                    return <AnimationWrapper key={i} transition={{ delay: i * 0.08 }}>
                                        <NotificationCard data={notification} index={i} notificationState={{ notifications, setNotifications }} />

                                    </AnimationWrapper>
                                })

                                :
                                <NoDataMessage msg="Nothing to Show" />

                        }
                        <LoadMoreBtn state={notifications} fetchDataFunc={fetchNotification} /*additionalParam={{ deletedDocCnt: notifications.deletedDocCnt }}*/ />
                    </>
            }
        </div>
    )
}
export default NotificationPage;