import React, { useState, useEffect, useContext } from "react"
import ScheduleLayout from "./schedule-layout"
import CalendarView from "./calendar-view"
import TimelineView from "./timeline-view"
import WeekView from "./week-view"
import { AuthContext } from "../../context/AuthContext"
import axios from "axios"
import { ROOT_API } from "../../api/rootApi";
export default function SchedulePage() {
  const { token, user } = useContext(AuthContext)
  const [viewType, setViewType] = useState("calendar")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user || !token) {
      setLoading(false)
      setError("Bạn chưa đăng nhập")
      return
    }

    const fetchEvents = async () => {
      try {
        const internId = user.internId
        const res = await axios.get(
          `${ROOT_API}/api/programs/intern/${internId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        const formatted = res.data.map((e) => ({
          ...e,
          date: new Date(e.date), // chuyển string sang Date
        }))

        setEvents(formatted)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchEvents()
  }, [user, token])

  if (loading) return <p>Đang tải dữ liệu...</p>

  return (
    <ScheduleLayout
      viewType={viewType}
      onViewChange={setViewType}
      currentDate={currentDate}
      onDateChange={setCurrentDate}
    >
      {viewType === "calendar" ? (
        <CalendarView currentDate={currentDate} events={events} />
      ) : viewType === "week" ? (
        <WeekView currentDate={currentDate} events={events} />
      ) : (
        <TimelineView currentDate={currentDate} events={events} />
      )}
    </ScheduleLayout>
  )
}
