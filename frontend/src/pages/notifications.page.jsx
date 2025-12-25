import { useContext, useEffect, useState } from "react";
import { UserContext, NotificationRefreshContext } from "../App";
import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NoDataMessage from "../components/nodata.component";
import NotificationCard from "../components/notification-card.component";
import LoadMoreDataBtn from "../components/load-more.component";

const Notifications = () => {

    let { userAuth, userAuth: { access_token, new_notification_available } } = useContext(UserContext);
    let { refreshNotificationCount } = useContext(NotificationRefreshContext);

    const [filter, setFilter] = useState('all');
    const [notifications, setNotifications] = useState(null);

    let filters = ['all', 'like', 'comment', 'reply'];

    const fetchNotifications = ({ page, deletedDocCount = 0 }) => {

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/notifications", {
            page,
            filter,
            deletedDocCount
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(async ({ data: { notifications: data } }) => {

            let formatedData = await filterPaginationData({
                state: notifications,
                data,
                page,
                countRoute: "/all-notifications-count",
                data_to_send: { filter },
                user: access_token
            })

            setNotifications(formatedData);

            // Refresh the notification count in the navbar
            if (refreshNotificationCount) {
                refreshNotificationCount();
            }

        })
        .catch(err => {
            console.log(err);
        })

    }

    useEffect(() => {

        if (access_token) {
            fetchNotifications({ page: 1 });
        }

    }, [access_token, filter])

    const handleFilter = (e) => {
        let btn = e.target;
        setFilter(btn.innerHTML.toLowerCase());
        setNotifications(null);
    }

    return (
        <div>
            <h1 className="max-md:hidden text-2xl font-medium mb-8">Recent Notifications</h1>

            <div className="my-8 flex gap-6">
                {
                    filters.map((filterName, i) => {
                        return <button
                            key={i}
                            className={"py-2 " + (filter == filterName ? " btn-dark " : " btn-light ") }
                            onClick={handleFilter}
                        >
                            {filterName}
                        </button>
                    })
                }
            </div>

            {
                notifications == null ? <Loader /> :
                <>
                    {
                        notifications.results.length ?
                            notifications.results.map((notification, i) => {
                                return <AnimationWrapper key={i} transition={{ delay: i * 0.08 }}>
                                    <NotificationCard data={notification} index={i} notificationState={{ notifications, setNotifications }} />
                                </AnimationWrapper>
                            })
                        : <NoDataMessage message="No notifications" />
                    }

                    <LoadMoreDataBtn state={notifications} fetchDataFun={fetchNotifications} additionalParam={{ deletedDocCount: 0 }} />
                </>
            }
        </div>
    )
}

export default Notifications;
